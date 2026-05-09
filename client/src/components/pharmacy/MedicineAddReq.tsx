"use client"

import React from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Plus,
    Trash2,
    ChevronRight,
    AlertCircle,
    Pill,
} from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store/store'
import { requestMedicine } from '@/store/slice/pharmacySlice'
import { toast } from 'react-toastify'

interface IMedicineForm {
    name: string
    genericName: string
    brandName?: string
    manufacturer: string
    medicineType: "tablet" | "capsule" | "syrup" | "injection" | "cream" | "ointment" | "drops" | "inhaler"
    strength: string
    category?: string
    description?: string
    requiresPrescription: boolean
    sideEffects?: { value: string }[]
}

const MEDICINE_TYPES = ["tablet", "capsule", "syrup", "injection", "cream", "ointment", "drops", "inhaler"]

const sectionVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4 },
    },
}

const inputBase =
    "w-full px-4 py-[11px] rounded-xl border-[1.5px] border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all duration-150 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"

const inputError =
    "border-red-400 bg-red-50 focus:border-red-400 focus:ring-red-100"

const RequestMedicinePage = ({ setRequestAdd }: { setRequestAdd: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<IMedicineForm>({
        defaultValues: {
            medicineType: "tablet",
            requiresPrescription: false,
            sideEffects: [{ value: "" }],
        },
    })

    const { fields, append, remove } = useFieldArray({ control, name: "sideEffects" })
    const dispatch = useDispatch<AppDispatch>()
    const { pharmacyLoading } = useSelector((state: RootState) => state.pharmacy)

    const onSubmit = async (data: any) => {
        const formattedData = {
            ...data,
            sideEffects: data.sideEffects?.map((se: { value: string }) => se.value).filter(Boolean),
        }
        try {
            await dispatch(requestMedicine(formattedData)).unwrap()
            toast.success("Medicine Request Success")
            setRequestAdd(true)
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    return (
        <div className="min-h-screen bg-[#f0f4ff] py-14 px-4">
            <div className="max-w-3xl mx-auto">

                {/* ── Header ── */}
                <motion.div
                    className="flex items-center gap-5 mb-12"
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="w-14 h-14 bg-linear-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 shrink-0">
                        <Pill className="text-white" size={26} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                            Medicine Request Form
                        </h1>
                        <p className="text-sm text-slate-500 mt-1 italic">
                            Submit comprehensive details for new pharmaceutical entries.
                        </p>
                    </div>
                </motion.div>

                {/* ── Step Indicator ── */}
                <motion.div
                    className="hidden sm:flex items-center mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                >
                    {["Basic Identification", "Specifications", "Side Effects & Details"].map((label, i) => (
                        <React.Fragment key={label}>
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                                    {i + 1}
                                </div>
                                <span className="text-xs font-semibold text-blue-600 whitespace-nowrap">{label}</span>
                            </div>
                            {i < 2 && (
                                <div className="flex-1 h-px bg-linear-to-r from-blue-200 to-slate-200 mx-3" />
                            )}
                        </React.Fragment>
                    ))}
                </motion.div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                    {/* ── Section 1: Identification ── */}
                    <motion.div
                        className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
                        custom={0}
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0 }}
                    >
                        {/* top accent bar */}
                        <div className="h-0.75 bg-linear-to-r from-blue-500 to-blue-300" />
                        <div className="p-8 space-y-6">
                            <SectionTitle badge="01 — Identification" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Field label="Medicine Name" required error={errors.name?.message}>
                                    <input
                                        className={`${inputBase} ${errors.name ? inputError : ""}`}
                                        placeholder="e.g. Napa"
                                        {...register("name", { required: "Medicine name is required" })}
                                    />
                                </Field>

                                <Field label="Generic Name" required error={errors.genericName?.message}>
                                    <input
                                        className={`${inputBase} ${errors.genericName ? inputError : ""}`}
                                        placeholder="e.g. Paracetamol"
                                        {...register("genericName", { required: "Generic name is required" })}
                                    />
                                </Field>

                                <Field label="Brand Name" optional>
                                    <input
                                        className={inputBase}
                                        placeholder="e.g. Napa Extend"
                                        {...register("brandName")}
                                    />
                                </Field>

                                <Field label="Manufacturer" required error={errors.manufacturer?.message}>
                                    <input
                                        className={`${inputBase} ${errors.manufacturer ? inputError : ""}`}
                                        placeholder="e.g. Beximco Pharma"
                                        {...register("manufacturer", { required: "Manufacturer is required" })}
                                    />
                                </Field>
                            </div>
                        </div>
                    </motion.div>

                    {/* ── Section 2: Specifications ── */}
                    <motion.div
                        className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
                        custom={1}
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.08 }}
                    >
                        <div className="h-0.75 bg-linear-to-r from-blue-500 to-blue-300" />
                        <div className="p-8 space-y-6">
                            <SectionTitle badge="02 — Specifications" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Field label="Medicine Type" required>
                                    <select
                                        className={`${inputBase} appearance-none cursor-pointer`}
                                        style={{
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                                            backgroundRepeat: "no-repeat",
                                            backgroundPosition: "right 14px center",
                                            paddingRight: "36px",
                                        }}
                                        {...register("medicineType")}
                                    >
                                        {MEDICINE_TYPES.map((type) => (
                                            <option key={type} value={type}>
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </Field>

                                <Field label="Strength" required error={errors.strength?.message}>
                                    <input
                                        className={`${inputBase} ${errors.strength ? inputError : ""}`}
                                        placeholder="e.g. 500mg or 10ml"
                                        {...register("strength", { required: "Strength is required" })}
                                    />
                                </Field>

                                <Field label="Category" optional>
                                    <input
                                        className={inputBase}
                                        placeholder="e.g. Analgesic"
                                        {...register("category")}
                                    />
                                </Field>

                                {/* Prescription checkbox */}
                                <div className="flex flex-col justify-end">
                                    <label
                                        htmlFor="prescription"
                                        className="flex items-center gap-3 px-4 h-11.5 bg-blue-50 border-[1.5px] border-blue-200 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors duration-150"
                                    >
                                        <input
                                            type="checkbox"
                                            id="prescription"
                                            className="w-4 h-4 accent-blue-600 cursor-pointer shrink-0"
                                            {...register("requiresPrescription")}
                                        />
                                        <span className="text-sm font-semibold text-blue-700 select-none">
                                            Requires Prescription
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* ── Section 3: Side Effects & Description ── */}
                    <motion.div
                        className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
                        custom={2}
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.16 }}
                    >
                        <div className="h-0.75 bg-linear-to-r from-blue-500 to-blue-300" />
                        <div className="p-8 space-y-6">
                            <SectionTitle badge="03 — Details" />

                            {/* Side Effects */}
                            <div className="space-y-3">
                                <label className="text-[12.5px] font-semibold text-slate-700 flex items-center gap-1">
                                    Side Effects
                                    <span className="text-slate-400 font-normal ml-1">(Optional)</span>
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    <AnimatePresence>
                                        {fields.map((field, index) => (
                                            <motion.div
                                                key={field.id}
                                                className="flex gap-2 items-center"
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.92 }}
                                                transition={{ duration: 0.18 }}
                                            >
                                                <input
                                                    className="flex-1 px-3.5 py-2.5 rounded-xl border-[1.5px] border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-150 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                                    placeholder="e.g. Dizziness"
                                                    {...register(`sideEffects.${index}.value` as const)}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => remove(index)}
                                                    className="w-8 h-8 shrink-0 rounded-lg border-[1.5px] border-red-200 bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 hover:text-red-500 hover:border-red-300 transition-colors duration-150"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => append({ value: "" })}
                                    className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-150 px-0.5"
                                >
                                    <Plus size={14} />
                                    Add Side Effect
                                </button>
                            </div>

                            {/* Description */}
                            <Field label="Description" optional error={errors.description?.message}>
                                <textarea
                                    rows={4}
                                    placeholder="Detailed usage notes, contraindications, or additional information..."
                                    className="w-full px-4 py-3 rounded-xl border-[1.5px] border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 outline-none resize-none transition-all duration-150 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 leading-relaxed"
                                    {...register("description", {
                                        maxLength: { value: 500, message: "Maximum 500 characters" },
                                    })}
                                />
                            </Field>
                        </div>
                    </motion.div>

                    {/* ── Submit ── */}
                    <motion.button
                        type="submit"
                        disabled={pharmacyLoading}
                        className="w-full cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-3 py-4 rounded-2xl bg-linear-to-r from-blue-600 to-blue-700 text-white text-[15px] font-bold tracking-wide shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 mt-2 disabled:opacity-80"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.32, duration: 0.4 }}
                    >
                        {pharmacyLoading ? (
                            <>
                                {/* Simple Loading Spinner */}
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Submitting Request...</span>
                            </>
                        ) : (
                            <>
                                Submit Professional Request
                                <span className="w-7 h-7 flex items-center justify-center bg-white/20 rounded-lg">
                                    <ChevronRight size={16} />
                                </span>
                            </>
                        )}
                    </motion.button>
                </form>
            </div>
        </div>
    )
}

/* ── Section Title ── */
const SectionTitle = ({ badge }: { badge: string }) => (
    <div className="flex items-center gap-3">
        <span className="bg-blue-50 border border-blue-200 text-blue-600 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap">
            {badge}
        </span>
        <div className="flex-1 h-px bg-slate-100" />
    </div>
)

/* ── Reusable Field ── */
const Field = ({
    label,
    required,
    optional,
    error,
    children,
}: {
    label: string
    required?: boolean
    optional?: boolean
    error?: string
    children: React.ReactNode
}) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[12.5px] font-semibold text-slate-700">
            {label}
            {optional && <span className="text-slate-400 font-normal ml-1">(Optional)</span>}
        </label>
        {children}
        {error && (
            <p className="flex items-center gap-1 text-[11.5px] text-red-500 font-medium mt-0.5">
                <AlertCircle size={11} />
                {error}
            </p>
        )}
    </div>
)

export default RequestMedicinePage