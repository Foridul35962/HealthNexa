"use client"

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

const FirstLoad = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white">
      {/* Central Icon & Logo Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <div className="relative flex items-center justify-center w-24 h-24 mb-6">
          {/* Pulsing Background Ring */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-blue-500 rounded-full"
          />
          <div className="z-10 flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
            <Activity className="text-white w-10 h-10" />
          </div>
        </div>

        <motion.h1 
          className="text-3xl font-bold tracking-tight text-slate-900"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Health<span className="text-blue-600">Nexa</span>
        </motion.h1>
        
        <motion.p 
          className="mt-2 text-sm font-medium text-slate-500 uppercase tracking-widest"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Your Digital Health Partner
        </motion.p>
      </motion.div>

      {/* Progress Bar Container */}
      <div className="mt-12 w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
        <motion.div
          className="h-full bg-blue-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: "easeInOut" }}
        />
      </div>

      <motion.div 
        className="mt-4 text-xs font-semibold text-blue-600/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {progress}%
      </motion.div>

      {/* Footer Branding */}
      <motion.footer 
        className="absolute bottom-10 text-slate-400 text-[10px] font-medium tracking-tighter"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1 }}
      >
        POWERED BY HEALTHNEXA CORE
      </motion.footer>
    </div>
  );
};

export default FirstLoad;