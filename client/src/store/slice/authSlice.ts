import { emailType, loginType, otpType, registrationType, resendOtpType, userType } from "@/Types/authTypes";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

const SERVER_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth`

export const registrationPatiend = createAsyncThunk(
    "authRegi",
    async(data:registrationType, {rejectWithValue})=>{
        try {
            const res = await axios.post(`${SERVER_URL}/patient-registration`, data)
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const verifyRegi = createAsyncThunk(
    "auth/verifyRegi",
    async (data: otpType, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/verify-regi`, data,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const login = createAsyncThunk(
    "auth/login",
    async (data: loginType, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/login`, data,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const logout = createAsyncThunk(
    "auth/logout",
    async (_: null, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/logout`,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const forgetPass = createAsyncThunk(
    "auth/forgetPass",
    async (data: emailType, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/forget-pass`, data,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const verifyForgetPass = createAsyncThunk(
    "auth/verifyForgetPass",
    async (data: otpType, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/verify-forget-pass`, data,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const resetPass = createAsyncThunk(
    "auth/resetPass",
    async (data: loginType, { rejectWithValue }) => {
        try {
            const res = await axios.patch(`${SERVER_URL}/reset-pass`, data,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const resendOtp = createAsyncThunk(
    "auth/resendOtp",
    async (data: resendOtpType, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/resend-otp`, data,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getUser = createAsyncThunk(
    "auth/getUser",
    async (_: null, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/user`,
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
    authLoading: boolean
    user: userType | null
    otpLoading: boolean
    fetchLoading: boolean
}

const initialState: initialStateType = {
    authLoading: false,
    fetchLoading: false,
    user: null,
    otpLoading: false
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        //registration
        builder
            .addCase(registrationPatiend.pending, (state) => {
                state.authLoading = true
            })
            .addCase(registrationPatiend.fulfilled, (state) => {
                state.authLoading = false
            })
            .addCase(registrationPatiend.rejected, (state) => {
                state.authLoading = false
            })
        //verify registration
        builder
            .addCase(verifyRegi.pending, (state) => {
                state.authLoading = true
            })
            .addCase(verifyRegi.fulfilled, (state) => {
                state.authLoading = false
            })
            .addCase(verifyRegi.rejected, (state) => {
                state.authLoading = false
            })
        //login
        builder
            .addCase(login.pending, (state) => {
                state.authLoading = true
            })
            .addCase(login.fulfilled, (state, action) => {
                state.authLoading = false
                state.user = action.payload.data
            })
            .addCase(login.rejected, (state) => {
                state.authLoading = false
            })
        //logout
        builder
            .addCase(logout.pending, (state) => {
                state.authLoading = true
            })
            .addCase(logout.fulfilled, (state) => {
                state.authLoading = false
                state.user = null
            })
            .addCase(logout.rejected, (state) => {
                state.authLoading = false
            })
        //forgetPass
        builder
            .addCase(forgetPass.pending, (state) => {
                state.authLoading = true
            })
            .addCase(forgetPass.fulfilled, (state) => {
                state.authLoading = false
            })
            .addCase(forgetPass.rejected, (state) => {
                state.authLoading = false
            })
        //verifyForgetPass
        builder
            .addCase(verifyForgetPass.pending, (state) => {
                state.authLoading = true
            })
            .addCase(verifyForgetPass.fulfilled, (state) => {
                state.authLoading = false
            })
            .addCase(verifyForgetPass.rejected, (state) => {
                state.authLoading = false
            })
        //resetPass
        builder
            .addCase(resetPass.pending, (state) => {
                state.authLoading = true
            })
            .addCase(resetPass.fulfilled, (state) => {
                state.authLoading = false
            })
            .addCase(resetPass.rejected, (state) => {
                state.authLoading = false
            })
        //resendOtp
        builder
            .addCase(resendOtp.pending, (state) => {
                state.otpLoading = true
            })
            .addCase(resendOtp.fulfilled, (state) => {
                state.otpLoading = false
            })
            .addCase(resendOtp.rejected, (state) => {
                state.otpLoading = false
            })
        //getuser
        builder
            .addCase(getUser.pending, (state) => {
                state.fetchLoading = false
            })
            .addCase(getUser.fulfilled, (state, action) => {
                state.fetchLoading = true
                state.user = action.payload.data
            })
            .addCase(getUser.rejected, (state) => {
                state.fetchLoading = true
            })
    }
})

export default authSlice.reducer