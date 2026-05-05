"use client"

import { getAdminDashboard } from '@/store/slice/adminSlice'
import { AppDispatch, RootState } from '@/store/store'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { motion, type Variants } from 'framer-motion'
import {
  Users,
  Hospital,
  Pill,
  ClipboardList,
  Clock,
  Shield,
  UserCheck,
  Stethoscope,
  TrendingUp,
  Activity,
} from 'lucide-react'

// ─── Animation Variants ────────────────────────────────────────────────────────
const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE },
  },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE },
  },
}

// ─── Role Badge ────────────────────────────────────────────────────────────────
const roleConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  admin: {
    label: 'Admin',
    color: 'bg-violet-100 text-violet-700 border-violet-200',
    icon: <Shield size={11} />,
  },
  hospitalStaff: {
    label: 'Hospital Staff',
    color: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    icon: <Stethoscope size={11} />,
  },
  pharmacyOwner: {
    label: 'Pharmacy',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: <Pill size={11} />,
  },
  patient: {
    label: 'Patient',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: <UserCheck size={11} />,
  },
}

const RoleBadge = ({ role }: { role: string }) => {
  const cfg = roleConfig[role] ?? {
    label: role,
    color: 'bg-slate-100 text-slate-600 border-slate-200',
    icon: null,
  }
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.color}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  )
}

// ─── Avatar ────────────────────────────────────────────────────────────────────
const Avatar = ({ name }: { name: string }) => {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  const colors = [
    'from-violet-500 to-purple-600',
    'from-cyan-500 to-blue-600',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-500',
  ]
  const color = colors[name.charCodeAt(0) % colors.length]

  return (
    <div
      className={`w-9 h-9 rounded-xl bg-linear-to-br ${color} flex items-center justify-center text-white text-xs font-bold shadow-md shrink-0`}
    >
      {initials}
    </div>
  )
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string
  value: number
  icon: React.ReactNode
  iconBg: string
  accent: string
  delay?: number
}

