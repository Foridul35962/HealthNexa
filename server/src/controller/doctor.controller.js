import mongoose from "mongoose";
import redis from "../config/redis.js";
import ApiErrors from "../helpers/ApiErrors.js";
import ApiResponse from "../helpers/ApiResponse.js";
import AsyncHandler from "../helpers/AsyncHandler.js";
import Appointments from "../models/Appointments.model.js";
import Doctors from "../models/Doctors.model.js";

export const doctorDashboard = AsyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Doctor Cache
    const doctorCacheKey = `doctor:${userId}`;

    let doctor;

    const cachedDoctor = await redis.get(doctorCacheKey);

    if (cachedDoctor) {
        doctor = JSON.parse(cachedDoctor);
    } else {
        doctor = await Doctors.findOne({ userId }).lean();

        if (!doctor) {
            throw new ApiErrors(404, "Doctor not found");
        }

        await redis.set(
            doctorCacheKey,
            JSON.stringify(doctor),
            "EX",
            300
        );
    }

    // Dashboard Cache
    const dashboardCacheKey = `dashboard:doctor:${doctor._id}`;

    const cachedDashboard = await redis.get(dashboardCacheKey);

    if (cachedDashboard) {
        return res.status(200).json(
            new ApiResponse(
                200,
                JSON.parse(cachedDashboard),
                "Doctor dashboard fetched from cache"
            )
        );
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Stats
    const statsResult = await Appointments.aggregate([
        {
            $match: {
                doctorId: doctor._id,
                hospitalId: doctor.hospitalId,
                date: {
                    $gte: todayStart,
                    $lte: todayEnd
                }
            }
        },
        {
            $group: {
                _id: null,

                totalAppointments: { $sum: 1 },

                completed: {
                    $sum: {
                        $cond: [
                            { $eq: ["$status", "Done"] },
                            1,
                            0
                        ]
                    }
                },

                cancelled: {
                    $sum: {
                        $cond: [
                            { $eq: ["$status", "Cancelled"] },
                            1,
                            0
                        ]
                    }
                },

                waiting: {
                    $sum: {
                        $cond: [
                            { $eq: ["$status", "Pending"] },
                            1,
                            0
                        ]
                    }
                },

                notArrived: {
                    $sum: {
                        $cond: [
                            { $eq: ["$status", "Booked"] },
                            1,
                            0
                        ]
                    }
                }
            }
        }
    ]);

    const stats = statsResult[0] || {
        totalAppointments: 0,
        completed: 0,
        cancelled: 0,
        waiting: 0,
        notArrived: 0
    };

    const income =
        stats.completed * (doctor.consultationFee || 0);

    // Queue
    const queueData = await Appointments.find({
        doctorId: doctor._id,
        hospitalId: doctor.hospitalId,
        date: { $gte: todayStart, $lte: todayEnd },
        status: "Pending",
        isSkipped: { $ne: true }
    })
        .populate({
            path: "patientId",
            select: "fullName email phoneNumber"
        })
        .select("_id tokenNumber status slotStart slotEnd patientId")
        .sort({ tokenNumber: 1 })
        .lean();

    const currentAppointment = queueData.length
        ? {
            _id: queueData[0]._id,
            patientId: queueData[0].patientId,
            tokenNumber: queueData[0].tokenNumber,
            status: queueData[0].status,
            slotStart: queueData[0].slotStart,
            slotEnd: queueData[0].slotEnd
        }
        : null;

    const currentToken =
        queueData.length > 0
            ? queueData[0].tokenNumber
            : 0;

    const lastToken =
        queueData.length > 0
            ? queueData[queueData.length - 1].tokenNumber
            : 0;

    await setCurrentToken(doctor._id, currentToken);

    const nextPatients = queueData
        .slice(1, 6)
        .map(item => ({
            appointmentId: item._id,
            tokenNumber: item.tokenNumber,
            patient: {
                _id: item.patientId._id,
                fullName: item.patientId.fullName,
                email: item.patientId.email,
                phoneNumber: item.patientId.phoneNumber
            }
        }));

    const dashboardData = {
        stats: {
            totalAppointments: stats.totalAppointments,
            completed: stats.completed,
            cancelled: stats.cancelled,
            waiting: stats.waiting,
            notArrived: stats.notArrived,
            income
        },

        queue: {
            consultationFee: doctor.consultationFee,
            currentToken,
            lastToken,
            currentAppointment,
            nextPatients
        }
    };

    await redis.set(
        dashboardCacheKey,
        JSON.stringify(dashboardData),
        "EX",
        300
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            dashboardData,
            "Doctor dashboard fetched successfully"
        )
    );
});

