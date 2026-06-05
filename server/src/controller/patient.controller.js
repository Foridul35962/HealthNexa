import mongoose from "mongoose";
import redis from "../config/redis.js";
import ApiErrors from "../helpers/ApiErrors.js";
import ApiResponse from "../helpers/ApiResponse.js";
import AsyncHandler from "../helpers/AsyncHandler.js";
import SymptomChecker from "../models/SymptomChecker.model.js";
import Doctors from "../models/Doctors.model.js";
import Appointments from "../models/Appointments.model.js";
import crypto from "crypto";
import QRCode from "qrcode";
import cloudinary from "../config/cloudinary.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import Users from "../models/Users.model.js";


export const getAllAISymptom = AsyncHandler(async (req, res) => {
    const userId = req.user._id;

    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    if (page < 1) {
        throw new ApiErrors(400, "page must be greater than 0");
    }

    const skip = (page - 1) * limit;

    // redis key
    const redisKey = `allSymptoms:${userId}:page:${page}`;

    let allSymptoms;

    // check redis cache
    const redisSymptoms = await redis.get(redisKey);

    if (redisSymptoms) {
        allSymptoms = JSON.parse(redisSymptoms);
    } else {

        const [data, total] = await Promise.all([
            SymptomChecker.find({
                userId,
            })
                .select(
                    "_id " +
                    "patientInfo.age " +
                    "patientInfo.gender " +
                    "input.symptoms " +
                    "input.duration " +
                    "aiResult.summary " +
                    "aiResult.emergencyLevel.level " +
                    "aiResult.recommendedDepartment.department " +
                    "createdAt"
                )
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            SymptomChecker.countDocuments({
                userId,
            }),
        ]);

        allSymptoms = {
            data,

            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            },
        };

        // save in redis for 5 min
        await redis.set(
            redisKey,
            JSON.stringify(allSymptoms),
            "EX",
            300
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            allSymptoms,
            "All symptoms fetched successfully"
        )
    );
});

export const getSymptomById = AsyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { symptomId } = req.params;

    // validation
    if (!symptomId) {
        throw new ApiErrors(400, "symptomId is required");
    }

    if (!mongoose.isValidObjectId(symptomId)) {
        throw new ApiErrors(400, "Invalid symptom id");
    }

    // redis key
    const redisKey = `symptom:${userId}:${symptomId}`;

    let symptom;

    // check redis
    const redisSymptom = await redis.get(redisKey);

    if (redisSymptom) {
        symptom = JSON.parse(redisSymptom);
    } else {

        symptom = await SymptomChecker.findOne({
            _id: symptomId,
            userId,
        }).lean();

        if (!symptom) {
            throw new ApiErrors(404, "Symptom not found");
        }

        await redis.set(
            redisKey,
            JSON.stringify(symptom),
            "EX",
            300
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            symptom,
            "Symptom fetched successfully"
        )
    );
});

export const deleteSymptomById = AsyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { symptomId } = req.params;

    // validation
    if (!symptomId) {
        throw new ApiErrors(400, "symptomId is required");
    }

    if (!mongoose.isValidObjectId(symptomId)) {
        throw new ApiErrors(400, "Invalid symptom id");
    }

    // redis key
    const redisKey = `symptom:${userId}:${symptomId}`;

    try {
        await SymptomChecker.findOneAndDelete({
            _id: symptomId,
            userId
        })
    } catch (error) {
        throw new ApiErrors(404, "symptom is not found")
    }

    await redis.del(redisKey)

    return res
        .status(200)
        .json(
            new ApiResponse(200, symptomId, "symptom delete successfully")
        )
})


// convert "10:30" -> minutes
const timeToMinutes = (time) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
};

// convert minutes -> "10:30"
const minutesToTime = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;

    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

// Get day string
const getDayName = (date) => {
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];
};

