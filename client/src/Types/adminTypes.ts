type Address = {
    house: string
    street: string
    city: string
    postalCode: string
}

type Location = {
    type: "Point"
    coordinates: [number, number] // [longitude, latitude]
}

export type HospitalRequestType = {
    _id: string

    fullName: string
    email: string
    phoneNumber: string
    password: string

    name: string
    address: Address
    contactNumber: string
    specialties: string[]
    location: Location
    createdAt: Date
}

export type PharmacyRequestType = {
    _id: string

    fullName: string
    email: string
    phoneNumber: string
    password: string

    name: string
    address: Address
    contactNumber: string
    location: Location
    createdAt: Date
}

export interface AdminRecentUser {
    _id: string
    fullName: string
    email: string
    role: string
    createdAt: string
}

export interface AdminRecentHospitalRequest {
    _id: string
    name: string
    address: {
        city: string
    }
    createdAt: string
}

export interface AdminDashboardDataType {
    totalUsers: number
    totalHospitals: number
    totalPharmacies: number
    pendingHospitalReq: number
    pendingPharmacyReq: number

    recent: {
        users: AdminRecentUser[]
        hospitalRequests: AdminRecentHospitalRequest[]
    }
}