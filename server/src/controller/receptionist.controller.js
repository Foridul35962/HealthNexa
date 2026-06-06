import mongoose from "mongoose";
import ApiErrors from "../helpers/ApiErrors.js";
import AsyncHandler from "../helpers/AsyncHandler.js";
import redis from "../config/redis.js";
import Appointments from "../models/Appointments.model.js";
import ApiResponse from "../helpers/ApiResponse.js";

export const checkInPatient = AsyncHandler(async (req, res) => {
    const { appointmentId, hash } = req.body;
    const user = req.user;

    if (!appointmentId || !hash) {
        throw new ApiErrors(400, "All fields are required");
    }

    if (!mongoose.isValidObjectId(appointmentId)) {
        throw new ApiErrors(400, "Invalid appointment id");
    }

    const redisKey = `appointment:${appointmentId}`;

    let appointment;

    const redisAppointment = await redis.get(redisKey);

    if (redisAppointment) {
        appointment = JSON.parse(redisAppointment);
    } else {
        appointment = await Appointments.findById(appointmentId)
            .populate([
                {
                    path: "doctorId",
                    select: "userId chamberNumber department",
                    populate: {
                        path: "userId",
                        select: "fullName image.url"
                    }
                },
                {
                    path: "hospitalId",
                    select: "name"
                }
            ])
            .lean();

        if (!appointment) {
            throw new ApiErrors(404, "Appointment not found");
        }
    }

    // QR Validation
    if (hash.toString() !== appointment.qrHash?.toString()) {
        throw new ApiErrors(400, "Invalid QR");
    }

    // Hospital Validation
    if (appointment.hospitalId._id.toString() !== user.hospitalId.toString()) {
        throw new ApiErrors(401, "Appointment belongs to another hospital");
    }

    // Status Validation
    if (appointment.status !== "Booked") {
        throw new ApiErrors(400, "Appointment already checked in");
    }

    // Date Validation
    const appointmentDate = new Date(appointment.date);
    const today = new Date();

    if (appointmentDate.toDateString() !== today.toDateString()) {
        throw new ApiErrors(400, "Appointment is not today");
    }

    // Generate Next Token
    const lastAppointment = await Appointments.findOne({
        doctorId: new mongoose.Types.ObjectId(appointment.doctorId._id),
        date: appointmentDate,
        checkedIn: true
    })
        .sort({ tokenNumber: -1 })
        .select("tokenNumber")
        .lean();

    const nextToken = lastAppointment
        ? lastAppointment.tokenNumber + 1
        : 1;

    // Atomic Update
    const updatedAppointment = await Appointments.findOneAndUpdate(
        {
            _id: appointmentId,
            status: "Booked",
            checkedIn: false
        },
        {
            $set: {
                checkedIn: true,
                status: "Pending",
                tokenNumber: nextToken
            }
        },
        {
            new: true
        }
    );

    if (!updatedAppointment) {
        throw new ApiErrors(
            400,
            "Appointment already checked in or unavailable"
        );
    }

    await updateDashboardCache(user.hospitalId, {
        checkedIn: +1,
        pending: -1
    });

    // Clear Cache
    await redis.del(redisKey);
    await redis.del(`dashboard:doctor:${appointment.doctorId}`)

    const io = req.app.get("io")
    io.to(`user:${appointment.patientId}`)
        .emit("appointmentStatusUpdate", {
            status: "Pending",
            tokenNumber: nextToken,
            checkedIn: true
        })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200, {}, "Patient checked in successfully"
            )
        );
});

