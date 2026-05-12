import { check, validationResult } from 'express-validator'
import AsyncHandler from '../helpers/AsyncHandler.js'
import ApiErrors from '../helpers/ApiErrors.js'
import Medicines from '../models/Medicine.model.js'
import ApiResponse from '../helpers/ApiResponse.js'
import RequestMedicines from '../models/RequestMedicine.model.js'
import mongoose from 'mongoose'
import PharmacyMedicines from '../models/PharmacyMedicine.model.js'
import redis from '../config/redis.js'
import Pharmacy from '../models/Pharmacy.model.js'

export const medicineRequest = [
    check('name')
        .trim()
        .notEmpty()
        .withMessage("medicine name is required"),
    check('genericName')
        .trim()
        .notEmpty()
        .withMessage("generic name is required"),
    check("manufacturer")
        .trim()
        .notEmpty()
        .withMessage("manufacturer name is required"),
    check("medicineType")
        .trim()
        .isIn([
            "tablet",
            "capsule",
            "syrup",
            "injection",
            "cream",
            "ointment",
            "drops",
            "inhaler"
        ])
        .withMessage("medicine type is required"),
    check("strength")
        .trim()
        .notEmpty()
        .withMessage("strength is required"),
    check("description")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("max description length is 500 char"),
    check("requiresPrescription")
        .isBoolean()
        .toBoolean(),
    check("sideEffects.*")
        .optional()
        .trim(),

    AsyncHandler(async (req, res) => {
        const error = validationResult(req)
        if (!error.isEmpty()) {
            throw new ApiErrors(400, "invalid value", error.array())
        }

        const { name, genericName, brandName, manufacturer, medicineType,
            strength, category, description, requiresPrescription, sideEffects } = req.body

        const user = req.user

        const normalizedStrength = strength.toLowerCase().replace(/\s+/g, "")

        const existingMedi = await Medicines.findOne({
            name: name.toLowerCase(),
            strength: normalizedStrength
        })

        if (existingMedi) {
            throw new ApiErrors(400, "medicine already exists")
        }

        const existingReq = await RequestMedicines.findOne({
            name: name.toLowerCase(),
            strength: normalizedStrength
        })
        if (existingReq) {
            throw new ApiErrors(400, "medicine already requested")
        }

        const medicine = await RequestMedicines.create({
            name: name.toLowerCase(),
            genericName: genericName.toLowerCase(),
            brandName,
            manufacturer: manufacturer.toLowerCase(),
            medicineType,
            strength,
            category,
            description,
            requiresPrescription,
            sideEffects,
            addedBy: user._id
        })

        if (!medicine) {
            throw new ApiErrors(500, "medicine is not added")
        }

        return res
            .status(201)
            .json(
                new ApiResponse(201, {}, "Medicine request submitted successfully")
            )
    })
]

export const addMedicineInShop = [
    check('medicineId')
        .trim()
        .notEmpty()
        .withMessage("medicineId is required")
        .isMongoId()
        .withMessage("invalid medicineId"),
    check("stock")
        .notEmpty()
        .withMessage("stock is required")
        .isInt({ gt: 0 })
        .withMessage("input valid stock"),
    check("price")
        .notEmpty()
        .withMessage("price is required")
        .isInt({ gt: 0 })
        .withMessage("input valid price"),
    check("discountPrice")
        .optional()
        .isInt({ gt: 0 })
        .withMessage("input valid discountPrice"),
    check("isAvailable")
        .optional()
        .isBoolean()
        .toBoolean(),

    AsyncHandler(async (req, res) => {
        const error = validationResult(req)
        if (!error.isEmpty()) {
            throw new ApiErrors(400, "invalid input", error.array())
        }

        const { medicineId, stock, price, discountPrice, isAvailable } = req.body
        const user = req.user

        if (discountPrice && discountPrice >= price) {
            throw new ApiErrors(400, "discount price must be less than price")
        }

        const redisKey = `medicine:${medicineId}`
        let medicine

        const redisMedicine = await redis.get(redisKey)
        if (redisMedicine) {
            medicine = JSON.parse(redisMedicine)
        } else {
            medicine = await Medicines.findById(medicineId)
            if (!medicine) {
                throw new ApiErrors(404, "medicine is not found")
            }

            await redis.set(redisKey,
                JSON.stringify(medicine),
                "EX", 300
            )
        }


        const existing = await PharmacyMedicines.findOne({
            pharmacyId: user.pharmacyId,
            medicineId
        })

        if (existing) {
            throw new ApiErrors(400, "medicine already added")
        }

        const pharMedi = await PharmacyMedicines.create({
            pharmacyId: user.pharmacyId,
            medicineId,
            stock,
            price,
            discountPrice,
            isAvailable
        })

        if (!pharMedi) {
            throw new ApiErrors(500, "medicine added failed")
        }

        const keys = await redis.keys(`allMediPharma:${user.pharmacyId}:*`)

        if (keys.length > 0) {
            await redis.del(keys)
        }

        return res
            .status(201)
            .json(
                new ApiResponse(201, pharMedi, "medicine added successfully")
            )
    })
]

