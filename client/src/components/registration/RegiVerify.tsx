"use client"

import { AppDispatch, RootState } from '@/store/store'
import React, { useState, useRef, useEffect, SetStateAction } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Loader2, ShieldCheck, RefreshCcw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { resendOtp, verifyForgetPass, verifyRegi } from '@/store/slice/authSlice'
import { toast } from 'react-toastify'

const RegiVerify = ({ email, setVerified, verifyType }: {
  email: string,
  setVerified?: React.Dispatch<SetStateAction<boolean>>,
  verifyType: "forgetPass" | "regiPatient"
}) => {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { authLoading, otpLoading } = useSelector((state: RootState) => state.auth)

  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""))
  const [resendTimer, setResendTimer] = useState(60)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Countdown timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => { if (timer) clearInterval(timer) }
  }, [resendTimer])

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    try {
      if (verifyType === "forgetPass") {
        await dispatch(resendOtp({ email, topic: "forgetPass" })).unwrap()
      } else {
        await dispatch(resendOtp({ email, topic: "registration" })).unwrap()
      }
      toast.info("A new OTP has been sent to your email.");
      setResendTimer(60);
      setOtp(new Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      toast.error("Failed to resend OTP");
    }
  }

  const handleChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return

    const newOtp = [...otp]
    newOtp[index] = value.substring(value.length - 1)
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const data = e.clipboardData.getData("text").slice(0, 6).split("")
    if (data.length === 6) {
      setOtp(data)
      inputRefs.current[5]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const fullOtp = otp.join("")
    if (fullOtp.length === 6) {
      try {
        if (verifyType === "regiPatient") {
          await dispatch(verifyRegi({ email, otp: fullOtp })).unwrap()
          toast.success('Verification Successfully')
          router.push('/login')
        } else if (verifyType === "forgetPass") {
          await dispatch(verifyForgetPass({ email, otp: fullOtp })).unwrap()
          if (setVerified) {
            setVerified(true)
          }
        }
      } catch (error: any) {
        toast.error(error.message || "Invalid OTP")
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#dceaf7] flex items-center justify-center p-6 font-sans">
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-100 h-100 rounded-full bg-blue-50/60 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-100 h-100 rounded-full bg-indigo-50/60 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-120 bg-white/80 backdrop-blur-2xl p-10 md:p-14 rounded-[48px] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-white"
      >
        <div className="flex flex-col items-center text-center mb-10">
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-200 rotate-3">
              <ShieldCheck size={40} className="text-white -rotate-3" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Security Check</h1>
          <p className="text-slate-500 mt-3 text-sm leading-relaxed">
            We sent a code to <span className="text-slate-900 font-semibold underline decoration-blue-200 underline-offset-4">{email}</span>.
            Please enter it below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="flex justify-between gap-2 md:gap-3">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                ref={(el) => { inputRefs.current[index] = el }}
                value={data}
                onPaste={handlePaste}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-full h-14 md:h-16 text-center text-2xl font-bold text-slate-800 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
              />
            ))}
          </div>

          <div className="space-y-6">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={authLoading || otp.join("").length < 6}
              type="submit"
              className="w-full py-4 cursor-pointer disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {authLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                "Verify Account"
              )}
            </motion.button>

            {/* Resend OTP Section */}
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm text-slate-400">Didn't receive the code?</p>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendTimer > 0 || otpLoading}
                className={`flex items-center space-x-2 font-bold transition-all text-sm cursor-pointer disabled:cursor-not-allowed ${resendTimer > 0 || otpLoading ? 'text-slate-300' : 'text-blue-600 hover:text-blue-700'
                  }`}
              >
                <RefreshCcw
                  size={16}
                  className={`${otpLoading ? 'animate-spin' : ''}`}
                />
                <span>
                  {otpLoading
                    ? 'Sending...'
                    : resendTimer > 0
                      ? `Resend in ${resendTimer}s`
                      : 'Resend OTP Now'
                  }
                </span>
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default RegiVerify