import crypto from "crypto";

import genAI from "../config/gemini.js";
import redis from "../config/redis.js";

import ApiErrors from "../helpers/ApiErrors.js";
import ApiResponse from "../helpers/ApiResponse.js";
import AsyncHandler from "../helpers/AsyncHandler.js";

const makeCacheKey = (body) => {
    return (
        "ai:symptom:v1:" +
        crypto
            .createHash("sha256")
            .update(JSON.stringify(body))
            .digest("hex")
    );
};

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
    // Validation
    // =========================

    if (
        age == null ||
        !gender ||
        !symptoms ||
        !Array.isArray(symptoms) ||
        symptoms.length === 0
    ) {
        throw new ApiErrors(
            400,
            "Age, gender and symptoms are required"
        );
    }

    if (typeof age !== "number" || age < 0 || age > 120) {
        throw new ApiErrors(
            400,
            "Invalid age"
        );
    }

    const allowedGender = [
        "male",
        "female",
        "other"
    ];

    if (!allowedGender.includes(gender)) {
        throw new ApiErrors(
            400,
            "Invalid gender"
        );
    }

    // =========================
    // Cache Check
    // =========================

    const cacheKey = makeCacheKey(req.body);

    const cached = await redis.get(cacheKey);

    if (cached) {

        return res.status(200).json(
            new ApiResponse(
                200,
                JSON.parse(cached),
                "Symptom analysis fetched from cache"
            )
        );
    }

    // =========================
    // Rate Limit
    // =========================

    const limitKey = "gemini:symptom:limit";

    const count = await redis.incr(limitKey);

    if (count === 1) {
        await redis.expire(limitKey, 60);
    }

    if (count > 10) {

        const ttl = await redis.ttl(limitKey);

        throw new ApiErrors(
            429,
            `AI request limit exceeded. Try again in ${ttl}s`
        );
    }

    // =========================
    // Gemini Model
    // =========================

    const model = genAI.getGenerativeModel({

        model: "gemini-2.5-flash-lite",

        systemInstruction: `
            You are a professional AI medical triage assistant for a healthcare platform.

            You are NOT a doctor and must NEVER provide final medical diagnosis.

            Your responsibilities:
            - Analyze patient symptoms carefully
            - Estimate urgency level
            - Suggest appropriate medical department
            - Provide safe preliminary guidance
            - Detect emergency warning signs
            - Encourage professional medical consultation when needed

            CRITICAL SAFETY RULES:

            - Never claim certainty.
            - Never say a patient definitely has a disease.
            - Use phrases like:
            - "may indicate"
            - "possible condition"
            - "could be related to"
            - "requires medical evaluation"

            - Never prescribe prescription medications.
            - Never provide medication dosage.
            - Never recommend dangerous treatment.
            - Never ignore emergency symptoms.

            Emergency symptoms include:
            - chest pain
            - difficulty breathing
            - stroke symptoms
            - seizures
            - severe bleeding
            - unconsciousness
            - suicidal thoughts
            - severe allergic reactions

            IMPORTANT:
            - Return ONLY valid JSON
            - No markdown
            - No explanation outside JSON
            - No code blocks

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

            Return JSON in this exact structure:

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

            "disclaimer": "This AI system does not provide final medical diagnosis. Please consult a licensed doctor for medical evaluation."
            }
        `
    });

    // =========================
    // User Prompt
    // =========================

    const userPrompt = `
        Patient Information:

        Age: ${age}

        Gender: ${gender}

        Symptoms:
        ${symptoms.map((s) => `- ${s}`).join("\n")}

        Duration:
        ${duration || "Not Provided"}

        Temperature:
        ${temperature || "Not Provided"}

        Blood Pressure:
        ${bloodPressure || "Not Provided"}

        Existing Conditions:
        ${existingConditions?.length
                ? existingConditions.join(", ")
                : "None"}

        Current Medications:
        ${currentMedications?.length
                ? currentMedications.join(", ")
                : "None"}

        Allergies:
        ${allergies?.length
                ? allergies.join(", ")
                : "None"}

        Additional Notes:
        ${additionalNotes || "None"}

        Analyze the patient's condition carefully and return ONLY valid JSON.
    `;

    try {

        const result = await model.generateContent({

            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: userPrompt
                        }
                    ]
                }
            ],

            generationConfig: {
                temperature: 0.2,
                responseMimeType: "application/json",
            }
        });

        const text = result.response.text();

        let parsedResponse;

        try {

            parsedResponse = JSON.parse(text);

        } catch {

            throw new ApiErrors(
                500,
                "Invalid AI response format"
            );
        }

        // =========================
        // Cache Save
        // =========================

        await redis.set(
            cacheKey,
            JSON.stringify(parsedResponse),
            "EX",
            60 * 60
        );

        return res.status(200).json(

            new ApiResponse(
                200,
                parsedResponse,
                "Symptoms analyzed successfully"
            )
        );

    } catch (error) {

        console.error("AI Symptom Checker Error:", error);

        throw new ApiErrors(
            500,
            "AI symptom analysis failed"
        );
    }
});