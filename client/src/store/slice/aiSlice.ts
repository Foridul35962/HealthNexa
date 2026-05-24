import { SymptomCheckRequestType, SymptomCheckResponseType } from "@/Types/aiTypes";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

const SERVER_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/ai`

export const symptomCheck = createAsyncThunk(
    "ai/symptomCheck",
    async (data: SymptomCheckRequestType, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/check-symptoms`, data,
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
    aiResult: SymptomCheckResponseType | null
    aiLoading: boolean
}

const initialState: initialStateType = {
    aiResult: null,
    aiLoading: false
}

const aiSlice = createSlice({
    name: "ai",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        //symtomCheck
        builder
            .addCase(symptomCheck.pending, (state) => {
                state.aiLoading = true
            })
            .addCase(symptomCheck.fulfilled, (state, action) => {
                state.aiLoading = false
                state.aiResult = action.payload.data
            })
            .addCase(symptomCheck.rejected, (state) => {
                state.aiLoading = false
            })
    }
})

export default aiSlice.reducer