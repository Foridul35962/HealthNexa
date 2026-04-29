"use client"

import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Lock, Mail, Loader2, HeartPulse } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store/store'
import { login } from '@/store/slice/authSlice'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const LoginPage = () => {
    const dispatch = useDispatch<AppDispatch>()
    const { authLoading } = useSelector((state: RootState) => state.auth)
    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            email: '',
            password: ''
        }
    })

    const onSubmit = async (data: any) => {
        try {
            await dispatch(login(data)).unwrap()
            toast.success("Login Successful")
            router.push('/')
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 font-sans text-slate-900">
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-100 bg-white p-10 rounded-3xl shadow-sm border border-slate-100"
            >
                {/* Logo & Header */}
                <div className="flex flex-col items-center mb-10">
                    <div className="bg-blue-50 p-3 rounded-2xl mb-4">
                        <HeartPulse className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">HealthNexa</h1>
                    <p className="text-slate-500 text-sm mt-1">Enter your credentials to continue</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Email Input */}
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
                                placeholder="doctor@healthnexa.com"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                            />
                        </div>
                        {errors.email && <p className="text-[11px] text-red-500 ml-1">{errors.email.message}</p>}
                    </div>

                    {/* Password Input */}
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

                    {/* Action Button */}
                    <motion.button
                        whileHover={{ scale: 1.005 }}
                        whileTap={{ scale: 0.995 }}
                        disabled={authLoading}
                        type="submit"
                        className="w-full py-3 cursor-pointer disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {authLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Signing In...</span>
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </motion.button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-slate-500">
                        New to HealthNexa? <Link href={'/registration'} className="text-blue-600 font-semibold hover:underline">Create Account</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    )
}

export default LoginPage