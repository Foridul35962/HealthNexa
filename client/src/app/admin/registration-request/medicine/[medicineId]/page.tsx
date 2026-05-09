"use client"

import { addMedicine, deleteRequestMedicine, getRequestMedicine } from '@/store/slice/adminSlice'
import { AppDispatch, RootState } from '@/store/store'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { CiTablets1 } from 'react-icons/ci'
import { FaCapsules, FaFillDrip } from 'react-icons/fa'
import { TbMedicineSyrup } from 'react-icons/tb'
import { GiLoveInjection } from 'react-icons/gi'
import { FaSprayCanSparkles } from 'react-icons/fa6'
import { IoEyedropSharp } from 'react-icons/io5'
import { MdOutlineAir } from 'react-icons/md'
import {
  Building2,
  FlaskConical,
  Tag,
  ShieldCheck,
  ShieldOff,
  Clock,
  User,
  Mail,
  Phone,
  Store,
  AlertTriangle,
  FileText,
  ArrowLeft,
  CheckCircle2,
  Check,
  Trash2,
  Loader2,
} from 'lucide-react'
import { MedicineRequestType } from '@/Types/adminTypes'



/* ── Medicine config ── */
const medicineConfig: Record<
  MedicineRequestType["medicineType"],
  { icon: React.ElementType; color: string; bg: string; border: string; label: string }
