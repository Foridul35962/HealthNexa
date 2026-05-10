import { medicineNameType } from "./publicTypes"

export interface requestMedicineType {
    name: string
    genericName: string
    brandName?: string
    manufacturer: string
    medicineType: "tablet" | "capsule" | "syrup" | "injection" | "cream" | "ointment" | "drops" | "inhaler"
    strength: string
    category?: string
    description?: string
    requiresPrescription: boolean
    sideEffects?: string[]
}

export interface pharmacyMedicineType {
    medicineId: string
    stock: number
    price: number
    discountPrice?: number
    isAvailable: boolean
}

export interface editPharmacyMedicineType {
    stock?: number
    price?: number
    discountPrice?: number
    isAvailable?: boolean
}

export interface PharmacyMedicineType {
    _id: string

    pharmacyId: string

    medicineId: {
        name: string
        genericName: string
        medicineType: "tablet" | "capsule" | "syrup" | "injection" | "cream" | "ointment" | "drops" | "inhaler"
        strength: string
    }

    stock: number
    price: number
    discountPrice?: number
    isAvailable: boolean

    createdAt: string
    updatedAt: string
}

export interface PaginationType {
    total: number
    page: number
    limit: number
    totalPages: number
}

export interface GetAllShopMedicineType {
    data: PharmacyMedicineType[]
    pagination: PaginationType
}