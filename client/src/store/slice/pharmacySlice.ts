import { editPharmacyMedicineType, GetAllShopMedicineType, PharmacyMedicineType, pharmacyMedicineType, requestMedicineType } from "@/Types/pharmacyTypes";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

const SERVER_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/pharmacy`

export const requestMedicine = createAsyncThunk(
    "pharmacy/reqMedi",
    async (data: requestMedicineType, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/req-medicine`, data,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const addMedicineToShop = createAsyncThunk(
    "pharmacy/addMeditoShop",
    async (data: pharmacyMedicineType, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/add-medishop`, data,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const editMedicineToShop = createAsyncThunk(
    "pharmacy/editMeditoShop",
    async ({ data, pharMediId }: { data: editPharmacyMedicineType, pharMediId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.patch(`${SERVER_URL}/edit-medishop/${pharMediId}`, data,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getAllShopMedicine = createAsyncThunk(
    "pharmacy/getAllShopMedi",
    async ({ page, limit, search }: { page: string, limit: string, search?: string }, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams({
                page,
                limit,
            })

            if (search?.trim()) {
                params.append("search", search.trim())
            }
            const res = await axios.get(`${SERVER_URL}/all-pharMedi?${params.toString()}`,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getPharMedi = createAsyncThunk(
    "pharmacy/pharmedi",
    async({medicineId}:{medicineId:string},{rejectWithValue})=>{
        try {
            const res = await axios.get(`${SERVER_URL}/pharMedi/${medicineId}`,{
                withCredentials: true
            })
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

interface InitialStateType {
    pharmacyFetchLoading: boolean
    pharmacyLoading: boolean
    allShopMedicine: GetAllShopMedicineType
    editPharMedi:PharmacyMedicineType | null
}

const initialState: InitialStateType = {
    pharmacyFetchLoading: false,
    pharmacyLoading: false,
    allShopMedicine: {
        data: [],
        pagination: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0
        }
    },
    editPharMedi: null
}

const pharmacySlice = createSlice({
    name: "pharmacy",
    initialState,
    reducers: {
        addEditMediPhar: (state, action)=>{
            state.editPharMedi = action.payload
        }
    },
    extraReducers: (builder) => {
        //request medicine
        builder
            .addCase(requestMedicine.pending, (state) => {
                state.pharmacyLoading = true
            })
            .addCase(requestMedicine.fulfilled, (state) => {
                state.pharmacyLoading = false
            })
            .addCase(requestMedicine.rejected, (state) => {
                state.pharmacyLoading = false
            })
        //add medicine to store
        builder
            .addCase(addMedicineToShop.pending, (state) => {
                state.pharmacyLoading = true
            })
            .addCase(addMedicineToShop.fulfilled, (state, action) => {
                state.pharmacyLoading = false
                state.allShopMedicine.data.unshift(action.payload.data)
                state.allShopMedicine.pagination.total += 1
            })
            .addCase(addMedicineToShop.rejected, (state) => {
                state.pharmacyLoading = false
            })
        //edit medicine to store
        builder
            .addCase(editMedicineToShop.pending, (state) => {
                state.pharmacyLoading = true
            })
            .addCase(editMedicineToShop.fulfilled, (state, action) => {
                state.pharmacyLoading = false
                const updatedMedicine = action.payload.data

                const index = state.allShopMedicine.data.findIndex(
                    m => m._id === updatedMedicine._id
                )

                if (index !== -1) {
                    state.allShopMedicine.data[index] = updatedMedicine
                }
            })
            .addCase(editMedicineToShop.rejected, (state) => {
                state.pharmacyLoading = false
            })
        //get all medicine shop
        builder
            .addCase(getAllShopMedicine.pending, (state) => {
                state.pharmacyFetchLoading = true
            })
            .addCase(getAllShopMedicine.fulfilled, (state, action) => {
                state.pharmacyFetchLoading = false
                state.allShopMedicine = action.payload.data
            })
            .addCase(getAllShopMedicine.rejected, (state) => {
                state.pharmacyFetchLoading = false
            })
        //get medicineShop
        builder
            .addCase(getPharMedi.pending, (state) => {
                state.pharmacyFetchLoading = true
            })
            .addCase(getPharMedi.fulfilled, (state, action) => {
                state.pharmacyFetchLoading = false
                state.editPharMedi = action.payload.data
            })
            .addCase(getPharMedi.rejected, (state) => {
                state.pharmacyFetchLoading = false
            })
    }
})

export const {addEditMediPhar} = pharmacySlice.actions

export default pharmacySlice.reducer