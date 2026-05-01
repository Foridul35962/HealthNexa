export type registrationType = {
    fullName: string
    email: string
    phoneNumber: string
    password: string
    role: "patient"
}

export type RegistrationHospitalType = {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;

  name: string;
  address: {
    house: string;
    street: string;
    city: string;
    postalCode: string;
  };
  contactNumber: string;
  specialties: string[];
  location: {
    lat: number;
    lon: number;
  };
};

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
    topic: 'registration' | 'forgetPass' | 'regiHospital'
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