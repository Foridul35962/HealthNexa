"use client"

import { completeAppointment, getDoctorDashboard } from '@/store/slice/doctorSlice'
import { AppDispatch, RootState } from '@/store/store'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  UserMinus, 
  DollarSign, 
  User, 
  ArrowRight,
  Loader2,
  Calendar
} from 'lucide-react'

// --- Strictly Typed Framer Motion Variants to Fix TS Errors ---
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
}

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { 
        opacity: 1, 
        y: 0, 
        transition: { 
            type: "spring", 
            stiffness: 100, 
            damping: 15 
        } 
    }
}

const Page = () => {
    const dispatch = useDispatch<AppDispatch>()
    const { completeLoading, doctorDashboard, doctorFetchLoading, nextCallLoading } = useSelector((state: RootState) => state.doctor)

    useEffect(() => {
        const fetch = async () => {
            try {
                await dispatch(getDoctorDashboard(null)).unwrap()
            } catch (error: any) {
                toast.error(error.message || "Failed to load dashboard data")
            }
        }
        if (!doctorDashboard) {
            fetch()
        }
    }, [dispatch, doctorDashboard])

    // --- Button Handler Functions ---
    const handleSkipPatient = async (appointmentId: string | undefined) => {
        if (!appointmentId) return
        try {
            toast.info(`Skipping patient with appointment ID: ${appointmentId}`)
        } catch (error: any) {
            toast.error(error.message || "Failed to skip patient")
        }
    }

    const handleCompleteAppointment = async (patientName:string | undefined, appointmentId: string | undefined) => {
        if (!appointmentId) return
        try {
            await dispatch(completeAppointment({appointmentId:appointmentId as string})).unwrap()
            toast.success(`Completing appointment: ${patientName}`)
        } catch (error: any) {
            toast.error(error.message || "Failed to complete appointment")
        }
    }

    // Fallback Clean Data Objects
    const stats = doctorDashboard?.stats || { totalAppointments: 0, completed: 0, cancelled: 0, waiting: 0, notArrived: 0, income: 0 }
    const queue = doctorDashboard?.queue || { consultationFee: 0, currentToken: 0, lastToken: 0, currentAppointment: null, nextPatients: [] }

    return (
        <div className="min-h-screen bg-slate-50/60 p-4 md:p-8 font-sans text-slate-800">
            <div className="mx-auto max-w-7xl space-y-8">
                
                {/* --- HEADER SECTION --- */}
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Doctor Dashboard</h1>
                        <p className="text-sm text-slate-500">Manage your live patient queue and daily analytics.</p>
                    </div>
                    {doctorFetchLoading && !doctorDashboard ? (
                        <div className="h-9 w-40 animate-pulse rounded-lg bg-slate-200" />
                    ) : (
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="mt-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 sm:mt-0 shadow-sm border border-blue-100"
                        >
                            Consultation Fee: ৳{queue.consultationFee}
                        </motion.div>
                    )}
                </div>

                {/* --- 1. SKELETON LOADING STATE --- */}
                {doctorFetchLoading && !doctorDashboard ? (
                    <div className="space-y-8">
                        {/* Stats Skeleton */}
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="animate-pulse rounded-xl border border-slate-100 bg-white p-4 shadow-sm space-y-3">
                                    <div className="flex justify-between">
                                        <div className="h-3 w-12 rounded bg-slate-200" />
                                        <div className="h-4 w-4 rounded-full bg-slate-200" />
                                    </div>
                                    <div className="h-7 w-10 rounded bg-slate-200" />
                                </div>
                            ))}
                        </div>

                        {/* Queue Layout Skeleton */}
                        <div className="grid gap-6 lg:grid-cols-3">
                            <div className="lg:col-span-2 animate-pulse rounded-2xl border border-slate-200 bg-white p-6 space-y-6">
                                <div className="flex justify-between border-b pb-4">
                                    <div className="h-6 w-1/3 rounded bg-slate-200" />
                                </div>
                                <div className="flex gap-4">
                                    <div className="h-12 w-12 rounded-full bg-slate-200" />
                                    <div className="space-y-2 flex-1">
                                        <div className="h-5 w-1/4 rounded bg-slate-200" />
                                        <div className="h-3 w-1/3 rounded bg-slate-200" />
                                    </div>
                                </div>
                                <div className="h-12 rounded-xl bg-slate-200 mt-8" />
                            </div>
                            <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                                <div className="h-6 w-1/2 rounded bg-slate-200 border-b pb-4" />
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="h-14 rounded-xl bg-slate-100" />
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    
                    /* --- 2. ACTUAL CONTENT (LOADED STATE) --- */
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="space-y-8"
                    >
                        {/* STATS SUMMARY CARDS */}
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                            {[
                                { title: "Total", value: stats.totalAppointments, icon: User, color: "text-blue-500", bg: "bg-white" },
                                { title: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-white" },
                                { title: "Waiting", value: stats.waiting, icon: Clock, color: "text-amber-500", bg: "bg-white" },
                                { title: "Cancelled", value: stats.cancelled, icon: XCircle, color: "text-rose-500", bg: "bg-white" },
                                { title: "Absent", value: stats.notArrived, icon: UserMinus, color: "text-slate-400", bg: "bg-white" },
                                { title: "Income", value: `৳${stats.income}`, icon: DollarSign, color: "text-blue-600", bg: "bg-gradient-to-br from-blue-50 to-white" }
                            ].map((card, idx) => (
                                <motion.div 
                                    variants={itemVariants}
                                    key={idx} 
                                    className={`rounded-xl border border-slate-100 p-4 shadow-sm ${card.bg}`}
                                >
                                    <div className="flex items-center justify-between text-slate-400">
                                        <span className="text-xs font-medium uppercase tracking-wider">{card.title}</span>
                                        <card.icon className={`h-4 w-4 ${card.color}`} />
                                    </div>
                                    <p className={`mt-2 text-2xl font-bold ${
                                        card.title === 'Completed' ? 'text-emerald-600' : 
                                        card.title === 'Waiting' ? 'text-amber-600' : 
                                        card.title === 'Cancelled' ? 'text-rose-600' : 
                                        card.title === 'Income' ? 'text-blue-700' : 'text-slate-900'
                                    }`}>{card.value}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* LIVE CONTROLS & QUEUE */}
                        <div className="grid gap-6 lg:grid-cols-3">
                            
                            {/* ACTIVE CONSULTATION PANEL */}
                            <motion.div 
                                variants={itemVariants}
                                className="lg:col-span-2 flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm relative overflow-hidden"
                            >
                                <div>
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                            Current Consultation
                                        </h2>
                                        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                                            Token Live: #{queue.currentToken} of {queue.lastToken}
                                        </span>
                                    </div>

                                    <AnimatePresence mode="wait">
                                        {queue.currentAppointment ? (
                                            <motion.div 
                                                key={queue.currentAppointment._id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 10 }}
                                                className="mt-6 space-y-4"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-700 text-xl border border-blue-100 shadow-sm">
                                                        #{queue.currentAppointment.tokenNumber}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h3 className="text-xl font-bold text-slate-900">
                                                            {queue.currentAppointment.patientId?.fullName}
                                                        </h3>
                                                        <p className="text-sm text-slate-500 font-medium">{queue.currentAppointment.patientId?.email}</p>
                                                        <p className="text-sm text-slate-500 font-medium">{queue.currentAppointment.patientId?.phoneNumber}</p>
                                                    </div>
                                                </div>
                                                <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    Slot: {queue.currentAppointment.slotStart} - {queue.currentAppointment.slotEnd}
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <motion.div 
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="flex h-48 items-center justify-center text-center"
                                            >
                                                <p className="text-slate-400 font-medium">No patient is currently in the session.</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* OPERATIONAL CONTROLS */}
                                <div className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5">
                                    <button
                                        onClick={() => handleSkipPatient(queue.currentAppointment?._id)}
                                        disabled={!queue.currentAppointment || nextCallLoading}
                                        className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        {nextCallLoading && <Loader2 className="h-4 w-4 animate-spin text-slate-500" />}
                                        Skip Patient
                                    </button>
                                    <button
                                        onClick={() => handleCompleteAppointment(queue.currentAppointment?.patientId.fullName, queue.currentAppointment?._id)}
                                        disabled={!queue.currentAppointment || completeLoading}
                                        className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        {completeLoading && <Loader2 className="h-4 w-4 animate-spin text-white" />}
                                        Complete Appointment
                                    </button>
                                </div>
                            </motion.div>

                            {/* UPCOMING QUEUE PANEL */}
                            <motion.div 
                                variants={itemVariants}
                                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col"
                            >
                                <h2 className="border-b border-slate-100 pb-4 text-lg font-bold text-slate-900">Next in Queue</h2>
                                
                                <div className="mt-4 max-h-80 overflow-y-auto space-y-3 pr-1 flex-1">
                                    <AnimatePresence>
                                        {queue.nextPatients && queue.nextPatients.length > 0 ? (
                                            queue.nextPatients.map((item, index) => (
                                                <motion.div 
                                                    key={item.appointmentId} 
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0, transition: { delay: index * 0.05 } }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition hover:bg-slate-100/70"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 font-bold text-blue-700 text-sm border border-blue-100">
                                                            #{item.tokenNumber}
                                                        </div>
                                                        <div className="max-w-37.5 truncate">
                                                            <p className="text-sm font-semibold text-slate-800 truncate">{item.patient?.fullName}</p>
                                                            <p className="text-xs text-slate-400 font-medium truncate">{item.patient?.phoneNumber}</p>
                                                        </div>
                                                    </div>
                                                    <ArrowRight className="h-4 w-4 text-slate-300" />
                                                </motion.div>
                                            ))
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-center py-12">
                                                <p className="text-sm text-slate-400 font-medium">No upcoming patients for today.</p>
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>

                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}

export default Page