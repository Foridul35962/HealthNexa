"use client"

import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Lock, Loader2, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store/store'
import Link from 'next/link'
import { registrationPatiend } from '@/store/slice/authSlice'
import { toast } from 'react-toastify'
import React from 'react'

const PatientRegister = ({ setEmail }: { setEmail: React.Dispatch<React.SetStateAction<string>> }) => {
    const router = useRouter()
    const dispatch = useDispatch<AppDispatch>()
    const { authLoading } = useSelector((state: RootState) => state.auth)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            fullName: '',
            email: '',
            phoneNumber: '',
            password: ''
        }
    })

    const onSubmit = async (data: any) => {
        try {
            await dispatch(registrationPatiend({
                email: data.email,
                fullName: data.fullName,
                password: data.password,
                phoneNumber: data.phoneNumber,
                role: "patient"
            })).unwrap()
            setEmail(data.email)
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    return (
        <div className="min-h-screen text-black bg-[#f8fafc] flex items-center justify-center p-4 font-sans">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg bg-white p-8 md:p-10 rounded-4xl shadow-sm border border-slate-100"
            >
                {/* Back Button & Header */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-slate-500 hover:text-blue-600 transition-colors mb-6 text-sm font-medium"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </button>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Patient Registration</h1>
                    <p className="text-slate-500 mt-2">Create your HealthNexa account to manage your health.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                {...register("fullName", { required: "Full name is required" })}
                                type="text"
                                placeholder="John Doe"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                            />
                        </div>
                        {errors.fullName && <p className="text-[11px] text-red-500 ml-1">{errors.fullName.message}</p>}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address"
                                    }
                                })}
                                type="email"
                                placeholder="john@example.com"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                            />
                        </div>
                        {errors.email && <p className="text-[11px] text-red-500 ml-1">{errors.email.message}</p>}
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                {...register("phoneNumber", {
                                    required: "Phone number is required",
                                    minLength: { value: 10, message: "Invalid phone number" }
                                })}
                                type="tel"
                                placeholder="+1 234 567 890"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                            />
                        </div>
                        {errors.phoneNumber && <p className="text-[11px] text-red-500 ml-1">{errors.phoneNumber.message}</p>}
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: { value: 8, message: "Must be at least 8 characters" },
                                    validate: {
                                        hasLetter: (v) => /[a-zA-Z]/.test(v) || "Must contain a letter",
                                        hasNumber: (v) => /[0-9]/.test(v) || "Must contain a number"
                                    }
                                })}
                                type={"password"}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                            />
                        </div>
                        {errors.password && <p className="text-[11px] text-red-500 ml-1">{errors.password.message}</p>}
                    </div>

                    {/* Submit Button */}
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        disabled={authLoading}
                        type="submit"
                        className="w-full py-4 cursor-pointer disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-4"
                    >
                        {authLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Creating Account...</span>
                            </>
                        ) : (
                            "Create Account"
                        )}
                    </motion.button>
                </form>

                <p className="mt-8 text-center text-sm text-slate-500">
                    Already have an account? <Link href={'/login'} className="text-blue-600 font-semibold hover:underline">Sign In</Link>
                </p>
            </motion.div>
        </div>
    )
}

export default PatientRegister