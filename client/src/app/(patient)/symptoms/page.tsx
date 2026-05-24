"use client"

import { getAllSymptoms } from '@/store/slice/aiSlice'
import { AppDispatch, RootState } from '@/store/store'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'react-toastify'
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  Activity, 
  ChevronLeft, 
  ChevronRight, 
  Loader2,
  AlertCircle
} from 'lucide-react'
import { AISymptomHistoryItem, GetAllAISymptomsResponseType } from '@/Types/aiTypes'


const Page = () => {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const rawPageParam = searchParams.get('page')
  const currentPage = parseInt(rawPageParam || '1', 10)

  // Redux State Access
  const { aiLoading, allSymtoms } = useSelector((state: RootState) => state.ai) as any

  const responseData = allSymtoms as GetAllAISymptomsResponseType | null;
  const records: AISymptomHistoryItem[] = responseData?.data || []
  const pagination = responseData?.pagination

  const fetchedPage = pagination?.page

  useEffect(() => {
    if (!rawPageParam || currentPage < 1) {
      router.push('?page=1')
      return
    }

    const fetchData = async () => {
      try {
        await dispatch(getAllSymptoms({ page: String(currentPage) })).unwrap()
      } catch (error: any) {
        toast.error(error?.message || "Failed to fetch symptoms history")
      }
    }

    if (!responseData || fetchedPage !== currentPage) {
      fetchData()
    }
    
  }, [currentPage, rawPageParam, fetchedPage, responseData, dispatch, router])

  const handlePageChange = (newPage: number) => {
    router.push(`?page=${newPage}`)
  }

  const getEmergencyBadgeColor = (level: "low" | "moderate" | "high" | "critical") => {
    switch (level) {
      case 'critical':
      case 'high':
        return 'bg-rose-50 border-rose-200 text-rose-700'
      case 'moderate':
        return 'bg-amber-50 border-amber-200 text-amber-700'
      case 'low':
      default:
        return 'bg-emerald-50 border-emerald-200 text-emerald-700'
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Activity className="w-7 h-7 text-emerald-600" />
              Medical Assessment History
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Review and manage your previous AI health reports and symptom checks.
            </p>
          </div>
        </div>

        {/* Dynamic States */}
        {aiLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
            <p className="text-slate-500 text-sm font-medium">Loading health logs...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl flex flex-col items-center justify-center py-16 px-4 shadow-xs">
            <AlertCircle className="w-12 h-12 text-slate-400 mb-3" />
            <h3 className="text-lg font-semibold text-slate-800">No Assessment Records</h3>
            <p className="text-slate-500 text-sm text-center max-w-sm mt-1">
              You haven&apos;t run any AI symptom checker assessment tests yet.
            </p>
          </div>
        ) : (
          /* Records List Mapping */
          <div className="space-y-4">
            {records.map((record) => (
              <div 
                key={record._id} 
                className="bg-white border border-slate-100 hover:border-emerald-200 rounded-2xl p-5 sm:p-6 transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col gap-4"
                onClick={() => router.push(`/symptoms/${record._id}`)}
              >
                {/* Meta Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-50 pb-3">
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="bg-slate-100 font-mono px-2 py-1 rounded-md text-slate-700">
                      ID: {record._id.slice(-8)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(record.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  {record.aiResult?.emergencyLevel?.level && (
                    <span className={`border text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${getEmergencyBadgeColor(record.aiResult.emergencyLevel.level)}`}>
                      {record.aiResult.emergencyLevel.level} Priority
                    </span>
                  )}
                </div>

                {/* Content Body Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-1 space-y-2 border-r border-slate-50 pr-2">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                      <User className="w-4 h-4 text-slate-400" />
                      <span>{record.patientInfo?.age} Yrs, <span className="capitalize">{record.patientInfo?.gender}</span></span>
                    </div>
                    {record.input?.duration && (
                      <div className="flex items-center gap-1.5 text-sm text-slate-500">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>Duration: {record.input.duration}</span>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-3 space-y-2">
                    {record.aiResult?.summary && (
                      <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                        {record.aiResult.summary}
                      </p>
                    )}

                    {/* Chips Array */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {record.input?.symptoms?.map((symptom, idx) => (
                        <span 
                          key={idx} 
                          className="bg-slate-50 text-slate-700 border border-slate-200/60 text-xs px-2 py-0.5 rounded-md capitalize font-medium"
                        >
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Referrals Section */}
                {record.aiResult?.recommendedDepartment && record.aiResult.recommendedDepartment.length > 0 && (
                  <div className="bg-emerald-50/40 border border-emerald-100/50 rounded-xl px-3 py-2 text-xs text-slate-700 flex items-center gap-2 mt-1">
                    <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-medium text-slate-500">Recommended Referral:</span>
                    <div className="flex gap-1.5 font-semibold text-emerald-800">
                      {record.aiResult.recommendedDepartment.map((d, i) => (
                        <span key={i}>
                          {d.department}{i < record.aiResult.recommendedDepartment.length - 1 ? ',' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls Footer */}
        {pagination && pagination.totalPages > 1 && !aiLoading && (
          <div className="flex items-center justify-between border-t border-slate-200 pt-6">
            <p className="text-xs font-medium text-slate-500">
              Showing Page <span className="text-slate-800">{pagination.page}</span> of <span className="text-slate-800">{pagination.totalPages}</span> ({pagination.total} total cases)
            </p>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-600 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: pagination.totalPages }, (_, index) => {
                const pageNum = index + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
                className="p-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-600 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Page