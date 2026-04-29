import mongoose from "mongoose";

const requestPharmacySchema = new mongoose.Schema({
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


requestPharmacySchema.index(
    { "address.house": 1, "address.street": 1, "address.city": 1 },
    { unique: true }
)

requestPharmacySchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 259200 } // 3 days
)

const requestPharmacy = mongoose.model("requestPharmacy", requestPharmacySchema)
export default requestPharmacy