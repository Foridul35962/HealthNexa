"use client"

import React, { useState, useRef, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import {
    Plus, Trash2, Upload, User, Mail,
    Phone, Building, Clock, CreditCard, ArrowLeft,
    Stethoscope, CheckCircle2
} from 'lucide-react'
import { toast } from 'react-toastify'
import Link from 'next/link'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store/store'
import { useParams, useRouter } from 'next/navigation'
import { editDoctor, getHospital, setEditDoctor } from '@/store/slice/hospitalAdminSlice' // updateDoctor action ta use korben
import { getDoctor } from '@/store/slice/publicSlice'
import { motion, AnimatePresence } from 'framer-motion'

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

const EditDoctorPage = () => {
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const { adminHospital, hosAdminLoading, editDoctors } = useSelector((state: RootState) => state.hosAdmin)

    const dispatch = useDispatch<AppDispatch>()
    const router = useRouter()
    const { doctorId } = useParams()

    const { register, control, handleSubmit, setValue, reset, formState: { errors } } = useForm({
        defaultValues: {
            fullName: '',
            phoneNumber: '',
            department: '',
            chamberNumber: '',
            consultationFee: '',
            slotDuration: 15,
            image: null as File | null,
            schedule: [{ dayOfWeek: 'Sun', startTime: '09:00', endTime: '12:00' }]
        }
    })

    const { fields, append, remove } = useFieldArray({ control, name: "schedule" })

    useEffect(() => {
        const initPage = async () => {
            try {
                if (!adminHospital) {
                    await dispatch(getHospital(null)).unwrap()
                }

                if (!editDoctors || editDoctors._id !== doctorId) {
                    const curr = await dispatch(getDoctor(doctorId as string)).unwrap()
                    dispatch(setEditDoctor(curr.data))
                }
            } catch (error: any) {
                toast.error(error.message || "Failed to load data")
            }
        }
        initPage()
    }, [dispatch, doctorId, adminHospital, editDoctors])

    useEffect(() => {
        if (editDoctors && editDoctors._id === doctorId && adminHospital?.specialties) {
            reset({
                fullName: editDoctors.userId?.fullName || '',
                phoneNumber: editDoctors.userId?.phoneNumber || '',
                department: editDoctors.department || '',
                chamberNumber: editDoctors.chamberNumber || '',
                consultationFee: editDoctors.consultationFee?.toString() || '',
                slotDuration: editDoctors.slotDuration || 15,
                schedule: editDoctors.schedule || []
            });

            if (editDoctors.userId?.image?.url) {
                setImagePreview(editDoctors.userId.image.url);
            }
        }
    }, [editDoctors, doctorId, reset, adminHospital]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (!file.type.startsWith('image/')) return toast.error("Only images allowed")
            setValue('image', file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const onSubmit = async (formData: any) => {
        try {
            const data = new FormData()

            data.append('fullName', formData.fullName)
            data.append('phoneNumber', formData.phoneNumber)
            data.append('department', formData.department)
            data.append('chamberNumber', formData.chamberNumber)
            data.append('consultationFee', formData.consultationFee)
            data.append('slotDuration', formData.slotDuration)
            data.append('schedule', JSON.stringify(formData.schedule))

            if (formData.image) {
                data.append('image', formData.image)
            }

            console.log(formData)
            await dispatch(editDoctor({ data, doctorId: doctorId as string })).unwrap()
            toast.success("Doctor updated successfully!")
            router.push('/hospital-admin/doctors')
        } catch (error: any) {
            toast.error(error.message || "Update failed")
        }
    }

    return (
        <motion.div initial="hidden" animate="visible" className="p-4 md:p-8 text-black bg-[#f8fafc] min-h-screen">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <motion.div variants={fadeInUp} className="flex items-center gap-5 mb-10">
                    <Link href="/hospital-admin/doctors" className="p-3 bg-white rounded-2xl border border-slate-200 hover:bg-blue-50 transition-all">
                        <ArrowLeft size={22} className="text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Edit <span className="text-blue-600">Doctor Profile</span></h1>
                        <p className="text-slate-500 font-medium">Update doctor information and availability.</p>
                    </div>
                </motion.div>

                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Image & Practice Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <motion.div variants={fadeInUp} className="bg-white p-6 rounded-4xl shadow-sm border border-slate-200">
                            <label className="block text-xs font-black text-slate-400 mb-4 uppercase text-center">Profile Photo</label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="relative w-full aspect-square rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden cursor-pointer hover:border-blue-500 transition-all"
                            >
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <Upload size={28} className="text-slate-400" />
                                )}
                                <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageChange} />
                            </div>
                        </motion.div>

                        <motion.div variants={fadeInUp} className="bg-white p-8 rounded-4xl shadow-sm border border-slate-200 space-y-6">
                            <h3 className="font-black text-slate-800 text-sm uppercase flex items-center gap-2">Practice Details</h3>
                            <FormInput label="Consultation Fee" icon={<CreditCard size={18} />} registration={register("consultationFee", { required: "Required" })} />
                            <FormInput label="Chamber No." icon={<Building size={18} />} registration={register("chamberNumber", { required: "Required" })} />
                            <FormInput label="Slot Duration" type="number" icon={<Clock size={18} />} registration={register("slotDuration")} />
                        </motion.div>
                    </div>

                    {/* Personal & Schedule Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <motion.div variants={fadeInUp} className="bg-white p-8 rounded-4xl shadow-sm border border-slate-200">
                            <h3 className="font-black text-slate-800 text-sm uppercase mb-8 flex items-center gap-3">Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormInput label="Full Name" registration={register("fullName", { required: "Name is required" })} />
                                <FormInput label="Phone Number" registration={register("phoneNumber", { required: "Phone is required" })} />
                                <div className="flex flex-col gap-2 md:col-span-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase">Department</label>
                                    <select
                                        {...register("department")}
                                        className="w-full p-3.5 border border-slate-200 rounded-2xl bg-slate-50 text-sm font-bold"
                                    >
                                        <option value="">-- Choose Department --</option>
                                        {adminHospital?.specialties.map((dept, idx) => (
                                            <option key={idx} value={dept}>{dept.toUpperCase()}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </motion.div>

                        {/* Schedule Section */}
                        <motion.div variants={fadeInUp} className="bg-white p-8 rounded-4xl shadow-sm border border-slate-200">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="font-black text-slate-800 text-sm uppercase">Availability Schedule</h3>
                                <button
                                    type="button"
                                    onClick={() => append({ dayOfWeek: 'Sun', startTime: '09:00', endTime: '12:00' })}
                                    className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase"
                                >
                                    <Plus size={14} className="inline mr-1" /> Add Shift
                                </button>
                            </div>

                            <div className="space-y-4">
                                <AnimatePresence>
                                    {fields.map((field, index) => (
                                        <motion.div key={field.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-12 gap-4 p-4 bg-slate-50 rounded-3xl items-end">
                                            <div className="col-span-12 md:col-span-4">
                                                <select {...register(`schedule.${index}.dayOfWeek` as const)} className="w-full p-3 border border-slate-200 rounded-xl bg-white text-sm font-bold">
                                                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => <option key={day} value={day}>{day}</option>)}
                                                </select>
                                            </div>
                                            <div className="col-span-5 md:col-span-3">
                                                <input type="time" {...register(`schedule.${index}.startTime` as const)} className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold" />
                                            </div>
                                            <div className="col-span-5 md:col-span-3">
                                                <input type="time" {...register(`schedule.${index}.endTime` as const)} className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold" />
                                            </div>
                                            <div className="col-span-2 md:col-span-2 flex justify-end">
                                                <button type="button" onClick={() => fields.length > 1 && remove(index)} className="p-3 text-red-400">
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </motion.div>

                        {/* Actions */}
                        <div className="flex justify-end gap-4 pt-6">
                            <button
                                type="submit"
                                disabled={hosAdminLoading}
                                className="bg-blue-600 cursor-pointer disabled:cursor-not-allowed text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg flex items-center gap-2">
                                {hosAdminLoading ? "Updating..." : <><CheckCircle2 size={18} /> Update Doctor</>}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </motion.div>
    )
}

const FormInput = ({ label, error, registration, icon, ...props }: any) => (
    <div className="flex flex-col gap-2">
        <label className="text-[11px] font-black text-slate-500 uppercase">{label}</label>
        <div className="relative">
            {icon && <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-black">{icon}</div>}
            <input {...props} {...registration} className={`w-full ${icon ? 'pl-11' : 'pl-4'} pr-4 py-3.5 border rounded-2xl bg-slate-50 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10`} />
        </div>
    </div>
)

export default EditDoctorPage