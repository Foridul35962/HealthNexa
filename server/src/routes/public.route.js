import express from 'express'
import * as controller from '../controller/public.controller.js'

const publicRouter = express.Router()

publicRouter.get(`/get-doctor/:doctorId`, controller.getDoctor)
publicRouter.get("/medicineName/:medicineName", controller.getMedicineNames)
publicRouter.post("/get-nearest-shop", controller.getNearestPharmacy)
publicRouter.get("/medicine/:medicineId", controller.getMedicine)
publicRouter.post("/nearest-hospital", controller.getNearestHospitals)
publicRouter.get("/hospital-details/:hospitalId", controller.getHospitalDetails)
publicRouter.get("/hospitalName/:hospitalName", controller.getHospitalName)
publicRouter.post("/get-doctors/:searchParams", controller.getDoctors)
publicRouter.get("/get-doctor-by-id/:doctorId", controller.getDoctorById)

export default publicRouter