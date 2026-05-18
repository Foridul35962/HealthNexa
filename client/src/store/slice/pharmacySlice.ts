import { editPharmacyMedicineType, GetAllShopMedicineType, IPharmacyDashboardType, PharmacyMedicineType, pharmacyMedicineType, PharmacyType, requestMedicineType } from "@/Types/pharmacyTypes";
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
    async ({ medicineId }: { medicineId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/pharMedi/${medicineId}`, {
                withCredentials: true
            })
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const deletePharMedi = createAsyncThunk(
    "pharmacy/deletepharmedi",
    async ({ medicineId }: { medicineId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.delete(`${SERVER_URL}/pharMedi/${medicineId}`, {
                withCredentials: true
            })
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getPharmacyDashboard = createAsyncThunk(
    "pharmacy/dashborad",
    async (_: null, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/dashboard`,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getMyPharmacy = createAsyncThunk(
    "pharmacy/myPharmacy",
    async (_: null, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/my-pharmacy`,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const editPharmacy = createAsyncThunk(
    "pharmacy/edit",
    async (data: FormData, { rejectWithValue }) => {
        try {
            const res = await axios.patch(`${SERVER_URL}/edit-pharma`, data,
                { withCredentials: true }
            )
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
    editPharMedi: PharmacyMedicineType | null
    pharmacyDashboard: IPharmacyDashboardType | null
    pharmacy: PharmacyType | null
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
    editPharMedi: null,
    pharmacyDashboard: null,
    pharmacy: null
}

const pharmacySlice = createSlice({
    name: "pharmacy",
    initialState,
    reducers: {
        addEditMediPhar: (state, action) => {
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
        //delete medicine from shop
        builder
            .addCase(deletePharMedi.fulfilled, (state, action) => {
                const medicineId = action.payload.data
                state.allShopMedicine.data = state.allShopMedicine.data.filter((m) => m._id !== medicineId)
            })
        //get dashboard
        builder
            .addCase(getPharmacyDashboard.pending, (state) => {
                state.pharmacyFetchLoading = true
            })
            .addCase(getPharmacyDashboard.fulfilled, (state, action) => {
                state.pharmacyFetchLoading = false
                state.pharmacyDashboard = action.payload.data
            })
            .addCase(getPharmacyDashboard.rejected, (state) => {
                state.pharmacyFetchLoading = false
            })
        //get pharmacy
        builder
            .addCase(getMyPharmacy.pending, (state) => {
                state.pharmacyFetchLoading = true
            })
            .addCase(getMyPharmacy.fulfilled, (state, action) => {
                state.pharmacyFetchLoading = false
                state.pharmacy = action.payload.data
            })
            .addCase(getMyPharmacy.rejected, (state) => {
                state.pharmacyFetchLoading = false
            })
        // edit pharmacy
        builder
            .addCase(editPharmacy.pending, (state) => {
                state.pharmacyLoading = true
            })
            .addCase(editPharmacy.fulfilled, (state, action) => {
                state.pharmacyLoading = false
                const updatedPharmacy = action.payload.data
                if (state.pharmacy) {
                    state.pharmacy = updatedPharmacy
                }
                if (state.pharmacyDashboard) {
                    state.pharmacyDashboard.pharmacyInfo = updatedPharmacy
                }
            })
            .addCase(editPharmacy.rejected, (state) => {
                state.pharmacyLoading = false
            })
    }
})

export const { addEditMediPhar } = pharmacySlice.actions

export default pharmacySlice.reducer