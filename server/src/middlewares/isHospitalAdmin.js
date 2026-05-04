import ApiErrors from "../helpers/ApiErrors.js";
import AsyncHandler from "../helpers/AsyncHandler.js";

const isHospitalAdmin = AsyncHandler(async(req, res, next)=>{
    const user = req.user

    if (user.role !== "hospitalStaff" || user.staffRole !== "hospitalAdmin") {
        throw new ApiErrors(403, "unauthorized access")
    }

    next()
})

export default isHospitalAdmin