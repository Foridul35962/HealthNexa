import mongoose from "mongoose";

const queueSchema = new mongoose.Schema({
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointments",
        required: true
    },

    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctors",
        required: true
    },

    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospitals",
        required: true
    },

    date: {
        type: Date,
        required: true
    },

    tokenNumber: {
        type: Number,
        required: true
    },

    priority: {
        type: Number,
        enum: [1, 2, 3], // 1=Normal, 2=Priority, 3=Emergency
        default: 1
    },

    status: {
        type: String,
        enum: ['WAITING', 'CALLED', 'COMPLETED', 'NO_SHOW'],
        default: 'WAITING'
    },

    checkedInAt: {
        type: Date,
        required: true
    },

    calledAt: {
        type: Date
    },

    completedAt: {
        type: Date
    }

}, { timestamps: true });


queueSchema.index({ doctorId: 1, date: 1 });
queueSchema.index({ doctorId: 1, date: 1, tokenNumber: 1 }, { unique: true });

const Queues = mongoose.model('Queues', queueSchema);
export default Queues;