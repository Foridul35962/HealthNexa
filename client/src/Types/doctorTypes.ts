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
        currentAppointment: CurrentAppointment | null;
        nextPatients: NextPatient[];
    };
};

export type CurrentAppointment = {
    _id: string;

    patient: {
        _id: string;
        fullName: string;
        email: string;
        phoneNumber: string;
    };

    tokenNumber: number;
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