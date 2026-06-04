"use client"

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Users,
  UserCheck,
  Stethoscope,
  ShieldAlert,
  UserPlus,
  Building2,
  UserSquare2,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  TrendingUp,
  Activity
} from 'lucide-react'

import { getHospitalAdminDashboard } from '@/store/slice/hospitalAdminSlice'
import { AppDispatch, RootState } from '@/store/store'

export interface HosAdminDashboardType {
  appointments: {
    total: number;
    checkedIn: number;
    pending: number;
    completed: number;
  };
  employees: {
    total: number;
    doctors: number;
    receptionists: number;
  };
}

const Page = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { isHosAdminDashboardFetch, hosAdminDashboard, hosAdminLoading } = useSelector(
    (state: RootState) => state.hosAdmin
  )
  const { user } = useSelector((state: RootState) => state.auth)

  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        await dispatch(getHospitalAdminDashboard(null)).unwrap()
      } catch (error: any) {
        toast.error(error?.message || "Something went wrong!")
      }
    }
    if (!isHosAdminDashboardFetch) {
      fetchDashboardData()
    }
  }, [dispatch, isHosAdminDashboardFetch])

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 18 } }
  }

  const quickLinks = [
    { name: "Add Doctor", href: "/hospital-admin/add-doctor", icon: <UserPlus className="w-5 h-5" />, desc: "Register medical professionals", accent: "blue" },
    { name: "Show Hospital", href: `/hospitals/${user?.hospitalId}`, icon: <Building2 className="w-5 h-5" />, desc: "View & edit facilities", accent: "blue" },
    { name: "Hospital Doctors", href: "/hospital-admin/doctors", icon: <UserSquare2 className="w-5 h-5" />, desc: "Duty rosters & logs", accent: "blue" },
    { name: "Receptionists", href: "/hospital-admin/receptionist", icon: <ShieldAlert className="w-5 h-5" />, desc: "Front desk administration", accent: "blue" },
  ]

  // Skeleton Loader
  if (hosAdminLoading) {
    return (
      <div className="min-h-screen bg-[#F0F4FF] p-8 animate-pulse">
        <div className="max-w-375 mx-auto space-y-8">
          <div className="h-12 w-80 bg-blue-100 rounded-2xl" />
          <div className="grid grid-cols-4 gap-5">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white rounded-3xl border border-blue-100" />)}
          </div>
          <div className="grid grid-cols-3 gap-5">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-3xl border border-blue-100" />)}
          </div>
        </div>
      </div>
    )
  }

  const data: HosAdminDashboardType = (hosAdminDashboard as HosAdminDashboardType) || {
    appointments: { total: 0, checkedIn: 0, pending: 0, completed: 0 },
    employees: { total: 0, doctors: 0, receptionists: 0 }
  }

  // Calendar Logic
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  const daysInMonth = endOfMonth.getDate()
  const startDayOfWeek = startOfMonth.getDay()
  const today = new Date()

  return (
    <div
      className="min-h-screen text-slate-900 font-sans antialiased"
      style={{
        background: "linear-gradient(145deg, #EEF3FF 0%, #F7F9FF 50%, #EAF0FF 100%)",
        fontFamily: "'DM Sans', 'Nunito', sans-serif"
      }}
    >
      {/* Top decorative bar */}
      <div className="h-1 w-full bg-linear-to-r from-blue-500 via-blue-400 to-indigo-500" />

      <div className="max-w-375 mx-auto px-6 lg:px-10 py-10">

        {/* ── HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-500 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                <LayoutDashboard className="w-3 h-3" /> Administration Portal
              </span>
            </div>
            <h1
              className="text-4xl lg:text-5xl font-black tracking-tight leading-none text-slate-900"
              style={{ fontFamily: "'Sora', 'DM Sans', sans-serif", letterSpacing: "-0.03em" }}
            >
              Hospital{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-blue-600">Command</span>
                <span
                  className="absolute -bottom-1 left-0 w-full h-2 rounded-full opacity-20 bg-blue-400"
                  style={{ zIndex: 0 }}
                />
              </span>
              {" "}Center
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/90 backdrop-blur-sm border border-blue-100 rounded-2xl px-5 py-3 shadow-sm flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_2px_rgba(16,185,129,0.4)] animate-pulse" />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Live System</div>
                <div className="text-sm font-bold text-slate-800">
                  {today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">

          {/* LEFT PANEL */}
          <div className="space-y-10">

            {/* ── QUICK ACTIONS ── */}
            <div>
              <SectionLabel icon={<Activity className="w-3.5 h-3.5" />} label="Quick Actions" />
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mt-4">
                {quickLinks.map((link, idx) => (
                  <Link key={idx} href={link.href} passHref>
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.07, type: "spring", stiffness: 130 }}
                      whileHover={{ y: -5, boxShadow: "0 20px 40px -12px rgba(59,130,246,0.2)" }}
                      whileTap={{ scale: 0.98 }}
                      className="group relative overflow-hidden bg-white rounded-3xl border border-blue-100/80 p-5 cursor-pointer transition-all duration-300 hover:border-blue-300 flex flex-col justify-between h-34.5"
                    >
                      {/* Subtle corner accent */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-linear-to-bl from-blue-50 to-transparent rounded-bl-[60px] pointer-events-none transition-all group-hover:from-blue-100" />

                      <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300 shadow-sm">
                          {link.icon}
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-blue-200 group-hover:text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-[14px] leading-tight group-hover:text-blue-600 transition-colors" style={{ fontFamily: "'Sora', sans-serif" }}>
                          {link.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1 font-medium line-clamp-1">{link.desc}</p>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>

            {/* ── APPOINTMENT METRICS ── */}
            <motion.div variants={containerVariants} initial="hidden" animate="show">
              <SectionLabel icon={<TrendingUp className="w-3.5 h-3.5" />} label="Appointment Metrics" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <StatCard
                  variants={cardVariants}
                  title="Total"
                  subtitle="Appointments"
                  value={data.appointments.total}
                  icon={<CalendarIcon className="w-5 h-5" />}
                  color="blue"
                />
                <StatCard
                  variants={cardVariants}
                  title="Checked"
                  subtitle="In — Arrived"
                  value={data.appointments.checkedIn}
                  icon={<UserCheck className="w-5 h-5" />}
                  color="emerald"
                />
                <StatCard
                  variants={cardVariants}
                  title="Pending"
                  subtitle="In Queue"
                  value={data.appointments.pending}
                  icon={<Clock className="w-5 h-5" />}
                  color="amber"
                />
                <StatCard
                  variants={cardVariants}
                  title="Completed"
                  subtitle="Cases Closed"
                  value={data.appointments.completed}
                  icon={<CheckCircle2 className="w-5 h-5" />}
                  color="indigo"
                />
              </div>
            </motion.div>

            {/* ── STAFF ALLOCATION ── */}
            <motion.div variants={containerVariants} initial="hidden" animate="show">
              <SectionLabel icon={<Users className="w-3.5 h-3.5" />} label="Staff Allocation" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-4">
                <StaffCard
                  variants={cardVariants}
                  label="Total Staff"
                  value={data.employees.total}
                  icon={<Users className="w-6 h-6 text-blue-600" />}
                  pct={100}
                  barColor="bg-blue-500"
                />
                <StaffCard
                  variants={cardVariants}
                  label="Active Doctors"
                  value={data.employees.doctors}
                  icon={<Stethoscope className="w-6 h-6 text-blue-500" />}
                  pct={data.employees.total > 0 ? Math.round((data.employees.doctors / data.employees.total) * 100) : 0}
                  barColor="bg-blue-400"
                />
                <StaffCard
                  variants={cardVariants}
                  label="Receptionists"
                  value={data.employees.receptionists}
                  icon={<ShieldAlert className="w-6 h-6 text-indigo-500" />}
                  pct={data.employees.total > 0 ? Math.round((data.employees.receptionists / data.employees.total) * 100) : 0}
                  barColor="bg-indigo-400"
                />
              </div>
            </motion.div>

          </div>

          {/* ── RIGHT: CALENDAR WIDGET ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="lg:sticky lg:top-8"
          >
            <div className="bg-white rounded-[28px] border border-blue-100 shadow-[0_8px_40px_-8px_rgba(59,130,246,0.12)] overflow-hidden">

              {/* Calendar Header Band */}
              <div className="bg-linear-to-r from-blue-600 to-blue-500 px-6 pt-6 pb-5">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200 mb-1">Schedule View</div>
                <div className="flex items-center justify-between">
                  <h3
                    className="text-lg font-black text-white tracking-tight"
                    style={{ fontFamily: "'Sora', sans-serif" }}
                  >
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </h3>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                      className="w-7 h-7 rounded-xl bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all border border-white/10"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                      className="w-7 h-7 rounded-xl bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all border border-white/10"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Weekday Labels */}
                <div className="grid grid-cols-7 text-center">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <div key={d} className="text-[10px] font-extrabold text-blue-400 tracking-wider py-1">{d}</div>
                  ))}
                </div>

                {/* Day Grid */}
                <div className="grid grid-cols-7 gap-y-1 text-center">
                  {Array.from({ length: startDayOfWeek }).map((_, i) => (
                    <div key={`e-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1
                    const isToday =
                      today.getDate() === day &&
                      today.getMonth() === currentDate.getMonth() &&
                      today.getFullYear() === currentDate.getFullYear()
                    const isWeekend = (() => {
                      const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getDay()
                      return d === 0 || d === 6
                    })()

                    return (
                      <div key={day} className="flex justify-center items-center py-0.5">
                        <div
                          className={`w-8 h-8 flex items-center justify-center rounded-xl text-[12px] font-bold transition-all duration-200 cursor-pointer
                            ${isToday
                              ? 'bg-blue-600 text-white shadow-[0_4px_12px_rgba(59,130,246,0.5)] scale-110'
                              : isWeekend
                                ? 'text-blue-300 hover:bg-blue-50 hover:text-blue-500'
                                : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                            }`}
                        >
                          {day}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Today's status card */}
                <div className="mt-2 rounded-2xl bg-linear-to-br from-blue-50 to-indigo-50/50 border border-blue-100/80 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest">Live Metrics</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    All figures sync automatically with patient check-ins and appointment activity.
                  </p>
                </div>

                {/* Mini stat pills */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-3 text-center">
                    <div className="text-xl font-black text-emerald-600">{data.appointments.checkedIn}</div>
                    <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide mt-0.5">Checked In</div>
                  </div>
                  <div className="rounded-2xl bg-amber-50 border border-amber-100 p-3 text-center">
                    <div className="text-xl font-black text-amber-500">{data.appointments.pending}</div>
                    <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wide mt-0.5">Pending</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}

// ── Section Label ──
const SectionLabel = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div className="flex items-center gap-2">
    <span className="text-blue-500">{icon}</span>
    <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">{label}</span>
    <div className="flex-1 h-px bg-linear-to-r from-blue-100 to-transparent ml-1" />
  </div>
)

// ── StatCard ──
interface StatCardProps {
  title: string;
  subtitle: string;
  value: number;
  icon: React.ReactNode;
  variants: any;
  color: 'blue' | 'emerald' | 'amber' | 'indigo';
}

const colorConfig = {
  blue: { icon: 'text-blue-600', bg: 'bg-blue-50', border: 'hover:border-blue-300', num: 'text-blue-700' },
  emerald: { icon: 'text-emerald-600', bg: 'bg-emerald-50', border: 'hover:border-emerald-300', num: 'text-emerald-700' },
  amber: { icon: 'text-amber-500', bg: 'bg-amber-50', border: 'hover:border-amber-300', num: 'text-amber-600' },
  indigo: { icon: 'text-indigo-600', bg: 'bg-indigo-50', border: 'hover:border-indigo-300', num: 'text-indigo-700' },
}

const StatCard = ({ title, subtitle, value, icon, variants, color }: StatCardProps) => {
  const c = colorConfig[color]
  return (
    <motion.div
      variants={variants}
      whileHover={{ y: -4, transition: { duration: 0.15 } }}
      className={`relative overflow-hidden bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between h-35 transition-all duration-300 ${c.border} shadow-[0_2px_16px_-4px_rgba(0,0,0,0.04)]`}
    >
      {/* BG shape */}
      <div className={`absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-30 ${c.bg} pointer-events-none`} />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{title}</div>
          <div className="text-[11px] font-semibold text-slate-400">{subtitle}</div>
        </div>
        <div className={`w-9 h-9 rounded-2xl ${c.bg} flex items-center justify-center ${c.icon} border border-white shadow-sm`}>
          {icon}
        </div>
      </div>
      <div className={`text-4xl font-black tracking-tight relative z-10 ${c.num}`} style={{ fontFamily: "'Sora', sans-serif" }}>
        {value.toLocaleString()}
      </div>
    </motion.div>
  )
}

// ── StaffCard with progress bar ──
interface StaffCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  variants: any;
  pct: number;
  barColor: string;
}

const StaffCard = ({ label, value, icon, variants, pct, barColor }: StaffCardProps) => (
  <motion.div
    variants={variants}
    whileHover={{ y: -4, transition: { duration: 0.15 } }}
    className="bg-white rounded-3xl border border-slate-100 hover:border-blue-200 p-6 flex flex-col gap-4 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.04)] transition-all duration-300"
  >
    <div className="flex items-center justify-between">
      <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className="w-9 h-9 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm">
        {icon}
      </div>
    </div>
    <div className="text-4xl font-black tracking-tight text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>
      {value.toLocaleString()}
    </div>
    <div>
      <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1.5">
        <span>Allocation</span>
        <span className="text-blue-500">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${barColor}`}
        />
      </div>
    </div>
  </motion.div>
)

export default Page