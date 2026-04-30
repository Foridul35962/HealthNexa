"use client"

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, ArrowLeft, Loader2, KeyRound, SendHorizontal } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store/store'
import { forgetPass } from '@/store/slice/authSlice'
import { toast } from 'react-toastify'

interface ForgotPassValues {
    email: string
}

const ForgetPassDesign = ({ setEmail }: { setEmail: React.Dispatch<React.SetStateAction<string>> }) => {
    const router = useRouter()
    const dispatch = useDispatch<AppDispatch>()
    const { authLoading } = useSelector((state: RootState) => state.auth)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPassValues>()

    const onSubmit = async (data: ForgotPassValues) => {
        console.log("Reset link requested for:", data.email)
        try {
            await dispatch(forgetPass({email:data.email})).unwrap()
            setEmail(data.email)
        } catch (error:any) {
            toast.error(error.message)
        }
    }

    return (
        <div className="min-h-screen text-black bg-[#fcfdfe] flex items-center justify-center p-6 font-sans">
            {/* Background Glow */}
            <div className="fixed inset-0 overflow-hidden -z-10">
                <div className="absolute top-[-5%] left-[-5%] w-87.5 h-87.5 rounded-full bg-blue-50/50 blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-112.5 bg-white p-10 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-100"
            >
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="group flex cursor-pointer items-center text-slate-400 hover:text-blue-600 transition-all mb-8 text-sm font-medium"
                >
                    <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back
                </button>

                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-3xl mb-6 text-blue-600">
                        <KeyRound size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Forgot Password?</h1>
                    <p className="text-slate-500 mt-3 text-sm leading-relaxed px-4">
                        No worries! Enter your email and we'll send you a link to reset your password.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[13px] font-semibold text-slate-600 ml-1 uppercase tracking-wider">
                            Email Address
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                <Mail size={18} />
                            </div>
                            <input
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address",
                                    },
                                })}
                                type="email"
                                placeholder="example@email.com"
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm shadow-sm"
                            />
                        </div>
                        <AnimatePresence>
                            {errors.email && (
                                <motion.p
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-[11px] text-red-500 font-medium ml-1"
                                >
                                    {errors.email.message}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        disabled={authLoading}
                        type="submit"
                        className="w-full py-4 cursor-pointer disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:shadow-none"
                    >
                        {authLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Sending OTP...</span>
                            </>
                        ) : (
                            <>
                                <span>Send OTP</span>
                                <SendHorizontal size={18} />
                            </>
                        )}
                    </motion.button>
                </form>

                <div className="mt-10 text-center">
                    <p className="text-sm text-slate-400">
                        Remembered your password?{" "}
                        <Link
                            href={"/login"}
                            className="text-blue-600 font-bold hover:underline underline-offset-4"
                        >
                            Log In
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    )
}

export default ForgetPassDesign