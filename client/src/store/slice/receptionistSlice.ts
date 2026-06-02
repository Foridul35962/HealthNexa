import { receptionistCallTypes, receptionistDashboardType } from "@/Types/receptionistTypes";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

const SERVER_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/receptionist`

export const checkInPatient = createAsyncThunk(
    "receptionist/checkIn",
    async (data: receptionistCallTypes, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/checkIn`, data,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const recallSkippedPatient = createAsyncThunk(
    "receptionist/recall",
    async (data: receptionistCallTypes, { rejectWithValue }) => {
        try {
            const res = await axios.patch(`${SERVER_URL}/recallPatient`, data,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getReceptionistDashboard = createAsyncThunk(
    "receptionist/dashboard",
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

interface initialStateType {
    receptionistLoading: boolean
    receptionistDashboard: receptionistDashboardType
}

const initialState: initialStateType = {
    receptionistLoading: false,
    receptionistDashboard: {
        checkedIn: 0,
        completed: 0,
        pending: 0,
        skipped: 0,
        totalAppointments: 0
    }
}

const receptionistSlice = createSlice({
    name: "receptionist",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        //checkIn patient
        builder
            .addCase(checkInPatient.pending, (state) => {
                state.receptionistLoading = true
            })
            .addCase(checkInPatient.fulfilled, (state) => {
                state.receptionistLoading = false
                state.receptionistDashboard.checkedIn+=1
                state.receptionistDashboard.pending-=0
            })
            .addCase(checkInPatient.rejected, (state) => {
                state.receptionistLoading = false
            })
        //recall skipped patient
        builder
            .addCase(recallSkippedPatient.pending, (state) => {
                state.receptionistLoading = true
            })
            .addCase(recallSkippedPatient.fulfilled, (state) => {
                state.receptionistLoading = false
                state.receptionistDashboard.skipped-=1
            })
            .addCase(recallSkippedPatient.rejected, (state) => {
                state.receptionistLoading = false
            })
        //dashboard
        builder
            .addCase(getReceptionistDashboard.pending, (state) => {
                state.receptionistLoading = true
            })
            .addCase(getReceptionistDashboard.fulfilled, (state, action) => {
                state.receptionistLoading = false
                state.receptionistDashboard = action.payload.data
            })
            .addCase(getReceptionistDashboard.rejected, (state) => {
                state.receptionistLoading = false
            })
    }
})

export default receptionistSlice.reducer