export const addAppointment = AsyncHandler(async (req, res) => {
    const patientId = req.user._id;
    const { doctorId } = req.body;

    if (!doctorId) {
        throw new ApiErrors(400, "doctorId is required");
    }


    const redisKey = `doctor:${doctorId}`;

    const redisDoctor = await redis.get(redisKey);

    let doctor;

    if (redisDoctor) {
        doctor = JSON.parse(redisDoctor);
    } else {
        doctor = await Doctors.findById(doctorId)
            .populate([
                {
                    path: "userId",
                    select: "fullName image.url"
                },
                {
                    path: "hospitalId",
                    select: "_id name address"
                }
            ])
            .lean();

        if (!doctor) {
            throw new ApiErrors(404, "Doctor not found");
        }

        await redis.set(
            redisKey,
            JSON.stringify(doctor),
            "EX",
            600
        );
    }


    const now = new Date();

    const next7Days = new Date();
    next7Days.setDate(next7Days.getDate() + 7);

    const existingAppointment = await Appointments.findOne({
        doctorId,
        patientId,
        status: {
            $in: ["Booked", "Pending"]
        },
        date: {
            $gte: now,
            $lte: next7Days
        }
    });

    if (existingAppointment) {
        throw new ApiErrors(
            400,
            "You already have an active appointment with this doctor"
        );
    }

    // Find Available Slot

    const slotDuration = doctor.slotDuration;

    let foundSlot = null;
    let selectedDate = null;

    for (let i = 0; i < 7; i++) {

        const currentDate = new Date();

        currentDate.setDate(currentDate.getDate() + i);

        currentDate.setHours(0, 0, 0, 0);

        const dayName = getDayName(currentDate);

        // Doctor schedule for this day
        const schedule = doctor.schedule.find(
            (s) => s.dayOfWeek === dayName
        );

        if (!schedule) continue;

        let start = timeToMinutes(schedule.startTime);

        const end = timeToMinutes(schedule.endTime);

        const slots = [];

        // Current time in minutes
        const nowMinutes =
            now.getHours() * 60 + now.getMinutes();

        // Generate slots
        while (start + slotDuration <= end) {

            // Skip past slots for today
            if (i === 0 && start <= nowMinutes) {
                start += slotDuration;
                continue;
            }

            const slotStart = minutesToTime(start);

            const slotEnd = minutesToTime(start + slotDuration);

            slots.push({
                slotStart,
                slotEnd
            });

            start += slotDuration;
        }

        // Day Range
        const startOfDay = new Date(currentDate);

        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(currentDate);

        endOfDay.setHours(23, 59, 59, 999);

        // Already booked slots
        const bookedAppointments = await Appointments.find({
            doctorId,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            },
            status: {
                $in: ["Booked", "Pending"]
            }
        }).select("slotStart");

        const bookedSet = new Set(
            bookedAppointments.map((b) => b.slotStart)
        );

        // Find first free slot
        for (const slot of slots) {

            if (!bookedSet.has(slot.slotStart)) {

                foundSlot = slot;

                selectedDate = new Date(currentDate);

                break;
            }
        }

        if (foundSlot) break;
    }

    if (!foundSlot || !selectedDate) {
        throw new ApiErrors(
            400,
            "No available slots in next 7 days"
        );
    }

    // Create Appointment

    const qrHash = crypto.randomBytes(16).toString("hex");

    let appointment;

    try {
        appointment = await Appointments.create({
            patientId,
            doctorId,
            hospitalId: doctor.hospitalId._id,
            date: selectedDate,
            slotStart: foundSlot.slotStart,
            slotEnd: foundSlot.slotEnd,
            status: "Booked",
            qrHash
        });

    } catch (error) {

        // Duplicate slot protection
        if (error.code === 11000) {
            throw new ApiErrors(
                409,
                "This slot was just booked by someone else. Please try again."
            );
        }

        throw error;
    }


    const qrPayload =
        `${process.env.CORS_ORIGIN}/receptionist/check-in?appointmentId=${appointment._id}&hash=${qrHash}`;

    const qrImage = await QRCode.toDataURL(qrPayload);

    await appointment.populate([
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

    appointment.qrHash = undefined

    await redis.del(`appointmentHistory:${patientId}:page:${1}`);
    await redis.del(`upcommingAppointment:${patientId}`)

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                appointment,
                qrImage
            },
            "Appointment auto-assigned successfully"
        )
    );
});