export const editMedicineInShop = [
    check("stock")
        .optional()
        .isInt({ min: 0 })
        .withMessage("input valid stock"),

    check("price")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("input valid price"),

    check("discountPrice")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("input valid discountPrice"),

    check("isAvailable")
        .optional()
        .isBoolean()
        .toBoolean(),

    AsyncHandler(async (req, res) => {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            throw new ApiErrors(400, "invalid input", error.array());
        }

        const user = req.user;
        const { pharMediId } = req.params;

        const { stock, price, discountPrice, isAvailable } = req.body;

        if (
            stock === undefined &&
            price === undefined &&
            discountPrice === undefined &&
            isAvailable === undefined
        ) {
            throw new ApiErrors(400, "no update data provided");
        }

        if (!pharMediId || !mongoose.isValidObjectId(pharMediId)) {
            throw new ApiErrors(400, "invalid pharmedi id");
        }

        const pharmedi = await PharmacyMedicines.findOne({
            _id: pharMediId,
            pharmacyId: user.pharmacyId
        });

        if (!pharmedi) {
            throw new ApiErrors(404, "medicine not found in shop");
        }

        const finalPrice = price ?? pharmedi.price;

        if (
            discountPrice !== undefined &&
            discountPrice >= finalPrice
        ) {
            throw new ApiErrors(
                400,
                "discount price must be less than price"
            );
        }

        const updateData = {};

        if (stock !== undefined) updateData.stock = stock;
        if (price !== undefined) updateData.price = price;
        if (discountPrice !== undefined) updateData.discountPrice = discountPrice;
        if (isAvailable !== undefined) updateData.isAvailable = isAvailable;

        if (stock !== undefined && stock === 0) {
            updateData.isAvailable = false;
        }

        const updatedPharmedi = await PharmacyMedicines.findOneAndUpdate(
            {
                _id: pharMediId,
                pharmacyId: user.pharmacyId
            },
            {
                $set: updateData
            },
            {
                new: true
            }
        );

        if (!updatedPharmedi) {
            throw new ApiErrors(500, "failed to update medicine");
        }

        await redis.del(`shopMedicine:${user.pharmacyId}:${pharMediId}`)

        return res.status(200).json(
            new ApiResponse(
                200,
                updatedPharmedi,
                "medicine updated successfully"
            )
        );
    })
];

export const getAllMedicine = AsyncHandler(async (req, res) => {
    const user = req.user;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search?.trim() || "";

    const redisKey = `allMediPharma:${user.pharmacyId}:page:${page}:limit:${limit}:search:${search}`;

    let allMedi;

    const redisAllMedi = await redis.get(redisKey);

    if (redisAllMedi) {
        allMedi = JSON.parse(redisAllMedi);
    } else {
        let medicineIds = [];

        if (search) {
            const medicines = await Medicines.find({
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { genericName: { $regex: search, $options: "i" } },
                    { strength: { $regex: search, $options: "i" } },
                ]
            }).select("_id");

            medicineIds = medicines.map((item) => item._id);
        }

        // main query
        const query = {
            pharmacyId: user.pharmacyId,
            ...(search && {
                medicineId: { $in: medicineIds }
            })
        };

        const [data, total] = await Promise.all([
            PharmacyMedicines.find(query)
                .populate({
                    path: "medicineId",
                    select: "_id name genericName strength medicineType"
                })
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),

            PharmacyMedicines.countDocuments(query)
        ]);

        allMedi = {
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };

        await redis.set(redisKey, JSON.stringify(allMedi), "EX", 300);
    }

    return res.status(200).json(
        new ApiResponse(200, allMedi, "all medicine fetch successful")
    );
});

