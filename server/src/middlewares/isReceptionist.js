import ApiErrors from "../helpers/ApiErrors.js";
import AsyncHandler from "../helpers/AsyncHandler.js";

const isReceptionist = AsyncHandler(async(req, res, next)=>{
    const user = req.user

    if (user.role !== "hospitalStaff" || user.staffRole !== "receptionist") {
        throw new ApiErrors(403, "unauthorized access")
    }

    next()
})

export default isReceptionist