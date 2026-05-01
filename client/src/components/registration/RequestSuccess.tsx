"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Clock, ArrowLeft, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

const RequestSuccess = ({ requestType }: { requestType: "hospital" | "pharmacy" }) => {
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full bg-white rounded-[40px] p-10 shadow-2xl shadow-blue-100 text-center border border-slate-100"
      >
        {/* Success Icon Animation */}
        <motion.div 
          variants={itemVariants}
          className="relative w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
          >
            <CheckCircle2 size={56} className="text-green-500" />
          </motion.div>
          {/* Pulsing effect */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-green-200 rounded-full -z-10"
          />
        </motion.div>

        {/* Text Content */}
        <motion.h2 
          variants={itemVariants}
          className="text-3xl font-black text-slate-900 mb-4 tracking-tight"
        >
          Registration Submitted!
        </motion.h2>

        <motion.p 
          variants={itemVariants}
          className="text-slate-500 mb-8 leading-relaxed"
        >
          Thank you for joining us. Your request to register as a 
          <span className="font-bold text-blue-600 capitalize"> {requestType} </span> 
          has been received and is currently under review by our admin team.
        </motion.p>

        {/* Info Box */}
        <motion.div 
          variants={itemVariants}
          className="bg-blue-50 rounded-3xl p-6 mb-8 flex flex-col gap-4 border border-blue-100"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="bg-white p-2 rounded-xl shadow-sm">
              <Clock size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-900 uppercase tracking-wider">Estimated Time</p>
              <p className="text-sm text-blue-700">Usually takes up to <span className="font-bold">3 working days</span></p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-left">
            <div className="bg-white p-2 rounded-xl shadow-sm">
              <ShieldCheck size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-900 uppercase tracking-wider">Verification</p>
              <p className="text-sm text-blue-700">We'll notify you via email once approved</p>
            </div>
          </div>
        </motion.div>

        {/* Button */}
        <motion.div variants={itemVariants}>
          <Link 
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>
        </motion.div>

        <motion.p 
          variants={itemVariants}
          className="mt-6 text-xs text-slate-400 font-medium"
        >
          Need help? <a href="mailto:support@hospitalconnect.com" className="text-blue-500 hover:underline">Contact Support</a>
        </motion.p>
      </motion.div>
    </div>
  )
}

export default RequestSuccess