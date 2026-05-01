import mongoose from "mongoose";

const requestHospitalSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
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

requestHospitalSchema.index(
    { "address.house": 1, "address.street": 1, "address.city": 1 },
    { unique: true }
)

requestHospitalSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 259200 } // 3 days
)

const RequestHospitals = mongoose.model("RequestHospitals", requestHospitalSchema)
export default RequestHospitals