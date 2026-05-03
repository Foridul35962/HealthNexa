import React from 'react'

const HospitalPharmacyList = () => {
  return (
    <div className="w-full bg-white border border-slate-100 p-5 rounded-[28px] animate-pulse">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Left Side: Info Skeleton */}
        <div className="flex items-start md:items-center gap-5 flex-1">
          {/* Icon Square */}
          <div className="w-14 h-14 bg-slate-200 rounded-[20px]" />
          
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              {/* Title */}
              <div className="h-5 w-48 bg-slate-200 rounded-md" />
              {/* Badge */}
              <div className="h-4 w-20 bg-slate-100 rounded-full" />
            </div>
            
            {/* Meta Info Lines */}
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <div className="h-3 w-32 bg-slate-100 rounded" />
              <div className="h-3 w-28 bg-slate-100 rounded" />
              <div className="h-3 w-40 bg-slate-100 rounded" />
            </div>
          </div>
        </div>

        {/* Right Side: Button Skeleton */}
        <div className="flex items-center gap-4">
            {/* Date info (hidden on mobile) */}
          <div className="hidden sm:flex flex-col items-end gap-2 mr-2">
            <div className="h-2 w-12 bg-slate-100 rounded" />
            <div className="h-3 w-16 bg-slate-200 rounded" />
          </div>
          {/* Button */}
          <div className="h-12 w-36 bg-slate-200 rounded-[18px]" />
        </div>

      </div>
    </div>
  )
}

export default HospitalPharmacyList