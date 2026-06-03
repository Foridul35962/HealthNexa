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
    reducers: {},
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
            })
            .addCase(completeAppointment.rejected, (state) => {
                state.completeLoading = false
            })
    }
})

export default doctorSlice.reducer