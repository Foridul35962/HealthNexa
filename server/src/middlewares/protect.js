import jwt from "jsonwebtoken";
import AsyncHandler from "../helpers/AsyncHandler.js";
import ApiErrors from "../helpers/ApiErrors.js";
import Users from "../models/Users.model.js";
import redis from "../config/redis.js";
import mongoose from "mongoose";

const protect = AsyncHandler(async (req, res, next) => {
    const { token } = req.cookies
    if (!token) {
        throw new ApiErrors(401, 'unauthenticated access')
    }

    let decoded
    try {
        decoded = jwt.verify(token, process.env.TOKEN_SECRET)
    } catch (error) {
        throw new ApiErrors(401, 'unauthenticated access')
    }

    if (!decoded) {
        throw new ApiErrors(401, 'unauthenticated access')
    }

    const userId = decoded.userId
    let user
    const redisKey = `userId:${userId}`
    const redisUser = await redis.get(redisKey)
    if (redisUser) {
        user = JSON.parse(redisUser)
        user._id = new mongoose.Types.ObjectId(user._id)
        if (user.hospitalId) {
            user.hospitalId = new mongoose.Types.ObjectId(user.hospitalId)
        }
        if (user.pharmacyId) {
            user.pharmacyId = new mongoose.Types.ObjectId(user.pharmacyId)
        }
    } else {
        user = await Users.findById(userId)
            .select('-password')
            .lean()

        if (!user) {
            throw new ApiErrors(404, 'user not found')
        }

        await redis.set(redisKey,
            JSON.stringify(user),
            "EX", 300
        )
    }

    req.user = user
    next()
})

export default protect