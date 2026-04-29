import express from 'express'
import * as authController from '../controller/auth.controller.js'
import protect from '../middlewares/protect.js'

const authRouter = express.Router()

authRouter.post('/patient-registration', authController.registrationPatient)
authRouter.post('/verify-regi', authController.verifyRegi)
authRouter.post('/login', authController.login)
authRouter.get('/logout', authController.logOut)
authRouter.post('/forget-pass', authController.forgetPass)
authRouter.post('/verify-forget-pass', authController.verifyResetPass)
authRouter.patch('/reset-pass', authController.resetPass)
authRouter.post('/resend-otp', authController.resendOtp)
authRouter.get('/user', protect, authController.fetchUser)

export default authRouter