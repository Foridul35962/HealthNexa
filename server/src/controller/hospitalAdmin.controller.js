import ApiErrors from "../helpers/ApiErrors.js";
import AsyncHandler from "../helpers/AsyncHandler.js";
import { body, check, validationResult } from 'express-validator'
import Users from "../models/Users.model.js";
import bcrypt from "bcryptjs";
import ApiResponse from "../helpers/ApiResponse.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import cloudinary from "../config/cloudinary.js";
import mongoose from "mongoose";
import Hospitals from "../models/Hospitals.model.js";
import Doctors from "../models/Doctors.model.js";
import redis from "../config/redis.js";
import Appointments from "../models/Appointments.model.js";

export const addReceptionist = [
    check('fullName')
        .trim()
        .notEmpty()
        .withMessage('FullName is required'),
    check('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Enter a valid Email'),
    check('phoneNumber')
        .trim()
        .notEmpty()
        .withMessage('phoneNumber is required')
        .isMobilePhone('bn-BD')
        .withMessage('phoneNumber is invalid'),
    check('password')
        .trim()
        .notEmpty()
        .withMessage('password is required')
        .isLength({ min: 8 })
        .withMessage('password must be at least 8 characters')
        .matches(/[a-zA-Z]/)
        .withMessage('password must contain a letter')
        .matches(/[0-9]/)
        .withMessage('password must contain a number'),

    AsyncHandler(async (req, res) => {
        const { fullName, email, password, phoneNumber } = req.body
        const admin = req.user

        const error = validationResult(req)
        if (!error.isEmpty()) {
            throw new ApiErrors(400, 'invalid value', error.array())
        }

        const image = req.files?.[0]
        if (!image) {
            throw new ApiErrors(400, 'image not found')
        }

        if (!image.mimetype.startsWith('image/')) {
            throw new ApiErrors(400, 'only image files are allowed')
        }

        const existingUser = await Users.findOne({ email })

        if (existingUser) {
            throw new ApiErrors(400, 'user is already registered')
        }

        const hashedPass = await bcrypt.hash(password, 12)

        let upload
        try {
            const uploaded = await uploadToCloudinary(image.buffer, 'HealthNexa')
            upload = {
                url: uploaded.secure_url,
                publicId: uploaded.public_id
            }
        } catch (error) {
            throw new ApiErrors(500, 'image upload failed')
        }

        const user = await Users.create({
            email,
            password: hashedPass,
            role: 'hospitalStaff',
            staffRole: "receptionist",
            hospitalId: admin.hospitalId,
            phoneNumber,
            fullName,
            image: upload
        })

        if (!user) {
            throw new ApiErrors(500, 'user registered failed')
        }

        user.password = undefined
        user.image.publicId = undefined
        const redisKey = `allReceptionist:hospitalAdmin:${admin.hospitalId.toString()}`
        await redis.del(redisKey)

        return res
            .status(201)
            .json(
                new ApiResponse(201, user, 'receptionist registered successfully')
            )
    })
]

export const deleteReceptionist = AsyncHandler(async (req, res) => {
    const { receptionistId } = req.params
    const admin = req.user

    if (!receptionistId) {
        throw new ApiErrors(400, 'receptionist id is required')
    }

    const receptionist = await Users.findOne({
        _id: receptionistId,
        hospitalId: admin.hospitalId,
        role: "hospitalStaff",
        staffRole: "receptionist"
    });

    if (!receptionist) {
        throw new ApiErrors(404, 'receptionist is not found')
    }

    if (receptionist.image?.publicId) {
        try {
            await cloudinary.uploader.destroy(receptionist.image.publicId)
        } catch (error) {
            throw new ApiErrors(500, 'image deleted failed')
        }
    }

    await receptionist.deleteOne()
    const redisKey = `allReceptionist:hospitalAdmin:${admin.hospitalId.toString()}`
    await redis.del(redisKey)

    return res
        .status(200)
        .json(
            new ApiResponse(200, receptionistId, 'receptionist deleted successfully')
        )
})

