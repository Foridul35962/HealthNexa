import express from 'express'
import * as controller from '../controller/public.controller.js'

const publicRouter = express.Router()

publicRouter.get(`/get-doctor/:doctorId`, controller.getDoctor)
publicRouter.get("/medicineName/:medicineName", controller.getMedicineNames)

export default publicRouter