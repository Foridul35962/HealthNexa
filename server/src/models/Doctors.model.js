import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospitals",
        required: true
    },
    department:{
        type: String,
        required: true,
        trim: true
    },
    chamberNumber: {
        type: String,
        required: true,
        trim: true
    },
    consultationFee: {
        type: Number,
        required: true,
        min: 0
    },
    slotDuration: {
        type: Number, // minutes (e.g., 15)
        default: 15
    },
    schedule: [
        {
            dayOfWeek: {
                type: String,
                enum: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                required: true
            },
            startTime: {
                type: String,
                required: true
            },
            endTime: {
                type: String,
                required: true
            }
        }
    ]
})

const Doctors = mongoose.model("Doctors", doctorSchema)
export default Doctors