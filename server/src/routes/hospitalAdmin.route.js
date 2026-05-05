import express from 'express'
import * as controller from '../controller/hospitalAdmin.controller.js'
import isHospitalAdmin from '../middlewares/isHospitalAdmin.js'
import protect from '../middlewares/protect.js'
import upload from '../middlewares/upload.js'

const hospitalAdminRouter = express.Router()
hospitalAdminRouter.post('/add-receptionist', protect, isHospitalAdmin, upload, controller.addReceptionist)
hospitalAdminRouter.delete('/receptionist/:receptionistId', protect, isHospitalAdmin, controller.deleteReceptionist)
hospitalAdminRouter.patch('/edit-receptionist/:receptionistId', protect, isHospitalAdmin, upload, controller.editReceptionist)
hospitalAdminRouter.get('/all-receptionist', protect, isHospitalAdmin, controller.getAllReceptionist)
hospitalAdminRouter.get('/all-doctors', protect, isHospitalAdmin, controller.getDoctors)
hospitalAdminRouter.post('/add-doctors', protect, isHospitalAdmin, upload, controller.addDoctor)
hospitalAdminRouter.patch('/edit-doctors/:doctorId', protect, isHospitalAdmin, upload, controller.editDoctor)
hospitalAdminRouter.delete('/doctors/:doctorId', protect, isHospitalAdmin, controller.deleteDoctor)
hospitalAdminRouter.get('/hospital', protect, isHospitalAdmin, controller.getHospital)

export default hospitalAdminRouter