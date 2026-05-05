export type HosAdminAllDoctorType = {
  _id: string;

  userId: {
    _id: string;
    email: string;
    fullName: string;
    role: string;
    phoneNumber?: string;
    createdAt?: string;
    updatedAt?: string;
  };

  hospitalId: string;

  department: string;

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