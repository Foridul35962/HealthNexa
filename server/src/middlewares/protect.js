import jwt from "jsonwebtoken";
import AsyncHandler from "../helpers/AsyncHandler.js";
import ApiErrors from "../helpers/ApiErrors.js";
import Users from "../models/Users.model.js";

const protect = AsyncHandler(async (req, res, next) => {
    const { token } = req.cookies
    if (!token) {
        throw new ApiErrors(401, 'unathonticated access')
    }

    let decoded
    try {
        decoded = await jwt.verify(token, process.env.TOKEN_SECRET)
    } catch (error) {
        throw new ApiErrors(401, 'unathonticated access')
    }

    if (!decoded) {
        throw new ApiErrors(401, 'unathonticated access')
    }

    const userId = decoded.userId
    const user = await Users.findById(userId).select('-password')
    if (!user) {
        throw new ApiErrors(404, 'user not found')
    }

    req.user = user
    next()
})

export default protect