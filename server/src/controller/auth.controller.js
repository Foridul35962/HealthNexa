import ApiErrors from "../helpers/ApiErrors.js";
import AsyncHandler from "../helpers/AsyncHandler.js";
import { check, validationResult } from 'express-validator'
import Users from "../models/Users.model.js";
import bcrypt from 'bcryptjs'
import ApiResponse from "../helpers/ApiResponse.js";
import { generateHospitalVerificationMail, generatePasswordResetMail, generateVerificationMail, sendBrevoMail } from "../config/mail.js";
import jwt from 'jsonwebtoken'
import redis from "../config/redis.js";
import Hospitals from "../models/Hospitals.model.js";
import RequestHospitals from "../models/RequestHospitals.model.js";

export const registrationPatient = [
    check('fullName')
        .trim()
        .notEmpty()
        .withMessage('FullName is required'),
    check('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Enter a valid Email'),
    check('phoneNumber')
        .trim()
        .notEmpty()
        .withMessage('phoneNumber is required')
        .isMobilePhone('bn-BD')
        .withMessage('phoneNumber is unvalid'),
    check('password')
        .trim()
        .notEmpty()
        .withMessage('password is required')
        .isLength({ min: 8 })
        .withMessage('password must be at least 8 characters')
        .matches(/[a-zA-Z]/)
        .withMessage('password must contain a letter')
        .matches(/[0-9]/)
        .withMessage('password must contain a number'),

    AsyncHandler(async (req, res) => {
        const { fullName, email, role, phoneNumber, password } = req.body

        if (role !== 'patient') {
            throw new ApiErrors(400, 'invalid role')
        }

        const error = validationResult(req)
        if (!error.isEmpty()) {
            throw new ApiErrors(400, 'unvalid value', error.array())
        }

        const limitKey = `authLimit:${email}`
        const count = await redis.incr(limitKey)

        if (count === 1) {
            await redis.expire(limitKey, 1800)
        }

        if (count > 10) {
            throw new ApiErrors(429, 'too many request')
        }

        const existingUser = await Users.findOne({ email })
        if (existingUser) {
            throw new ApiErrors(400, 'user already registered')
        }

        const hashPassword = await bcrypt.hash(password, 12)

        const otp = Math.floor(100000 + Math.random() * 900000).toString()

        try {
            const { subject, html } = generateVerificationMail(otp)
            await sendBrevoMail(email, subject, html)
        } catch (error) {
            throw new ApiErrors(500, 'email send failed')
        }

        const coolDownKey = `coolDownMail:${email}`
        await redis.set(coolDownKey, "1", "EX", 60)

        const redisKey = `userRegistration:${email}`
        await redis.set(redisKey, JSON.stringify({
            fullName: fullName,
            email: email,
            role: role,
            phoneNumber: phoneNumber,
            password: hashPassword,
            otp: otp,
            verify: false
        }), "EX", 300)

        return res
            .status(202)
            .json(
                new ApiResponse(202, {}, 'user registration successfully')
            )
    })
]

export const verifyRegi = AsyncHandler(async (req, res) => {
    const { email, otp } = req.body
    if (!email || !otp) {
        throw new ApiErrors(400, 'all value are required')
    }

    const limitKey = `authLimit:${email}`
    const count = await redis.incr(limitKey)

    if (count === 1) {
        await redis.expire(limitKey, 1800)
    }

    if (count > 10) {
        throw new ApiErrors(429, 'too many request')
    }

    const redisKey = `userRegistration:${email}`

    const redisUserString = await redis.get(redisKey)

    if (!redisUserString) {
        throw new ApiErrors(400, 'otp is expired')
    }

    const redisUser = JSON.parse(redisUserString)

    if (redisUser.otp !== otp) {
        throw new ApiErrors(400, 'otp is not matched')
    }

    const user = await Users.create({
        fullName: redisUser.fullName,
        password: redisUser.password,
        role: redisUser.role,
        email: redisUser.email,
        phoneNumber: redisUser.phoneNumber
    })

    if (!user) {
        throw new ApiErrors(500, 'user created failed')
    }

    user.password = undefined

    await redis.del(redisKey)
    await redis.del(limitKey)

    return res
        .status(201)
        .json(
            new ApiResponse(201, {}, 'user verify successfully')
        )
})

