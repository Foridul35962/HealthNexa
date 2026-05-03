import ApiErrors from "../helpers/ApiErrors.js";
import AsyncHandler from "../helpers/AsyncHandler.js";

const isAdmin = AsyncHandler(async(req, res, next)=>{
    const user = req.user

    if (user.role !== "admin") {
        throw new ApiErrors(401, "unauthorized access")
    }

    next()
})

export default isAdmin