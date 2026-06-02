"use client"

import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store/store'
import { getReceptionistDashboard } from '@/store/slice/receptionistSlice'
import { toast } from 'react-toastify'
import { motion, Variants } from 'framer-motion'
import { 
  CalendarDays, 
  Clock, 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  UserPlus, 
  RefreshCw,
  Info,
  ShieldCheck,
  Activity
} from 'lucide-react'

// Variants with strict type definition to prevent TypeScript compilation errors
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring", 
      stiffness: 100 
    } 
  }
}

const Page = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { receptionistDashboard, receptionistLoading } = useSelector((state: RootState) => state.receptionist)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        await dispatch(getReceptionistDashboard(null)).unwrap()
      } catch (error: any) {
        console.log(error)
        toast.error(error?.message || "Something went wrong!")
      }
    }

    if (
      receptionistDashboard.checkedIn === 0 &&
      receptionistDashboard.completed === 0 &&
      receptionistDashboard.pending === 0 &&
      receptionistDashboard.skipped === 0 &&
      receptionistDashboard.totalAppointments === 0
    ) {
      fetchDashboardData()
    }
  }, [dispatch])

  // --- SKELETON LOADING STATE ---
  if (receptionistLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 space-y-8">
        {/* Header Skeleton */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-2">
            <div className="h-4 w-20 bg-slate-200 animate-pulse rounded" />
            <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-md" />
            <div className="h-4 w-72 bg-slate-200 animate-pulse rounded" />
          </div>
          <div className="flex gap-3">
            <div className="h-11 w-36 bg-slate-200 animate-pulse rounded-xl" />
            <div className="h-11 w-32 bg-slate-200 animate-pulse rounded-xl" />
          </div>
        </div>

        {/* Cards Skeleton Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-4 w-24 bg-slate-100 animate-pulse rounded" />
                <div className="h-10 w-10 bg-slate-100 animate-pulse rounded-xl" />
              </div>
              <div className="h-10 w-16 bg-slate-200 animate-pulse rounded-md" />
            </div>
          ))}
        </div>

        {/* Bottom Section Skeleton */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
          <div className="h-6 w-40 bg-slate-200 animate-pulse rounded" />
          <div className="h-24 bg-slate-50 animate-pulse rounded-xl" />
        </div>
      </div>
    )
  }

  // Statistics Display Array Configurations
  const statsConfig = [
    {
      title: "Total Booked",
      value: receptionistDashboard.totalAppointments,
      icon: CalendarDays,
      color: "text-blue-600",
      bgColor: "bg-blue-50/80",
      borderColor: "hover:border-blue-200",
      lineColor: "bg-blue-500",
    },
    {
      title: "In Waiting",
      value: receptionistDashboard.pending,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50/80",
      borderColor: "hover:border-amber-200",
      lineColor: "bg-amber-500",
    },
    {
      title: "Checked In",
      value: receptionistDashboard.checkedIn,
      icon: UserCheck,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50/80",
      borderColor: "hover:border-indigo-200",
      lineColor: "bg-indigo-500",
    },
    {
      title: "Served",
      value: receptionistDashboard.completed,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50/80",
      borderColor: "hover:border-emerald-200",
      lineColor: "bg-emerald-500",
    },
    {
      title: "No Show",
      value: receptionistDashboard.skipped,
      icon: XCircle,
      color: "text-rose-600",
      bgColor: "bg-rose-50/80",
      borderColor: "hover:border-rose-200",
      lineColor: "bg-rose-500",
    },
  ]

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 text-slate-800 selection:bg-blue-100">
      
      {/* Top Header Block */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-8 flex flex-col justify-between gap-4 rounded-2xl border border-white/60 bg-white/40 p-6 backdrop-blur-md shadow-sm sm:flex-row sm:items-center"
      >
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">Overview</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-0.5">Reception Desk</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor patient flow, check-ins, and daily schedules efficiently.</p>
        </div>

        {/* Action Links */}
        <div className="flex flex-wrap gap-3">
          <motion.a
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            href="/receptionist/check-in"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/10 transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20"
          >
            <UserPlus className="h-4 w-4" strokeWidth={2.5} />
            Patient Check-In
          </motion.a>
          
          <motion.a
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            href="/receptionist/recall"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900"
          >
            <RefreshCw className="h-4 w-4 text-slate-500" strokeWidth={2.5} />
            Patient Recall
          </motion.a>
        </div>
      </motion.div>

      {/* Stats Cards Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5"
      >
        {statsConfig.map((card, idx) => {
          const IconComponent = card.icon
          return (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all ${card.borderColor}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-400">{card.title}</span>
                <div className={`rounded-xl p-2.5 ${card.color} ${card.bgColor} transition-colors duration-300`}>
                  <IconComponent className="h-5 w-5" strokeWidth={2.2} />
                </div>
              </div>
              <p className="mt-4 text-4xl font-bold tracking-tight text-slate-900">{card.value}</p>
              
              {/* Card bottom hover strip */}
              <div className={`absolute bottom-0 inset-x-0 h-1 ${card.lineColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            </motion.div>
          )
        })}
      </motion.div>

      {/* Static / Read-Only Information Terminal Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-inner relative overflow-hidden"
      >
        {/* Decorative subtle background pattern to emphasize status */}
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 opacity-5 pointer-events-none">
          <Activity className="h-64 w-64" />
        </div>

        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-200 p-2 text-slate-600">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">System Activity Logs</h3>
              <p className="text-xs text-slate-500">Live operational scope and system integrity details</p>
            </div>
          </div>
          <span className="self-start sm:self-center inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
            Read-Only Console
          </span>
        </div>
        
        {/* Informative Static Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200/60 bg-white p-5">
            <h4 className="text-sm font-bold text-slate-700 mb-2">Automated Data Sync</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              This terminal receives secure, direct stream events from doctor chambers and clinic counters. Stats displayed above update incrementally without requiring manual overrides.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/60 bg-white p-5">
            <h4 className="text-sm font-bold text-slate-700 mb-2">Operational Controls</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              To queue or modify serials, please trigger the interactive modules using the <span className="text-blue-600 font-medium">Patient Check-In</span> button located in the global action workspace above.
            </p>
          </div>
        </div>
      </motion.div>

    </div>
  )
}

export default Page