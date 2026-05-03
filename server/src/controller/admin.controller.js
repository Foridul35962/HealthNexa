import mongoose from "mongoose";
import redis from "../config/redis.js";
import ApiErrors from "../helpers/ApiErrors.js";
import ApiResponse from "../helpers/ApiResponse.js";
import AsyncHandler from "../helpers/AsyncHandler.js";
import RequestHospitals from "../models/RequestHospitals.model.js";
import RequestPharmacy from "../models/RequestPharmacy.model.js";
import {
    generateHospitalAcceptanceMail,
    generateHospitalRejectionMail,
    generatePharmacyAcceptanceMail,
    generatePharmacyRejectionMail,
    sendBrevoMail
} from "../config/mail.js";
import Hospitals from "../models/Hospitals.model.js";
import Users from "../models/Users.model.js";
import Pharmacy from "../models/Pharmacy.model.js";

export const getAllHospitalRequest = AsyncHandler(async (req, res) => {
    const redisKey = "Request:hospital"
    let allHospitals

    const redisHospital = await redis.get(redisKey)
    if (redisHospital) {
        allHospitals = JSON.parse(redisHospital)
    } else {
        allHospitals = await RequestHospitals.find()
            .select("-password")
            .sort({ createdAt: 1 })
            .lean()
        await redis.set(redisKey,
            JSON.stringify(allHospitals),
            "EX", 300
        )
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, allHospitals, "all request hospital fetch done")
        )
})

export const getAllPharmacyRequest = AsyncHandler(async (req, res) => {
    const redisKey = "Request:pharmacy"
    let allPharmacy

    const redisPharmacy = await redis.get(redisKey)
    if (redisPharmacy) {
        allPharmacy = JSON.parse(redisPharmacy)
    } else {
        allPharmacy = await RequestPharmacy.find()
            .select("-password")
            .sort({ createdAt: 1 })
            .lean()
        await redis.set(redisKey,
            JSON.stringify(allPharmacy),
            "EX", 300
        )
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, allPharmacy, "all request pharmacy fetch done")
        )
})

export const getHospitalFromRequest = AsyncHandler(async (req, res) => {
    const { hospitalId } = req.params
    if (!hospitalId) {
        throw new ApiErrors(400, "hospital id is required")
    }

    if (!mongoose.isValidObjectId(hospitalId)) {
        throw new ApiErrors(400, "invalid hospitalId")
    }

    const redisHospitalReqKey = `hospitalReq:${hospitalId}`

    let hospital;

    const redisHospital = await redis.get(redisHospitalReqKey)
    if (redisHospital) {
        hospital = JSON.parse(redisHospital)
    } else {
        hospital = await RequestHospitals.findById(hospitalId)
            .select("-password")
            .lean()
    }

    if (!hospital) {
        throw new ApiErrors(404, "hospital is not found")
    }

    if (!redisHospital) {
        await redis.set(redisHospitalReqKey,
            JSON.stringify(hospital),
            "EX", 300
        )
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, hospital, "hospital fetch done")
        )

})

export const deleteHospitalRequest = AsyncHandler(async (req, res) => {
    const { hospitalId } = req.params
    if (!hospitalId) {
        throw new ApiErrors(400, "hospital id is required")
    }

    if (!mongoose.isValidObjectId(hospitalId)) {
        throw new ApiErrors(400, "invalid hospitalId")
    }

    const redisHospitalReqKey = `hospitalReq:${hospitalId}`

    let hospital

    const redisHospital = await redis.get(redisHospitalReqKey)

    if (redisHospital) {
        hospital = JSON.parse(redisHospital)
    } else {
        hospital = await RequestHospitals.findById(hospitalId)
    }

    if (!hospital) {
        throw new ApiErrors(404, "hospital is not found")
    }

    const { subject, html } = generateHospitalRejectionMail(hospital.name)

    try {
        await sendBrevoMail(hospital.email, subject, html)
    } catch (error) {
        throw new ApiErrors(500, "mail send failed")
    }

    if (redisHospital) {
        await RequestHospitals.findByIdAndDelete(hospitalId)
        await redis.del(redisHospitalReqKey)
    } else {
        await hospital.deleteOne()
    }
    await redis.del("Request:hospital")

    return res
        .status(200)
        .json(
            new ApiResponse(200, hospitalId, "hospital request deleted")
        )
})

export const getPharmacyFromRequest = AsyncHandler(async (req, res) => {
    const { pharmacyId } = req.params
    if (!pharmacyId) {
        throw new ApiErrors(400, "pharmacy id is required")
    }

    if (!mongoose.isValidObjectId(pharmacyId)) {
        throw new ApiErrors(400, "invalid pharmacyId")
    }

    const redisPharmacyReqKey = `pharmacyReq:${pharmacyId}`

    let pharmacy;

    const redisPharmacy = await redis.get(redisPharmacyReqKey)
    if (redisPharmacy) {
        pharmacy = JSON.parse(redisPharmacy)
    } else {
        pharmacy = await RequestPharmacy.findById(pharmacyId)
            .select("-password")
            .lean()
    }

    if (!pharmacy) {
        throw new ApiErrors(404, "pharmacy is not found")
    }

    if (!redisPharmacy) {
        await redis.set(redisPharmacyReqKey,
            JSON.stringify(pharmacy),
            "EX", 300
        )
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, pharmacy, "pharmacy fetch done")
        )

})

