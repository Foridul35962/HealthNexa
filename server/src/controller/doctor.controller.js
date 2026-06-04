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
        doctor._id = new mongoose.Types.ObjectId(doctor._id);
        doctor.hospitalId = new mongoose.Types.ObjectId(doctor.hospitalId);
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
        .select("_id tokenNumber patientId")
        .sort({ tokenNumber: 1 })
        .limit(6)
        .lean();

    const currentAppointment = queueData.length
        ? {
            _id: queueData[0]._id,
            patient: queueData[0].patientId,
            tokenNumber: queueData[0].tokenNumber,
        }
        : null;

    const currentToken =
        queueData.length > 0
            ? queueData[0].tokenNumber
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

    const result = await moveToNextPatient(doctor._id, true);

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

    const result = await moveToNextPatient(appointment.doctorId._id, false);

    await redis.del(`dashboard:doctor:${appointment.doctorId._id}`);
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

const moveToNextPatient = async (doctorId, shouldSkipCurrent = false) => {

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const queue = await Appointments.find({
        doctorId,
        date: { $gte: todayStart, $lte: todayEnd },
        status: "Pending",
        isSkipped: { $ne: true }
    })
        .populate({
            path: "patientId",
            select: "fullName email phoneNumber"
        })
        .sort({ tokenNumber: 1 })
        .limit(7)

    // ❌ NO PATIENT
    if (queue.length < 1) {
        return {
            currentAppointment: null,
            skippedToken: null,
            nextToken: null,
            nextPatients: []
        };
    }


    // ✅ SKIP logic only for callNextPatient
    let remainingQueue
    if (shouldSkipCurrent) {
        queue[0].isSkipped = true;
        await queue[0].save();

        remainingQueue = queue.slice(1);

        if (remainingQueue.length === 0) {
            return {
                currentAppointment: null,
                skippedToken: queue[0].tokenNumber,
                nextToken: null,
                nextPatients: []
            };
        } else if (remainingQueue.length === 1) {
            const current = remainingQueue[0]

            await setCurrentToken(doctorId, current.tokenNumber);

            return {
                currentAppointment: {
                    _id: current._id,
                    tokenNumber: current.tokenNumber,
                    patient: {
                        _id: current.patientId._id,
                        fullName: current.patientId.fullName,
                        email: current.patientId.email,
                        phoneNumber: current.patientId.phoneNumber
                    }
                },

                skippedToken: queue[0].tokenNumber,
                nextToken: null,
                nextPatients: []
            };
        } else {
            const current = remainingQueue[0]

            await setCurrentToken(doctorId, current.tokenNumber);
            const nextPatients = remainingQueue.slice(1, 6).map(item => ({
                appointmentId: item._id,
                tokenNumber: item.tokenNumber,
                patient: {
                    _id: item.patientId._id,
                    fullName: item.patientId.fullName,
                    email: item.patientId.email,
                    phoneNumber: item.patientId.phoneNumber
                }
            }));

            return {
                skippedToken: queue[0].tokenNumber,

                nextToken: nextPatients[0].tokenNumber,

                currentAppointment: {
                    _id: current._id,
                    tokenNumber: current.tokenNumber,
                    patient: {
                        _id: current.patientId._id,
                        fullName: current.patientId.fullName,
                        email: current.patientId.email,
                        phoneNumber: current.patientId.phoneNumber
                    }
                },

                nextPatients
            };
        }
    } else {
        if (queue.length === 0) {
            return {
                currentAppointment: null,
                skippedToken: null,
                nextToken: null,
                nextPatients: []
            };
        } else if (queue.length === 1) {
            const current = queue[0]

            await setCurrentToken(doctorId, current.tokenNumber);

            return {
                currentAppointment: {
                    _id: current._id,
                    tokenNumber: current.tokenNumber,
                    patient: {
                        _id: current.patientId._id,
                        fullName: current.patientId.fullName,
                        email: current.patientId.email,
                        phoneNumber: current.patientId.phoneNumber
                    }
                },

                skippedToken: null,
                nextToken: null,
                nextPatients: []
            };
        } else {
            const current = queue[0]

            await setCurrentToken(doctorId, current.tokenNumber);
            const nextPatients = queue.slice(1, 6).map(item => ({
                appointmentId: item._id,
                tokenNumber: item.tokenNumber,
                patient: {
                    _id: item.patientId._id,
                    fullName: item.patientId.fullName,
                    email: item.patientId.email,
                    phoneNumber: item.patientId.phoneNumber
                }
            }));

            return {
                skippedToken: null,

                nextToken: nextPatients[0].tokenNumber,

                currentAppointment: {
                    _id: current._id,
                    tokenNumber: current.tokenNumber,
                    patient: {
                        _id: current.patientId._id,
                        fullName: current.patientId.fullName,
                        email: current.patientId.email,
                        phoneNumber: current.patientId.phoneNumber
                    }
                },

                nextPatients
            };
        }
    }
};

const setCurrentToken = async (doctorId, token) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const key = `queue:token:${doctorId}:${todayStr}`;
    await redis.set(key, token, "EX", 60 * 60 * 24);
};