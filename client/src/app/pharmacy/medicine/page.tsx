"use client"

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store/store'
import { addEditMediPhar, deletePharMedi, getAllShopMedicine } from '@/store/slice/pharmacySlice'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

// Icons
import { CiTablets1 } from "react-icons/ci";
import { FaCapsules, FaFillDrip, FaSprayCanSparkles } from "react-icons/fa6";
import { TbMedicineSyrup } from "react-icons/tb";
import { GiLoveInjection } from "react-icons/gi";
import { IoEyedropSharp } from "react-icons/io5";
import { MdOutlineAir } from "react-icons/md";
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Trash2,
  LayoutDashboard,
  Plus,
  Pill,
  Search,
  X
} from 'lucide-react'
import { PharmacyMedicineType } from '@/Types/pharmacyTypes'
import { toast } from 'react-toastify'

const medicineConfig: any = {
  tablet: { icon: CiTablets1, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", label: "Tablet" },
  capsule: { icon: FaCapsules, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200", label: "Capsule" },
  syrup: { icon: TbMedicineSyrup, color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-200", label: "Syrup" },
  injection: { icon: GiLoveInjection, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", label: "Injection" },
  cream: { icon: FaSprayCanSparkles, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", label: "Cream" },
  ointment: { icon: FaFillDrip, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", label: "Ointment" },
  drops: { icon: IoEyedropSharp, color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-200", label: "Drops" },
  inhaler: { icon: MdOutlineAir, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200", label: "Inhaler" },
}

const MedicineInventory = () => {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [deletedId, setDeletedId] = useState("")

  const { pharmacyFetchLoading, allShopMedicine } = useSelector((state: RootState) => state.pharmacy)

  const currentPage = Number(searchParams.get('page')) || 1
  const currentSearch = searchParams.get('search') || ""

  const [searchInput, setSearchInput] = useState(currentSearch)
  const limit = 10

  // Common function to update URL
  const applySearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value.trim()) {
      params.set('search', value.trim())
    } else {
      params.delete('search')
    }
    params.set('page', '1')
    router.push(`?${params.toString()}`)
  }

  // Handle Key Down (Enter)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      applySearch(searchInput)
    }
  }

  // Effect to fetch data when URL params change
  useEffect(() => {
    dispatch(getAllShopMedicine({
      page: currentPage.toString(),
      limit: limit.toString(),
      search: currentSearch
    }))
  }, [dispatch, currentPage, currentSearch])

  const updatePageQuery = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`?${params.toString()}`)
  }

  const handleEdit = async (item: PharmacyMedicineType) => {
    dispatch(addEditMediPhar(item))
    router.push(`/pharmacy/medicine/edit/${item._id}`)
  }

  const handleDelete = async (medicineId: string, medicineName: string) => {
    if (window.confirm(`Are you really want to delete ${medicineName} from your shop?`)) {
      try {
        setDeletedId(medicineId)
        await dispatch(deletePharMedi({ medicineId })).unwrap()
        toast.success("medicine deleted from shop")
      } catch (error: any) {
        toast.error(error.message)
      } finally {
        setDeletedId("")
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd] p-4 lg:p-8 w-full">
      <div className="w-full mx-auto">

        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6 px-2">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
              <LayoutDashboard className="text-blue-600" /> INVENTORY
            </h1>
            <p className="text-slate-500 text-sm font-medium">Manage your pharmacy products & stock levels</p>
          </div>

          <div className="flex flex-col text-black sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-80 group">
              <button
                onClick={() => applySearch(searchInput)}
                type="button"
                className="absolute inset-y-0 left-4 z-10 flex items-center text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
              >
                <Search size={18} />
              </button>

              <input
                type="text"
                placeholder="Search & press Enter..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-12 pr-10 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all shadow-sm"
              />

              {searchInput && (
                <button
                  onClick={() => { setSearchInput(""); applySearch(""); }}
                  type="button"
                  className="absolute inset-y-0 right-4 z-10 flex items-center text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <Link
              href="/pharmacy/medicine/add"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-slate-200 active:scale-95"
            >
              <Plus size={18} /> Add Medicine
            </Link>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-4xl border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] overflow-hidden w-full">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed min-w-225">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="p-6 w-[35%] text-[11px] font-black uppercase text-slate-400 tracking-widest">Medicine Details</th>
                  <th className="p-6 w-[15%] text-[11px] font-black uppercase text-slate-400 tracking-widest">Type</th>
                  <th className="p-6 w-[20%] text-[11px] font-black uppercase text-slate-400 tracking-widest">Pricing</th>
                  <th className="p-6 w-[15%] text-[11px] font-black uppercase text-slate-400 tracking-widest">Stock Status</th>
                  <th className="p-6 w-[15%] text-[11px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence mode='wait'>
                  {pharmacyFetchLoading ? (
                    <SkeletonRows count={8} />
                  ) : allShopMedicine?.data?.length > 0 ? (
                    allShopMedicine.data.map((item: any, idx: number) => {
                      const typeConfig = medicineConfig[item.medicineId?.medicineType?.toLowerCase()]
                      const Icon = typeConfig?.icon || Pill

                      return (
                        <motion.tr
                          key={item._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.02 }}
                          className="group hover:bg-blue-50/30 transition-colors"
                        >
                          <td className="p-6">
                            <div className="flex items-center gap-4">
                              <div className={`shrink-0 w-12 h-12 ${typeConfig?.bg || 'bg-slate-50'} ${typeConfig?.color || 'text-slate-400'} rounded-2xl flex items-center justify-center border ${typeConfig?.border || 'border-slate-200'} shadow-sm group-hover:scale-110 transition-transform`}>
                                <Icon size={24} />
                              </div>
                              <div className="overflow-hidden">
                                <h4 className="font-bold text-slate-800 flex items-center gap-2 truncate">
                                  {item.medicineId?.name}
                                  <span className="shrink-0 text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded-md font-black">{item.medicineId?.strength}</span>
                                </h4>
                                <p className="text-xs text-slate-400 font-medium truncate">{item.medicineId?.genericName}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-6">
                            <span className={`inline-flex text-[10px] font-black uppercase tracking-tighter px-3 py-1 rounded-full border ${typeConfig?.bg || 'bg-slate-50'} ${typeConfig?.color || 'text-slate-400'} ${typeConfig?.border || 'border-slate-200'}`}>
                              {typeConfig?.label || item.medicineId?.medicineType}
                            </span>
                          </td>
                          <td className="p-6">
                            <div className="flex flex-col">
                              {item.discountPrice ? (
                                <>
                                  <span className="text-green-600 font-black text-lg leading-none mb-1">৳{item.discountPrice}</span>
                                  <span className="text-slate-300 line-through text-[11px] font-bold">৳{item.price}</span>
                                </>
                              ) : (
                                <span className="text-slate-800 font-black text-lg">৳{item.price}</span>
                              )}
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-full max-w-20 rounded-full bg-slate-100 overflow-hidden">
                                  <div
                                    className={`h-full transition-all duration-500 ${item.stock < 20 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${Math.min(item.stock, 100)}%` }}
                                  />
                                </div>
                                <span className={`text-xs font-black ${item.stock < 20 ? 'text-rose-500' : 'text-slate-700'}`}>
                                  {item.stock}
                                </span>
                              </div>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Units in hand</span>
                            </div>
                          </td>
                          <td className="p-6 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleEdit(item)} className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-100 hover:shadow-md transition-all active:scale-90">
                                <Edit3 size={16} />
                              </button>
                              <button
                                disabled={deletedId === item._id}
                                onClick={() => handleDelete(item._id, item.medicineId?.name)}
                                className={`p-2.5 bg-white border border-slate-100 rounded-xl transition-all 
                                  ${deletedId === item._id ? 'opacity-50 cursor-not-allowed' : 'text-slate-400 hover:text-rose-600 hover:border-rose-100 hover:shadow-md active:scale-90'}`}
                              >
                                {deletedId === item._id ? (
                                  <div className="h-4 w-4 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-20 text-center text-slate-400 font-medium">
                        No medicine found. Try a different search term.
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination Section (Restored Design) */}
          <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Page {allShopMedicine?.pagination?.page || 1} of {allShopMedicine?.pagination?.totalPages || 1}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => updatePageQuery(currentPage - 1)}
                disabled={currentPage === 1 || pharmacyFetchLoading}
                className="p-2.5 rounded-xl border border-slate-200 bg-white disabled:opacity-30 hover:bg-slate-50 transition-all active:scale-90"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex items-center gap-1.5 mx-2">
                {[...Array(allShopMedicine?.pagination?.totalPages || 0)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => updatePageQuery(i + 1)}
                    className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${currentPage === i + 1
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                      : 'text-slate-400 bg-white border border-transparent hover:border-slate-200'
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => updatePageQuery(currentPage + 1)}
                disabled={currentPage === (allShopMedicine?.pagination?.totalPages || 1) || pharmacyFetchLoading}
                className="p-2.5 rounded-xl border border-slate-200 bg-white disabled:opacity-30 hover:bg-slate-50 transition-all active:scale-90"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const SkeletonRows = ({ count }: { count: number }) => (
  <>
    {[...Array(count)].map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
            <div className="space-y-2">
              <div className="h-4 bg-slate-100 rounded w-32" />
              <div className="h-3 bg-slate-50 rounded w-20" />
            </div>
          </div>
        </td>
        <td className="p-6"><div className="h-6 bg-slate-50 rounded-full w-16" /></td>
        <td className="p-6"><div className="space-y-1"><div className="h-6 bg-slate-100 rounded w-16" /><div className="h-3 bg-slate-50 rounded w-10" /></div></td>
        <td className="p-6"><div className="h-2 bg-slate-100 rounded w-20" /></td>
        <td className="p-6 text-right flex justify-end gap-2">
          <div className="w-8 h-8 bg-slate-50 rounded-lg" />
          <div className="w-8 h-8 bg-slate-50 rounded-lg" />
        </td>
      </tr>
    ))}
  </>
)

export default MedicineInventory;