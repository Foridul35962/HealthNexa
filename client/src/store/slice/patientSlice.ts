import { AppointmentHistoryType, AppointmentResponseType, UpcomingAppointmentType } from "@/Types/patientTypes";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

const SERVER_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/patient`

export const addAppointment = createAsyncThunk(
    "patient/add-appointment",
    async (data: { doctorId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/add-appointment`, data,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getAppointmentHistory = createAsyncThunk(
    "patient/appointmentHistory",
    async ({ page }: { page: number }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/appointment-history`,
                {
                    withCredentials: true,
                    params: { page }
                }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getAppointment = createAsyncThunk(
    "patient/getAppointment",
    async ({ appointmentId }: { appointmentId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/appointment/${appointmentId}`,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getCurrentToken = createAsyncThunk(
    "patient/currentToken",
    async ({ doctorId, date }: { doctorId: string, date: Date }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/doctor-token/${doctorId}/${date}`,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const deleteAppointment = createAsyncThunk(
    "patient/deleteAppointment",
    async ({ appointmentId }: { appointmentId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.delete(`${SERVER_URL}/appointment/${appointmentId}`,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getUpcommingAppointment = createAsyncThunk(
    "patient/upcommingAppointment",
    async (_: null, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/upcomming-appointment`, {
                withCredentials: true
            })
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const updatePatientDetails = createAsyncThunk(
    "patient/updatePatient",
    async (data: FormData, { rejectWithValue }) => {
        try {
            const res = await axios.patch(`${SERVER_URL}/update-patient`, data,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

interface initialStateType {
    patientLoading: boolean
    patientDeleteLoading: boolean
    appointment: AppointmentResponseType | null
    appointmentHistory: AppointmentHistoryType
    currentToken: number
    upcommingAppointment: UpcomingAppointmentType[]
    updateLoading: boolean
}

const initialState: initialStateType = {
    patientLoading: false,
    patientDeleteLoading: false,
    appointment: null,
    appointmentHistory: {
        pagination: {
            limit: 10,
            page: 0,
            total: 0,
            totalPages: 0
        },
        data: []
    },
    currentToken: 0,
    upcommingAppointment: [],
    updateLoading: false
}

const patientSlice = createSlice({
    name: "patient",
    initialState,
    reducers: {
        updateStatus: (state, action) => {
            if (state.appointment) {
                state.appointment.appointment.status = action.payload.status
                if (action.payload.tokenNumber !== undefined) {
                    state.appointment.appointment.tokenNumber = action.payload.tokenNumber
                }
                if (action.payload.checkedIn !== undefined) {
                    state.appointment.appointment.checkedIn = action.payload.checkedIn
                }
            }
        },
        updateCurrentToken: (state, action) => {
            state.currentToken = action.payload.currentToken
        },
        updateRecall: (state, action) => {
            if (state.appointment) {
                state.appointment.appointment.isSkipped = action.payload
            }
        }
    },
    extraReducers: (builder) => {
        //add appointment
        builder
            .addCase(addAppointment.pending, (state) => {
                state.patientLoading = true
            })
            .addCase(addAppointment.fulfilled, (state, action) => {
                state.patientLoading = false
                state.appointment = action.payload.data
                if (state.appointmentHistory?.data.length > 0 && state.appointment) {
                    state.appointmentHistory.data = [state.appointment?.appointment, ...state.appointmentHistory?.data]
                } else {
                    if (state.appointment) {
                        state.appointmentHistory.data = [state.appointment?.appointment]
                        state.appointmentHistory.pagination.total = 1
                        state.appointmentHistory.pagination.totalPages = 1
                        state.appointmentHistory.pagination.page = 1
                    }

                }
            })
            .addCase(addAppointment.rejected, (state) => {
                state.patientLoading = false
            })
        //get appointment history
        builder
            .addCase(getAppointmentHistory.pending, (state) => {
                state.patientLoading = true
            })
            .addCase(getAppointmentHistory.fulfilled, (state, action) => {
                state.patientLoading = false
                state.appointmentHistory = action.payload.data
            })
            .addCase(getAppointmentHistory.rejected, (state) => {
                state.patientLoading = false
            })
        //get appointment
        builder
            .addCase(getAppointment.pending, (state) => {
                state.patientLoading = true
            })
            .addCase(getAppointment.fulfilled, (state, action) => {
                state.patientLoading = false
                state.appointment = action.payload.data
            })
            .addCase(getAppointment.rejected, (state) => {
                state.patientLoading = false
            })
        //get current token
        builder
            .addCase(getCurrentToken.fulfilled, (state, action) => {
                state.currentToken = action.payload.data
            })
        //delete appointment
        builder
            .addCase(deleteAppointment.pending, (state) => {
                state.patientDeleteLoading = true
            })
            .addCase(deleteAppointment.fulfilled, (state, action) => {
                state.patientDeleteLoading = false
                const appointmentId = action.payload.data
                state.appointmentHistory.data = state.appointmentHistory.data.filter((appointment) => appointment._id !== appointmentId)
            })
            .addCase(deleteAppointment.rejected, (state) => {
                state.patientDeleteLoading = false
            })

        //upcomming appointment
        builder
            .addCase(getUpcommingAppointment.pending, (state) => {
                state.patientLoading = true
            })
            .addCase(getUpcommingAppointment.fulfilled, (state, action) => {
                state.patientLoading = false
                state.upcommingAppointment = action.payload.data
            })
            .addCase(getUpcommingAppointment.rejected, (state) => {
                state.patientLoading = false
            })
        //update details
        builder
            .addCase(updatePatientDetails.pending, (state) => {
                state.updateLoading = true
            })
            .addCase(updatePatientDetails.fulfilled, (state) => {
                state.updateLoading = false
            })
            .addCase(updatePatientDetails.rejected, (state) => {
                state.updateLoading = false
            })
    }
})

export const { updateStatus, updateCurrentToken, updateRecall } = patientSlice.actions
export default patientSlice.reducer