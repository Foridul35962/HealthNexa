export type HosAdminAllDoctorType = {
  _id: string;

  userId: {
    _id: string;
    email: string;
    fullName: string;
    role: string;
    image?: {
      url?: string
    }
    phoneNumber?: string;
    createdAt?: string;
    updatedAt?: string;
  };

  hospitalId: string;

  department: string;
  chamberNumber: string
  consultationFee: number
  slotDuration: number

  schedule: {
    dayOfWeek: "Sun" | "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";
    startTime: string;
    endTime: string;
  }[];

  createdAt?: string;
  updatedAt?: string;
};

export type HospitalType = {
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
    coordinates: [number, number]; // [longitude, latitude]
  };

  createdAt: string;
  updatedAt: string;
};

export type HosAdminEditDoctorType = {
  _id: string;

  userId: {
    _id: string;
    email: string;
    fullName: string;
    role: string;
    image?: {
      url?: string
    }
    phoneNumber?: string;
    createdAt?: string;
    updatedAt?: string;
  };

  hospitalId: string;

  department: string;

  chamberNumber: string
  consultationFee: number
  slotDuration: number

  schedule: {
    dayOfWeek: "Sun" | "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";
    startTime: string;
    endTime: string;
  }[];

  createdAt?: string;
  updatedAt?: string;
};

export interface HosAdminDashboardType {
  appointments: {
    total: number;
    checkedIn: number;
    pending: number;
    completed: number;
  };
  employees: {
    total: number;
    doctors: number;
    receptionists: number;
  };
}