const StatCard = ({ label, value, icon, iconBg, accent, delay = 0 }: StatCardProps) => (
  <motion.div
    variants={cardVariants}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-5 group cursor-default"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">{label}</p>
        <motion.p
          className="text-4xl font-black text-slate-800"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 + delay, duration: 0.4, type: 'spring' }}
        >
          {value}
        </motion.p>
      </div>
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shadow-sm`}>
        {icon}
      </div>
    </div>
    {/* Bottom accent line */}
    <div className={`absolute bottom-0 left-0 right-0 h-0.75 ${accent}`} />
  </motion.div>
)

// ─── Skeleton Loader ───────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="rounded-2xl bg-white border border-slate-100 p-5 animate-pulse">
    <div className="flex items-start justify-between">
      <div className="space-y-3">
        <div className="h-3 w-20 bg-slate-200 rounded-full" />
        <div className="h-8 w-12 bg-slate-200 rounded-lg" />
      </div>
      <div className="w-10 h-10 bg-slate-200 rounded-xl" />
    </div>
  </div>
)

// ─── Format Date ───────────────────────────────────────────────────────────────
const formatDate = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
const AdminDashboardPage = () => {
  const { adminDashboard, adminFetchLoading } = useSelector((state: RootState) => state.admin)
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    const fetch = async () => {
      try {
        await dispatch(getAdminDashboard(null)).unwrap()
      } catch (error: any) {
        toast.error(error.message)
      }
    }
    if (!adminDashboard) fetch()
  }, [])

  const stats = adminDashboard
    ? [
        {
          label: 'Total Users',
          value: adminDashboard.totalUsers,
          icon: <Users size={18} className="text-violet-600" />,
          iconBg: 'bg-violet-100',
          accent: 'bg-gradient-to-r from-violet-400 to-purple-500',
        },
        {
          label: 'Hospitals',
          value: adminDashboard.totalHospitals,
          icon: <Hospital size={18} className="text-blue-600" />,
          iconBg: 'bg-blue-100',
          accent: 'bg-gradient-to-r from-blue-400 to-cyan-500',
        },
        {
          label: 'Pharmacies',
          value: adminDashboard.totalPharmacies,
          icon: <Pill size={18} className="text-emerald-600" />,
          iconBg: 'bg-emerald-100',
          accent: 'bg-gradient-to-r from-emerald-400 to-teal-500',
        },
        {
          label: 'Pending Hospital Req',
          value: adminDashboard.pendingHospitalReq,
          icon: <ClipboardList size={18} className="text-amber-600" />,
          iconBg: 'bg-amber-100',
          accent: 'bg-gradient-to-r from-amber-400 to-orange-400',
        },
        {
          label: 'Pending Pharmacy Req',
          value: adminDashboard.pendingPharmacyReq,
          icon: <Activity size={18} className="text-rose-600" />,
          iconBg: 'bg-rose-100',
          accent: 'bg-gradient-to-r from-rose-400 to-pink-500',
        },
      ]
    : []

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Subtle top gradient bar */}
      <div className="h-1 w-full bg-linear-to-r from-blue-500 via-cyan-400 to-blue-600" />

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-10 flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_2px_rgba(52,211,153,0.5)]" />
              <span className="text-xs text-slate-400 font-semibold tracking-widest uppercase">
                System Online
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-800">
              Admin{' '}
              <span className="bg-linear-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 shadow-sm text-sm text-slate-500"
          >
            <TrendingUp size={14} className="text-blue-500" />
            <span className="font-medium">Overview</span>
          </motion.div>
        </motion.div>

        {/* ── Stat Cards ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10"
        >
          {adminFetchLoading || !adminDashboard
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            : stats.map((s, i) => (
                <StatCard key={s.label} {...s} delay={i * 0.08} />
              ))}
        </motion.div>

        {/* ── Bottom Grid ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Recent Users — wider */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden"
          >
            {/* Card header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Users size={14} className="text-white" />
                </div>
                <span className="font-bold text-sm text-slate-700">Recent Users</span>
              </div>
              <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2.5 py-1 rounded-full">
                {adminDashboard?.recent?.users?.length ?? 0} entries
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {adminFetchLoading || !adminDashboard ? (
                <div className="p-6 space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="w-9 h-9 bg-slate-200 rounded-xl shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-32 bg-slate-200 rounded-full" />
                        <div className="h-2.5 w-48 bg-slate-100 rounded-full" />
                      </div>
                      <div className="h-5 w-16 bg-slate-200 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                        User
                      </th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest hidden md:table-cell">
                        Email
                      </th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                        Role
                      </th>
                      <th className="text-right px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest hidden sm:table-cell">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminDashboard.recent.users.map((user, idx) => (
                      <motion.tr
                        key={user._id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + idx * 0.07, duration: 0.4 }}
                        className="border-b border-slate-50 hover:bg-blue-50/40 transition-colors"
                      >
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar name={user.fullName} />
                            <span className="font-semibold text-slate-700 text-sm">{user.fullName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-400 text-xs hidden md:table-cell max-w-45 truncate">
                          {user.email}
                        </td>
                        <td className="px-4 py-3.5">
                          <RoleBadge role={user.role} />
                        </td>
                        <td className="px-6 py-3.5 text-right text-xs text-slate-400 hidden sm:table-cell">
                          <div className="flex items-center justify-end gap-1.5">
                            <Clock size={10} className="text-slate-300" />
                            {formatDate(user.createdAt)}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            {/* Hospital Requests */}
            <motion.div
              variants={itemVariants}
              className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden flex-1"
            >
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <Hospital size={14} className="text-white" />
                  </div>
                  <span className="font-bold text-sm text-slate-700">Hospital Requests</span>
                </div>
                <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2.5 py-1 rounded-full">
                  {adminDashboard?.recent?.hospitalRequests?.length ?? 0}
                </span>
              </div>

              <div className="p-5">
                {adminFetchLoading || !adminDashboard ? (
                  <div className="animate-pulse space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-12 bg-slate-100 rounded-xl" />
                    ))}
                  </div>
                ) : adminDashboard.recent.hospitalRequests.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col items-center justify-center py-8 text-center gap-2"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center mb-1">
                      <ClipboardList size={18} className="text-slate-400" />
                    </div>
                    <p className="text-slate-500 text-sm font-medium">No pending requests</p>
                    <p className="text-slate-400 text-xs">All hospital requests are clear</p>
                  </motion.div>
                ) : (
                  <div className="space-y-2">
                    {adminDashboard.recent.hospitalRequests.map((req: any, idx: number) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 + idx * 0.07 }}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-600"
                      >
                        {JSON.stringify(req)}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* System Summary */}
            <motion.div
              variants={itemVariants}
              className="rounded-2xl bg-linear-to-br from-blue-600 to-cyan-500 p-5 shadow-md shadow-blue-200"
            >
              <p className="text-xs font-semibold text-blue-100 uppercase tracking-widest mb-4">
                System Summary
              </p>
              <div className="space-y-3">
                {[
                  {
                    label: 'Approval Rate',
                    value: adminDashboard
                      ? adminDashboard.totalHospitals + adminDashboard.totalPharmacies > 0
                        ? '100%'
                        : 'N/A'
                      : '—',
                    color: 'text-white',
                  },
                  {
                    label: 'Pending Actions',
                    value: adminDashboard
                      ? adminDashboard.pendingHospitalReq + adminDashboard.pendingPharmacyReq
                      : '—',
                    color: 'text-white',
                  },
                  {
                    label: 'Total Entities',
                    value: adminDashboard
                      ? adminDashboard.totalHospitals + adminDashboard.totalPharmacies
                      : '—',
                    color: 'text-white',
                  },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-xs text-blue-100/80">{row.label}</span>
                    <span className={`text-sm font-bold ${row.color}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AdminDashboardPage