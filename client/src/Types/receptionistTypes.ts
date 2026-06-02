export interface receptionistCallTypes {
    appointmentId: string,
    hash: string
}

export interface receptionistDashboardType {
    totalAppointments: number;
    checkedIn: number;
    pending: number;
    skipped: number;
    completed: number;
}