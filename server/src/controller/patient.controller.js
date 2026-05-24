import mongoose from "mongoose";
import redis from "../config/redis.js";
import ApiErrors from "../helpers/ApiErrors.js";
import ApiResponse from "../helpers/ApiResponse.js";
import AsyncHandler from "../helpers/AsyncHandler.js";
import SymptomChecker from "../models/SymptomChecker.model.js";


export const getAllAISymptom = AsyncHandler(async (req, res) => {
    const userId = req.user._id;

    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    if (page < 1) {
        throw new ApiErrors(400, "page must be greater than 0");
    }

    const skip = (page - 1) * limit;

    // redis key
    const redisKey = `allSymptoms:${userId}:page:${page}:limit:${limit}`;

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