export interface medicineNameType {
    _id: string
    name: string
    genericName: string
    strength: string
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