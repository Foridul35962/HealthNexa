"use client"

import { getAllRequestMedicine } from '@/store/slice/adminSlice'
import { AppDispatch, RootState } from '@/store/store'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Pill,
  Building2,
  Tag,
  Dna,
  ShieldCheck,
  ShieldOff,
  Clock,
  PackageSearch,
} from 'lucide-react'
import { AllMedicineRequestType } from '@/Types/adminTypes'
import { CiTablets1 } from 'react-icons/ci'
import { FaCapsules, FaFillDrip } from 'react-icons/fa'
import { TbMedicineSyrup } from 'react-icons/tb'
import { GiLoveInjection } from 'react-icons/gi'
import { FaSprayCanSparkles } from 'react-icons/fa6'
import { IoEyedropSharp } from 'react-icons/io5'
import { MdOutlineAir } from 'react-icons/md'
import Link from 'next/link'


/* ── Medicine type config ── */
const medicineConfig: Record<
  AllMedicineRequestType["medicineType"],
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

/* ── Skeleton Card ── */
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4 overflow-hidden relative">
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-linear-to-r from-transparent via-slate-50/80 to-transparent" />
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-100" />
        <div className="space-y-2">
          <div className="w-28 h-4 rounded-md bg-slate-100" />
          <div className="w-20 h-3 rounded-md bg-slate-100" />
        </div>
      </div>
      <div className="w-16 h-6 rounded-full bg-slate-100" />
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div className="h-3 rounded-md bg-slate-100" />
      <div className="h-3 rounded-md bg-slate-100" />
      <div className="h-3 rounded-md bg-slate-100" />
      <div className="h-3 rounded-md bg-slate-100" />
    </div>
    <div className="flex gap-2">
      <div className="w-16 h-5 rounded-full bg-slate-100" />
      <div className="w-20 h-5 rounded-full bg-slate-100" />
    </div>
  </div>
)

/* ── Medicine Card ── */
const MedicineCard = ({ item, index }: { item: AllMedicineRequestType; index: number }) => {
  const cfg = medicineConfig[item.medicineType]
  const Icon = cfg.icon
  const formattedDate = new Date(item.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  })

  return (
    <Link href={`/admin/registration-request/medicine/${item._id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-200 overflow-hidden cursor-pointer"
      >
        {/* top accent */}
        <div className={`h-0.75 bg-linear-to-r from-blue-500 to-blue-300 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />

        <div className="p-5 space-y-4">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-xl ${cfg.bg} ${cfg.border} border flex items-center justify-center shrink-0`}>
                <Icon className={cfg.color} size={18} />
              </div>
              <div className="min-w-0">
                <h3 className="text-[20px] font-bold text-slate-900 capitalize leading-tight truncate">
                  {item.name}
                </h3>
                <p className="text-sm text-slate-400 font-medium capitalize truncate mt-0.5">
                  {item.genericName}
                </p>
              </div>
            </div>
            {/* Medicine type badge */}
            <span className={`shrink-0 flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border} capitalize`}>
              <Icon size={10} />
              {cfg.label}
            </span>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <InfoRow icon={Building2} label="Manufacturer" value={item.manufacturer} />
            <InfoRow icon={Tag} label="Strength" value={item.strength} />
            {item.brandName && <InfoRow icon={Dna} label="Brand" value={item.brandName} />}
            {item.category && <InfoRow icon={Tag} label="Category" value={item.category} />}
          </div>

          {/* Footer row */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-50">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Prescription badge */}
              {item.requiresPrescription ? (
                <span className="flex items-center gap-1 text-[15px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  <ShieldCheck size={10} /> Rx Required
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[15px] font-semibold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                  <ShieldOff size={10} /> OTC
                </span>
              )}
              {/* Side effects count */}
              {item.sideEffects.length > 0 && (
                <span className="text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                  {item.sideEffects.length} side effect{item.sideEffects.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
            {/* Date */}
            <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium shrink-0">
              <Clock size={10} />
              {formattedDate}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

/* ── Tiny info row helper ── */
const InfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) => (
  <div className="flex items-center gap-1.5 min-w-0">
    <Icon size={11} className="text-slate-400 shrink-0" />
    <span className="text-[11px] text-slate-400 shrink-0">{label}:</span>
    <span className="text-[12px] font-semibold text-slate-700 truncate capitalize">{value}</span>
  </div>
)

/* ── Empty State ── */
const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.96 }}
    animate={{ opacity: 1, scale: 1 }}
    className="col-span-full flex flex-col items-center justify-center py-24 text-center"
  >
    <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mb-4">
      <PackageSearch className="text-blue-400" size={28} />
    </div>
    <h3 className="text-base font-bold text-slate-700 mb-1">No requests found</h3>
    <p className="text-sm text-slate-400 max-w-xs">
      Medicine requests submitted by users will appear here.
    </p>
  </motion.div>
)

/* ── Main Page ── */
const Page = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { adminFetchLoading, allMedicineRequest } = useSelector(
    (state: RootState) => state.admin
  )

  useEffect(() => {
    const fetch = async () => {
      try {
        await dispatch(getAllRequestMedicine(null)).unwrap()
      } catch (error: any) {
        toast.error(error.message)
      }
    }
    if (allMedicineRequest.length === 0) {
      fetch()
    }
  }, [dispatch])

  return (
    <>
      {/* shimmer keyframe */}
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(200%); }
        }
      `}</style>

      <div className="min-h-screen bg-[#f0f4ff] px-4 py-10">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* ── Page Header ── */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 shrink-0">
                <Pill className="text-white" size={22} />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Medicine Requests
                </h1>
                <p className="text-sm text-slate-500 mt-0.5 italic">
                  Review and manage all submitted pharmaceutical entries.
                </p>
              </div>
            </div>

            {/* Count badge */}
            {!adminFetchLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 bg-white border border-blue-100 rounded-2xl px-4 py-2.5 shadow-sm self-start sm:self-auto"
              >
                <span className="text-2xl font-extrabold text-blue-600 leading-none">
                  {allMedicineRequest.length}
                </span>
                <span className="text-xs font-semibold text-slate-500 leading-tight">
                  Total<br />Requests
                </span>
              </motion.div>
            )}
          </motion.div>

          {/* ── Divider ── */}
          <div className="h-px bg-linear-to-r from-blue-100 via-slate-200 to-transparent" />

          {/* ── Grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminFetchLoading ? (
              /* Skeleton */
              Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))
            ) : allMedicineRequest.length === 0 ? (
              <EmptyState />
            ) : (
              <AnimatePresence>
                {(allMedicineRequest as AllMedicineRequestType[]).map((item, index) => (
                  <MedicineCard key={item._id} item={item} index={index} />
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Page