import express from 'express'
import * as controller from '../controller/patient.controller.js'
import protect from '../middlewares/protect.js'
import isPatient from '../middlewares/isPatient.js'

const patientRoute = express.Router()

patientRoute.get("/all-symptoms", protect, isPatient, controller.getAllAISymptom)
patientRoute.get("/symptom/:symptomId", protect, isPatient, controller.getAllAISymptom)
patientRoute.delete("/symptom/:symptomId", protect, isPatient, controller.deleteSymptomById)

export default patientRoute