export const deletePharmacyRequest = AsyncHandler(async (req, res) => {
    const { pharmacyId } = req.params
    if (!pharmacyId) {
        throw new ApiErrors(400, "pharmacy id is required")
    }

    if (!mongoose.isValidObjectId(pharmacyId)) {
        throw new ApiErrors(400, "invalid pharmacyId")
    }

    const redisPharmacyReqKey = `pharmacyReq:${pharmacyId}`

    let pharmacy

    const redisPharmacy = await redis.get(redisPharmacyReqKey)

    if (redisPharmacy) {
        pharmacy = JSON.parse(redisPharmacy)
    } else {
        pharmacy = await RequestPharmacy.findById(pharmacyId)
    }

    if (!pharmacy) {
        throw new ApiErrors(404, "pharmacy is not found")
    }

    const { subject, html } = generatePharmacyRejectionMail(pharmacy.name)

    try {
        await sendBrevoMail(pharmacy.email, subject, html)
    } catch (error) {
        throw new ApiErrors(500, "mail send failed")
    }

    if (redisPharmacy) {
        await RequestPharmacy.findByIdAndDelete(pharmacyId)
        await redis.del(redisPharmacyReqKey)
    } else {
        await pharmacy.deleteOne()
    }
    await redis.del("Request:pharmacy")

    return res
        .status(200)
        .json(
            new ApiResponse(200, pharmacyId, "pharmacy request deleted")
        )
})

export const addHospital = AsyncHandler(async (req, res) => {
    const { hospitalId } = req.params
    if (!hospitalId) {
        throw new ApiErrors(400, "hospital id is required")
    }

    if (!mongoose.isValidObjectId(hospitalId)) {
        throw new ApiErrors(400, "invalid hospital id")
    }

    // const session = await mongoose.startSession()
    // session.startTransaction()

    try {
        const reqHospital = await RequestHospitals.findById(hospitalId)
        // .session(session)

        if (!reqHospital) {
            throw new ApiErrors(404, "hospital is not found in request")
        }

        const hospital = await Hospitals.create([{
            name: reqHospital.name,
            address: reqHospital.address,
            contactNumber: reqHospital.contactNumber,
            specialties: reqHospital.specialties,
            location: reqHospital.location
        }]
            // , { session }
        )

        if (!hospital || hospital.length === 0) {
            throw new ApiErrors(500, 'hospital added failed')
        }

        const user = await Users.create([{
            fullName: reqHospital.fullName,
            email: reqHospital.email,
            phoneNumber: reqHospital.phoneNumber,
            password: reqHospital.password,
            role: "hospitalStaff",
            staffRole: "hospitalAdmin",
            hospitalId: hospital[0]._id
        }]
            // , { session }
        )

        if (!user || user.length === 0) {
            throw new ApiErrors(500, "user created failed")
        }

        const { subject, html } = generateHospitalAcceptanceMail(hospital[0].name)

        try {
            await sendBrevoMail(user[0].email, subject, html)
        } catch (error) {
            console.error("Mail failed", error)
        }

        await reqHospital.deleteOne(
            // { session }
        )

        // await session.commitTransaction()
        // session.endSession()

        await redis.del(`hospitalReq:${hospitalId}`)
        await redis.del("Request:hospital")

        return res
            .status(200)
            .json(
                new ApiResponse(200, hospitalId, "hospital added successfully")
            )

    } catch (error) {
        // await session.abortTransaction()
        // session.endSession()
        throw error
    }
})

export const addPharmacy = AsyncHandler(async (req, res) => {
    const { pharmacyId } = req.params
    if (!pharmacyId) {
        throw new ApiErrors(400, "pharmacy id is required")
    }

    if (!mongoose.isValidObjectId(pharmacyId)) {
        throw new ApiErrors(400, "invalid pharmacy id")
    }

    // const session = await mongoose.startSession()
    // session.startTransaction()

    try {
        const reqPharmacy = await RequestPharmacy.findById(pharmacyId)
        // .session(session)

        if (!reqPharmacy) {
            throw new ApiErrors(404, "pharmacy is not found in request")
        }

        const pharmacy = await Pharmacy.create([{
            name: reqPharmacy.name,
            address: reqPharmacy.address,
            contactNumber: reqPharmacy.contactNumber,
            location: reqPharmacy.location
        }]
            // , { session }
        )

        if (!pharmacy || pharmacy.length === 0) {
            throw new ApiErrors(500, 'pharmacy added failed')
        }

        const user = await Users.create([{
            fullName: reqPharmacy.fullName,
            email: reqPharmacy.email,
            phoneNumber: reqPharmacy.phoneNumber,
            password: reqPharmacy.password,
            role: "pharmacyOwner",
            pharmacyId: pharmacy[0]._id
        }]
            // , { session }
        )

        if (!user || user.length === 0) {
            throw new ApiErrors(500, "user created failed")
        }

        const { subject, html } = generatePharmacyAcceptanceMail(pharmacy[0].name)

        try {
            await sendBrevoMail(user[0].email, subject, html)
        } catch (error) {
            console.error("Mail failed", error)
        }

        await reqPharmacy.deleteOne(
            // { session }
        )

        // await session.commitTransaction()
        // session.endSession()

        await redis.del(`pharmacyReq:${pharmacyId}`)
        await redis.del("Request:pharmacy")

        return res
            .status(200)
            .json(
                new ApiResponse(200, pharmacyId, "pharmacy added successfully")
            )

    } catch (error) {
        // await session.abortTransaction()
        // session.endSession()
        throw error
    }
})