import ApiErrors from "../helpers/ApiErrors.js";
import AsyncHandler from "../helpers/AsyncHandler.js";

const isPatient = AsyncHandler(async (req, res, next) => {
    const user = req.user

    if (user.role !== "patient") {
        throw new ApiErrors(403, "unauthorized access")
    }

    next()
})

export default isPatient