export const getAppointmentHistory = AsyncHandler(async (req, res) => {
    const patientId = req.user._id;

    const limit = 10;

    const page = Number(req.query.page);

    if (!Number.isInteger(page) || page < 1) {
        throw new ApiErrors(400, "Invalid page number");
    }

    const skip = (page - 1) * limit;

    const redisKey = `appointmentHistory:${patientId}:page:${page}`;

    const redisAppointments = await redis.get(redisKey);

    let appointments;

    if (redisAppointments) {
        appointments = JSON.parse(redisAppointments);
    } else {
        const [data, total] = await Promise.all([
            Appointments.find({ patientId })
                .populate([
                    {
                        path: "doctorId",
                        select: "userId department",
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
                .select("-patientId -slotStart -slotEnd -qrHash -status -checkedIn -isSkipped -tokenNumber")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            Appointments.countDocuments({ patientId })
        ]);

        appointments = {
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };

        await redis.set(
            redisKey,
            JSON.stringify(appointments),
            "EX",
            300
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            appointments,
            "Appointment history fetched successfully"
        )
    );
});

export const getAppointmentById = AsyncHandler(async (req, res) => {
    const patientId = req.user._id;
    const { appointmentId } = req.params;

    if (!appointmentId) {
        throw new ApiErrors(400, "appointment id is required");
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

        await redis.set(
            redisKey,
            JSON.stringify(appointment),
            "EX",
            300
        );
    }

    if (appointment.patientId.toString() !== patientId.toString()) {
        throw new ApiErrors(401, "Unauthorized access");
    }

    let qrImage = null;

    if (appointment.status === "Booked" || appointment.status === "Pending") {
        const qrPayload =
            `${process.env.CORS_ORIGIN}/receptionist/check-in?appointmentId=${appointment._id}&hash=${appointment.qrHash}`;

        qrImage = await QRCode.toDataURL(qrPayload);
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            { appointment, qrImage },
            "Appointment fetched successfully"
        )
    );
});

export const getCurrentToken = AsyncHandler(async (req, res) => {
    const { doctorId, date } = req.params;

    if (!doctorId || !date) {
        throw new ApiErrors(400, "doctorId and date are required");
    }

    const d = new Date(date);

    const formattedDate = `${d.getFullYear()}-${String(
        d.getMonth() + 1
    ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    const redisKey = `queue:${doctorId}:${formattedDate}`;

    const currentToken = await redis.get(redisKey) || "0";

    return res.status(200).json(
        new ApiResponse(
            200,
            Number(currentToken),
            "current token fetch done"
        )
    );
});

export const deleteAppointment = AsyncHandler(async (req, res) => {
    const patientId = req.user._id
    const { appointmentId } = req.params
    if (!appointmentId) {
        throw new ApiErrors(400, "appointment id is required")
    }

    const appointment = await Appointments.findById(appointmentId)

    if (!appointment) {
        throw new ApiErrors(404, "appointment is not found")
    }

    if (appointment.status !== "Booked") {
        throw new ApiErrors(400, "appointment is done")
    }

    if (appointment.patientId.toString() !== patientId.toString()) {
        throw new ApiErrors(401, "unauthorized access")
    }

    await appointment.deleteOne()
    await redis.del(`appointment:${appointmentId}`)

    const historyKeys = await redis.keys(
        `appointmentHistory:${patientId}:page:*`
    );

    if (historyKeys.length) {
        await redis.del(historyKeys);
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, appointmentId, "appointment delete successfully")
        )
})

export const upCommingAppointment = AsyncHandler(async (req, res) => {
    const user = req.user

    const redisKey = `upcommingAppointment:${user._id}`
    const redisAppointment = await redis.get(redisKey)
    if (redisAppointment) {
        return res
            .status(200)
            .json(
                new ApiResponse(200, JSON.parse(redisAppointment), "upcomming appointment fetch successfully")
            )
    }

    const appointment = await Appointments.find({
        patientId: user._id,
        status: { $in: ["Booked", "Pending"] }
    })
        .select("-patientId -qrHash -tokenNumber -isSkipped -checkedIn")
        .populate([
            {
                path: "hospitalId",
                select: "name"
            },
            {
                path: "doctorId",
                select: "userId department",
                populate: {
                    path: "userId",
                    select: "fullName image.url"
                }
            },
        ])
        .sort({ date: -1 })
        .lean()

    await redis.set(redisKey,
        JSON.stringify(appointment),
        "EX", 300
    )

    return res
        .status(200)
        .json(
            new ApiResponse(200, appointment, "up comming appointment fetch successfull")
        )
})

export const editPatientDetails = AsyncHandler(async (req, res) => {
    const user = req.user;
    const { fullName } = req.body;
    const image = req.files?.[0];

    if (!fullName && !image) {
        throw new ApiErrors(400, "Nothing to update");
    }

    const userUpdates = {};

    if (fullName) {
        userUpdates.fullName = fullName;
    }

    if (image) {
        if (!image.mimetype.startsWith("image/")) {
            throw new ApiErrors(400, "Only image files are allowed");
        }

        const uploaded = await uploadToCloudinary(
            image.buffer,
            "HealthNexa"
        );

        if (user?.image?.publicId) {
            await cloudinary.uploader.destroy(
                user.image.publicId
            );
        }

        userUpdates.image = {
            url: uploaded.secure_url,
            publicId: uploaded.public_id,
        };
    }

    const updatedUser = await Users.findByIdAndUpdate(
        user._id,
        userUpdates,
        { new: true }
    ).select("-password -image.publicId");

    await redis.del(`userId:${user._id}`);

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedUser,
            "Patient updated successfully"
        )
    );
});