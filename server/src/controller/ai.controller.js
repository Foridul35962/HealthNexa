import crypto from "crypto";

import genAI from "../config/gemini.js";
import redis from "../config/redis.js";

import ApiErrors from "../helpers/ApiErrors.js";
import ApiResponse from "../helpers/ApiResponse.js";
import AsyncHandler from "../helpers/AsyncHandler.js";
import SymptomChecker from "../models/SymptomChecker.model.js";


// =========================
// CACHE KEY
// =========================

const makeCacheKey = (body) => {
    return (
        "ai:symptom:v3:" +
        crypto
            .createHash("sha256")
            .update(JSON.stringify(body))
            .digest("hex")
    );
};


// =========================
// SAVE FUNCTION
// =========================

const saveResult = async (result, userInfo, userId) => {

    const saved = await SymptomChecker.create({
        userId: userId || null,

        patientInfo: {
            age: userInfo.age,
            gender: userInfo.gender,
        },

        input: {
            symptoms: userInfo.symptoms,
            duration: userInfo.duration,
            temperature: userInfo.temperature,
            bloodPressure: userInfo.bloodPressure,
            existingConditions: userInfo.existingConditions || [],
            currentMedications: userInfo.currentMedications || [],
            allergies: userInfo.allergies || [],
            additionalNotes: userInfo.additionalNotes,
        },

        aiResult: result,
    });

    await redis.del(`allSymptoms:${userId}:page:${1}`)

    return saved;
};


// =========================
// CONTROLLER
// =========================

export const checkSymptoms = AsyncHandler(async (req, res) => {

    const {
        age,
        gender,
        symptoms,
        duration,
        temperature,
        bloodPressure,
        existingConditions,
        currentMedications,
        allergies,
        additionalNotes,
    } = req.body;

    // =========================
    // VALIDATION
    // =========================

    if (
        age == null ||
        !gender ||
        !symptoms ||
        !Array.isArray(symptoms) ||
        symptoms.length === 0
    ) {
        throw new ApiErrors(400, "Age, gender and symptoms required");
    }

    // =========================
    // CACHE CHECK
    // =========================

    const cacheKey = makeCacheKey(req.body);
    const cached = await redis.get(cacheKey);

    if (cached) {

        const parsed = JSON.parse(cached);

        const saved = await saveResult(
            parsed,
            {
                age,
                gender,
                symptoms,
                duration,
                temperature,
                bloodPressure,
                existingConditions,
                currentMedications,
                allergies,
                additionalNotes,
            },
            req.user?._id
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                saved,
                "Fetched from cache"
            )
        );
    }

    // =========================
    // RATE LIMIT
    // =========================

    const limitKey = "gemini:symptom:limit";

    const count = await redis.incr(limitKey);

    if (count === 1) {
        await redis.expire(limitKey, 60);
    }

    if (count > 10) {
        const ttl = await redis.ttl(limitKey);
        throw new ApiErrors(429, `Try again in ${ttl}s`);
    }

    // =========================
    // GEMINI MODEL
    // =========================

    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
        systemInstruction: `
            You are a professional AI medical triage assistant.

            You are NOT a doctor and must NEVER give a final diagnosis.

            ========================
            CRITICAL RULES
            ========================
            - Never diagnose diseases
            - Use "may indicate", "possible", "could be related to"
            - No medication dosage
            - Detect emergencies carefully

            ========================
            IMPORTANT RULE
            ========================
            You MUST ONLY select departments from this list:

            Allowed departments:
            [
            "Medicine",
            "Cardiology",
            "Neurology",
            "Dermatology",
            "Orthopedics",
            "ENT",
            "Gastroenterology",
            "Pulmonology",
            "Psychiatry",
            "Gynecology",
            "Pediatrics",
            "Emergency"
            ]

            If you choose a department, it MUST be from this list only.

            ========================
            OUTPUT RULES
            ========================
            Return ONLY valid JSON. No markdown. No extra text.

            {
            "success": true,
            "summary": "",
            "possibleConditions": [
                {
                "name": "",
                "probability": "low | medium | high",
                "reason": ""
                }
            ],
            "emergencyLevel": {
                "level": "low | moderate | high | critical",
                "reason": ""
            },
            "recommendedDepartment": [
                {
                "department": "",
                "reason": ""
                }
            ],
            "immediateActions": [],
            "homeCareSuggestions": [],
            "redFlags": [],
            "whenToSeeDoctor": "",
            "disclaimer": "This is not a medical diagnosis."
            }
        `
    });

    // =========================
    // USER PROMPT
    // =========================

    const userPrompt = `
        Patient Information:

        Age: ${age}
        Gender: ${gender}

        Symptoms:
        ${symptoms.map(s => `- ${s}`).join("\n")}

        Duration: ${duration || "Not Provided"}
        Temperature: ${temperature || "Not Provided"}
        Blood Pressure: ${bloodPressure || "Not Provided"}

        Existing Conditions:
        ${existingConditions?.length ? existingConditions.join(", ") : "None"}

        Current Medications:
        ${currentMedications?.length ? currentMedications.join(", ") : "None"}

        Allergies:
        ${allergies?.length ? allergies.join(", ") : "None"}

        Additional Notes:
        ${additionalNotes || "None"}

        Return ONLY JSON.
    `;

    try {

        const result = await model.generateContent({
            contents: [
                {
                    role: "user",
                    parts: [{ text: userPrompt }]
                }
            ],
            generationConfig: {
                temperature: 0.2,
                responseMimeType: "application/json",
            }
        });

        const text = result.response.text();

        let parsed;

        try {
            parsed = JSON.parse(text);
        } catch {
            throw new ApiErrors(500, "Invalid AI response format");
        }

        // =========================
        // SAVE TO CACHE
        // =========================

        await redis.set(
            cacheKey,
            JSON.stringify(parsed),
            "EX",
            60 * 60
        );

        // =========================
        // SAVE TO DB
        // =========================

        const saved = await saveResult(
            parsed,
            {
                age,
                gender,
                symptoms,
                duration,
                temperature,
                bloodPressure,
                existingConditions,
                currentMedications,
                allergies,
                additionalNotes,
            },
            req.user?._id
        );

        // =========================
        // RESPONSE
        // =========================

        return res.status(200).json(
            new ApiResponse(
                200,
                saved,
                "Symptoms analyzed successfully"
            )
        );

    } catch (error) {

        console.error(error);

        throw new ApiErrors(
            500,
            "AI symptom analysis failed"
        );
    }
});