export const editReceptionist = [
    check('fullName')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Full name cannot be empty'),

    check('phoneNumber')
        .optional()
        .isMobilePhone('bn-BD')
        .withMessage('invalid phone number'),

    AsyncHandler(async (req, res) => {
        const { fullName, phoneNumber } = req.body;
        const { receptionistId } = req.params;
        const admin = req.user

        if (!receptionistId) {
            throw new ApiErrors(400, "receptionist id is required");
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ApiErrors(400, "invalid value", errors.array());
        }

        if (!fullName && !phoneNumber && !req.files?.[0]) {
            throw new ApiErrors(400, "at least one field is required");
        }

        const receptionist = await Users.findOne({
            _id: receptionistId,
            hospitalId: admin.hospitalId,
            role: "hospitalStaff",
            staffRole: "receptionist"
        });

        if (!receptionist) {
            throw new ApiErrors(404, "receptionist is not found");
        }

        if (fullName) {
            receptionist.fullName = fullName
        }

        if (phoneNumber) {
            receptionist.phoneNumber = phoneNumber;
        }

        // Handle image
        const image = req.files?.[0];

        if (image && !image.mimetype.startsWith('image/')) {
            throw new ApiErrors(400, 'only image files are allowed');
        }

        if (image) {
            try {
                const uploaded = await uploadToCloudinary(image.buffer, "HealthNexa");

                if (receptionist.image?.publicId) {
                    await cloudinary.uploader.destroy(receptionist.image.publicId);
                }

                receptionist.image = {
                    url: uploaded.secure_url,
                    publicId: uploaded.public_id,
                };
            } catch (error) {
                throw new ApiErrors(500, "image upload failed");
            }
        }

        await receptionist.save();

        receptionist.password = undefined;
        if (receptionist.image) {
            receptionist.image.publicId = undefined;
        }

        const redisKey = `allReceptionist:hospitalAdmin:${admin.hospitalId.toString()}`
        await redis.del(redisKey)

        return res.status(200).json(
            new ApiResponse(200, receptionist, "receptionist updated successfully")
        );
    })
]

export const getAllReceptionist = AsyncHandler(async (req, res) => {
    const admin = req.user

    const redisKey = `allReceptionist:hospitalAdmin:${admin.hospitalId.toString()}`

    const redisAllReceptionist = await redis.get(redisKey)
    let allReceptionist

    if (redisAllReceptionist) {
        allReceptionist = JSON.parse(redisAllReceptionist)
    } else {
        allReceptionist = await Users.find({
            role: "hospitalStaff",
            staffRole: "receptionist",
            hospitalId: admin.hospitalId,
        })
            .select('-password -image.publicId')
            .lean()

        await redis.set(redisKey,
            JSON.stringify(allReceptionist),
            "EX", 600
        )
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, allReceptionist, 'all receptionist get successful')
        )
})

export const getDoctors = AsyncHandler(async (req, res) => {
    let doctors
    const admin = req.user

    const doctorKey = `allDoctors:hospitalAdmin:${admin.hospitalId.toString()}`
    const redisDoctor = await redis.get(doctorKey)

    if (redisDoctor) {
        doctors = JSON.parse(redisDoctor)
    } else {
        doctors = await Doctors.find({
            hospitalId: admin.hospitalId
        })
            .populate({
                path: 'userId',
                select: '-password -image.publicId'
            })
            .sort({ createdAt: -1 })
            .lean()

        await redis.set(
            doctorKey,
            JSON.stringify(doctors),
            "EX",
            600
        )
    }

    return res.status(200).json(
        new ApiResponse(200, doctors, 'doctors fetch successful')
    )
})

