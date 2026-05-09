import mongoose from "mongoose";

const requestMedicineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    genericName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    brandName: {
        type: String,
        trim: true,
        lowercase: true
    },
    manufacturer: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    medicineType: {
        type: String,
        required: true,
        enum: [
            "tablet",
            "capsule",
            "syrup",
            "injection",
            "cream",
            "ointment",
            "drops",
            "inhaler"
        ]
    },
    strength: {
        type: String,
        required: true,
        lowercase: true
        // Example:
        // 500mg
        // 250mg/5ml
    },
    category: {
        type: String,
        trim: true,
        lowercase: true
        // antibiotic
        // painkiller
        // antihistamine
    },
    description: {
        type: String,
        maxlength: 500
    },
    requiresPrescription: {
        type: Boolean,
        default: false
    },
    sideEffects: [{
        type: String
    }],
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    }
}, { timestamps: true });

requestMedicineSchema.index(
    { name: 1, strength: 1 },
    { unique: true }
)

const RequestMedicines = mongoose.model("RequestMedicines", requestMedicineSchema);

export default RequestMedicines;