export const callNextPatient = AsyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Doctor Cache
    const doctorCacheKey = `doctor:${userId}`;

    let doctor;

    const cachedDoctor = await redis.get(doctorCacheKey);

    if (cachedDoctor) {
        doctor = JSON.parse(cachedDoctor);
    } else {
        doctor = await Doctors.findOne({ userId }).lean();

        if (!doctor) {
            throw new ApiErrors(404, "Doctor not found");
        }

        await redis.set(
            doctorCacheKey,
            JSON.stringify(doctor),
            "EX",
            300
        );
    }

    const result = await moveToNextPatient(req, doctor._id);

    // Redis invalidate
    await redis.del(`dashboard:doctor:${doctor._id}`);

    // realtime dashboard refresh
    // req.app.get("io").to(`doctor:${doctor._id}`).emit("dashboard:refresh");

    return res.status(200).json(
        new ApiResponse(200, result, "Next patient called")
    );
});

export const completeAppointment = AsyncHandler(async (req, res) => {
    const { appointmentId } = req.body;
    const userId = req.user._id

    if (!appointmentId || !mongoose.isValidObjectId(appointmentId)) {
        throw new ApiErrors(400, "invalid appointment id")
    }

    const appointment = await Appointments.findById(appointmentId)
        .populate({
            path: "doctorId",
            select: "userId"
        });

    if (!appointment) {
        throw new ApiErrors(404, "Appointment not found");
    }

    if (appointment.doctorId.userId.toString() !== userId.toString()) {
        throw new ApiErrors(403, "You are not authorized for this appointment");
    }

    if (appointment.status !== "Pending") {
        throw new ApiErrors(400, "Invalid appointment status");
    }

    appointment.status = "Done";
    appointment.isSkipped = false;
    await appointment.save();

    const result = await moveToNextPatient(req, appointment.doctorId);

    await redis.del(`dashboard:doctor:${appointment.doctorId}`);
    await redis.del(`appointment:${appointmentId}`);

    // const io = req.app.get("io");

    // io.to(`user:${appointment.patientId}`).emit(
    //     "appointmentStatusUpdate",
    //     { status: "Done" }
    // );

    // io.to(`doctor:${appointment.doctorId}`).emit("dashboard:refresh");

    return res.status(200).json(
        new ApiResponse(
            200,
            result,
            "Appointment completed & next called"
        )
    );
});

const moveToNextPatient = async (req, doctorId) => {
    // const io = req.app.get("io");

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const date = new Date().toISOString().split("T")[0];

    const queue = await Appointments.find({
        doctorId,
        date: { $gte: todayStart, $lte: todayEnd },
        status: { $in: ["Pending", "Skipped"] }
    })
        .populate({
            path: "patientId",
            select: "fullName email phoneNumber"
        })
        .sort({ tokenNumber: 1 });

    // NO PATIENT
    if (queue.length === 0) {
        await setCurrentToken(doctorId, 0);

        // io.to(`queue:${doctorId}:${date}`).emit("queue:update", {
        //     currentToken: 0,
        //     currentAppointment: null,
        //     nextPatients: []
        // });

        return {
            currentAppointment: null,
            skippedToken: null,
            nextToken: null
        };
    }

    const current = queue[0];
    const next = queue[1] || null;

    // HANDLE SKIP LOGIC
    current.isSkipped = true;
    await current.save();

    // ONLY ONE PATIENT LEFT
    if (!next) {
        await setCurrentToken(doctorId, current.tokenNumber);

        // io.to(`queue:${doctorId}:${date}`).emit("queue:update", {
        //     currentToken: current.tokenNumber,
        //     currentAppointment: current
        // });

        return {
            skippedToken: current.tokenNumber,
            nextToken: null,
            currentAppointment: current
        };
    }

    // MOVE NEXT
    await setCurrentToken(doctorId, next.tokenNumber);

    // io.to(`queue:${doctorId}:${date}`).emit("queue:update", {
    //     currentToken: next.tokenNumber,
    //     currentAppointment: next
    // });

    return {
        skippedToken: current.tokenNumber,
        nextToken: next.tokenNumber,
        currentAppointment: next
    };
};

const setCurrentToken = async (doctorId, token) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const key = `queue:token:${doctorId}:${todayStr}`;
    await redis.set(key, token, "EX", 60 * 60 * 24);
};