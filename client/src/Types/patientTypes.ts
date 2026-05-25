export interface AppointmentResponseType {
  appointment: Appointment;
  qrImage?: string;
}

export interface Appointment {
  _id: string;

  patientId: string;
  doctorId: {
    _id: string;
    userId: {
      _id: string;
      fullName: string;
      image?: {
        url: string;
      };
    };
    department: string;
    chamberNumber: string;
  };

  hospitalId: {
    _id: string;
    name: string;
    address?: any;
  };

  date: string; // ISO string

  slotStart: string; // "10:30"
  slotEnd: string;   // "10:45"

  status: "Booked" | "Cancelled" | "Pending" | "Done";

  isSkipped: boolean;
  checkedIn: boolean;

  tokenNumber?: number;

  createdAt: string;
  updatedAt: string;
}


//history
export interface AppointmentHistoryType {
  data: AppointmentHistoryItem[];
  pagination: Pagination;
}

export interface AppointmentHistoryItem {
  _id: string;

  doctorId: {
    _id: string;
    userId: {
      _id: string;
      fullName: string;
      image?: {
        url: string;
      };
    };
    department: string;
  };

  hospitalId: {
    _id: string;
    name: string;
  };

  date: string;

  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}