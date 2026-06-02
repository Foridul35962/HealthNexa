"use client";

import React, { useState, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Info, 
  Loader2, 
  Monitor, 
  Smartphone, 
  CameraOff,
  Sparkles
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { checkInPatient } from "@/store/slice/receptionistSlice";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

export default function ScanPage() {
  const router = useRouter()
  const [isScanning, setIsScanning] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /iphone|ipad|ipod|android|blackberry|windows phone/g.test(userAgent);

    if (!isMobile) {
      setIsDesktop(true);
    } else {
      setShowScanner(true);
    }

    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        if (videoDevices.length === 0) {
          setHasCamera(false);
        }
      });
    }
  }, []);

  const handleScan = async (result: any) => {
    if (result && isScanning) {
      const text = result[0]?.rawValue;
      if (text) {
        setIsScanning(false);
        setLoading(true);
        try {
          const url = new URL(text);
          const appointmentId = url.searchParams.get("appointmentId");
          const hash = url.searchParams.get("hash");

          await dispatch(checkInPatient({
            appointmentId: appointmentId as string,
            hash: hash as string
          })).unwrap();

          toast.success('Patient Checked In Successfully');
        } catch (error: any) {
          toast.error(error.message || "Invalid QR Code");
          setIsScanning(true);
        } finally {
          setLoading(false);
        }
      }
    }
  };

  // --- 1. LIGHT MODE DESKTOP WARNING VIEW ---
  if (isDesktop && !showScanner) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200 max-w-md shadow-xl relative overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full" />
          
          <div className="flex justify-center mb-6">
            <div className="relative p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
              <Monitor size={48} className="text-slate-400" />
              <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-xl p-2 shadow-lg shadow-blue-600/20">
                <Smartphone size={18} className="text-white" />
              </div>
            </div>
          </div>
          
          <h2 className="text-xl font-bold mb-3 tracking-tight text-slate-900">Handheld Access Suggested</h2>
          <p className="text-slate-500 mb-8 text-xs leading-relaxed">
            QR capture matrix is highly calibrated for mobile optics. For elite performance at the desk, transition this session to a smartphone device.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => setShowScanner(true)}
              className="w-full py-3.5 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/10 active:scale-[0.99] transition-all text-xs uppercase tracking-wider"
            >
              Force Desktop Stream
            </button>
            <button
              onClick={() => router.back()}
              className="w-full py-3.5 bg-slate-100 hover:bg-slate-200/60 rounded-xl font-semibold transition-all border border-slate-200 text-xs text-slate-600"
            >
              Return to Control Center
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- 2. LIGHT MODE CAMERA NOT FOUND VIEW ---
  if (!hasCamera && showScanner) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-6 text-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-sm flex flex-col items-center">
          <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 text-rose-500 mb-6 animate-pulse">
            <CameraOff size={40} />
          </div>
          <h2 className="text-xl font-bold mb-2 tracking-tight text-slate-900">Optical Hardware Missing</h2>
          <p className="text-slate-500 text-xs mb-8 leading-relaxed">
            No secure video input peripheral could be initialized on this interface node. Verify drivers or mount an external lens.
          </p>
          <button
            onClick={() => router.back()}
            className="w-full px-6 py-3.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs text-slate-700 transition-all shadow-xs"
          >
            Terminal Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  // --- 3. PREMIUM WHITE & BLUE LIVE SCANNER VIEW ---
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-700 flex flex-col justify-between overflow-hidden relative font-sans selection:bg-blue-100">
      
      {/* Soft Clean Ambient Gradients */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-87.5 h-87.5 bg-blue-500/4 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute bottom-[-5%] left-1/2 -translate-x-1/2 w-75 h-75 bg-cyan-500/4 blur-[100px] pointer-events-none rounded-full" />

      {/* High-Performance 60FPS GPU Laser Line Animation */}
      <style jsx global>{`
        @keyframes laser-sweep {
          0% { transform: translateY(10px); opacity: 0.4; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translateY(240px); opacity: 0.1; }
        }
        .gpu-laser {
          animation: laser-sweep 2.2s infinite cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform;
        }
      `}</style>

      {/* Center Scan Workspace */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-6 z-20">
        <div className="text-center mb-8 max-w-xs">
          <div className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-semibold mb-1.5 uppercase tracking-widest">
            <Sparkles size={12} /> Live Target System
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Capture QR for CheckIn Patient</h1>
          <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
            Align the encrypted patient pass token inside the matrix frame boundaries.
          </p>
        </div>

        {/* Viewfinder Outer Card with Soft Shadow */}
        <div className="relative w-full max-w-70 aspect-square rounded-[36px] overflow-hidden border border-slate-200 bg-white shadow-[0_20px_50px_-12px_rgba(15,23,42,0.08)] group">
          
          {/* Target Corner Vector Reticles (Medical Blue-Cyan) */}
          <div className="absolute inset-0 z-10 pointer-events-none p-5">
            <div className="absolute top-5 left-5 w-6 h-6 border-t-[3px] border-l-[3px] border-blue-600 rounded-tl-xl transition-all group-hover:scale-105" />
            <div className="absolute top-5 right-5 w-6 h-6 border-t-[3px] border-r-[3px] border-blue-600 rounded-tr-xl transition-all group-hover:scale-105" />
            <div className="absolute bottom-5 left-5 w-6 h-6 border-b-[3px] border-l-[3px] border-blue-600 rounded-bl-xl transition-all group-hover:scale-105" />
            <div className="absolute bottom-5 right-5 w-6 h-6 border-b-[3px] border-r-[3px] border-blue-600 rounded-br-xl transition-all group-hover:scale-105" />

            {/* GPU Acceleration Laser Strip (Blue/Cyan Neon Line) */}
            {isScanning && !loading && (
              <div className="w-[calc(100%-40px)] left-5 h-0.5 bg-linear-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_rgba(34,211,238,1)] absolute gpu-laser" />
            )}
          </div>

          {/* Video Engine Window */}
          <div className="w-full h-full bg-slate-50 opacity-95">
            <Scanner
              onScan={handleScan}
              onError={(err) => console.log(err)}
              styles={{
                container: { width: '100%', height: '100%' }
              }}
            />
          </div>

          {/* Secure Light-Loader Overlay */}
          <AnimatePresence>
            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 bg-white/95 flex flex-col items-center justify-center backdrop-blur-xs"
              >
                <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 mb-3 shadow-inner">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                </div>
                <p className="font-bold text-[11px] uppercase tracking-widest text-slate-700">Decrypting Payload</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status Indicator Pill */}
        {isScanning && !loading && (
          <div className="mt-6 flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full shadow-xs text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Awaiting Frame Optical Entry
          </div>
        )}
      </div>

      {/* Professional Bottom Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 border-t border-slate-200 bg-white/60 backdrop-blur-md flex justify-center z-20"
      >
        <div className="flex items-start gap-3 bg-white border border-slate-200 p-4 rounded-2xl max-w-xs w-full shadow-xs">
          <Info className="text-blue-600 shrink-0 mt-0.5" size={14} />
          <div className="space-y-0.5">
            <h4 className="text-[11px] font-bold text-slate-800 tracking-wide">Optical Diagnostics</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              If decryption hangs, augment device lumen index or re-orient screen alignment vectors.
            </p>
          </div>
        </div>
      </motion.div>

    </div>
  );
}