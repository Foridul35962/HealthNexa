export type registrationType = {
    fullName: string
    email: string
    phoneNumber: string
    password: string
    role: "patient"
}

export type otpType = {
    email: string
    otp: string
}

export type loginType = {
    email: string,
    password: string
}

export type emailType = {
    email: string
}

export type resendOtpType = {
    email: string
    topic: 'registration' | 'forgetPass'
}

export type userType = {
    _id: string
    fullName: string
    email: string
    phoneNumber: string
    role: 'admin' | 'patient' | 'pharmacyOwner' | 'hospitalStaff'
    image?: {
        url?: string
    }
    staffRole?: 'hospitalAdmin' | 'receptionist' | 'doctor'
    hospitalId?: any
    pharmacyId?: any
}