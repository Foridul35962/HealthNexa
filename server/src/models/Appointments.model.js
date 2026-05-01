import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctors",
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    slotStart: {
        type: String,
        required: true
    },
    slotEnd: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Booked', 'Cancelled', 'Pending', 'Done'],
        default: 'Booked'
    },
    qrHash: {
        type: String,
        unique: true
    },
    tokenNumber: Number,
    isSkipped: {
        type: Boolean,
        default: false
    },
    checkedIn: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

appointmentSchema.index(
    { doctorId: 1, date: 1, slotStart: 1 },
    { unique: true }
);

const Appointments = mongoose.model('Appointments', appointmentSchema)
export default Appointments