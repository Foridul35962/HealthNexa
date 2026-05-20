import { HosAdminEditDoctorType } from "@/Types/hospitalAdminTypes";
import { GetNearestShopRequestType, MedicineDetailsType, medicineNameType, PharmacyMedicineItemType, publicLocationType } from "@/Types/publicTypes";
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

export const getMedicineNames = createAsyncThunk(
    "public/getMedicineNames",
    async ({ medicineName }: { medicineName: string }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/medicineName/${medicineName}`)
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getNearestShop = createAsyncThunk(
    "public/getNearestShop",
    async (data: GetNearestShopRequestType, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/get-nearest-shop`, data)
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getMedicineDetails = createAsyncThunk(
    "public/getMedicineDetails",
    async({medicineId}:{medicineId:string}, {rejectWithValue})=>{
        try {
            const res = await axios.get(`${SERVER_URL}/medicine/${medicineId}`)
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

interface initialStateType {
    fetchLoading: boolean
    publicLoading: boolean
    publicLocation: publicLocationType | null
    doctor: HosAdminEditDoctorType | null
    medicineName: medicineNameType[]
    nearestShop: PharmacyMedicineItemType[]
    medicineDetails: MedicineDetailsType | null
}

const initialState: initialStateType = {
    fetchLoading: false,
    publicLoading: false,
    doctor: null,
    publicLocation: null,
    medicineName: [],
    nearestShop: [],
    medicineDetails: null
}

const publicSlice = createSlice({
    name: "public",
    initialState,
    reducers: {
        setLocation: (state, action) => {
            state.publicLocation = action.payload
        }
    },
    extraReducers: (builder) => {
        //get doctor
        builder
            .addCase(getDoctor.pending, (state) => {
                state.fetchLoading = true
            })
            .addCase(getDoctor.fulfilled, (state, action) => {
                state.fetchLoading = false
                state.doctor = action.payload.data
            })
            .addCase(getDoctor.rejected, (state) => {
                state.fetchLoading = false
            })
        //medicine name
        builder
            .addCase(getMedicineNames.fulfilled, (state, action) => {
                state.medicineName = action.payload.data
            })
        //get nearest shop
        builder
            .addCase(getNearestShop.pending, (state) => {
                state.publicLoading = true
            })
            .addCase(getNearestShop.fulfilled, (state, action) => {
                state.publicLoading = false
                state.nearestShop = action.payload.data
            })
            .addCase(getNearestShop.rejected, (state) => {
                state.publicLoading = false
            })
        //get medicine details
        builder
            .addCase(getMedicineDetails.fulfilled, (state, action)=>{
                state.medicineDetails = action.payload.data
            })
    }
})

export const { setLocation } = publicSlice.actions
export default publicSlice.reducer