import { userType } from "@/Types/authTypes";
import { HosAdminAllDoctorType, HosAdminEditDoctorType, HospitalType } from "@/Types/hospitalAdminTypes";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

const SERVER_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/hospital-admin`

export const addReceptionists = createAsyncThunk(
    "hospitalAdmin/add-rece",
    async (data: FormData, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/add-receptionist`, data,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const editReceptionists = createAsyncThunk(
    "hospitalAdmin/edit-rece",
    async ({ data, receptionistId }: { data: FormData; receptionistId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.patch(`${SERVER_URL}/edit-receptionist/${receptionistId}`, data,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const deleteReceptionists = createAsyncThunk(
    "hospitalAdmin/delete-rece",
    async ({ receptionistId }: { receptionistId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.delete(`${SERVER_URL}/receptionist/${receptionistId}`,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getAllReceptionists = createAsyncThunk(
    "hospitalAdmin/all-rece",
    async (_: null, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/all-receptionist`,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getAllDoctors = createAsyncThunk(
    "hospitalAdmin/all-doc",
    async (_: null, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/all-doctors`,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const addDoctors = createAsyncThunk(
    "hospitalAdmin/add-doctor",
    async (data: FormData, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/add-doctors`, data,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const editDoctor = createAsyncThunk(
    "hospitalAdmin/edit-doctor",
    async ({ data, doctorId }: { data: FormData; doctorId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.patch(`${SERVER_URL}/edit-doctors/${doctorId}`, data,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const deleteDoctors = createAsyncThunk(
    "hospitalAdmin/delete-doctor",
    async ({ doctorId }: { doctorId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.delete(`${SERVER_URL}/doctors/${doctorId}`,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getHospital = createAsyncThunk(
    "hospitalAdmin/get-hospital",
    async (_: null, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/hospital`,
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
    hosAdminLoading: boolean
    allReceptionist: userType[]
    allDoctors: HosAdminAllDoctorType[]
    editDoctors: HosAdminEditDoctorType | null
    adminHospital: HospitalType | null
    fetchLoading: boolean
    deleteLoading: boolean
}

const initialState: initialStateType = {
    hosAdminLoading: false,
    allReceptionist: [],
    allDoctors: [],
    editDoctors: null,
    adminHospital: null,
    fetchLoading: false,
    deleteLoading: false
}

const hospitalAdminSlice = createSlice({
    name: "hosAdmin",
    initialState,
    reducers: {
        setEditDoctor: (state, action) => {
            state.editDoctors = action.payload
        }
    },
    extraReducers: (builder) => {
        //add receptionist
        builder
            .addCase(addReceptionists.pending, (state) => {
                state.hosAdminLoading = true
            })
            .addCase(addReceptionists.fulfilled, (state, action) => {
                state.hosAdminLoading = false
                state.allReceptionist.push(action.payload.data)
            })
            .addCase(addReceptionists.rejected, (state) => {
                state.hosAdminLoading = false
            })
        //edit receptionist
        builder
            .addCase(editReceptionists.pending, (state) => {
                state.hosAdminLoading = true
            })
            .addCase(editReceptionists.fulfilled, (state, action) => {
                state.hosAdminLoading = false
                const receptionist = action.payload.data
                const idx: any = state.allReceptionist?.findIndex((r) => r._id === receptionist._id)
                if (idx > -1 && state.allReceptionist) {
                    state.allReceptionist[idx] = receptionist
                }
            })
            .addCase(editReceptionists.rejected, (state) => {
                state.hosAdminLoading = false
            })
        //delete receptionist
        builder
            .addCase(deleteReceptionists.pending, (state) => {
                state.hosAdminLoading = true
            })
            .addCase(deleteReceptionists.fulfilled, (state, action) => {
                state.hosAdminLoading = false
                const receptionistId = action.payload.data
                state.allReceptionist = state.allReceptionist?.filter(r => r._id !== receptionistId)
            })
            .addCase(deleteReceptionists.rejected, (state) => {
                state.hosAdminLoading = false
            })
        //get all receptionist
        builder
            .addCase(getAllReceptionists.pending, (state) => {
                state.fetchLoading = true
            })
            .addCase(getAllReceptionists.fulfilled, (state, action) => {
                state.fetchLoading = false
                state.allReceptionist = action.payload.data
            })
            .addCase(getAllReceptionists.rejected, (state) => {
                state.fetchLoading = false
            })
        //get all doctors
        builder
            .addCase(getAllDoctors.pending, (state) => {
                state.fetchLoading = true
            })
            .addCase(getAllDoctors.fulfilled, (state, action) => {
                state.fetchLoading = false
                state.allDoctors = action.payload.data
            })
            .addCase(getAllDoctors.rejected, (state) => {
                state.fetchLoading = false
            })
        //add doctors
        builder
            .addCase(addDoctors.pending, (state) => {
                state.hosAdminLoading = true
            })
            .addCase(addDoctors.fulfilled, (state, action) => {
                state.hosAdminLoading = false
                state.allDoctors.push(action.payload.data)
            })
            .addCase(addDoctors.rejected, (state) => {
                state.hosAdminLoading = false
            })
        //edit doctor
        builder
            .addCase(editDoctor.pending, (state) => {
                state.hosAdminLoading = true
            })
            .addCase(editDoctor.fulfilled, (state, action) => {
                state.hosAdminLoading = false
                const doctor = action.payload.data
                const idx: any = state.allDoctors?.findIndex((d) => d._id === doctor._id)
                if (idx > -1 && state.allDoctors) {
                    state.allDoctors[idx] = doctor
                }
            })
            .addCase(editDoctor.rejected, (state) => {
                state.hosAdminLoading = false
            })
        //delete doctor
        builder
            .addCase(deleteDoctors.pending, (state) => {
                state.deleteLoading = true
            })
            .addCase(deleteDoctors.fulfilled, (state, action) => {
                state.deleteLoading = false
                const doctorId = action.payload.data
                state.allDoctors = state.allDoctors?.filter(d => d._id !== doctorId)
            })
            .addCase(deleteDoctors.rejected, (state) => {
                state.deleteLoading = false
            })
        //get hospital
        builder
            .addCase(getHospital.fulfilled, (state, action) => {
                state.adminHospital = action.payload.data
            })
    }
})

export const { setEditDoctor } = hospitalAdminSlice.actions

export default hospitalAdminSlice.reducer