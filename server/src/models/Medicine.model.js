import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    genericName: {
        type: String,
        required: true,
        trim: true
    },
    brandName: {
        type: String,
        trim: true
    },
    manufacturer: {
        type: String,
        required: true,
        trim: true
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
        required: true
        // Example:
        // 500mg
        // 250mg/5ml
    },
    category: {
        type: String,
        trim: true
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
    isApproved: {
        type: Boolean,
        default: false
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    }
}, { timestamps: true });

const Medicines = mongoose.model("Medicines", medicineSchema);

export default Medicines;