import redis from "../config/redis.js";
import ApiErrors from "../helpers/ApiErrors.js";
import ApiResponse from "../helpers/ApiResponse.js";
import AsyncHandler from "../helpers/AsyncHandler.js";
import Doctors from "../models/Doctors.model.js";
import Medicines from "../models/Medicine.model.js";
import { check, validationResult } from "express-validator"
import PharmacyMedicines from "../models/PharmacyMedicine.model.js";
import mongoose from "mongoose";
import Pharmacy from "../models/Pharmacy.model.js";
import Hospitals from "../models/Hospitals.model.js";

export const getDoctor = AsyncHandler(async (req, res) => {
    const { doctorId } = req.params
    if (!doctorId) {
        throw new ApiErrors(400, "doctor id is required")
    }

    const redisKey = `getDoctor:${doctorId}`
    let doctor

    const redisDoctor = await redis.get(redisKey)
    if (redisDoctor) {
        doctor = JSON.parse(redisDoctor)
    } else {
        doctor = await Doctors.findById(doctorId)
            .populate({
                path: "userId",
                select: "-password -image.publicId"
            })
            .lean()

        if (!doctor) {
            throw new ApiErrors(404, "doctor not found")
        }

        await redis.set(redisKey,
            JSON.stringify(doctor),
            "EX", 300
        )
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, doctor, "doctor fetch done")
        )
})


export const getMedicineNames = AsyncHandler(async (req, res) => {
    const { medicineName } = req.params
    if (!medicineName) {
        throw new ApiErrors(400, "medicineName is required")
    }

    const medicines = await Medicines.find({
        name: {
            $regex: medicineName,
            $options: "i"
        }
    })
        .select("_id name genericName strength medicineType")
        .limit(10)

    return res
        .status(200)
        .json(
            new ApiResponse(200, medicines, "medicine name fetch done")
        )
})

export const getNearestPharmacy = [
    check("medicineId")
        .notEmpty()
        .withMessage("Medicine Id is required")
        .isMongoId()
        .withMessage("Invalid medicineId"),

    check("location.lat")
        .notEmpty()
        .withMessage("latitude is required")
        .isFloat(),

    check("location.lon")
        .notEmpty()
        .withMessage("longitude is required")
        .isFloat(),

    AsyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ApiErrors(400, "Invalid input", errors.array());
        }

        const { medicineId, location } = req.body;

        const lat = parseFloat(location.lat);
        const lon = parseFloat(location.lon);

        const redisKey = `medicine:shop:${medicineId}:${lat}:${lon}`;

        const cached = await redis.get(redisKey);
        if (cached) {
            return res.status(200).json(
                new ApiResponse(
                    200,
                    JSON.parse(cached),
                    "shops fetched successfully (cache)"
                )
            );
        }

        // GEO QUERY
        const result = await Pharmacy.aggregate([
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [lon, lat],
                    },
                    distanceField: "distance",
                    spherical: true,
                },
            },

            // join medicine from junction table
            {
                $lookup: {
                    from: "pharmacymedicines",
                    let: { pharmacyId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$pharmacyId", "$$pharmacyId"] },
                                        { $eq: ["$medicineId", new mongoose.Types.ObjectId(medicineId)] },
                                        { $eq: ["$isAvailable", true] },
                                        { $gt: ["$stock", 0] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "medicine",
                },
            },

            {
                $unwind: "$medicine",
            },

            // nearest 10
            {
                $limit: 10,
            },

            // final output
            {
                $project: {
                    _id: 0,
                    pharmacyId: "$_id",
                    name: "$name",
                    contactNumber: "$contactNumber",
                    address: "$address",
                    price: "$medicine.price",
                    discountPrice: "$medicine.discountPrice",
                    stock: "$medicine.stock",
                    distance: { $round: ["$distance", 2] }, // meters
                },
            },
        ]);

        await redis.set(redisKey, JSON.stringify(result), "EX", 600);

        return res.status(200).json(
            new ApiResponse(200, result, "shops fetched successfully")
        );
    }),
];

export const getMedicine = AsyncHandler(async (req, res) => {
    const { medicineId } = req.params
    if (!medicineId) {
        throw new ApiErrors(400, "medicine id is required")
    }

    if (!mongoose.isValidObjectId(medicineId)) {
        throw new ApiErrors(400, "invalid medicine id")
    }

    const redisKey = `medicine:${medicineId}`
    let medicine
    const redisMedicine = await redis.get(redisKey)
    if (redisMedicine) {
        medicine = JSON.parse(redisMedicine)
    } else {
        medicine = await Medicines.findById(medicineId)
            .select("-approvedBy -addedBy")
            .lean()
        if (!medicine) {
            throw new ApiErrors(404, "medicine is not found")
        }

        await redis.set(redisKey,
            JSON.stringify(medicine),
            "EX", 600
        )
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, medicine, "medicine fetch successfully")
        )
})

