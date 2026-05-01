import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema({
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
            type: String,
            required: true
        }
    },
    contactNumber: {
        type: String,
        required: true,
        unique: true
    },
    specialties: {
        type: [String],
        required: true
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
    },
}, { timestamps: true })

hospitalSchema.index({ location: "2dsphere" })

hospitalSchema.index(
    { "address.house": 1, "address.street": 1, "address.city": 1 },
    { unique: true }
)

const Hospitals = mongoose.model("Hospitals", hospitalSchema)
export default Hospitals