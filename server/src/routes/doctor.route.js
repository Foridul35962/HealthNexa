import express from 'express'
import * as controller from '../controller/doctor.controller.js'
import protect from '../middlewares/protect.js'
import isDoctor from '../middlewares/isDoctor.js'

const doctorRoute = express.Router()

doctorRoute.get("/dashboard", protect, isDoctor, controller.doctorDashboard)
doctorRoute.get("/call-next", protect, isDoctor, controller.callNextPatient)
doctorRoute.patch("/appointment-complete", protect, isDoctor, controller.completeAppointment)

export default doctorRoute