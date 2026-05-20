export interface medicineNameType {
    _id: string
    name: string
    genericName: string
    strength: string
    medicineType: "tablet" | "capsule" | "syrup" | "injection" | "cream" | "ointment" | "drops" | "inhaler"
}

export interface GetNearestShopRequestType {
    medicineId: string;
    location: {
        lat: number;
        lon: number;
    };
}

export interface publicLocationType {
    location: {
        lat: number;
        lon: number;
    };
}

export interface PharmacyMedicineItemType {
    pharmacyId: string;

    name: string;

    contactNumber: string;

    address: {
        house: string;
        street: string;
        city: string;
        postalCode: string;
    };

    price: number;

    discountPrice?: number;

    stock: number;

    distance: number;
}

export interface MedicineDetailsType {
    _id: string;

    name: string;

    genericName: string;

    brandName?: string;

    manufacturer: string;

    medicineType:
    | "tablet"
    | "capsule"
    | "syrup"
    | "injection"
    | "cream"
    | "ointment"
    | "drops"
    | "inhaler";

    strength: string;

    category?: string;

    description?: string;

    requiresPrescription: boolean;

    sideEffects: string[];

    createdAt: string;

    updatedAt: string;
}