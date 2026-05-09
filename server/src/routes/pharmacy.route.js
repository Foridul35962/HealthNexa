import express from 'express'
import * as controller from '../controller/pharmacy.controller.js'
import protect from '../middlewares/protect.js'
import isPharmacyOwner from '../middlewares/isPharmacyOwner.js'

const pharmacyRouter = express.Router()

pharmacyRouter.post("/req-medicine", protect, isPharmacyOwner, controller.medicineRequest)
pharmacyRouter.post("/add-medishop", protect, isPharmacyOwner, controller.addMedicineInShop)
pharmacyRouter.patch("/edit-medishop/:pharMediId", protect, isPharmacyOwner, controller.editMedicineInShop)
pharmacyRouter.get("/all-pharMedi", protect, isPharmacyOwner, controller.getAllMedicine)

export default pharmacyRouter