export const getNearestHospitals = [
    check("location.lat")
        .notEmpty()
        .withMessage("latitude is required")
        .isFloat()
        .withMessage("invalid latitude"),

    check("location.lon")
        .notEmpty()
        .withMessage("longitude is required")
        .isFloat()
        .withMessage("invalid longitude"),

    AsyncHandler(async (req, res) => {
        const error = validationResult(req);

        if (!error.isEmpty()) {
            throw new ApiErrors(400, "invalid value", error.array());
        }

        const { location } = req.body;
        const { department = "all", name = "" } = req.query;

        const lat = parseFloat(location.lat);
        const lon = parseFloat(location.lon);

        // redis key
        const redisKey = `hospitals:near:${lat}:${lon}:dept:${department}:name:${name}`;

        // cache check
        const cached = await redis.get(redisKey);

        if (cached) {
            return res.status(200).json(
                new ApiResponse(
                    200,
                    JSON.parse(cached),
                    "hospital fetched successfully (cache)"
                )
            );
        }

        // filter object
        const matchStage = {};

        // department filter
        if (department.toLowerCase() !== "all") {
            matchStage.specialties = {
                $regex: new RegExp(`^${department}$`, "i")
            };
        }

        // hospital name OR area search
        if (name.trim()) {
            matchStage.$or = [
                {
                    name: {
                        $regex: name,
                        $options: "i"
                    }
                },
                {
                    "address.house": {
                        $regex: name,
                        $options: "i"
                    }
                },
                {
                    "address.street": {
                        $regex: name,
                        $options: "i"
                    }
                },
                {
                    "address.city": {
                        $regex: name,
                        $options: "i"
                    }
                }
            ];
        }

        const hospitals = await Hospitals.aggregate([
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [lon, lat]
                    },
                    distanceField: "distance",
                    spherical: true,
                    query: matchStage
                }
            },

            {
                $limit: 10
            },

            {
                $project: {
                    name: 1,
                    specialties: 1,
                    address: 1,
                    contactNumber: 1,
                    image: {
                        url: "$image.url"
                    },

                    // meter -> kilometer
                    distanceInKm: {
                        $round: [
                            { $divide: ["$distance", 1000] },
                            2
                        ]
                    }
                }
            }
        ]);

        await redis.set(
            redisKey,
            JSON.stringify(hospitals),
            "EX",
            600
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                hospitals,
                "hospital fetched successfully"
            )
        );
    })
];

export const getHospitalDetails = AsyncHandler(async (req, res) => {
    const { hospitalId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
        throw new ApiErrors(400, "Invalid hospital id");
    }

    const cacheKey = `hospital:details:${hospitalId}`;

    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
        return res.status(200).json(
            new ApiResponse(
                200,
                JSON.parse(cachedData),
                "Hospital details fetched (cache)"
            )
        );
    }

    const hospital = await Hospitals.findById(hospitalId).lean();

    if (!hospital) {
        throw new ApiErrors(404, "Hospital not found");
    }

    const departments = await Doctors.aggregate([
        {
            $match: {
                hospitalId: new mongoose.Types.ObjectId(hospitalId)
            }
        },

        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user"
            }
        },

        {
            $unwind: "$user"
        },

        {
            $group: {
                _id: "$department",
                doctors: {
                    $push: {
                        doctorId: "$_id",
                        user: {
                            fullName: "$user.fullName",
                            image: "$user.image"
                        },
                        consultationFee: "$consultationFee",
                        chamberNumber: "$chamberNumber",
                        schedule: "$schedule",
                        slotDuration: "$slotDuration"
                    }
                }
            }
        },

        {
            $project: {
                _id: 0,
                department: "$_id",
                doctors: { $slice: ["$doctors", 5] },
                doctorCount: { $size: "$doctors" }
            }
        },

        {
            $sort: { department: 1 }
        }
    ]);

    // 4. Stats
    const totalDoctors = departments.reduce(
        (sum, dept) => sum + dept.doctorCount,
        0
    );

    const response = {
        hospital,
        stats: {
            totalDoctors,
            totalDepartments: departments.length
        },
        departments
    };

    await redis.set(
        cacheKey,
        JSON.stringify(response),
        "EX",
        600
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                response,
                "Hospital details fetched successfully"
            )
        );
});

export const getHospitalName = AsyncHandler(async (req, res) => {
    const { hospitalName } = req.params
    if (!hospitalName) {
        throw new ApiErrors(400, "hospital name is required")
    }

    const hospitals = await Hospitals.find({
        name: {
            $regex: hospitalName,
            $options: "i"
        }
    })
        .select("_id name")
        .limit(10)

    return res
        .status(200)
        .json(
            new ApiResponse(200, hospitals, "hospital name fetch done")
        )

})