export const login = [
    check('email')
        .trim()
        .isEmail()
        .withMessage('Enter a valid Email'),
    check('password')
        .trim()
        .isLength({ min: 8 })
        .withMessage('password is not matched')
        .matches(/[a-zA-Z]/)
        .withMessage('password is not matched')
        .matches(/[0-9]/)
        .withMessage('password is not matched'),

    AsyncHandler(async (req, res) => {
        const { email, password } = req.body

        const error = validationResult(req)
        if (!error.isEmpty()) {
            throw new ApiErrors(400, 'unvalid value', error.array())
        }

        const limitKey = `authLimit:${email}`

        const count = await redis.incr(limitKey)
        if (count === 1) {
            await redis.expire(limitKey, 1800)
        }

        if (count > 10) {
            throw new ApiErrors(429, 'too many request')
        }

        let user

        const redisKey = `user:${email}`

        const redisUser = await redis.get(redisKey)

        if (!redisUser) {
            user = await Users.findOne({ email }).lean()
        } else {
            user = JSON.parse(redisUser)
        }

        if (!user) {
            throw new ApiErrors(404, 'user is not registered')
        }

        if (!redisUser) {
            await redis.set(
                redisKey,
                JSON.stringify(user),
                "EX",
                600
            )
        }

        const isPassCorrect = await bcrypt.compare(password, user.password)
        if (!isPassCorrect) {
            throw new ApiErrors(400, 'Password is not correct')
        }

        const token = await jwt.sign({ userId: user._id },
            process.env.TOKEN_SECRET,
            { expiresIn: process.env.TOKEN_EXPIRY }
        )

        const tokenOption = {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 10 * 24 * 60 * 60 * 1000
        }

        user.password = undefined
        if (user.image) {
            user.image.publicId = undefined
        }

        await redis.del(limitKey)

        return res
            .status(200)
            .cookie('token', token, tokenOption)
            .json(
                new ApiResponse(200, user, 'user logged in successfully')
            )
    })
]

export const logOut = AsyncHandler(async (req, res) => {
    const tokenOption = {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 10 * 24 * 60 * 60 * 1000
    }

    return res
        .status(200)
        .clearCookie('token', tokenOption)
        .json(
            new ApiResponse(200, {}, 'user logout successfully')
        )
})

