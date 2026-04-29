import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
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
    image: {
        url: {
            type: String
        },
        publicId: {
            type: String
        }
    },
    role: {
        type: String,
        enum: ['admin', 'patient', 'pharmacyOwner', 'hospitalStaff'],
        default: 'patient',
        required: true
    },
    staffRole: {
        type: String,
        enum: ['hospitalAdmin', 'receptionist', 'doctor'],
        required: function () {
            return this.role === 'hospitalStaff'
        }
    },
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospitals",
        required: function () {
            return this.role === 'hospitalStaff'
        }
    },
    pharmacyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pharmacy",
        required: function () {
            return this.role === 'pharmacyOwner'
        }
    }
}, { timestamps: true })

const Users = mongoose.model('Users', userSchema)
export default Users