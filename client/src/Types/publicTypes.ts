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

export interface HospitalAddress {
    house: string;
    street: string;
    city: string;
    postalCode: string;
}

export interface NearestHospitalType {
    _id: string;
    name: string;
    specialties: string[];
    address: HospitalAddress;
    contactNumber: string;
    image?: {
        url?: string;
    }

    // from geoNear
    distance: number; // meters (MongoDB raw)

    // if you project it
    distanceInKm?: number;
}

export type HospitalDetailsType = {
    hospital: {
        _id: string;
        name: string;
        address: {
            house: string;
            street: string;
            city: string;
            postalCode: string;
        };
        contactNumber: string;
        specialties: string[];
        image?: {
            url?: string;
        };
        location: {
            type: "Point";
            coordinates: [number, number];
        };
        createdAt: string;
        updatedAt: string;
    };

    stats: {
        totalDoctors: number;
        totalDepartments: number;
    };

    departments: Array<{
        department: string;
        doctorCount: number;
        doctors: Array<{
            doctorId: string;
            user: {
                fullName: string;
                image?: {
                    url?: string;
                };
            };
            consultationFee: number;
            chamberNumber: string;
            slotDuration: number;
            schedule: Array<{
                dayOfWeek: "Sun" | "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";
                startTime: string;
                endTime: string;
            }>;
        }>;
    }>;
};

export interface hospitalNameType {
    _id: string
    name: string
}

export interface DoctorsResponseData {
    currentPage: number;
    totalPages: number;
    totalDoctors: number;

    doctors: DoctorItem[];
}

export interface DoctorItem {
    _id: string;
    department: string;
    consultationFee: number;

    doctor: {
        _id: string;
        name: string;
        image?: string;
    };

    hospital: {
        _id?: string;
        name: string;
    };
}

export interface DoctorByIdDataType {
    _id: string;

    userId: DoctorUser;

    hospitalId: DoctorHospital;

    department: string;
    chamberNumber: string;
    consultationFee: number;
    slotDuration: number;

    schedule: DoctorSchedule[];

    createdAt?: string;
    updatedAt?: string;
}

export interface DoctorUser {
    _id: string;
    fullName: string;

    image?: {
        url?: string;
    };
}

export interface DoctorHospital {
    _id: string;

    name: string;

    address: {
        house: string;
        street: string;
        city: string;
        postalCode: string;
    };
}

export interface DoctorSchedule {
    _id: string;

    dayOfWeek: "Sun" | "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";

    startTime: string;
    endTime: string;
}