export const forgetPass = [
    check('email')
        .trim()
        .isEmail()
        .withMessage('Enter a valid Email'),

    AsyncHandler(async (req, res) => {
        const { email } = req.body

        const error = validationResult(req)
        if (!error.isEmpty()) {
            throw new ApiErrors(400, 'unvalid value', error.array())
        }

        const limitKey = `authLimit:${email}`

        const count = await redis.incr(limitKey)
        if (count === 1) {
            await redis.expire(limitKey, 1800)
        }

        if (count > 10) {
            throw new ApiErrors(429, 'too many request')
        }

        let user

        const redisKey = `user:${email}`

        const redisUser = await redis.get(redisKey)
        if (!redisUser) {
            user = await Users.findOne({ email }).lean()
        } else {
            user = JSON.parse(redisUser)
        }

        if (!user) {
            throw new ApiErrors(404, 'user is not registered')
        }

        if (!redisUser) {
            await redis.set(
                redisKey,
                JSON.stringify(user),
                "EX",
                600
            )
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString()

        const { subject, html } = generatePasswordResetMail(otp)

        try {
            await sendBrevoMail(email, subject, html)
        } catch (error) {
            throw new ApiErrors(500, 'otp send failed')
        }

        const coolDownKey = `coolDownMail:${email}`
        await redis.set(coolDownKey, "1", "EX", 60)

        const resetRedisKey = `resetPass:${email}`

        await redis.set(resetRedisKey,
            JSON.stringify({
                otp: otp
            }),
            "EX",
            300
        )

        return res
            .status(200)
            .json(
                new ApiResponse(200, {}, 'otp send successfully')
            )
    })
]

export const verifyResetPass = [
    check('email')
        .trim()
        .isEmail()
        .withMessage('Enter a valid Email'),
    check('otp')
        .trim()
        .isNumeric()
        .isLength({ min: 6, max: 6 })
        .withMessage('OTP must be a 6 digit number'),

    AsyncHandler(async (req, res) => {
        const { email, otp } = req.body

        const error = validationResult(req)
        if (!error.isEmpty()) {
            throw new ApiErrors(400, 'unvalid value', error.array())
        }

        const limitKey = `authLimit:${email}`

        const count = await redis.incr(limitKey)
        if (count === 1) {
            await redis.expire(limitKey, 1800)
        }

        if (count > 10) {
            throw new ApiErrors(429, 'too many request')
        }

        const resetRedisKey = `resetPass:${email}`

        const redisUser = await redis.get(resetRedisKey)

        if (!redisUser) {
            throw new ApiErrors(410, 'otp is expired')
        }

        const user = JSON.parse(redisUser)

        if (otp !== user.otp) {
            throw new ApiErrors(400, 'otp is not matched')
        }

        await redis.set(resetRedisKey,
            JSON.stringify({
                verified: true
            }),
            "EX", 300
        )

        return res
            .status(200)
            .json(
                new ApiResponse(200, {}, 'otp is verified')
            )
    })
]

export const resetPass = [
    check('email')
        .trim()
        .isEmail()
        .withMessage('Enter a valid Email'),
    check('password')
        .trim()
        .isLength({ min: 8 })
        .withMessage('password is not matched')
        .matches(/[a-zA-Z]/)
        .withMessage('password is not matched')
        .matches(/[0-9]/)
        .withMessage('password is not matched'),

    AsyncHandler(async (req, res) => {
        const { email, password } = req.body

        const error = validationResult(req)
        if (!error.isEmpty()) {
            throw new ApiErrors(400, 'unvalid value', error.array())
        }

        const resetRedisKey = `resetPass:${email}`

        const redisValidity = await redis.get(resetRedisKey)

        if (!redisValidity) {
            throw new ApiErrors(410, 'time expired, try again')
        }

        const validation = JSON.parse(redisValidity)
        if (!validation.verified) {
            throw new ApiErrors(401, 'email is not verified')
        }

        const hashPassword = await bcrypt.hash(password, 12)

        const user = await Users.findOneAndUpdate({ email },
            { password: hashPassword }
        )

        if (!user) {
            throw new ApiErrors(404, 'user not found and reset password failed')
        }

        const limitKey = `authLimit:${email}`
        await redis.del(limitKey)
        await redis.del(resetRedisKey)

        return res
            .status(200)
            .json(
                new ApiResponse(200, {}, 'password reset successfully')
            )
    })
]

export const resendOtp = [
    check('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Enter a valid Email'),
    check('topic')
        .trim()
        .notEmpty()
        .withMessage('topic is required'),

    AsyncHandler(async (req, res) => {
        const { email, topic } = req.body

        const error = validationResult(req)
        if (!error.isEmpty()) {
            throw new ApiErrors(400, 'unvalid value', error.array())
        }

        const limitKey = `authLimit:${email}`

        const count = await redis.incr(limitKey)
        if (count === 1) {
            await redis.expire(limitKey, 1800)
        }

        if (count > 10) {
            throw new ApiErrors(429, 'too many request')
        }

        const coolDownKey = `coolDownMail:${email}`
        const ttl = await redis.ttl(coolDownKey)

        if (ttl > 0) {
            throw new ApiErrors(429, `please wait ${ttl}s before resending OTP`)
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString()

        let mailData;

        if (topic === 'registration') {
            mailData = generateVerificationMail(otp)

            const redisKey = `userRegistration:${email}`
            const redisValue = await redis.get(redisKey)
            if (!redisValue) {
                throw new ApiErrors(400, 'value is expired, try again')
            }

            const redisValues = JSON.parse(redisValue)

            await redis.set(redisKey, JSON.stringify({
                fullName: redisValues.fullName,
                email: redisValues.email,
                role: redisValues.role,
                phoneNumber: redisValues.phoneNumber,
                password: redisValues.password,
                otp: otp,
                verify: false
            }), "EX", 300)
        }
        else if (topic === 'forgetPass') {
            mailData = generatePasswordResetMail(otp);

            const resetRedisKey = `resetPass:${email}`

            await redis.set(resetRedisKey,
                JSON.stringify({
                    otp: otp,
                    verify: false
                }),
                "EX",
                300
            )
        }
        else if (topic === "regiHospital") {
            const redisKey = `userRegistration:${email}`

            const redisValue = await redis.get(redisKey)
            if (!redisValue) {
                throw new ApiErrors(400, 'value is expired, try again')
            }

            const redisValues = JSON.parse(redisValue)

            await redis.set(redisKey, JSON.stringify({
                fullName: redisValues.fullName,
                email: redisValues.email,
                phoneNumber: redisValues.phoneNumber,
                password: redisValues.password,
                name: redisValues.name,
                address: redisValues.address,
                contactNumber: redisValues.contactNumber,
                specialties: redisValues.specialties,
                location: redisValues.location,
                otp: otp,
                verify: false
            }), "EX", 300)

            mailData = generateHospitalVerificationMail(otp, redisValues.name)
        }

        const { subject, html } = mailData;

        try {
            await sendBrevoMail(email, subject, html)
        } catch (error) {
            throw new ApiErrors(400, 'resend otp send failed')
        }

        await redis.set(coolDownKey, "1", "EX", 60)

        return res
            .status(200)
            .json(
                new ApiResponse(200, {}, 'otp send successfully')
            )
    })
]

export const fetchUser = AsyncHandler(async (req, res) => {
    const user = req.user
    if (user.image.publicId) {
        user.image.publicId = undefined
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, user, 'user fetch successfully')
        )
})

export const hospitalRegistrationRequest = [
    check('fullName')
        .trim()
        .notEmpty()
        .withMessage('FullName is required'),
    check('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Enter a valid Email'),
    check('phoneNumber')
        .trim()
        .notEmpty()
        .withMessage('phoneNumber is required')
        .isMobilePhone('bn-BD')
        .withMessage('phoneNumber is unvalid'),
    check('password')
        .trim()
        .notEmpty()
        .withMessage('password is required')
        .isLength({ min: 8 })
        .withMessage('password must be at least 8 characters')
        .matches(/[a-zA-Z]/)
        .withMessage('password must contain a letter')
        .matches(/[0-9]/)
        .withMessage('password must contain a number'),
    check("name")
        .trim()
        .notEmpty()
        .withMessage('hospital name is required'),
    check("address.house")
        .trim()
        .notEmpty()
        .withMessage('house name is required'),
    check("address.street")
        .trim()
        .notEmpty()
        .withMessage('street name is required'),
    check("address.city")
        .trim()
        .notEmpty()
        .withMessage('city name is required'),
    check("address.postalCode")
        .trim()
        .notEmpty()
        .withMessage('postalCode is required'),
    check("contactNumber")
        .trim()
        .notEmpty()
        .withMessage('contactNumber is required')
        .isMobilePhone('bn-BD')
        .withMessage('contactNumber is unvalid'),
    check("specialties")
        .isArray({ min: 1 })
        .withMessage("specialties must be a non-empty array"),
    check("location.lat")
        .notEmpty()
        .withMessage("latitude is required"),
    check("location.lon")
        .notEmpty()
        .withMessage("longitude is required"),

    AsyncHandler(async (req, res) => {
        const { fullName, email, phoneNumber, password, name, address, contactNumber, specialties, location } = req.body

        const error = validationResult(req)
        if (!error.isEmpty()) {
            console.log(address)
            console.log(error)
            throw new ApiErrors(400, "invalid input value", error.array())
        }

        const limitKey = `authLimit:${email}`
        const count = await redis.incr(limitKey)

        if (count === 1) {
            await redis.expire(limitKey, 1800)
        }

        if (count > 10) {
            throw new ApiErrors(429, 'too many request')
        }

        const existingUser = await Users.findOne({ email })

        if (existingUser) {
            throw new ApiErrors(400, 'user already registered. Try hospital admin email')
        }

        const existingHospital = await Hospitals.findOne({
            $or: [
                { name },
                { email },
                { contactNumber }
            ]
        })

        if (existingHospital) {
            throw new ApiErrors(400, "hospital already registered")
        }

        const existingRequestHospital = await RequestHospitals.findOne({
            $or: [
                { name },
                { email },
                { contactNumber }
            ]
        })
        if (existingRequestHospital) {
            throw new ApiErrors(400, "hospital already requested. Wait for admin response")
        }

        const hashPassword = await bcrypt.hash(password, 12)

        const otp = Math.floor(100000 + Math.random() * 900000).toString()

        try {
            const { subject, html } = generateHospitalVerificationMail(otp, name)
            await sendBrevoMail(email, subject, html)
        } catch (error) {
            throw new ApiErrors(500, 'email send failed')
        }

        const coolDownKey = `coolDownMail:${email}`
        await redis.set(coolDownKey, "1", "EX", 60)

        const redisKey = `userRegistration:${email}`
        await redis.set(redisKey, JSON.stringify({
            fullName: fullName,
            email: email,
            phoneNumber: phoneNumber,
            password: hashPassword,
            name: name,
            address: address,
            contactNumber: contactNumber,
            specialties: specialties,
            location: location,
            otp: otp,
            verify: false
        }), "EX", 300)

        return res
            .status(202)
            .json(
                new ApiResponse(202, {}, 'hospital registration request successfully')
            )
    })
]

export const verifyHospitalRequest = AsyncHandler(async (req, res) => {
    const { email, otp } = req.body
    if (!email || !otp) {
        throw new ApiErrors(400, 'all value are required')
    }

    const limitKey = `authLimit:${email}`
    const count = await redis.incr(limitKey)

    if (count === 1) {
        await redis.expire(limitKey, 1800)
    }

    if (count > 10) {
        throw new ApiErrors(429, 'too many request')
    }

    const redisKey = `userRegistration:${email}`

    const redisUserString = await redis.get(redisKey)

    if (!redisUserString) {
        throw new ApiErrors(400, 'otp is expired')
    }

    const redisUser = JSON.parse(redisUserString)

    if (redisUser.otp !== otp) {
        throw new ApiErrors(400, 'otp is not matched')
    }

    const hospital = await RequestHospitals.create({
        fullName: redisUser.fullName,
        email: redisUser.email,
        phoneNumber: redisUser.phoneNumber,
        password: redisUser.password,
        name: redisUser.name,
        address: {
            house: redisUser.address.house,
            street: redisUser.address.street,
            city: redisUser.address.city,
            postalCode: redisUser.address.postalCode
        },
        contactNumber: redisUser.contactNumber,
        specialties: redisUser.specialties,
        location: {
            type: "Point",
            coordinates: [
                redisUser.location.lat,
                redisUser.location.lon
            ]
        }
    })

    if (!hospital) {
        throw new ApiErrors(500, "hospital request failed")
    }

    await redis.del(redisKey)
    await redis.del(limitKey)

    return res
        .status(201)
        .json(
            new ApiResponse(201, {}, 'hospital admin verify successfully')
        )
})