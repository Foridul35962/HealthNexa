"use client"

import { getAllRequestPharmacy, getPharmacyDetails } from '@/store/slice/adminSlice'
import { AppDispatch, RootState } from '@/store/store'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import {
    Pill, Mail, Phone, MapPin,
    ChevronRight, Store
} from 'lucide-react'
import Link from 'next/link'
import HospitalPharmacyList from '@/components/loading/Hospital-PharmacyList'
import { useRouter } from 'next/navigation'

const PharmacyRequestPage = () => {
    const { adminFetchLoading, allPharmacyRequest } = useSelector((state: RootState) => state.admin)
    const dispatch = useDispatch<AppDispatch>()
    const router = useRouter()

    useEffect(() => {
        const fetch = async () => {
            try {
                await dispatch(getAllRequestPharmacy(null)).unwrap()
            } catch (error: any) {
                toast.error(error.message || "Failed to fetch pharmacy requests")
            }
        }
        if (allPharmacyRequest.length === 0) {
            fetch()
        }
    }, [dispatch, allPharmacyRequest.length])

    const handleDetails = async (pharmacyId: string) => {
        dispatch(getPharmacyDetails(pharmacyId))
        router.push(`/admin/registration-request/pharmacy/${pharmacyId}`)
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Pharmacy Requests</h1>
                    <p className="text-slate-500 mt-1 font-medium">Review and approve pharmacy partner applications.</p>
                </div>
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
                    </span>
                    <span className="text-sm font-bold text-slate-700">{allPharmacyRequest.length} Pending Approvals</span>
                </div>
            </div>

            {/* List Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 gap-4">
                {adminFetchLoading ? (
                    [1, 2, 3].map((i) => (
                        <div key={i}>
                            <HospitalPharmacyList />
                        </div>
                    ))
                ) : allPharmacyRequest.length > 0 ? (
                    allPharmacyRequest.map((pharmacy: any, index: number) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            key={pharmacy._id}
                            className="group bg-white border border-slate-100 p-5 rounded-[28px] hover:shadow-xl hover:shadow-emerald-900/5 transition-all hover:border-emerald-100"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                {/* Pharmacy Info */}
                                <div className="flex items-start md:items-center gap-5">
                                    <div className="w-14 h-14 bg-emerald-50 rounded-[20px] flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                                        <Pill size={28} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                                                {pharmacy.name}
                                            </h3>
                                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100">
                                                New Application
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 font-medium">
                                            <span className="flex items-center gap-1.5"><Mail size={14} className="text-slate-400" /> {pharmacy.email}</span>
                                            <span className="flex items-center gap-1.5"><Phone size={14} className="text-slate-400" /> {pharmacy.phoneNumber}</span>
                                            <span className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-400" /> {pharmacy.address.city}, {pharmacy.address.postalCode}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-4">
                                    <div className="hidden sm:flex flex-col items-end mr-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Applied On</span>
                                        <span className="text-xs font-bold text-slate-700">{new Date(pharmacy.createdAt).toLocaleDateString()}</span>
                                    </div>

                                    <button
                                        onClick={() => handleDetails(pharmacy._id)}
                                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-[18px] font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-slate-100 hover:shadow-emerald-200 active:scale-95"
                                    >
                                        View Request <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <Store size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">No Pharmacy Requests</h3>
                        <p className="text-slate-500">Wait for new pharmacies to join the network.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default PharmacyRequestPage