import { configureStore } from "@reduxjs/toolkit";
import authSlice from './slice/authSlice'
import adminSlice from './slice/adminSlice'
import hospitalAdminSlice from './slice/hospitalAdminSlice'
import publicSlice from './slice/publicSlice'

const store = configureStore({
    reducer: {
        auth: authSlice,
        admin: adminSlice,
        hosAdmin: hospitalAdminSlice,
        publicSlice: publicSlice,
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store