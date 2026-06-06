import { DoctorDashboardType } from "@/Types/doctorTypes";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

const SERVER_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/doctor`

export const getDoctorDashboard = createAsyncThunk(
    "doctor/dashboard",
    async (_: null, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/dashboard`, {
                withCredentials: true
            })
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const patientNextCall = createAsyncThunk(
    "doctor/next-call",
    async (_: null, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/call-next`, {
                withCredentials: true
            })
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const completeAppointment = createAsyncThunk(
    "doctor/completeAppointment",
    async (data: { appointmentId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.patch(`${SERVER_URL}/appointment-complete`, data,
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
    nextCallLoading: boolean
    completeLoading: boolean
    doctorFetchLoading: boolean
    doctorDashboard: DoctorDashboardType | null
}

const initialState: initialStateType = {
    doctorFetchLoading: false,
    nextCallLoading: false,
    completeLoading: false,
    doctorDashboard: null
}

const doctorSlice = createSlice({
    name: "doctor",
    initialState,
    reducers: {
        recallPatient: (state, action) => {
            if (state.doctorDashboard) {
                if (state.doctorDashboard.queue.nextPatients) {
                    state.doctorDashboard.queue.nextPatients = [action.payload, ...state.doctorDashboard.queue.nextPatients]
                } else {
                    state.doctorDashboard.queue.nextPatients = action.payload
                }
            }
        }
    },
    extraReducers: (builder) => {
        //doctor dashboard
        builder
            .addCase(getDoctorDashboard.pending, (state) => {
                state.doctorFetchLoading = true
            })
            .addCase(getDoctorDashboard.fulfilled, (state, action) => {
                state.doctorFetchLoading = false
                state.doctorDashboard = action.payload.data
            })
            .addCase(getDoctorDashboard.rejected, (state) => {
                state.doctorFetchLoading = false
            })
        //next call
        builder
            .addCase(patientNextCall.pending, (state) => {
                state.nextCallLoading = true
            })
            .addCase(patientNextCall.fulfilled, (state, action) => {
                state.nextCallLoading = false
                const data = action.payload.data
                if (state.doctorDashboard) {
                    if (data.currentAppointment) {
                        state.doctorDashboard.queue.currentToken = data.currentAppointment.tokenNumber
                        state.doctorDashboard.queue.currentAppointment = data.currentAppointment
                    } else {
                        state.doctorDashboard.queue.currentAppointment = null
                    }
                    state.doctorDashboard.queue.nextPatients = data.nextPatients
                }
            })
            .addCase(patientNextCall.rejected, (state) => {
                state.nextCallLoading = false
            })
        //complete appointment
        builder
            .addCase(completeAppointment.pending, (state) => {
                state.completeLoading = true
            })
            .addCase(completeAppointment.fulfilled, (state, action) => {
                state.completeLoading = false
                if (state.doctorDashboard) {
                    state.doctorDashboard.stats.income += state.doctorDashboard?.queue.consultationFee
                    state.doctorDashboard.stats.completed += 1
                    state.doctorDashboard.stats.waiting -= 1
                    if (action.payload.data.currentAppointment) {
                        state.doctorDashboard.queue.currentToken = action.payload.data.currentAppointment.tokenNumber
                        state.doctorDashboard.queue.currentAppointment = action.payload.data.currentAppointment
                    } else {
                        state.doctorDashboard.queue.currentAppointment = null
                    }
                    state.doctorDashboard.queue.nextPatients = action.payload.data.nextPatients
                }
            })
            .addCase(completeAppointment.rejected, (state) => {
                state.completeLoading = false
            })
    }
})

export const { recallPatient } = doctorSlice.actions
export default doctorSlice.reducer