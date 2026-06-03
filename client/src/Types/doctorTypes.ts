export type DoctorDashboardType = {
    stats: {
        totalAppointments: number;
        completed: number;
        cancelled: number;
        waiting: number;
        notArrived: number;
        income: number;
    };

    queue: {
        consultationFee: number;
        currentToken: number;
        lastToken: number;
        currentAppointment: CurrentAppointment | null;
        nextPatients: NextPatient[];
    };
};

export type CurrentAppointment = {
    _id: string;

    patientId: {
        _id: string;
        fullName: string;
        email: string;
        phoneNumber: string;
    };

    tokenNumber: number;
    status: "Booked" | "Cancelled" | "Pending" | "Done";
    slotStart: string;
    slotEnd: string;
};

export type NextPatient = {
    appointmentId: string;
    tokenNumber: number;

    patient: {
        _id: string;
        fullName: string;
        email: string;
        phoneNumber: string;
    };
};