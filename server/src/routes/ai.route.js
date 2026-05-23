import express from 'express'
import * as controller from '../controller/ai.controller.js'
import protect from '../middlewares/protect.js'
import isPatient from '../middlewares/isPatient.js'

const aiRouter = express.Router()

aiRouter.post("/check-symptoms", protect, isPatient, controller.checkSymptoms)

export default aiRouter