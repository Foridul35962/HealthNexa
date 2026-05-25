import express from 'express'
import * as controller from '../controller/patient.controller.js'
import protect from '../middlewares/protect.js'
import isPatient from '../middlewares/isPatient.js'

const patientRoute = express.Router()

patientRoute.get("/all-symptoms", protect, isPatient, controller.getAllAISymptom)
patientRoute.get("/symptom/:symptomId", protect, isPatient, controller.getSymptomById)
patientRoute.delete("/symptom/:symptomId", protect, isPatient, controller.deleteSymptomById)
patientRoute.post("/add-appointment", protect, isPatient, controller.addAppointment)
patientRoute.get("/appointment-history", protect, isPatient, controller.getAppointmentHistory)
patientRoute.get("/appointment/:appointmentId", protect, isPatient, controller.getAppointmentById)
patientRoute.get("/doctor-token/:doctorId/:date", protect, isPatient, controller.getCurrentToken)
patientRoute.delete("/appointment/:appointmentId", protect, isPatient, controller.deleteAppointment)

export default patientRoute