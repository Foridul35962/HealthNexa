"use client"

import { AppDispatch, RootState } from '@/store/store'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react'
import { resetPass } from '@/store/slice/authSlice'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

const ResetPass = ({ email }: { email: string }) => {
    const { authLoading } = useSelector((state: RootState) => state.auth)
    const dispatch = useDispatch<AppDispatch>()
    const router = useRouter()

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            password: '',
            confirmPassword: ''
        }
    })

    const newPassword = watch("password")

    const onSubmit = async (data: any) => {
        try {
            await dispatch(resetPass({ email, password: data.password })).unwrap()
            toast.success("Password Updated")
            router.push("/login")
        } catch (error:any) {
            toast.error(error.message)
        }
    }

    return (
        <div className="min-h-screen text-black bg-[#e4e6e8] flex items-center justify-center p-6 font-sans">
            {/* Background Glow */}
            <div className="fixed inset-0 overflow-hidden -z-10">
                <div className="absolute top-[-10%] right-[-10%] w-100 h-100 rounded-full bg-blue-50/50 blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-115 bg-white p-10 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-100"
            >
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-[22px] mb-6 text-white shadow-xl shadow-blue-100">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Set New Password</h1>
                    <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                        Create a strong password to protect your <br/> HealthNexa account for <span className="font-semibold text-slate-900">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* New Password Field */}
                    <div className="space-y-2">
                        <label className="text-[13px] font-semibold text-slate-600 ml-1">NEW PASSWORD</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                <Lock size={18} />
                            </div>
                            <input
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: { value: 8, message: "At least 8 characters" },
                                    validate: {
                                        hasLetter: (v) => /[a-zA-Z]/.test(v) || "Must contain a letter",
                                        hasNumber: (v) => /[0-9]/.test(v) || "Must contain a number"
                                    }
                                })}
                                type={"password"}
                                placeholder="••••••••"
                                className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm"
                            />
                        </div>
                        <AnimatePresence mode="wait">
                            {errors.password && (
                                <motion.p initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className="text-[11px] text-red-500 ml-1 font-medium">
                                    {errors.password.message}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Confirm Password Field */}
                    <div className="space-y-2">
                        <label className="text-[13px] font-semibold text-slate-600 ml-1">CONFIRM PASSWORD</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                <Lock size={18} />
                            </div>
                            <input
                                {...register("confirmPassword", {
                                    required: "Please confirm your password",
                                    validate: (value) => value === newPassword || "Passwords do not match"
                                })}
                                type={"password"}
                                placeholder="••••••••"
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm"
                            />
                        </div>
                        <AnimatePresence mode="wait">
                            {errors.confirmPassword && (
                                <motion.p initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className="text-[11px] text-red-500 ml-1 font-medium">
                                    {errors.confirmPassword.message}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        disabled={authLoading}
                        type="submit"
                        className="w-full py-4 bg-slate-900 cursor-pointer disabled:cursor-not-allowed hover:bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-2 disabled:bg-slate-300"
                    >
                        {authLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Updating Password...</span>
                            </>
                        ) : (
                            <>
                                <span>Reset Password</span>
                                <CheckCircle2 size={18} />
                            </>
                        )}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    )
}

export default ResetPass