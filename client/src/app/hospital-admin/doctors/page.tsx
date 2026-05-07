"use client"

import { AppDispatch, RootState } from '@/store/store'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
  Mail, Search, Stethoscope,
  Plus, ExternalLink, Calendar,
  Pencil
} from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { getAllDoctors, setEditDoctor } from '@/store/slice/hospitalAdminSlice'
import { HosAdminEditDoctorType } from '@/Types/hospitalAdminTypes'
import { useRouter } from 'next/navigation'

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
}

const DoctorsPage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { fetchLoading, allDoctors } = useSelector((state: RootState) => state.hosAdmin)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(getAllDoctors(null)).unwrap()
      } catch (error: any) {
        toast.error(error.message || "Something went wrong")
      }
    }
    if (allDoctors.length === 0) {
      fetchData()
    }
  }, [dispatch, allDoctors.length])

  const filteredDoctors = allDoctors?.filter((doctor: any) =>
    doctor.userId?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.userId?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.department?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit=async(doctor:HosAdminEditDoctorType)=>{
    dispatch(setEditDoctor(doctor))
    router.push(`/hospital-admin/doctors/edit/${doctor._id}`)
  }

  return (
    <div className="p-4 md:p-8 bg-[#F8FAFC] min-h-screen font-sans selection:bg-blue-100 selection:text-blue-700">

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Specialist <span className="text-blue-600">Directory</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">
            Manage your medical team and consultation schedules.
          </p>
        </motion.div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto"
        >
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search by name, email or department..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-700 font-medium"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Link
            href='/hospital-admin/add-doctor'
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-7 py-3.5 rounded-2xl font-bold transition-all shadow-xl shadow-slate-200 active:scale-95 w-full sm:w-auto"
          >
            <Plus size={20} strokeWidth={3} />
            <span>Onboard Doctor</span>
          </Link>
        </motion.div>
      </div>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden"
      >
        {fetchLoading ? (
          <div className="py-40 flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              <Stethoscope className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600" size={24} />
            </div>
            <p className="mt-6 text-slate-400 font-black uppercase tracking-widest text-sm animate-pulse">Accessing Records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 text-[11px] font-black uppercase text-slate-400 tracking-[0.2em]">Medical Specialist</th>
                  <th className="px-8 py-6 text-[11px] font-black uppercase text-slate-400 tracking-[0.2em]">Department</th>
                  <th className="px-8 py-6 text-[11px] font-black uppercase text-slate-400 tracking-[0.2em]">Consultation Hours</th>
                  <th className="px-8 py-6 text-[11px] font-black uppercase text-slate-400 tracking-[0.2em]">Fee (BDT)</th>
                  <th className="px-8 py-6 text-right text-[11px] font-black uppercase text-slate-400 tracking-[0.2em]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence>
                  {filteredDoctors && filteredDoctors.length > 0 ? (
                    filteredDoctors.map((doctor: any) => (
                      <motion.tr
                        key={doctor._id}
                        variants={itemVariants}
                        layout
                        className="group hover:bg-blue-50/30 transition-colors"
                      >
                        {/* Profile Info */}
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="relative shrink-0">
                              <img
                                src={doctor.userId?.image?.url || "https://avatar.iran.liara.run/public/job/doctor/24"}
                                alt=""
                                className="w-14 h-14 rounded-2xl object-cover ring-4 ring-slate-50 group-hover:ring-blue-100 transition-all shadow-sm"
                              />
                              <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-slate-800 text-lg truncate group-hover:text-blue-600 transition-colors leading-tight">
                                {doctor.userId?.fullName}
                              </span>
                              <div className="flex items-center gap-3 mt-1.5">
                                <span className="flex items-center gap-1 text-xs text-slate-400 font-medium lowercase">
                                  <Mail size={12} /> {doctor.userId?.email}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Department */}
                        <td className="px-8 py-6">
                          <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wider group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
                            {doctor.department}
                          </span>
                        </td>

                        {/* Weekly Schedule */}
                        <td className="px-8 py-6">
                          <div className="flex flex-wrap gap-2 max-w-70">
                            {doctor.schedule?.slice(0, 2).map((s: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-2 text-[10px] font-bold text-slate-600 bg-slate-100/50 px-2.5 py-1.5 rounded-lg border border-slate-200/50">
                                <Calendar size={10} className="text-blue-500" />
                                <span>{s.dayOfWeek}: {s.startTime}-{s.endTime}</span>
                              </div>
                            ))}
                            {doctor.schedule?.length > 2 && (
                              <span className="text-[10px] font-bold text-slate-400 px-2 py-1.5">+ {doctor.schedule.length - 2} more</span>
                            )}
                          </div>
                        </td>

                        {/* Consultation Fee */}
                        <td className="px-8 py-6">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xl font-black text-slate-900 leading-none">
                              {doctor.consultationFee || 0}
                            </span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">BDT</span>
                          </div>
                        </td>

                        {/* Action Buttons */}
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-70 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                            <Link
                              href={`/doctor/${doctor._id}`}
                              className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                              title="View Details"
                            >
                              <ExternalLink size={18} />
                            </Link>
                            <button
                              className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                              onClick={() => handleEdit(doctor)}
                            >
                              <Pencil size={18} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-32 text-center">
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="flex flex-col items-center gap-4"
                        >
                          <div className="p-6 bg-slate-50 rounded-full border border-slate-100">
                            <Stethoscope size={48} className="text-slate-200" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-xl font-black text-slate-800 tracking-tight">No specialists found</p>
                            <p className="text-slate-400 text-sm font-medium">Try adjusting your search filters or add a new doctor.</p>
                          </div>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default DoctorsPage