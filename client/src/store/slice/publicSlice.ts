import { HosAdminEditDoctorType } from "@/Types/hospitalAdminTypes";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

const SERVER_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/public`

export const getDoctor = createAsyncThunk(
    "public/getDoctor",
    async (doctorId: string, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/get-doctor/${doctorId}`)
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

interface initialStateType{
    fetchLoading: boolean
    doctor: HosAdminEditDoctorType | null
}

const initialState:initialStateType ={
    fetchLoading: false,
    doctor: null
}

const publicSlice = createSlice({
    name: "public",
    initialState,
    reducers:{},
    extraReducers: (builder)=>{
        //get doctor
        builder
            .addCase(getDoctor.pending, (state)=>{
                state.fetchLoading = true
            })
            .addCase(getDoctor.fulfilled, (state,action)=>{
                state.fetchLoading = false
                state.doctor = action.payload.data
            })
            .addCase(getDoctor.rejected, (state)=>{
                state.fetchLoading = false
            })
    }
})

export default publicSlice.reducer