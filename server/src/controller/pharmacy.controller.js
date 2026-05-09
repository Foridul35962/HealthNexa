import { check, validationResult } from 'express-validator'
import AsyncHandler from '../helpers/AsyncHandler.js'
import ApiErrors from '../helpers/ApiErrors.js'
import Medicines from '../models/Medicine.model.js'
import ApiResponse from '../helpers/ApiResponse.js'
import RequestMedicines from '../models/RequestMedicine.model.js'
import mongoose from 'mongoose'
import PharmacyMedicines from '../models/PharmacyMedicine.model.js'
import redis from '../config/redis.js'

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

        await redis.del(`allMediPharma:${user.pharmacyId}`)

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

        return res.status(200).json(
            new ApiResponse(
                200,
                updatedPharmedi,
                "medicine updated successfully"
            )
        );
    })
];

export const getAllMedicine = AsyncHandler(async(req, res)=>{
    const user = req.user
    const redisKey = `allMediPharma:${user.pharmacyId}`
    let allMedi
    const redisAllMedi = await redis.get(redisKey)
    if (redisAllMedi) {
        allMedi = JSON.parse(allMedi)
    } else {
        allMedi = await PharmacyMedicines.find({pharmacyId: user.pharmacyId})
        await redis.set(redisKey,
            JSON.stringify(allMedi),
            "EX", 300
        )
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, allMedi, "all medicine fetch successfull")
        )
})