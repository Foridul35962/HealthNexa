export interface SymptomCheckRequestType {
    age: number;

    gender: "male" | "female" | "other";

    symptoms: string[];

    duration?: string;

    temperature?: number;

    bloodPressure?: string;

    existingConditions?: string[];

    currentMedications?: string[];

    allergies?: string[];

    additionalNotes?: string;
}

export interface SymptomCheckResponseType {
    _id: string;

    userId: string | null;

    patientInfo: {
        age: number;
        gender: "male" | "female" | "other";
    };

    input: {
        symptoms: string[];
        duration?: string;
        temperature?: number;
        bloodPressure?: string;
        existingConditions: string[];
        currentMedications: string[];
        allergies: string[];
        additionalNotes?: string;
    };

    aiResult: {
        success: boolean;

        summary: string;

        possibleConditions: {
            name: string;
            probability: "low" | "medium" | "high";
            reason: string;
        }[];

        emergencyLevel: {
            level: "low" | "moderate" | "high" | "critical";
            reason: string;
        };

        recommendedDepartment: {
            department:
                | "Medicine"
                | "Cardiology"
                | "Neurology"
                | "Dermatology"
                | "Orthopedics"
                | "ENT"
                | "Gastroenterology"
                | "Pulmonology"
                | "Psychiatry"
                | "Gynecology"
                | "Pediatrics"
                | "Emergency";

            reason: string;
        }[];

        immediateActions: string[];

        homeCareSuggestions: string[];

        redFlags: string[];

        whenToSeeDoctor: string;

        disclaimer: string;
    };

    createdAt: string;
    updatedAt: string;
}

export interface GetAllAISymptomsResponseType {
    data: AISymptomHistoryItem[];

    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface AISymptomHistoryItem {
    _id: string;

    patientInfo: {
        age: number;
        gender: "male" | "female" | "other";
    };

    input: {
        symptoms: string[];
        duration?: string;
    };

    aiResult: {
        summary?: string;

        emergencyLevel: {
            level: "low" | "moderate" | "high" | "critical";
        };

        recommendedDepartment: {
            department: string;
        }[];
    };

    createdAt: string;
}