import mongoose from "mongoose";

const pharmacySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    address: {
        house: {
            type: String,
            required: true
        },
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        postalCode: {
            type: Number,
            required: true
        }
    },
    contactNumber: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        url: {
            type: String
        },
        publicId: {
            type: String
        }
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true,
            default: [0, 0]
        }
    }
}, {timestamps: true})

pharmacySchema.index({ location: "2dsphere" })

pharmacySchema.index(
    { "address.house": 1, "address.street": 1, "address.city": 1 },
    { unique: true }
)

const Pharmacy = mongoose.model("Pharmacy", pharmacySchema)
export default Pharmacy