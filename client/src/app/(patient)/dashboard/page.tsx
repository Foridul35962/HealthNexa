"use client"

import { getUpcommingAppointment, updatePatientDetails } from '@/store/slice/patientSlice'
import { AppDispatch, RootState } from '@/store/store'
import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { motion, Variants, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, MapPin, User, Mail, Phone, ShieldCheck, Loader2, Edit2, X, Upload, Stethoscope } from 'lucide-react'
import Link from 'next/link'
import { UpcomingAppointmentType } from '@/Types/patientTypes'


const Page = () => {
  const { upcommingAppointment, patientLoading, updateLoading } = useSelector((state: RootState) => state.patient)
  const { user } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch<AppDispatch>()

  // Edit Profile States
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [fullName, setFullName] = useState(user?.fullName || '')

  // Image handling states
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>(user?.image?.url || '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        await dispatch(getUpcommingAppointment(null)).unwrap()
      } catch (error: any) {
        toast.error(error?.message || "Something went wrong")
      }
    }
    if (upcommingAppointment.length === 0) {
      fetch()
    }
  }, [dispatch])

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '')
      setPreviewUrl(user.image?.url || '')
    }
  }, [user])

  // Handle Image Change & Create Preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  // Handle Form Submit using FormData (Conditional Append)
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    const formData = new FormData()
    let isChanged = false

    if (fullName.trim() !== user?.fullName) {
      formData.append('fullName', fullName.trim())
      isChanged = true
    }

    if (selectedFile) {
      formData.append('image', selectedFile)
      isChanged = true
    }

    if (!isChanged) {
      toast.info("No changes made to your profile.")
      setIsEditOpen(false)
      return
    }

    try {
      await dispatch(updatePatientDetails(formData)).unwrap()

      toast.success("Profile updated successfully with FormData!")
      setIsEditOpen(false)
      setSelectedFile(null)
    } catch (error: any) {
      toast.error(error?.message || "Failed to update profile")
    }
  }

  const handleCloseModal = () => {
    setIsEditOpen(false)
    setFullName(user?.fullName || '')
    setPreviewUrl(user?.image?.url || '')
    setSelectedFile(null)
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 }
    }
  }

  return (
    <div
      className="w-full min-h-screen bg-slate-50/50 p-4 md:p-8 text-slate-800 overflow-y-scroll"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {/* Dynamic Scrollbar Injection to clear secondary tracks completely */}
      <style jsx global>{`
        ::-webkit-scrollbar {
          display: none !important;
          width: 0px !important;
        }
        body, html {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
          overflow-y: auto !important;
        }
      `}</style>

      {/* Top Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Welcome Back, <span className="text-blue-600">{user?.fullName || 'Patient'}</span> 👋
          </h1>
          <p className="text-slate-500 mt-1">Here is your health dashboard and upcoming schedule.</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-medium self-start md:self-center">
          <ShieldCheck className="w-4 h-4" />
          <span>Verified Patient</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* Left Section: Appointments List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Upcoming Appointments
            </h2>
            <span className="bg-slate-200/60 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {upcommingAppointment?.length || 0} Total
            </span>
          </div>

          {patientLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-slate-500 mt-2 text-sm">Loading appointments...</p>
            </div>
          ) : upcommingAppointment && upcommingAppointment.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 gap-4"
            >
              {upcommingAppointment.map((appointment: UpcomingAppointmentType) => (
                <Link
                  href={`/appointments/${appointment._id}`}
                  key={appointment._id}>
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between md:items-center gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-blue-50 rounded-xl overflow-hidden flex items-center justify-center border border-blue-100 shrink-0">
                        {/* FIXED: Target location updated to appointment.doctorId.userId.image.url */}
                        {appointment.doctorId?.userId?.image?.url ? (
                          <img
                            src={appointment.doctorId.userId.image.url}
                            alt={appointment.doctorId.userId.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-blue-500" />
                        )}
                      </div>

                      <div>
                        {/* FIXED: Target location updated to appointment.doctorId.userId.fullName */}
                        <h3 className="font-semibold text-slate-900 text-base">
                          Dr. {appointment.doctorId?.userId?.fullName || 'Unknown Doctor'}
                        </h3>

                        <p className="text-sm font-medium text-blue-600 mt-0.5">
                          {appointment.hospitalId?.name || 'Hospital Details Unavailable'}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                          {appointment.doctorId?.department && (
                            <span className="flex items-center gap-1 bg-slate-100 text-slate-600 capitalize px-2 py-0.5 rounded-md font-medium">
                              <Stethoscope className="w-3 h-3 text-blue-500" />
                              {appointment.doctorId.department}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {appointment.slotStart} - {appointment.slotEnd}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex md:flex-col justify-between md:items-end gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <span className="text-sm font-semibold text-slate-800 bg-slate-100 px-3 py-1 rounded-lg">
                        {new Date(appointment.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${appointment.status === 'Booked' || appointment.status === 'Pending'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                        {appointment.status}
                      </span>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 p-6 shadow-sm"
            >
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">No upcoming appointments found</p>
              <p className="text-slate-400 text-sm mt-1">When you book an appointment, it will appear here.</p>
            </motion.div>
          )}
        </div>

        {/* Right Section: Patient Profile Card */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              My Profile
            </h2>
            <button
              onClick={() => setIsEditOpen(true)}
              className="flex items-center cursor-pointer gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors px-3 py-1.5 rounded-xl border border-blue-100"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit Profile
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden relative"
          >
            <div className="h-24 bg-linear-to-r from-blue-500 to-indigo-600" />

            <div className="p-6 relative pt-0">
              <div className="absolute -top-12 left-6">
                <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-md border border-slate-100">
                  <div className="w-full h-full bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center">
                    {user?.image?.url ? (
                      <img src={user.image.url} alt={user.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-10 mt-2">
                <h3 className="text-lg font-bold text-slate-900">{user?.fullName || 'N/A'}</h3>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-0.5">{user?.role || 'Patient'}</p>

                <hr className="my-4 border-slate-100" />

                <div className="space-y-3.5 text-sm text-slate-600">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{user?.email || 'No Email Added'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{user?.phoneNumber || 'No Phone Number'}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Profile Edit Modal Layer */}
      <AnimatePresence>
        {isEditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden border border-slate-100 relative z-10 p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-slate-900">Update Profile Details</h3>
                <button
                  onClick={handleCloseModal}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-5">

                {/* Direct Image Upload Block with Live Preview */}
                <div className="flex flex-col items-center justify-center bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200">
                  <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden mb-3 relative group">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                        <User className="w-10 h-10" />
                      </div>
                    )}
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-xl shadow-sm transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    {user?.image?.url ? 'Change Image' : 'Upload Image'}
                  </button>
                </div>

                {/* Full Name input block */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Enter your full name"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
                  />
                </div>

                {/* Submit Controls */}
                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={patientLoading}
                    className="px-4 py-2 rounded-xl cursor-pointer disabled:cursor-wait disabled:bg-blue-400 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    {patientLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Page