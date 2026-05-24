import { GetAllAISymptomsResponseType, SymptomCheckRequestType, SymptomCheckResponseType } from "@/Types/aiTypes";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

const SERVER_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/ai`
const SERVER_URL_PATIENT = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/patient`

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

export const getAllSymptoms = createAsyncThunk(
    "ai/getAllSymptoms",
    async ({ page }: { page: string }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL_PATIENT}/all-symptoms`,
                {
                    withCredentials: true,
                    params: {
                        page
                    }
                }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getSymptomsById = createAsyncThunk(
    "ai/getSymptom",
    async ({ symptomId }: { symptomId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL_PATIENT}/symptom/${symptomId}`,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const deleteSymptoms = createAsyncThunk(
    "ai/deleteSymptom",
    async ({ symptomId }: { symptomId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.delete(`${SERVER_URL_PATIENT}/symptom/${symptomId}`,
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
    allSymtoms: GetAllAISymptomsResponseType | null
    deleteLoading: boolean
    aiLoading: boolean
}

const initialState: initialStateType = {
    aiResult: null,
    allSymtoms: null,
    deleteLoading: false,
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
        // get all symptoms
        builder
            .addCase(getAllSymptoms.pending, (state) => {
                state.aiLoading = true
            })
            .addCase(getAllSymptoms.fulfilled, (state, action) => {
                state.aiLoading = false
                state.allSymtoms = action.payload.data
            })
            .addCase(getAllSymptoms.rejected, (state) => {
                state.aiLoading = false
            })
        //get symptoms by Id
        builder
            .addCase(getSymptomsById.pending, (state) => {
                state.aiLoading = true
            })
            .addCase(getSymptomsById.fulfilled, (state, action) => {
                state.aiLoading = false
                state.aiResult = action.payload.data
            })
            .addCase(getSymptomsById.rejected, (state) => {
                state.aiLoading = false
            })
        //delete symptoms
        builder
            .addCase(deleteSymptoms.pending, (state) => {
                state.deleteLoading = true
            })
            .addCase(deleteSymptoms.fulfilled, (state, action) => {
                state.deleteLoading = false
                const symptomId = action.payload.data
                if (state.allSymtoms?.data) {
                    state.allSymtoms.data = state.allSymtoms?.data.filter((symptom) => symptom._id !== symptomId)
                }
            })
            .addCase(deleteSymptoms.rejected, (state) => {
                state.deleteLoading = false
            })

    }
})

export default aiSlice.reducer