export const recallSkippedPatient = AsyncHandler(async (req, res) => {
    const { appointmentId, hash } = req.body;
    const user = req.user;

    if (!appointmentId || !hash) {
        throw new ApiErrors(400, "All fields are required");
    }

    if (!mongoose.isValidObjectId(appointmentId)) {
        throw new ApiErrors(400, "Invalid appointment id");
    }

    const redisKey = `appointment:${appointmentId}`;

    let appointment;

    const redisAppointment = await redis.get(redisKey);

    if (redisAppointment) {
        appointment = JSON.parse(redisAppointment);
    } else {
        appointment = await Appointments.findById(appointmentId)
            .populate([
                {
                    path: "doctorId",
                    select: "userId chamberNumber department",
                    populate: {
                        path: "userId",
                        select: "fullName image.url"
                    }
                },
                {
                    path: "hospitalId",
                    select: "name"
                }
            ])
            .lean();

        if (!appointment) {
            throw new ApiErrors(404, "Appointment not found");
        }
    }

    // QR Validation
    if (hash.toString() !== appointment.qrHash?.toString()) {
        throw new ApiErrors(400, "Invalid QR");
    }

    // Hospital Validation
    if (appointment.hospitalId._id.toString() !== user.hospitalId.toString()) {
        throw new ApiErrors(401, "Appointment belongs to another hospital");
    }

    // Status Validation
    if (appointment.status !== "Pending") {
        throw new ApiErrors(400, "Appointment is not checked in");
    }

    // Date Validation
    const appointmentDate = new Date(appointment.date);
    const today = new Date();

    if (appointmentDate.toDateString() !== today.toDateString()) {
        throw new ApiErrors(400, "Appointment is not today");
    }

    if (!appointment.isSkipped) {
        throw new ApiErrors(400, "Patient is not skipped");
    }

    const updatedAppointment = await Appointments.findOneAndUpdate(
        {
            _id: appointmentId,
            status: "Pending",
            checkedIn: true,
            isSkipped: true
        },
        {
            $set: {
                isSkipped: false
            }
        },
        {
            new: true
        }
    ).populate([
        {
            path: "doctorId",
            populate: {
                path: "userId",
                select: "_id"
            }
        },
        {
            path: "patientId",
            select: "fullName _id email phoneNumber"
        }
    ])

    if (!updatedAppointment) {
        throw new ApiErrors(
            400,
            "Appointment is not checked in or unavailable"
        );
    }

    const doctorUserId = updatedAppointment?.doctorId?.userId?._id;

    await updateDashboardCache(user.hospitalId, {
        skipped: -1,
    });

    // Clear Cache
    await redis.del(redisKey);
    await redis.del(`dashboard:doctor:${appointment.doctorId}`)

    const io = req.app.get("io");

    io.to(`user:${doctorUserId}`).emit("recallPatientDoctor", {
        appointmentId,
        tokenNumber: updatedAppointment.tokenNumber,

        patient: {
            _id: updatedAppointment.patientId?._id,
            fullName: updatedAppointment.patientId?.fullName,
            email: updatedAppointment.patientId?.email,
            phoneNumber: updatedAppointment.patientId?.phoneNumber
        }
    });

    io.to(`user:${updatedAppointment.patientId._id}`)
        .emit("recallPatient", {
            isSkipped: false
        })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200, {}, "Patient recalled successfully"
            )
        );
});

const updateDashboardCache = async (hospitalId, change) => {
    const key = `receptionist:dashboard:hospital:${hospitalId}`;

    let dashboard = await redis.get(key);

    if (!dashboard) {
        dashboard = {
            totalAppointments: 0,
            checkedIn: 0,
            pending: 0,
            skipped: 0,
            completed: 0
        };
    } else {
        dashboard = JSON.parse(dashboard);
    }

    // apply changes dynamically
    for (const key in change) {
        dashboard[key] += change[key];
    }

    await redis.set(key, JSON.stringify(dashboard), "EX", 3600);

    return dashboard;
};

export const dashboard = AsyncHandler(async (req, res) => {
    const user = req.user;

    if (!user?.hospitalId) {
        throw new ApiErrors(401, "Unauthorized");
    }

    const key = `receptionist:dashboard:hospital:${user.hospitalId}`;

    const cached = await redis.get(key);

    if (cached) {
        return res.status(200).json(
            new ApiResponse(200, JSON.parse(cached), "Dashboard from cache")
        );
    }

    // fallback (first time only)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const result = await Appointments.aggregate([
        {
            $match: {
                hospitalId: new mongoose.Types.ObjectId(user.hospitalId),
                date: { $gte: startOfDay, $lte: endOfDay }
            }
        },
        {
            $facet: {
                total: [{ $count: "count" }],
                checkedIn: [
                    { $match: { checkedIn: true, status: "Pending" } },
                    { $count: "count" }
                ],
                pending: [
                    { $match: { status: "Booked" } },
                    { $count: "count" }
                ],
                skipped: [
                    { $match: { isSkipped: true } },
                    { $count: "count" }
                ],
                completed: [
                    { $match: { status: "Done" } },
                    { $count: "count" }
                ]
            }
        }
    ]);

    const data = result[0];

    const response = {
        totalAppointments: data.total[0]?.count || 0,
        checkedIn: data.checkedIn[0]?.count || 0,
        pending: data.pending[0]?.count || 0,
        skipped: data.skipped[0]?.count || 0,
        completed: data.completed[0]?.count || 0
    };

    await redis.set(key, JSON.stringify(response), "EX", 60); // 1 min cache

    return res.status(200).json(
        new ApiResponse(200, response, "Dashboard from DB")
    );
});