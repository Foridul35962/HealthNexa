"use client"

import { getPharmacyDashboard } from '@/store/slice/pharmacySlice'
import { AppDispatch, RootState } from '@/store/store'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Pill, 
  PackageCheck, 
  AlertCircle, 
  TrendingUp, 
  MapPin, 
  Phone,
  Clock,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'

// --- Skeleton Component ---
const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-slate-200 rounded-md ${className}`} />
)

const DashboardSkeleton = () => (
  <div className="p-6 space-y-8 max-w-7xl mx-auto">
    <div className="space-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Skeleton className="h-64 lg:col-span-2 rounded-2xl" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  </div>
)

const PharmacyDashboard = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { pharmacyFetchLoading, pharmacyDashboard } = useSelector((state: RootState) => state.pharmacy)

  useEffect(() => {
    const fetch = async () => {
      try {
        await dispatch(getPharmacyDashboard(null)).unwrap()
      } catch (error: any) {
        toast.error(error.message)
      }
    }
    if (!pharmacyDashboard) fetch()
  }, [dispatch, pharmacyDashboard])

  if (pharmacyFetchLoading) return <DashboardSkeleton />
  if (!pharmacyDashboard) return <div className="p-10 text-center text-slate-500">No data available</div>

  const { pharmacyInfo, overview, recentMedicines } = pharmacyDashboard

  const stats = [
    { label: "Total Medicines", value: overview.totalMedicines, icon: Pill, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Available", value: overview.availableMedicines, icon: PackageCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Out of Stock", value: overview.outOfStock, icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50" },
    { label: "Low Stock", value: overview.lowStockMedicines, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
  ]

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-8 max-w-7xl mx-auto"
    >
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <LayoutDashboard className="text-indigo-600" /> 
            {pharmacyInfo.name}
          </h1>
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-3">
            <span className="flex items-center gap-1"><MapPin size={14}/> {pharmacyInfo.address.city}, {pharmacyInfo.address.street}</span>
            <span className="flex items-center gap-1"><Phone size={14}/> {pharmacyInfo.contactNumber}</span>
          </p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item, idx) => (
          <motion.div 
            key={idx}
            whileHover={{ y: -5 }}
            className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-4"
          >
            <div className={`p-3 rounded-xl ${item.bg} ${item.color}`}>
              <item.icon size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{item.label}</p>
              <h3 className="text-2xl font-bold text-slate-800">{item.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Medicines Table */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-lg">Recent Medicines</h3>
            <Link href={"/pharmacy/medicine"} className="text-indigo-600 text-sm font-semibold flex items-center hover:underline">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="px-6 py-4">Medicine</th>
                  <th className="px-6 py-4">Generic</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentMedicines.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800 capitalize">{item.medicineId.name}</p>
                      <p className="text-xs text-slate-400">{item.medicineId.medicineType} • {item.medicineId.strength}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.medicineId.genericName}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">{item.stock}</td>
                    <td className="px-6 py-4 font-bold text-indigo-600">৳{item.price}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${item.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Info / Pharmacy Details Card */}
        <div className="space-y-6">
          <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2">Shop Address</h3>
              <p className="text-indigo-100 text-sm leading-relaxed">
                House: {pharmacyInfo.address.house}, {pharmacyInfo.address.street}<br/>
                {pharmacyInfo.address.city} - {pharmacyInfo.address.postalCode}
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs text-indigo-200">
                <Clock size={14} /> Updated {new Date(recentMedicines[0]?.updatedAt).toLocaleDateString()}
              </div>
            </div>
            {/* Background Decoration */}
            <div className="absolute -right-4 -bottom-4 bg-indigo-800 w-24 h-24 rounded-full opacity-50 transition-transform" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default PharmacyDashboard