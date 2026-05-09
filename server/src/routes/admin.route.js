import express from 'express'
import * as adminController from '../controller/admin.controller.js'
import protect from '../middlewares/protect.js'
import isAdmin from '../middlewares/isAdmin.js'

const adminRouter = express.Router()

adminRouter.get('/request-hospital', protect, isAdmin, adminController.getAllHospitalRequest)
adminRouter.get('/request-pharmacy', protect, isAdmin, adminController.getAllPharmacyRequest)
adminRouter.get('/request-hospital/:hospitalId', protect, isAdmin, adminController.getHospitalFromRequest)
adminRouter.get('/request-pharmacy/:pharmacyId', protect, isAdmin, adminController.getPharmacyFromRequest)
adminRouter.delete('/request-hospital/:hospitalId', protect, isAdmin, adminController.deleteHospitalRequest)
adminRouter.delete('/request-pharmacy/:pharmacyId', protect, isAdmin, adminController.deletePharmacyRequest)
adminRouter.post('/add-hospital', protect, isAdmin, adminController.addHospital)
adminRouter.post('/add-pharmacy', protect, isAdmin, adminController.addPharmacy)
adminRouter.get('/dashboard', protect, isAdmin, adminController.adminDashboard)
adminRouter.get('/request-medicine', protect, isAdmin, adminController.getAllMedicineRequest)
adminRouter.get('/request-medicine/:medicineId', protect, isAdmin, adminController.getMedicineFromRequest)
adminRouter.delete('/request-medicine/:medicineId', protect, isAdmin, adminController.deleteMedicineFromRequest)
adminRouter.post('/add-medicine', protect, isAdmin, adminController.addMedicine)

export default adminRouter