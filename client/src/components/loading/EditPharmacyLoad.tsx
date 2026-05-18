import React from 'react'
import { motion, Variants } from 'framer-motion'

const EditPharmacyLoad = () => {
  const shimmerVariants: Variants = {
    initial: { opacity: 0.4 },
    animate: {
      opacity: [0.4, 0.7, 0.4],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: ["easeInOut"],
      },
    },
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-8 w-48 rounded-lg bg-gray-200 animate-pulse" />
          <div className="mt-2 h-4 w-80 rounded-lg bg-gray-200 animate-pulse" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* LEFT SIDE: Profile Card & Quick Info Skeletons */}
          <div className="space-y-6 lg:col-span-1">
            
            {/* Profile Card Skeleton */}
            <motion.div
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
              className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 flex flex-col items-center"
            >
              {/* Image Circle */}
              <div className="h-28 w-28 rounded-full bg-gray-200" />
              
              {/* Name */}
              <div className="mt-4 h-5 w-40 rounded-md bg-gray-200" />
              
              {/* Location */}
              <div className="mt-2 h-3 w-24 rounded-md bg-gray-200" />
              
              {/* Status Badge */}
              <div className="mt-5 h-7 w-28 rounded-full bg-gray-200" />
              
              {/* Logout Button Skeleton */}
              <div className="mt-8 pt-6 border-t border-gray-100 w-full hidden sm:block">
                <div className="h-11 w-full rounded-xl bg-gray-100" />
              </div>
            </motion.div>

            {/* Quick Info Skeleton */}
            <motion.div
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
              className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
            >
              <div className="h-5 w-24 rounded-md bg-gray-200 mb-5" />
              
              <div className="space-y-4">
                {[1, 2].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-md bg-gray-200 shrink-0" />
                    <div className="space-y-2 w-full">
                      <div className="h-4 w-20 rounded-md bg-gray-200" />
                      <div className="h-3 w-full rounded-md bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* RIGHT SIDE: Form Skeleton */}
          <div className="space-y-6 lg:col-span-2">
            
            <motion.div
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
              className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
            >
              {/* Form Title */}
              <div className="mb-6 flex items-center gap-3">
                <div className="h-6 w-6 rounded-md bg-gray-200" />
                <div className="h-5 w-48 rounded-md bg-gray-200" />
              </div>

              {/* Form Fields Grid */}
              <div className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  
                  {/* Field 1 */}
                  <div>
                    <div className="h-4 w-28 rounded-md bg-gray-200 mb-2" />
                    <div className="h-12 w-full rounded-xl bg-gray-100" />
                  </div>

                  {/* Field 2 */}
                  <div>
                    <div className="h-4 w-28 rounded-md bg-gray-200 mb-2" />
                    <div className="h-12 w-full rounded-xl bg-gray-100" />
                  </div>

                </div>

                {/* Button Skeleton */}
                <div className="pt-2">
                  <div className="h-12 w-36 rounded-xl bg-gray-200" />
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default EditPharmacyLoad