export const getMedicineFromShop = AsyncHandler(async (req, res) => {
    const user = req.user
    const { medicineId } = req.params
    if (!medicineId) {
        throw new ApiErrors(400, "medicine id is required")
    }

    const redisKey = `shopMedicine:${user.pharmacyId}:${medicineId}`
    let medicine

    const redisMedicine = await redis.get(redisKey)
    if (redisMedicine) {
        medicine = JSON.parse(redisMedicine)
    } else {
        medicine = await PharmacyMedicines.findOne({
            _id: medicineId,
            pharmacyId: user.pharmacyId
        })
            .populate({
                path: "medicineId",
                select: "_id name genericName medicineType strength"
            })
            .select("stock price discountPrice isAvailable")
            .lean()

        if (!medicine) {
            throw new ApiErrors(404, "medicine not found")
        }

        await redis.set(redisKey,
            JSON.stringify(medicine),
            "EX", 300
        )
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, medicine, "medicine fetch done")
        )
})

export const deleteMedicineFromShop = AsyncHandler(async (req, res) => {
    const user = req.user
    const { medicineId } = req.params
    if (!medicineId) {
        throw new ApiErrors(400, "medicine id is required")
    }

    const redisKey = `shopMedicine:${user.pharmacyId}:${medicineId}`
    try {
        await PharmacyMedicines.findOneAndDelete({
            _id: medicineId,
            pharmacyId: user.pharmacyId
        })
    } catch (error) {
        throw new ApiErrors(404, "medicine not found in shop")
    }

    await redis.del(redisKey)

    return res
        .status(200)
        .json(
            new ApiResponse(200, medicineId, "medicine delete from shop done")
        )
})

export const pharmacyDashboard = AsyncHandler(async (req, res) => {
    const user = req.user;

    const pharmacyId = user.pharmacyId

    const redisKey = `pharmacyDashboard:${pharmacyId}`
    const redisData = await redis.get(redisKey)

    let data
    if (redisData) {
        data = JSON.parse(redisData)
    } else {
        const [
            totalMedicines,
            availableMedicines,
            outOfStock,
            lowStockMedicines,
            recentMedicines,
            pharmacyInfo
        ] = await Promise.all([

            PharmacyMedicines.countDocuments({
                pharmacyId
            }),

            // available medicines
            PharmacyMedicines.countDocuments({
                pharmacyId,
                stock: { $gt: 0 },
                isAvailable: true
            }),

            // out of stock
            PharmacyMedicines.countDocuments({
                pharmacyId,
                stock: 0
            }),

            // low stock
            PharmacyMedicines.countDocuments({
                pharmacyId,
                stock: { $gt: 0, $lte: 10 }
            }),

            // recently added medicines
            PharmacyMedicines.find({
                pharmacyId
            })
                .populate({
                    path: "medicineId",
                    select: "name genericName strength medicineType"
                })
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),

            // pharmacy basic info
            Pharmacy.findById(pharmacyId)
                .select("name image.url address contactNumber")
        ]);

        data = {
            pharmacyInfo,

            overview: {
                totalMedicines,
                availableMedicines,
                outOfStock,
                lowStockMedicines
            },

            recentMedicines
        }

        await redis.set(redisKey,
            JSON.stringify(data),
            "EX", 600
        )
    }


    return res
        .status(200)
        .json(
            new ApiResponse(200, data, "pharmacy dashboard fetch successfully")
        );
});