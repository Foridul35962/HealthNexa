"use client"

import { getAllRequestHospital, getHospitalDetails } from '@/store/slice/adminSlice'
import { AppDispatch, RootState } from '@/store/store'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import {
    Building2, Mail, Phone, MapPin,
    Clock,
    ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import HospitalPharmacyList from '@/components/loading/Hospital-PharmacyList'
import { useRouter } from 'next/navigation'

const HospitalRequestPage = () => {
    const { adminFetchLoading, allHospitalRequest } = useSelector((state: RootState) => state.admin)
    const dispatch = useDispatch<AppDispatch>()
    const router = useRouter()

    useEffect(() => {
        const fetch = async () => {
            try {
                await dispatch(getAllRequestHospital(null)).unwrap()
            } catch (error: any) {
                toast.error(error.message || "Failed to fetch requests")
            }
        }
        if (allHospitalRequest.length === 0) {
            fetch()
        }
    }, [dispatch, allHospitalRequest.length])

    const handleDetails = async (hospitalId: string) => {
        dispatch(getHospitalDetails(hospitalId))
        router.push(`/admin/registration-request/hospital/${hospitalId}`)
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Hospital Requests</h1>
                    <p className="text-slate-500 mt-1 font-medium">Manage and review pending hospital registrations.</p>
                </div>
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
                    </span>
                    <span className="text-sm font-bold text-slate-700">{allHospitalRequest.length} Pending Requests</span>
                </div>
            </div>

            {/* List Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 gap-4">
                {adminFetchLoading ? (
                    // Skeleton Loader
                    [1, 2, 3].map((i) => (
                        <div key={i}>
                            <HospitalPharmacyList />
                        </div>
                    ))
                ) : allHospitalRequest.length > 0 ? (
                    allHospitalRequest.map((hospital: any, index: number) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            key={hospital._id}
                            className="group bg-white border border-slate-100 p-5 rounded-[28px] hover:shadow-xl hover:shadow-slate-200/50 transition-all hover:border-blue-100"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                {/* Hospital Info */}
                                <div className="flex items-start md:items-center gap-5">
                                    <div className="w-14 h-14 bg-slate-50 rounded-[20px] flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                        <Building2 size={28} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                                                {hospital.name}
                                            </h3>
                                            <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-100">
                                                Pending
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 font-medium">
                                            <span className="flex items-center gap-1.5"><Mail size={14} className="text-slate-400" /> {hospital.email}</span>
                                            <span className="flex items-center gap-1.5"><Phone size={14} className="text-slate-400" /> {hospital.phoneNumber}</span>
                                            <span className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-400" /> {hospital.address.city}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-3 ml-auto md:ml-0">
                                    <div className="hidden lg:flex flex-wrap gap-2 mr-4">
                                        {hospital.specialties.slice(0, 2).map((spec: string, i: number) => (
                                            <span key={i} className="px-3 py-1 bg-slate-50 text-slate-600 text-[11px] font-bold rounded-lg border border-slate-100 capitalize">
                                                {spec}
                                            </span>
                                        ))}
                                        {hospital.specialties.length > 2 && (
                                            <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[11px] font-bold rounded-lg">
                                                +{hospital.specialties.length - 2}
                                            </span>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handleDetails(hospital._id)}
                                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-[18px] font-bold text-sm hover:bg-blue-600 transition-all shadow-lg shadow-slate-100 hover:shadow-blue-200 active:scale-95"
                                    >
                                        Review Details <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <Clock size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">No Pending Requests</h3>
                        <p className="text-slate-500">All hospital applications have been processed.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default HospitalRequestPage