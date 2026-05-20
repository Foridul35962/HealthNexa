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