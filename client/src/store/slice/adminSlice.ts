import { HospitalRequestType, PharmacyRequestType } from "@/Types/adminTypes";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

const SERVER_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/admin`

export const getAllRequestHospital = createAsyncThunk(
    "admin/getAllReqHos",
    async (_: null, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/request-hospital`,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getAllRequestPharmacy = createAsyncThunk(
    "admin/getAllReqPhar",
    async (_: null, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/request-pharmacy`,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getRequestHospital = createAsyncThunk(
    "admin/getReqHos",
    async ({ hospitalId }: { hospitalId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/request-hospital/${hospitalId}`,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getRequestPharmacy = createAsyncThunk(
    "admin/getReqPhar",
    async ({ pharmacyId }: { pharmacyId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/request-pharmacy/${pharmacyId}`,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const deleteRequestHospital = createAsyncThunk(
    "admin/deleteReqHos",
    async ({ hospitalId }: { hospitalId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.delete(`${SERVER_URL}/request-hospital/${hospitalId}`,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const deleteRequestPharmacy = createAsyncThunk(
    "admin/deleteReqPhar",
    async ({ pharmacyId }: { pharmacyId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.delete(`${SERVER_URL}/request-pharmacy/${pharmacyId}`,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const addHospital = createAsyncThunk(
    "admin/addHos",
    async (data: { hospitalId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/add-hospital`, data,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const addPharmacy = createAsyncThunk(
    "admin/addPhar",
    async (data: { pharmacyId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/add-pharmacy`, data,
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
    adminLoading: boolean
    adminFetchLoading: boolean
    adminDeleteLoading: boolean
    allHospitalRequest: HospitalRequestType[]
    allPharmacyRequest: PharmacyRequestType[]
    hospitalRequest: HospitalRequestType | null
    pharmacyRequest: PharmacyRequestType | null
}

const initialState: initialStateType = {
    adminLoading: false,
    adminFetchLoading: false,
    adminDeleteLoading: false,
    allHospitalRequest: [],
    allPharmacyRequest: [],
    hospitalRequest: null,
    pharmacyRequest: null
}

const adminSlice = createSlice({
    name: "admin",
    initialState,
    reducers: {
        getHospitalDetails: (state, action) => {
            const hospitalId = action.payload
            const hospital = state.allHospitalRequest.find((hospital) => hospital._id === hospitalId)
            if (hospital) {
                state.hospitalRequest = hospital
            }
        },
        getPharmacyDetails: (state, action) => {
            const pharmacyId = action.payload
            const pharmacy = state.allPharmacyRequest.find((pharmacy) => pharmacy._id === pharmacyId)
            if (pharmacy) {
                state.pharmacyRequest = pharmacy
            }
        },
    },
    extraReducers: (builder) => {
        //getAllRequestHospital
        builder
            .addCase(getAllRequestHospital.pending, (state) => {
                state.adminFetchLoading = true
            })
            .addCase(getAllRequestHospital.fulfilled, (state, action) => {
                state.adminFetchLoading = false
                state.allHospitalRequest = action.payload.data
            })
            .addCase(getAllRequestHospital.rejected, (state) => {
                state.adminFetchLoading = false
            })
        //getAllRequestPharmacy
        builder
            .addCase(getAllRequestPharmacy.pending, (state) => {
                state.adminFetchLoading = true
            })
            .addCase(getAllRequestPharmacy.fulfilled, (state, action) => {
                state.adminFetchLoading = false
                state.allPharmacyRequest = action.payload.data
            })
            .addCase(getAllRequestPharmacy.rejected, (state) => {
                state.adminFetchLoading = false
            })
        //getRequestHospital
        builder
            .addCase(getRequestHospital.pending, (state) => {
                state.adminFetchLoading = true
            })
            .addCase(getRequestHospital.fulfilled, (state, action) => {
                state.adminFetchLoading = false
                state.hospitalRequest = action.payload.data
            })
            .addCase(getRequestHospital.rejected, (state) => {
                state.adminFetchLoading = false
            })
        //getRequestPharmacy
        builder
            .addCase(getRequestPharmacy.pending, (state) => {
                state.adminFetchLoading = true
            })
            .addCase(getRequestPharmacy.fulfilled, (state, action) => {
                state.adminFetchLoading = false
                state.pharmacyRequest = action.payload.data
            })
            .addCase(getRequestPharmacy.rejected, (state) => {
                state.adminFetchLoading = false
            })
        //deleteRequestHospital
        builder
            .addCase(deleteRequestHospital.pending, (state) => {
                state.adminDeleteLoading = true
            })
            .addCase(deleteRequestHospital.fulfilled, (state, action) => {
                state.adminDeleteLoading = false
                const hospitalId = action.payload.data
                state.allHospitalRequest = state.allHospitalRequest.filter((hospital) => hospital._id !== hospitalId)
            })
            .addCase(deleteRequestHospital.rejected, (state) => {
                state.adminDeleteLoading = false
            })
        //deleteRequestPharmacy
        builder
            .addCase(deleteRequestPharmacy.pending, (state) => {
                state.adminDeleteLoading = true
            })
            .addCase(deleteRequestPharmacy.fulfilled, (state, action) => {
                state.adminDeleteLoading = false
                const pharmacyId = action.payload.data
                state.allPharmacyRequest = state.allPharmacyRequest.filter((pharmacy) => pharmacy._id !== pharmacyId)
            })
            .addCase(deleteRequestPharmacy.rejected, (state) => {
                state.adminDeleteLoading = false
            })
        //addHospital
        builder
            .addCase(addHospital.pending, (state) => {
                state.adminLoading = true
            })
            .addCase(addHospital.fulfilled, (state, action) => {
                state.adminLoading = false
                const hospitalId = action.payload.data
                state.allHospitalRequest = state.allHospitalRequest.filter((hospital) => hospital._id !== hospitalId)
            })
            .addCase(addHospital.rejected, (state) => {
                state.adminLoading = false
            })
        //addPharmacy
        builder
            .addCase(addPharmacy.pending, (state) => {
                state.adminLoading = true
            })
            .addCase(addPharmacy.fulfilled, (state, action) => {
                state.adminLoading = false
                const pharmacyId = action.payload.data
                state.allPharmacyRequest = state.allPharmacyRequest.filter((pharmacy) => pharmacy._id !== pharmacyId)
            })
            .addCase(addPharmacy.rejected, (state) => {
                state.adminLoading = false
            })
    }
})

export const {getHospitalDetails, getPharmacyDetails} = adminSlice.actions

export default adminSlice.reducer