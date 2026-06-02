import express from 'express'
import * as controller from '../controller/receptionist.controller.js'
import protect from '../middlewares/protect.js'
import isReceptionist from '../middlewares/isReceptionist.js'

const receptionistRoute = express.Router()

receptionistRoute.post("/checkIn", protect, isReceptionist, controller.checkInPatient)
receptionistRoute.post("/recallPatient", protect, isReceptionist, controller.recallSkippedPatient)
receptionistRoute.get("/dashboard", protect, isReceptionist, controller.dashboard)

export default receptionistRoute