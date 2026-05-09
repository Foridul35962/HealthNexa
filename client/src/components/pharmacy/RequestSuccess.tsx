"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { 
  CheckCircle2, 
  Clock, 
  ArrowLeft, 
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'

const RequestSuccessPage = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl border border-slate-100 shadow-sm p-8 text-center"
      >
        {/* Compact Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-emerald-50 p-3 rounded-2xl">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
        </div>

        {/* Text Section - Font size adjusted */}
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Request Received</h2>
        <p className="text-sm text-slate-500 mb-8 px-4">
          Medicine details have been sent to our pharmacy board for clinical verification.
        </p>

        {/* Status Card - Compact */}
        <div className="bg-slate-50 rounded-2xl p-4 mb-8 flex items-center gap-4 text-left border border-slate-100">
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <Clock size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Review Timeline</p>
            <p className="text-sm font-semibold text-slate-700">Expect response within 3 Days</p>
          </div>
        </div>

        {/* Action Buttons - Streamlined */}
        <div className="space-y-3">
          <Link href="/" className="block">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-100 flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} />
              Return to Home
            </motion.button>
          </Link>
          
          <button className="w-full py-3 bg-white text-slate-600 text-sm font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
            Track Status
            <ExternalLink size={14} />
          </button>
        </div>

        <p className="mt-8 text-[10px] text-slate-400 font-medium">
          Ticket ID: #REQ-{Math.floor(1000 + Math.random() * 9000)}
        </p>
      </motion.div>
    </div>
  )
}

export default RequestSuccessPage