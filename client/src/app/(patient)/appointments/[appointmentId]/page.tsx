"use client"

import { deleteAppointment, getAppointment, getCurrentToken } from '@/store/slice/patientSlice'
import { AppDispatch, RootState } from '@/store/store'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { Calendar, Clock, Stethoscope, User, Trash2, ArrowLeft, Maximize2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const Page = () => {
    const { appointmentId } = useParams()
    const router = useRouter()
    const dispatch = useDispatch<AppDispatch>()
    const { appointment, patientLoading, patientDeleteLoading, currentToken } = useSelector((state: RootState) => state.patient)

    const [isQrExpanded, setIsQrExpanded] = useState(false)

    useEffect(() => {
        const fetchAppointment = async () => {
            try {
                await dispatch(getAppointment({ appointmentId: appointmentId as string })).unwrap()
            } catch (error: any) {
                toast.error(error.message || "Failed to fetch appointment details")
            }
        }

        if (appointmentId !== appointment?.appointment._id) {
            fetchAppointment()
        }
    }, [appointmentId, dispatch])

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to cancel this appointment?")) return

        try {
            await dispatch(deleteAppointment({appointmentId:appointmentId as string})).unwrap()
            toast.success("Appointment cancelled successfully")
            router.push('/appointments')
        } catch (error: any) {
            toast.error(error.message || "Failed to cancel appointment")
        }
    }

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Booked': return 'bg-green-100 text-green-800 border-green-200'
            case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    useEffect(()=>{
        if (appointment) {
            const appointmentDate = appointment?.appointment?.date;
            const parsedDate = new Date(appointmentDate);
            dispatch(getCurrentToken({
                doctorId:appointment?.appointment.doctorId._id as string,
                date: parsedDate
            }))
        }
    },[dispatch, appointment])

    // --- SKELETON LOADING UI ---
    if (patientLoading) {
        return (
            <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 animate-pulse">
                <div className="h-6 w-24 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded-2xl"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 h-64 bg-gray-200 rounded-2xl"></div>
                    <div className="h-64 bg-gray-200 rounded-2xl"></div>
                </div>
            </div>
        )
    }

    if (!appointment) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <p className="text-gray-500 font-medium">No appointment found.</p>
                <button onClick={() => router.back()} className="flex items-center gap-2 text-blue-600 hover:underline">
                    <ArrowLeft size={16} /> Go Back
                </button>
            </div>
        )
    }

    const { appointment: data, qrImage } = appointment

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 text-gray-800"
        >
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
                <ArrowLeft size={18} /> Back to Dashboard
            </button>

            {/* Header / Summary Card */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between md:justify-start gap-4 flex-1">
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Appointment Details</h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyles(data.status)}`}>
                                {data.status}
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">ID: {data._id}</p>
                    </div>

                    {/* QR Code integrated at the top */}
                    {qrImage && (
                        <div className="flex items-center sm:ml-auto md:ml-6">
                            <div 
                                onClick={() => setIsQrExpanded(true)}
                                className="group relative cursor-pointer border border-gray-200 p-2 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-3 shadow-2xl bg-white"
                                title="Click to enlarge"
                            >
                                <img src={qrImage} alt="QR Thumbnail" className="w-12 h-12 object-contain" />
                                <div className="text-left pr-2">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Check-in QR</span>
                                    <span className="text-xs font-medium text-blue-600 flex items-center gap-1">
                                        View <Maximize2 size={10} />
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Conditional Delete/Cancel Button */}
                {data.status === "Booked" && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleDelete}
                        disabled={patientDeleteLoading}
                        className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-5 py-2.5 rounded-xl border border-red-200 font-medium text-sm transition-colors disabled:opacity-50 h-fit w-full md:w-auto"
                    >
                        <Trash2 size={16} />
                        {patientDeleteLoading ? "Cancelling..." : "Cancel Appointment"}
                    </motion.button>
                )}
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left Side: Details */}
                <div className="md:col-span-2 space-y-6">
                    {/* Doctor Info */}
                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 space-y-4">
                        <div className="flex items-center gap-4">
                            {data.doctorId.userId?.image?.url ? (
                                <img
                                    src={data.doctorId.userId.image.url}
                                    alt={data.doctorId.userId.fullName}
                                    className="w-14 h-14 rounded-full object-cover ring-2 ring-blue-50"
                                />
                            ) : (
                                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                    <User size={24} />
                                </div>
                            )}
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">{data.doctorId?.userId?.fullName}</h2>
                                <p className="text-sm text-blue-600 flex items-center gap-1 font-medium mt-0.5">
                                    <Stethoscope size={14} /> {data?.doctorId?.department}
                                </p>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-xs text-gray-400 block">Chamber</span>
                                <span className="font-semibold text-gray-700">{data?.doctorId?.chamberNumber}</span>
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 block">Hospital</span>
                                <span className="font-semibold text-gray-700 block truncate">{data.hospitalId?.name}</span>
                            </div>
                        </div>
                    </div>

                    {/* Date & Time Slot */}
                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 grid grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl mt-0.5">
                                <Calendar size={18} />
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 block">Date</span>
                                <span className="font-semibold text-gray-800 text-sm md:text-base">
                                    {new Date(data.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl mt-0.5">
                                <Clock size={18} />
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 block">Time Slot</span>
                                <span className="font-semibold text-gray-800 text-sm md:text-base">
                                    {data.slotStart} - {data.slotEnd}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Token & Live Status */}
                <div className="space-y-6">
                    {/* Token Status Card */}
                    <div className="bg-linear-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-6 shadow-md shadow-blue-100 space-y-6 flex flex-col justify-between">
                        {/* User's Token */}
                        <div className="text-center border-b border-white/10 pb-4">
                            <p className="text-xs text-blue-100 uppercase tracking-wider font-semibold">Your Token Number</p>
                            <p className="text-5xl font-black mt-2 drop-shadow-sm">
                                {data.tokenNumber ? String(data.tokenNumber).padStart(2, '0') : 'N/A'}
                            </p>
                        </div>

                        {/* Live Current Serving Token */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-blue-100 font-medium">Current Serving</p>
                                <p className="text-2xl font-bold mt-0.5">
                                    Token #{String(currentToken).padStart(2, '0')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- FRAMER MOTION QR CODE LIGHTBOX MODAL --- */}
            <AnimatePresence>
                {isQrExpanded && qrImage && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsQrExpanded(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        
                        {/* Modal Body */}
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white rounded-2xl p-6 relative max-w-sm w-full shadow-2xl flex flex-col items-center text-center z-10"
                        >
                            <button 
                                onClick={() => setIsQrExpanded(false)}
                                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                            >
                                <X size={18} />
                            </button>
                            
                            <span className="text-sm font-bold text-gray-500 mb-4 mt-2">Check-in QR Code</span>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-inner">
                                <img src={qrImage} alt="Appointment QR Code Large" className="w-56 h-56 object-contain" />
                            </div>
                            <p className="text-xs text-gray-400 mt-4 leading-relaxed">
                                Scan this QR code at the hospital reception Desk for automatic check-in.
                            </p>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default Page