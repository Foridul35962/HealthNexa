import React from 'react'

const DoctorDetailsLoad = () => {
    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4">
            <div className="max-w-3xl mx-auto space-y-5">

                {/* Doctor Header Skeleton */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <div className="w-24 h-24 rounded-2xl bg-slate-200 animate-pulse shrink-0" />
                    <div className="flex-1 w-full space-y-3">
                        <div className="h-6 w-48 bg-slate-200 rounded-lg animate-pulse" />
                        <div className="h-4 w-28 bg-slate-200 rounded-lg animate-pulse" />
                        <div className="flex gap-2 flex-wrap">
                            <div className="h-6 w-24 bg-slate-200 rounded-full animate-pulse" />
                            <div className="h-6 w-24 bg-slate-200 rounded-full animate-pulse" />
                            <div className="h-6 w-24 bg-slate-200 rounded-full animate-pulse" />
                        </div>
                    </div>
                    <div className="h-10 w-36 bg-slate-200 rounded-xl animate-pulse shrink-0" />
                </div>

                {/* Hospital Skeleton */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
                    <div className="h-4 w-20 bg-slate-200 rounded-lg animate-pulse" />
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-200 animate-pulse shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-40 bg-slate-200 rounded-lg animate-pulse" />
                            <div className="h-3 w-64 bg-slate-200 rounded-lg animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* Schedule Skeleton */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
                    <div className="h-4 w-32 bg-slate-200 rounded-lg animate-pulse" />
                    <div className="space-y-3">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-slate-200 animate-pulse" />
                                    <div className="h-4 w-20 bg-slate-200 rounded-lg animate-pulse" />
                                </div>
                                <div className="h-7 w-28 bg-slate-200 rounded-full animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    )
}

export default DoctorDetailsLoad