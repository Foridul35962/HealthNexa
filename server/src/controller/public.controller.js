import redis from "../config/redis.js";
import ApiErrors from "../helpers/ApiErrors.js";
import ApiResponse from "../helpers/ApiResponse.js";
import AsyncHandler from "../helpers/AsyncHandler.js";
import Doctors from "../models/Doctors.model.js";
import Medicines from "../models/Medicine.model.js";

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
        .select("_id name genericName strength")
        .limit(10)

    return res
        .status(200)
        .json(
            new ApiResponse(200, medicines, "medicine name fetch done")
        )
})