export const getDoctors = [
    check("location.lat")
        .notEmpty()
        .withMessage("latitude is required")
        .isFloat({ min: -90, max: 90 })
        .withMessage("invalid latitude"),

    check("location.lon")
        .notEmpty()
        .withMessage("longitude is required")
        .isFloat({ min: -180, max: 180 })
        .withMessage("invalid longitude"),

    AsyncHandler(async (req, res) => {

        const error = validationResult(req);

        if (!error.isEmpty()) {
            throw new ApiErrors(
                400,
                "validation failed",
                error.array()
            );
        }

        const { location } = req.body;

        const { searchParams } = req.params;

        const parsedParams = new URLSearchParams(searchParams);

        const hospital = parsedParams.get("hospital") || undefined;
        const department = parsedParams.get("department") || undefined;
        const doctorName = parsedParams.get("doctorName") || undefined;
        const page = Number(parsedParams.get("page")) || 1;

        if (hospital && !mongoose.isValidObjectId(hospital)) {
            throw new ApiErrors(400, "invalid hospital id")
        }

        const limit = 10;
        const skip = (page - 1) * limit;

        const redisKey = `doctors:${JSON.stringify({
            lat: location.lat,
            lon: location.lon,
            hospital: hospital || "",
            department: department || "",
            doctorName: doctorName || "",
            page
        })}`;

        const cachedDoctors = await redis.get(redisKey);

        if (cachedDoctors) {
            return res.status(200).json(
                new ApiResponse(
                    200,
                    JSON.parse(cachedDoctors),
                    "doctor fetch successfully"
                )
            );
        }

        const doctorMatchStage = {};

        if (department) {
            doctorMatchStage.department = {
                $regex: department,
                $options: "i"
            };
        }

        const doctors = await Doctors.aggregate([

            {
                $match: doctorMatchStage
            },

            // USER JOIN
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            },

            // DOCTOR NAME SEARCH
            ...(doctorName
                ? [{
                    $match: {
                        "user.fullName": {
                            $regex: doctorName,
                            $options: "i"
                        }
                    }
                }]
                : []),

            {
                $lookup: {
                    from: "hospitals",
                    let: { hospitalId: "$hospitalId" },
                    pipeline: [

                        // MATCH BY ID
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$_id", "$$hospitalId"]
                                }
                            }
                        },
                        ...(hospital
                            ? [{
                                $match:
                                    { _id: new mongoose.Types.ObjectId(hospital) }
                            }]
                            : []),

                        // DISTANCE CALC
                        {
                            $addFields: {
                                distanceInKm: {
                                    $round: [
                                        {
                                            $divide: [
                                                {
                                                    $sqrt: {
                                                        $add: [
                                                            {
                                                                $pow: [
                                                                    {
                                                                        $subtract: [
                                                                            { $arrayElemAt: ["$location.coordinates", 0] },
                                                                            Number(location.lon)
                                                                        ]
                                                                    },
                                                                    2
                                                                ]
                                                            },
                                                            {
                                                                $pow: [
                                                                    {
                                                                        $subtract: [
                                                                            { $arrayElemAt: ["$location.coordinates", 1] },
                                                                            Number(location.lat)
                                                                        ]
                                                                    },
                                                                    2
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                },
                                                111
                                            ]
                                        },
                                        2
                                    ]
                                }
                            }
                        },

                        {
                            $project: {
                                name: 1,
                                distanceInKm: 1
                            }
                        }
                    ],
                    as: "hospital"
                }
            },

            {
                $match: {
                    hospital: { $ne: [] }
                }
            },

            {
                $sort: {
                    "hospital.0.distanceInKm": 1
                }
            },

            {
                $facet: {
                    doctors: [
                        { $skip: skip },
                        { $limit: limit },

                        {
                            $project: {
                                _id: 1,
                                department: 1,
                                consultationFee: 1,

                                doctor: {
                                    _id: "$user._id",
                                    name: "$user.fullName",
                                    image: {
                                        $ifNull: ["$user.image.url", null]
                                    }
                                },

                                hospital: {
                                    $arrayElemAt: ["$hospital", 0]
                                }
                            }
                        }
                    ],

                    totalDoctors: [
                        { $count: "count" }
                    ]
                }
            }
        ]);

        const doctorList = doctors?.[0]?.doctors || [];
        const totalDoctors = doctors?.[0]?.totalDoctors?.[0]?.count || 0;

        const responseData = {
            currentPage: page,
            totalPages: Math.ceil(totalDoctors / limit),
            totalDoctors,
            doctors: doctorList
        };

        await redis.set(
            redisKey,
            JSON.stringify(responseData),
            "EX",
            300
        );

        return res
            .status(200)
            .json(
                new ApiResponse(200, responseData, "doctor fetch successfully")
            );
    })
];