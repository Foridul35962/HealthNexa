import express from 'express'
import * as controller from '../controller/hospitalAdmin.controller.js'
import isHospitalAdmin from '../middlewares/isHospitalAdmin.js'
import protect from '../middlewares/protect.js'

const hospitalAdminRouter = express.Router()
hospitalAdminRouter.post('/add-receptionist', protect, isHospitalAdmin, controller.addReceptionist)
hospitalAdminRouter.delete('/receptionist/:receptionistId', protect, isHospitalAdmin, controller.deleteReceptionist)
hospitalAdminRouter.patch('/edit-receptionist/:receptionistId', protect, isHospitalAdmin, controller.editReceptionist)
hospitalAdminRouter.get('/all-receptionist', protect, isHospitalAdmin, controller.getAllReceptionist)
hospitalAdminRouter.get('/all-doctors', protect, isHospitalAdmin, controller.getDoctors)
hospitalAdminRouter.post('/add-doctors', protect, isHospitalAdmin, controller.addDoctor)
hospitalAdminRouter.patch('/edit-doctors/:doctorId', protect, isHospitalAdmin, controller.editDoctor)
hospitalAdminRouter.delete('/doctors/:doctorId', protect, isHospitalAdmin, controller.deleteDoctor)

export default hospitalAdminRouter