> = {
  tablet: { icon: CiTablets1, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", label: "Tablet" },
  capsule: { icon: FaCapsules, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200", label: "Capsule" },
  syrup: { icon: TbMedicineSyrup, color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-200", label: "Syrup" },
  injection: { icon: GiLoveInjection, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", label: "Injection" },
  cream: { icon: FaSprayCanSparkles, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", label: "Cream" },
  ointment: { icon: FaFillDrip, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", label: "Ointment" },
  drops: { icon: IoEyedropSharp, color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-200", label: "Drops" },
  inhaler: { icon: MdOutlineAir, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200", label: "Inhaler" },
}

/* ── Skeleton ── */
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`relative overflow-hidden rounded-lg bg-slate-100 ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-linear-to-r from-transparent via-white/60 to-transparent" />
  </div>
)

const SkeletonPage = () => (
  <div className="min-h-screen bg-[#f0f4ff] px-4 py-10">
    <style>{`@keyframes shimmer { 100% { transform: translateX(200%); } }`}</style>
    <div className="max-w-4xl mx-auto space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-2xl" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-24 rounded-xl" />
      </div>
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-4">
        <Skeleton className="h-5 w-32" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  </div>
)

/* ── Detail chip ── */
const DetailChip = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) => (
  <div className="flex flex-col gap-1.5 bg-slate-50 border border-slate-100 rounded-xl p-3.5">
    <div className="flex items-center gap-1.5">
      <Icon size={12} className="text-slate-400" />
      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
    </div>
    <span className="text-sm font-bold text-slate-800 capitalize truncate">{value || "—"}</span>
  </div>
)

/* ── User info row ── */
const UserInfoRow = ({
  icon: Icon,
  value,
}: {
  icon: React.ElementType
  value: string
}) => (
  <div className="flex items-center gap-2.5">
    <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
      <Icon size={13} className="text-blue-500" />
    </div>
    <span className="text-sm text-slate-600 font-medium truncate">{value}</span>
  </div>
)

/* ── Section card ── */
const SectionCard = ({
  badge,
  children,
  delay = 0,
}: {
  badge: string
  children: React.ReactNode
  delay?: number
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
  >
    <div className="h-0.75 bg-linear-to-r from-blue-500 to-blue-300" />
    <div className="p-6 sm:p-8 space-y-5">
      <div className="flex items-center gap-3">
        <span className="bg-blue-50 border border-blue-200 text-blue-600 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
          {badge}
        </span>
        <div className="flex-1 h-px bg-slate-100" />
      </div>
      {children}
    </div>
  </motion.div>
)

/* ── Main page ── */
const Page = () => {
  const { medicineId } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const { adminFetchLoading, medicineRequest, adminDeleteLoading, adminLoading } = useSelector((state: RootState) => state.admin)

  const router = useRouter()

  useEffect(() => {
    const fetch = async () => {
      try {
        await dispatch(getRequestMedicine({ medicineId: medicineId as string })).unwrap()
      } catch (error: any) {
        toast.error(error.message)
      }
    }
    if (medicineRequest?._id !== medicineId) {
      fetch()
    }
  }, [dispatch, medicineId])

  if (adminFetchLoading || !medicineRequest) return <SkeletonPage />

  const data = medicineRequest as MedicineRequestType
  const cfg = medicineConfig[data.medicineType]
  const Icon = cfg.icon

  const formattedCreated = new Date(data.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit", month: "long", year: "numeric",
  })
  const formattedUpdated = new Date(data.updatedAt).toLocaleDateString("en-GB", {
    day: "2-digit", month: "long", year: "numeric",
  })
  const userJoined = new Date(data.addedBy.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  })

  const handleApprove = async () => {
    try {
      await dispatch(addMedicine({ medicineId: medicineId as string })).unwrap()
      toast.success("medicine approve successfull")
      router.push("/admin/registration-request/medicine")
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleDelete = async () => {
    if (window.confirm(`Are you really want to delete ${data.name}`)) {
      try {
        await dispatch(deleteRequestMedicine({ medicineId: medicineId as string })).unwrap()
        toast.success("medicine delete successfull")
        router.push("/admin/registration-request/medicine")
      } catch (error: any) {
        toast.error(error.message)
      }
    }
  }

  return (
    <>
      <style>{`@keyframes shimmer { 100% { transform: translateX(200%); } }`}</style>

      <div className="min-h-screen bg-[#f0f4ff] px-4 py-10">
        <div className="max-w-4xl mx-auto space-y-5">

          {/* ── Back + page title ── */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-3"
          >
            <button
              onClick={() => window.history.back()}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all duration-150 shadow-sm"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Medicine Detail
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Request ID: {data._id}</p>
            </div>
          </motion.div>

          {/* ── Hero card ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="h-0.75 bg-linear-to-r from-blue-500 to-blue-300" />
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl ${cfg.bg} ${cfg.border} border-2 flex items-center justify-center shrink-0 shadow-sm`}>
                  <Icon className={`${cfg.color} text-3xl`} />
                </div>

                {/* Name + badges */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className="text-2xl font-extrabold text-slate-900 capitalize tracking-tight">
                      {data.name}
                    </h2>
                    <span className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color} ${cfg.border} border capitalize`}>
                      <Icon className="text-xs" />
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 font-medium capitalize mb-3">{data.genericName}</p>

                  <div className="flex flex-wrap gap-2">
                    {/* Prescription */}
                    {data.requiresPrescription ? (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                        <ShieldCheck size={12} /> Prescription Required
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                        <ShieldOff size={12} /> Over The Counter
                      </span>
                    )}

                    {/* Timestamps */}
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full">
                      <Clock size={11} /> Added {formattedCreated}
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 shrink-0">
                  <button
                    onClick={handleApprove}
                    disabled={adminLoading}
                    className="flex cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 active:scale-95 text-white text-sm font-semibold shadow-sm shadow-green-100 transition-all duration-150 min-w-27.5"
                  >
                    {adminLoading ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        <span>Approving...</span>
                      </>
                    ) : (
                      <>
                        <Check size={15} />
                        <span>Approve</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDelete}
                    disabled={adminDeleteLoading}
                    className="flex items-center justify-center cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-red-50 active:scale-95 text-red-500 border border-red-200 hover:border-red-300 text-sm font-semibold transition-all duration-150 min-w-25"
                  >
                    {adminDeleteLoading ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 size={15} />
                        <span>Delete</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Identification ── */}
          <SectionCard badge="01 — Identification" delay={0.1}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <DetailChip icon={Tag} label="Medicine Name" value={data.name} />
              <DetailChip icon={FlaskConical} label="Generic Name" value={data.genericName} />
              {data.brandName && <DetailChip icon={Tag} label="Brand Name" value={data.brandName} />}
              <DetailChip icon={Building2} label="Manufacturer" value={data.manufacturer} />
              <DetailChip icon={FlaskConical} label="Strength" value={data.strength} />
              {data.category && <DetailChip icon={Tag} label="Category" value={data.category} />}
            </div>
          </SectionCard>

          {/* ── Description ── */}
          {data.description && (
            <SectionCard badge="02 — Description" delay={0.16}>
              <div className="flex gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                <FileText size={16} className="text-slate-400 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-600 leading-relaxed">{data.description}</p>
              </div>
            </SectionCard>
          )}

          {/* ── Side Effects ── */}
          <SectionCard badge={`${data.description ? "03" : "02"} — Side Effects`} delay={0.22}>
            {data.sideEffects.length === 0 ? (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-xl">
                <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                <p className="text-sm font-medium text-green-700">No side effects reported for this medicine.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {data.sideEffects.map((se, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.22 + i * 0.04 }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-full capitalize"
                  >
                    <AlertTriangle size={10} />
                    {se}
                  </motion.span>
                ))}
              </div>
            )}
          </SectionCard>

          {/* ── Submitted By ── */}
          <SectionCard badge="Submitted By" delay={0.28}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center shrink-0 shadow-md shadow-blue-100">
                <span className="text-white text-lg font-extrabold">
                  {data.addedBy.fullName.charAt(0).toUpperCase()}
                </span>
              </div>

              <div className="flex-1 space-y-2.5">
                <div>
                  <p className="text-base font-bold text-slate-900">{data.addedBy.fullName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Joined {userJoined}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <UserInfoRow icon={Mail} value={data.addedBy.email} />
                  <UserInfoRow icon={Phone} value={data.addedBy.phoneNumber} />
                  <UserInfoRow icon={Store} value={`Pharmacy ID: ${data.addedBy.pharmacyId.slice(-8)}...`} />
                  <UserInfoRow icon={User} value={`User ID: ${data.addedBy._id.slice(-8)}...`} />
                </div>
              </div>
            </div>
          </SectionCard>

        </div>
      </div>
    </>
  )
}

export default Page