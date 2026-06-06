"use client"

import { deleteAppointment, getAppointment, getCurrentToken, updateCurrentToken, updateRecall, updateStatus } from '@/store/slice/patientSlice'
import { AppDispatch, RootState } from '@/store/store'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { Calendar, Clock, Stethoscope, User, Trash2, ArrowLeft, Maximize2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import socket from '@/socket'

const Page = () => {
    const { appointmentId } = useParams()
    const router = useRouter()
    const dispatch = useDispatch<AppDispatch>()
    const { user } = useSelector((state: RootState) => state.auth)
    const { appointment, patientLoading, patientDeleteLoading, currentToken } = useSelector((state: RootState) => state.patient)

    const [isQrExpanded, setIsQrExpanded] = useState(false)

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const appointmentDate = appointment?.appointment?.date
        ? new Date(appointment.appointment.date)
        : null;

    const normalizedAppointmentDate = appointmentDate
        ? new Date(appointmentDate)
        : null;

    if (normalizedAppointmentDate) {
        normalizedAppointmentDate.setHours(0, 0, 0, 0);
    }

    const isFutureAppointment =
        normalizedAppointmentDate &&
        normalizedAppointmentDate >= today;

    const isTodayAppointment =
        normalizedAppointmentDate &&
        normalizedAppointmentDate.getTime() === today.getTime();

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

    useEffect(() => {
        if (!appointment) {
            return
        }
        const { doctorId, date } = appointment?.appointment
        const formattedDate = new Date(date)
            .toISOString()
            .split('T')[0];

        const today = new Date().toISOString().split('T')[0];

        if (formattedDate !== today) {
            return
        }

        socket.emit('joinQueue', { doctorId: doctorId._id, date: formattedDate })

        return () => {
            socket.emit('leaveQueue', { doctorId: doctorId._id, date: formattedDate })
        }
    }, [appointment?.appointment.doctorId, appointment?.appointment.date])

    useEffect(() => {
        const handleUpdateStatus = ({ status, tokenNumber, checkedIn }: { status: string, tokenNumber?: number, checkedIn?: boolean }) => {
            dispatch(updateStatus({ status, tokenNumber, checkedIn }))
            setIsQrExpanded(false)
            if (status === "Pending") {
                toast.success("You are checkedIn")
            } else if (status === "Done") {
                toast.success("Your Appointment is Done")
            }
        }
        socket.on("appointmentStatusUpdate", handleUpdateStatus)
        return () => {
            socket.off("appointmentStatusUpdate", handleUpdateStatus)
        }
    }, [dispatch])

    useEffect(() => {
        const handleUpdateCurrentToken = ({ currentToken }: { currentToken: number }) => {
            dispatch(updateCurrentToken({ currentToken }))
        }
        socket.on("updateTokenNumber", handleUpdateCurrentToken)
        return () => {
            socket.off("updateTokenNumber", handleUpdateCurrentToken)
        }
    }, [dispatch])

    useEffect(() => {
        const handleRecall = ({ isSkipped }: { isSkipped: boolean }) => {
            dispatch(updateRecall(isSkipped))
            setIsQrExpanded(false)
            if (!isSkipped) {
                toast.success("Recall successfull")
            }
        }
        socket.on("recallPatient", handleRecall)
        return () => {
            socket.off("recallPatient", handleRecall)
        }
    }, [dispatch])

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to cancel this appointment?")) return

        try {
            await dispatch(deleteAppointment({ appointmentId: appointmentId as string })).unwrap()
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
            case 'Done': return 'bg-blue-100 text-blue-800 border-blue-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    useEffect(() => {
        if (appointment && isTodayAppointment && appointment.appointment.status === "Pending") {
            const appointmentDate = appointment?.appointment?.date;
            const parsedDate = new Date(appointmentDate);
            dispatch(getCurrentToken({
                doctorId: appointment?.appointment.doctorId._id as string,
                date: parsedDate
            }))
        }
    }, [dispatch, appointment])

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


    if (appointment.appointment.tokenNumber === currentToken && appointment.appointment.status === "Pending") {
        return (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-900 text-white p-6 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_0%,transparent_70%)] animate-pulse" />

                    <div className="relative z-10 max-w-md w-full text-center space-y-8">

                        <div className="relative flex justify-center">

                            <motion.div
                                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                className="absolute w-32 h-32 bg-white/20 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                            />
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                                className="w-32 h-32 bg-white text-emerald-700 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-900/50"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-14 h-14 animate-bounce">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                                </svg>
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="space-y-2"
                        >
                            <span className="bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest inline-block backdrop-blur-sm">
                                Live Status: Your Turn
                            </span>
                            <h1 className="text-4xl font-extrabold tracking-tight mt-4">
                                It's Your Turn Now!
                            </h1>
                            <p className="text-emerald-100/80 text-sm max-w-sm mx-auto">
                                Please proceed to the doctor's room immediately. Your token is being called.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ y: 40, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6, type: "spring" }}
                            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl"
                        >
                            <p className="text-xs text-emerald-200 uppercase tracking-wider font-semibold">Your Token</p>
                            <div className="text-7xl font-black my-2 tracking-wider tabular-nums font-mono">
                                {String(appointment.appointment.tokenNumber).padStart(2, '0')}
                            </div>
                            <div className="border-t border-white/10 mt-4 pt-4 flex justify-around text-left">
                                <div>
                                    <p className="text-[10px] uppercase text-emerald-200 font-medium">Patient Name</p>
                                    <p className="text-sm font-bold truncate max-w-[150px]">
                                        {user?.fullName || 'Grand Patient'}
                                    </p>
                                </div>
                                <div className="border-l border-white/10 pl-4">
                                    <p className="text-[10px] uppercase text-emerald-200 font-medium">Room No</p>
                                    <p className="text-sm font-bold text-amber-300">
                                        {appointment.appointment.doctorId.chamberNumber || 'Room 01'}
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* ডক্টর ইনফো বা ফুট নোটিফিকেশন */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.7 }}
                            transition={{ delay: 0.9 }}
                            className="text-xs text-emerald-100 flex items-center justify-center gap-1.5"
                        >
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            Please keep your phone or prescription slip ready
                        </motion.p>

                    </div>
                </motion.div>
            </AnimatePresence>
        )
    }

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
                    {qrImage && isFutureAppointment && (
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
                {
                    appointment.appointment.checkedIn && isTodayAppointment && (
                        <div className="space-y-6">
                            {/* Token Status Card */}
                            <div className="bg-linear-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-6 shadow-md shadow-blue-100 space-y-6 flex flex-col justify-between relative overflow-hidden">

                                {/* User's Token */}
                                <div className="text-center border-b border-white/10 pb-4">
                                    <p className="text-xs text-blue-100 uppercase tracking-wider font-semibold">Your Token Number</p>
                                    <p className="text-5xl font-black mt-2 drop-shadow-sm">
                                        {data.tokenNumber ? String(data.tokenNumber).padStart(2, '0') : 'N/A'}
                                    </p>
                                </div>

                                {/* --- Skipped Status Notification --- */}
                                {appointment.appointment.isSkipped && (
                                    <div className="bg-amber-500/20 border border-amber-400/30 rounded-xl p-3 flex items-center gap-3 animate-pulse">
                                        <div className="bg-amber-500 p-1.5 rounded-lg text-white">
                                            {/* Fast/Simple Alert Icon */}
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                                            </svg>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xs font-bold text-amber-300 uppercase tracking-wide">Status: Skipped</p>
                                            <p className="text-xs text-amber-100/90 mt-0.5">You were skipped. Please contact the reception desk.</p>
                                        </div>
                                    </div>
                                )}

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
                    )
                }
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