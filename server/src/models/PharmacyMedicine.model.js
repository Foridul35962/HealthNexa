import mongoose from "mongoose";

const pharmacyMedicineSchema = new mongoose.Schema({
    pharmacyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pharmacy",
        required: true,
        index: true
    },
    medicineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Medicines",
        required: true,
        index: true
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    discountPrice: {
        type: Number,
        min: 0
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
}, { timestamps: true });


pharmacyMedicineSchema.index(
    { pharmacyId: 1, medicineId: 1 },
    { unique: true }
);

const PharmacyMedicines = mongoose.model(
    "PharmacyMedicines",
    pharmacyMedicineSchema
);

export default PharmacyMedicines;