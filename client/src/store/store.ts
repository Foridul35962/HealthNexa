import { configureStore } from "@reduxjs/toolkit";
import authSlice from './slice/authSlice'
import adminSlice from './slice/adminSlice'
import hospitalAdminSlice from './slice/hospitalAdminSlice'
import publicSlice from './slice/publicSlice'
import pharmacySlice from './slice/pharmacySlice'
import aiSlice from './slice/aiSlice'
import patientSlice from './slice/patientSlice'
import receptionistSlice from './slice/receptionistSlice'
import doctorSlice from './slice/doctorSlice'

const store = configureStore({
    reducer: {
        auth: authSlice,
        admin: adminSlice,
        hosAdmin: hospitalAdminSlice,
        public: publicSlice,
        pharmacy: pharmacySlice,
        ai: aiSlice,
        patient: patientSlice,
        receptionist: receptionistSlice,
        doctor: doctorSlice,
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store