export const addDoctor = [
    (req, res, next) => {
        if (req.body.schedule && typeof req.body.schedule === "string") {
            try {
                req.body.schedule = JSON.parse(req.body.schedule)
            } catch (err) {
                throw new ApiErrors(400, 'Invalid schedule JSON format')
            }
        }
        next()
    },

    // User fields
    check('fullName')
        .trim()
        .notEmpty()
        .withMessage('FullName is required'),

    check('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Enter a valid Email'),

    check('phoneNumber')
        .trim()
        .notEmpty()
        .withMessage('phoneNumber is required')
        .isMobilePhone('bn-BD')
        .withMessage('phoneNumber is invalid'),

    check('password')
        .notEmpty()
        .withMessage('password is required')
        .isLength({ min: 8 })
        .withMessage('password must be at least 8 characters')
        .matches(/[a-zA-Z]/)
        .withMessage('password must contain a letter')
        .matches(/[0-9]/)
        .withMessage('password must contain a number'),

    // Doctor fields
    check('department')
        .notEmpty()
        .withMessage('department is required'),

    check('chamberNumber')
        .trim()
        .notEmpty()
        .withMessage('chamberNumber is required'),

    check('consultationFee')
        .notEmpty()
        .withMessage('consultationFee is required')
        .isFloat({ min: 0 })
        .withMessage('consultationFee must be a positive number'),

    check('slotDuration')
        .optional()
        .isInt({ min: 1 })
        .withMessage('slotDuration must be at least 1 minute'),

    // Schedule
    check('schedule')
        .isArray({ min: 1 })
        .withMessage('schedule must be a non-empty array'),

    check('schedule.*.dayOfWeek')
        .notEmpty()
        .withMessage('dayOfWeek is required')
        .isIn(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"])
        .withMessage('Invalid dayOfWeek'),

    check('schedule.*.startTime')
        .notEmpty()
        .withMessage('startTime is required')
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage('startTime must be HH:MM format'),

    check('schedule.*.endTime')
        .notEmpty()
        .withMessage('endTime is required')
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage('endTime must be HH:MM format'),

    check('schedule').custom((schedule) => {
        for (let slot of schedule) {
            const [sh, sm] = slot.startTime.split(':').map(Number);
            const [eh, em] = slot.endTime.split(':').map(Number);

            const start = sh * 60 + sm;
            const end = eh * 60 + em;

            if (start >= end) {
                throw new Error('startTime must be less than endTime');
            }
        }
        return true;
    }),

    // Controller
    AsyncHandler(async (req, res) => {
        const error = validationResult(req)
        if (!error.isEmpty()) {
            throw new ApiErrors(400, 'invalid data', error.array())
        }

        const {
            fullName,
            email,
            password,
            phoneNumber,
            department,
            chamberNumber,
            consultationFee,
            slotDuration,
            schedule
        } = req.body

        const admin = req.user

        const image = req.files?.[0]
        if (!image) {
            throw new ApiErrors(400, 'image not found')
        }

        if (!image.mimetype.startsWith('image/')) {
            throw new ApiErrors(400, 'only image files are allowed')
        }

        const existingUser = await Users.findOne({ email })
        if (existingUser) {
            throw new ApiErrors(400, 'Doctor is already registered')
        }

        const hashedPass = await bcrypt.hash(password, 12)

        const hospital = await Hospitals.findById(admin.hospitalId)
        if (!hospital) {
            throw new ApiErrors(404, "hospital is not found")
        }

        if (!hospital.specialties.includes(department)) {
            throw new ApiErrors(400, "There is no such department in hospital")
        }

        const session = await mongoose.startSession()
        session.startTransaction()

        let upload

        try {
            const uploaded = await uploadToCloudinary(image.buffer, 'HealthNexa')
            upload = {
                url: uploaded.secure_url,
                publicId: uploaded.public_id
            }

            const user = await Users.create([{
                email,
                password: hashedPass,
                fullName,
                image: upload,
                phoneNumber,
                role: "hospitalStaff",
                staffRole: "doctor",
                hospitalId: admin.hospitalId
            }]
                , { session }
            )

            const doctor = await Doctors.create([{
                userId: user[0]._id,
                chamberNumber,
                consultationFee,
                department,
                schedule,
                slotDuration,
                hospitalId: admin.hospitalId
            }]
                , { session }
            )

            await session.commitTransaction()
            session.endSession()

            const populatedDoctor = await Doctors.findById(doctor[0]._id)
                .populate('userId')
                .select('-userId.password -userId.image.publicId')

            const doctorKey = `allDoctors:hospitalAdmin:${admin.hospitalId.toString()}`
            await redis.del(doctorKey)

            return res.status(201).json(
                new ApiResponse(201, populatedDoctor, 'doctor added successfully')
            )

        } catch (err) {
            await session.abortTransaction()
            session.endSession()
            if (upload?.public_id) {
                await cloudinary.uploader.destroy(upload.public_id)
            }
            throw new ApiErrors(500, 'Doctor creation failed')
        }
    })
]

export const editDoctor = [
    // User fields
    check('fullName')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('FullName cannot be empty'),

    check('phoneNumber')
        .optional()
        .trim()
        .isMobilePhone('bn-BD')
        .withMessage('phoneNumber is invalid'),

    // Doctor fields
    check('department')
        .optional(),

    check('chamberNumber')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('chamberNumber cannot be empty'),

    check('consultationFee')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('consultationFee must be a positive number'),

    check('slotDuration')
        .optional()
        .isInt({ min: 1 })
        .withMessage('slotDuration must be at least 1 minute'),

    // Schedule
    check('schedule')
        .optional()
        .custom((value) => {
            if (!value) return true;

            // If form-data, parse string to array
            let scheduleArray;
            if (typeof value === "string") {
                try {
                    scheduleArray = JSON.parse(value);
                } catch {
                    throw new Error('schedule must be a valid JSON array');
                }
            } else {
                scheduleArray = value;
            }

            if (!Array.isArray(scheduleArray) || scheduleArray.length === 0) {
                throw new Error('schedule must be a non-empty array');
            }

            // Validate each slot
            for (let slot of scheduleArray) {
                if (!slot.dayOfWeek || !["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].includes(slot.dayOfWeek)) {
                    throw new Error('Invalid dayOfWeek in schedule');
                }
                if (!slot.startTime || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(slot.startTime)) {
                    throw new Error('startTime must be HH:MM format');
                }
                if (!slot.endTime || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(slot.endTime)) {
                    throw new Error('endTime must be HH:MM format');
                }

                const [sh, sm] = slot.startTime.split(':').map(Number);
                const [eh, em] = slot.endTime.split(':').map(Number);
                const start = sh * 60 + sm;
                const end = eh * 60 + em;

                if (start >= end) {
                    throw new Error('startTime must be less than endTime');
                }
            }

            return true;
        }),

    // Controller
    AsyncHandler(async (req, res) => {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            throw new ApiErrors(400, 'invalid data', error.array());
        }

        const { doctorId } = req.params;
        if (!doctorId) {
            throw new ApiErrors(400, 'doctorId is required');
        }

        let {
            fullName,
            phoneNumber,
            department,
            chamberNumber,
            consultationFee,
            slotDuration,
            schedule
        } = req.body;

        const admin = req.user

        const image = req.files?.[0];

        // Parse schedule if it's string (form-data)
        if (schedule && typeof schedule === "string") {
            try {
                schedule = JSON.parse(schedule);
            } catch {
                throw new ApiErrors(400, 'schedule must be a valid JSON array');
            }
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Find doctor
            const doctor = await Doctors.findOne({
                _id: doctorId,
                hospitalId: admin.hospitalId
            })
            .session(session);

            if (!doctor) {
                throw new ApiErrors(404, 'Doctor not found');
            }

            // Update user
            const userUpdates = {};
            if (fullName) userUpdates.fullName = fullName;
            if (phoneNumber) userUpdates.phoneNumber = phoneNumber;

            if (image) {
                if (!image.mimetype.startsWith('image/')) {
                    throw new ApiErrors(400, 'only image files are allowed');
                }

                const user = await Users.findById(doctor.userId)
                if (user && user.image?.publicId) {
                    await cloudinary.uploader.destroy(user.image.publicId)
                }

                const uploaded = await uploadToCloudinary(image.buffer, 'HealthNexa');
                userUpdates.image = {
                    url: uploaded.secure_url,
                    publicId: uploaded.public_id
                };
            }

            if (Object.keys(userUpdates).length > 0) {
                await Users.findByIdAndUpdate(doctor.userId, userUpdates
                    , { session }
                );
            }

            // Update doctor fields
            const doctorUpdates = {};
            if (department) {
                const hospital = await Hospitals.findById(admin.hospitalId)
                if (!hospital) {
                    throw new ApiErrors(404, "hospital is not found")
                }

                if (!hospital.specialties.includes(department)) {
                    throw new ApiErrors(400, "There is no such department in hospital")
                }
                doctorUpdates.department = department
            }
            if (chamberNumber) doctorUpdates.chamberNumber = chamberNumber;
            if (consultationFee !== undefined) doctorUpdates.consultationFee = consultationFee;
            if (slotDuration) doctorUpdates.slotDuration = slotDuration;
            if (schedule) doctorUpdates.schedule = schedule;

            if (Object.keys(doctorUpdates).length > 0) {
                await Doctors.findByIdAndUpdate(doctorId, doctorUpdates
                    , { session }
                );
            }

            await session.commitTransaction();
            session.endSession();

            const populatedDoctor = await Doctors.findById(doctorId)
                .populate('userId')
                .select('-userId.password -userId.image.publicId');

            const doctorKey = `allDoctors:hospitalAdmin:${admin.hospitalId.toString()}`
            await redis.del(doctorKey)

            const redisKey = `Doctor:${doctorId}`
            await redis.del(redisKey)

            return res.status(200).json(
                new ApiResponse(200, populatedDoctor, 'doctor updated successfully')
            );
        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            throw new ApiErrors(500, 'Doctor update failed');
        }
    })
];

export const deleteDoctor = AsyncHandler(async (req, res) => {
    const { doctorId } = req.params

    const admin = req.user

    if (!doctorId) {
        throw new ApiErrors(400, 'doctor id is required')
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const doctor = await Doctors.findOne({
            _id: doctorId,
            hospitalId: admin.hospitalId
        })
        .session(session)
        if (!doctor) {
            throw new ApiErrors(404, 'Doctor not found')
        }

        const user = await Users.findById(doctor.userId)
        .session(session)

        await doctor.deleteOne()

        // Delete user
        if (user) {
            await user.deleteOne()
        }

        await session.commitTransaction()
        session.endSession()

        if (user?.image?.publicId) {
            try {
                await cloudinary.uploader.destroy(user.image.publicId)
            } catch (err) {
                throw new ApiErrors(500, "image delete failed")
            }
        }

        const doctorKey = `allDoctors:hospitalAdmin:${admin.hospitalId.toString()}`
        await redis.del(doctorKey)

        const redisKey = `Doctor:${doctorId}`
        await redis.del(redisKey)

        return res.status(200).json(
            new ApiResponse(200, doctorId, 'doctor deleted successfully')
        )

    } catch (err) {
        await session.abortTransaction()
        session.endSession()
        throw new ApiErrors(500, 'Doctor deletion failed')
    }
})

export const getHospital = AsyncHandler(async (req, res) => {
    const admin = req.user
    const redisKey = `AdminHospital:${admin.hospitalId}`
    const redisValue = await redis.get(redisKey)
    let hospital
    if (redisValue) {
        hospital = JSON.parse(redisValue)
    } else {
        hospital = await Hospitals.findById(admin.hospitalId)
            .select("-image.publicId")
            .lean()

        if (!hospital) {
            throw new ApiErrors(404, "hospital is not found")
        }
        await redis.set(redisKey,
            JSON.stringify(hospital),
            "EX", 300
        )
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, hospital, "hospital fetch successfully")
        )
})

