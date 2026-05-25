"use client"

import { getAppointmentHistory } from '@/store/slice/patientSlice'
import { AppDispatch, RootState } from '@/store/store'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Stethoscope, ChevronLeft, ChevronRight, Clock, Building, ArrowRight, Activity } from 'lucide-react'
import { motion, Variants } from 'framer-motion'

const Page = () => {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const currentPage = Number(searchParams.get('page')) || 1

  const { appointmentHistory, patientLoading } = useSelector((state: RootState) => state.patient)

  useEffect(() => {
    if (!searchParams.get('page')) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('page', '1')
      router.replace(`${pathname}?${params.toString()}`)
    }
  }, [searchParams, pathname, router])

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        await dispatch(getAppointmentHistory({ page: currentPage })).unwrap()
      } catch (error: any) {
        toast.error(error.message || "Failed to load appointment history")
      }
    }

    if (currentPage !== appointmentHistory.pagination.page) {
      fetchHistory()
    }
  }, [currentPage, dispatch])

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(newPage))
    router.push(`${pathname}?${params.toString()}`)
  }

  const historyData = appointmentHistory?.data || []
  const pagination = appointmentHistory?.pagination

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06 }
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 260, damping: 20 } 
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8 space-y-8 text-slate-800 antialiased">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Activity size={18} className="animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase">Patient Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Appointment History
          </h1>
          <p className="text-sm text-slate-500 mt-1">View and manage your past and upcoming medical consultations.</p>
        </div>
        {pagination && (
          <span className="inline-flex items-center text-xs font-semibold bg-blue-50/60 text-blue-700 px-3.5 py-2 rounded-xl border border-blue-100/80 shadow-sm backdrop-blur-sm w-fit h-fit self-start sm:self-center">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
            Total: {pagination.total} Appointments
          </span>
        )}
      </div>

      {/* Loading Skeleton */}
      {patientLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 bg-slate-50/80 rounded-2xl border border-slate-100 animate-pulse flex items-center p-5 space-x-4">
              <div className="w-12 h-12 bg-slate-200 rounded-full shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/6"></div>
              </div>
              <div className="h-4 bg-slate-200 rounded w-24 hidden sm:block"></div>
            </div>
          ))}
        </div>
      ) : historyData.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 px-4 bg-slate-50/50 border border-dashed border-slate-200 rounded-3xl text-center space-y-4 backdrop-blur-sm">
          <div className="p-4 bg-white rounded-2xl text-slate-400 shadow-sm border border-slate-100">
            <Calendar size={36} className="text-blue-500/80" />
          </div>
          <div className="max-w-xs space-y-1">
            <p className="text-lg font-bold text-slate-800">No appointments found</p>
            <p className="text-xs text-slate-400 leading-relaxed">You haven't booked any appointments yet or your history is currently empty.</p>
          </div>
          <Link href="/doctors" className="inline-flex items-center text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-100 hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 active:translate-y-0">
            Book Appointment Now
          </Link>
        </div>
      ) : (
        /* Appointment List */
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {historyData.map((item) => (
            <motion.div key={item._id} variants={itemVariants}>
              <Link 
                href={`/appointments/${item._id}`}
                className="group block bg-white border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_20px_-5px_rgba(0,0,0,0.08)] hover:border-blue-200/60 rounded-2xl p-5 transition-all duration-300 relative overflow-hidden active:scale-[0.99]"
              >
                {/* Active hover effect side bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-transparent group-hover:bg-blue-600 transition-all duration-300" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Doctor Details */}
                  <div className="flex items-center gap-4">
                    {item.doctorId?.userId?.image?.url ? (
                      <div className="relative shrink-0">
                        <img 
                          src={item.doctorId.userId.image.url} 
                          alt={item.doctorId.userId.fullName}
                          className="w-14 h-14 rounded-2xl object-cover ring-4 ring-slate-50 group-hover:ring-blue-50 transition-all shadow-sm"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-blue-50 to-indigo-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/50 shadow-inner">
                        <Clock size={22} />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-base md:text-lg tracking-tight">
                        {item.doctorId?.userId?.fullName || "Unknown Doctor"}
                      </h3>
                      <div className="inline-flex items-center gap-1.5 bg-slate-50 group-hover:bg-blue-50/50 text-slate-600 group-hover:text-blue-700 px-2.5 py-1 rounded-lg text-xs font-medium mt-1.5 border border-slate-100 group-hover:border-blue-100/30 transition-colors">
                        <Stethoscope size={13} className="text-blue-500" /> 
                        <span>{item.doctorId?.department || "General"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Hospital & Date Metadata */}
                  <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 sm:gap-8 text-xs md:text-sm text-slate-600 sm:ml-auto">
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest">Hospital</span>
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5 truncate max-w-40" title={item.hospitalId?.name}>
                        <Building size={14} className="text-slate-400 shrink-0" /> 
                        <span className="truncate">{item.hospitalId?.name || "N/A"}</span>
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest">Appointment Date</span>
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5 whitespace-nowrap">
                        <Calendar size={14} className="text-slate-400 shrink-0" /> 
                        {new Date(item.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Action Arrow Icon */}
                  <div className="hidden sm:flex items-center justify-center w-9 h-9 rounded-xl bg-slate-50 group-hover:bg-blue-600 text-slate-400 group-hover:text-white transition-all duration-300 ml-2 shadow-sm shrink-0">
                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform duration-300" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* --- PAGINATION CONTROLS --- */}
      {pagination && pagination.totalPages > 1 && !patientLoading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-6 mt-6"
        >
          <p className="text-xs font-semibold text-slate-500 order-2 sm:order-1">
            Showing page <span className="text-slate-800 font-bold bg-slate-100 px-2 py-0.5 rounded-md">{pagination.page}</span> of <span className="text-slate-800 font-bold bg-slate-100 px-2 py-0.5 rounded-md">{pagination.totalPages}</span>
          </p>
          
          <div className="flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto justify-center">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-95 shadow-sm"
              title="Previous Page"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Page Numbers Indicator */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => {
                if (
                  pageNum === 1 || 
                  pageNum === pagination.totalPages || 
                  Math.abs(pageNum - currentPage) <= 1
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-9 h-9 text-xs font-bold rounded-xl transition-all ${
                        currentPage === pageNum 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                          : 'border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 shadow-sm'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                }
                if (pageNum === 2 || pageNum === pagination.totalPages - 1) {
                  return <span key={pageNum} className="text-slate-400 px-1 text-xs tracking-tight">•••</span>
                }
                return null;
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
              className="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-95 shadow-sm"
              title="Next Page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </motion.div>
      )}

    </div>
  )
}

export default Page