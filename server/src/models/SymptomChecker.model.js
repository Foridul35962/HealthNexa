import mongoose from 'mongoose'

const symptomCheckSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },
    patientInfo: {
        age: {
            type: Number,
            required: true
        },
        gender: {
            type: String,
            required: true,
            enum: ["male", "female", "other"],
        }
    },
    input: {
        symptoms: {
            type: [String],
            required: true
        },

        duration: {
            type: String
        },
        temperature: {
            type: Number,
        },

        bloodPressure: {
            type: String,
        },

        existingConditions: {
            type: [String],
            default: [],
        },

        currentMedications: {
            type: [String],
            default: [],
        },

        allergies: {
            type: [String],
            default: [],
        },

        additionalNotes: {
            type: String,
        },
    },
    aiResult: {
        summary: String,

        possibleConditions: [
            {
                name: String,
                probability: {
                    type: String,
                    enum: ["low", "medium", "high"],
                },
                reason: String,
            },
        ],

        emergencyLevel: {
            level: {
                type: String,
                enum: ["low", "moderate", "high", "critical"],
            },
            reason: String,
        },

        recommendedDepartment: [
            {
                department: String,
                reason: String,
            },
        ],

        immediateActions: [String],

        homeCareSuggestions: [String],

        redFlags: [String],

        whenToSeeDoctor: String,

        disclaimer: String,
    },
}, {timestamps: true})

const SymptomChecker = mongoose.model("SymptomCheck", symptomCheckSchema)

export default SymptomChecker