export const dashboard = AsyncHandler(async (req, res) => {
    const user = req.user;

    const key = `dashboard:hospitalAdmin:${user.hospitalId}`;

    const cached = await redis.get(key);

    if (cached) {
        return res.status(200).json(
            new ApiResponse(
                200,
                JSON.parse(cached),
                "Dashboard from cache"
            )
        );
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [appointmentStats, employeeStats] = await Promise.all([
        Appointments.aggregate([
            {
                $match: {
                    hospitalId: user.hospitalId,
                    date: {
                        $gte: startOfDay,
                        $lte: endOfDay
                    }
                }
            },
            {
                $facet: {
                    total: [
                        { $count: "count" }
                    ],
                    checkedIn: [
                        {
                            $match: {
                                checkedIn: true
                            }
                        },
                        { $count: "count" }
                    ],
                    pending: [
                        {
                            $match: {
                                status: "Booked"
                            }
                        },
                        { $count: "count" }
                    ],
                    completed: [
                        {
                            $match: {
                                status: "Done"
                            }
                        },
                        { $count: "count" }
                    ]
                }
            }
        ]),

        Users.aggregate([
            {
                $match: {
                    hospitalId: user.hospitalId,
                    role: "hospitalStaff"
                }
            },
            {
                $facet: {
                    totalEmployees: [
                        { $count: "count" }
                    ],
                    doctors: [
                        {
                            $match: {
                                staffRole: "doctor"
                            }
                        },
                        { $count: "count" }
                    ],
                    receptionists: [
                        {
                            $match: {
                                staffRole: "receptionist"
                            }
                        },
                        { $count: "count" }
                    ]
                }
            }
        ])
    ]);

    const appointmentData = appointmentStats[0];
    const employeeData = employeeStats[0];

    const response = {
        appointments: {
            total: appointmentData.total[0]?.count || 0,
            checkedIn: appointmentData.checkedIn[0]?.count || 0,
            pending: appointmentData.pending[0]?.count || 0,
            completed: appointmentData.completed[0]?.count || 0
        },

        employees: {
            total: employeeData.totalEmployees[0]?.count || 0,
            doctors: employeeData.doctors[0]?.count || 0,
            receptionists: employeeData.receptionists[0]?.count || 0
        }
    };

    await redis.set(
        key,
        JSON.stringify(response),
        "EX",
        300
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            response,
            "Dashboard fetched successfully"
        )
    );
});