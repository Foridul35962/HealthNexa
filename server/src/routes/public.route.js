import express from 'express'
import * as controller from '../controller/public.controller.js'

const publicRouter = express.Router()

publicRouter.get(`/get-doctor/:doctorId`, controller.getDoctor)
publicRouter.get("/medicineName/:medicineName", controller.getMedicineNames)
publicRouter.post("/get-nearest-shop", controller.getNearestPharmacy)

export default publicRouter