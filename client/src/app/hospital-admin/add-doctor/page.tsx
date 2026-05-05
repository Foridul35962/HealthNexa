"use client"

import React, { useState, useRef, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import {
  Plus, Trash2, Upload, User, Mail, Lock,
  Phone, Building, Clock, CreditCard, ArrowLeft,
  Stethoscope, CheckCircle2
} from 'lucide-react'
import { toast } from 'react-toastify'
import Link from 'next/link'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store/store'
import { useRouter } from 'next/navigation'
import { addDoctors, getHospital } from '@/store/slice/hospitalAdminSlice'
import { motion, AnimatePresence } from 'framer-motion'

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const AddDoctorPage = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { adminHospital, hosAdminLoading } = useSelector((state: RootState) => state.hosAdmin)
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  const { register, control, handleSubmit, setValue, formState: { errors }, watch } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
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
    const fetch = async () => {
      try {
        await dispatch(getHospital(null)).unwrap()
      } catch (error) {
        console.log(error)
      }
    }
    if (!adminHospital) fetch()
  }, [dispatch, adminHospital])
  console.log(adminHospital)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        return toast.error("Only image files are allowed")
      }
      setValue('image', file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const onSubmit = async (formData: any) => {
    try {
      const data = new FormData()
      Object.keys(formData).forEach(key => {
        if (key !== 'schedule' && key !== 'image') {
          data.append(key, formData[key])
        }
      })
      if (formData.image) data.append('image', formData.image)
      else return toast.error("Doctor image is required")

      data.append('schedule', JSON.stringify(formData.schedule))

      await dispatch(addDoctors(data)).unwrap()
      toast.success("Doctor registered successfully!")
      router.push('/hospital-admin/doctors')
    } catch (error: any) {
      toast.error(error.message || "Failed to add doctor")
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="p-4 md:p-8 bg-[#f8fafc] min-h-screen font-sans"
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div variants={fadeInUp} className="flex items-center gap-5 mb-10">
          <Link href="/hospital-admin/doctors" className="group p-3 bg-white rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all shadow-sm">
            <ArrowLeft size={22} className="text-slate-600 group-hover:text-blue-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Onboard <span className="text-blue-600">New Doctor</span></h1>
            <p className="text-slate-500 font-medium">Create a professional profile and set consultation hours.</p>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Image Upload Card */}
            <motion.div variants={fadeInUp} className="bg-white p-6 rounded-4xl shadow-sm border border-slate-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Stethoscope size={80} />
              </div>
              <label className="block text-xs font-black text-slate-400 mb-4 uppercase tracking-[0.2em] text-center">Profile Identity</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`relative w-full aspect-square rounded-3xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden cursor-pointer transition-all duration-300 ${errors.image ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50 hover:border-blue-500 hover:bg-blue-50/50'}`}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-6 text-slate-400 group-hover:text-blue-500 transition-colors">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-slate-100">
                      <Upload size={28} />
                    </div>
                    <span className="text-sm font-bold">Drop photo or click</span>
                    <p className="text-[10px] mt-1 font-medium text-slate-400 italic">PNG, JPG up to 5MB</p>
                  </div>
                )}
                <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageChange} />
              </div>
              {errors.image && <p className="text-red-500 text-[10px] font-bold mt-3 text-center uppercase tracking-wider">Doctor photo is mandatory</p>}
            </motion.div>

            {/* Fees & Chamber Card */}
            <motion.div variants={fadeInUp} className="bg-white p-8 rounded-4xl shadow-sm border border-slate-200 space-y-6">
              <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest flex items-center gap-2">Practice Details</h3>
              <FormInput
                label="Consultation Fee"
                placeholder="e.g. 800"
                type="number"
                icon={<CreditCard size={18} />}
                error={errors.consultationFee?.message}
                registration={register("consultationFee", {
                  required: "Fee is required",
                  min: { value: 0, message: "Fee cannot be negative" }
                })}
              />
              <FormInput
                label="Chamber No."
                placeholder="Room 402, Level 4"
                icon={<Building size={18} />}
                error={errors.chamberNumber?.message}
                registration={register("chamberNumber", { required: "Chamber number is required" })}
              />
              <FormInput
                label="Slot Duration (Min)"
                type="number"
                icon={<Clock size={18} />}
                error={errors.slotDuration?.message}
                registration={register("slotDuration", {
                  required: "Duration required",
                  min: { value: 5, message: "Min 5 mins" }
                })}
              />
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div variants={fadeInUp} className="bg-white p-8 rounded-4xl shadow-sm border border-slate-200">
              <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-8 flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-100">
                  <User size={16} />
                </div>
                Personal & Medical Info
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <FormInput
                  label="Full Name"
                  placeholder="Dr. Mohammad Forid"
                  error={errors.fullName?.message}
                  registration={register("fullName", { required: "Name is required" })}
                />
                <FormInput
                  label="Email Address"
                  placeholder="forid@hospital.com"
                  error={errors.email?.message}
                  registration={register("email", {
                    required: "Email is required",
                    pattern: { value: /^\S+@\S+$/i, message: "Invalid email" }
                  })}
                />
                <FormInput
                  label="Phone Number"
                  placeholder="01XXXXXXXXX"
                  error={errors.phoneNumber?.message}
                  registration={register("phoneNumber", {
                    required: "Phone is required",
                    pattern: { value: /^(?:\+88|88)?(01[3-9]\d{8})$/, message: "Invalid BD number" }
                  })}
                />
                <FormInput
                  label="Login Password"
                  type="password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  registration={register("password", {
                    required: "Password is required",
                    minLength: { value: 8, message: "Min 8 chars" },
                    validate: {
                      hasLetter: v => /[a-zA-Z]/.test(v) || "Need 1 letter",
                      hasNumber: v => /[0-9]/.test(v) || "Need 1 number"
                    }
                  })}
                />
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Medical Department</label>
                  <select
                    {...register("department", { required: "Select department" })}
                    className="w-full p-3.5 border border-slate-200 rounded-2xl bg-slate-50 text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-bold transition-all appearance-none cursor-pointer"
                  >
                    <option value="">-- Choose Department --</option>
                    {adminHospital?.specialties.map((dept, idx) => (
                      <option key={idx} value={dept}>{dept.toUpperCase()}</option>
                    ))}
                  </select>
                  {errors.department && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.department.message}</p>}
                </div>
              </div>
            </motion.div>

            {/* Schedule Section */}
            <motion.div variants={fadeInUp} className="bg-white p-8 rounded-4xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest flex items-center gap-3">
                  <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-100">
                    <Clock size={16} />
                  </div>
                  Availability Schedule
                </h3>
                <button
                  type="button"
                  onClick={() => append({ dayOfWeek: 'Sun', startTime: '09:00', endTime: '12:00' })}
                  className="group flex items-center gap-2 text-[11px] bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black hover:bg-blue-600 transition-all uppercase tracking-widest"
                >
                  <Plus size={14} className="transition-transform group-hover:rotate-90" /> Add Shift
                </button>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {fields.map((field, index) => (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="grid grid-cols-12 gap-4 p-5 bg-slate-50/50 text-black rounded-3xl border border-slate-100 items-end relative group"
                    >
                      <div className="col-span-12 md:col-span-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-wider">Working Day</label>
                        <select
                          {...register(`schedule.${index}.dayOfWeek` as const, { required: true })}
                          className="w-full p-3 border border-slate-200 rounded-xl bg-white text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none"
                        >
                          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                            <option key={day} value={day}>{day}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-5 md:col-span-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-wider">Start Time</label>
                        <input
                          type="time"
                          {...register(`schedule.${index}.startTime` as const, { required: true })}
                          className="w-full p-3 border border-slate-200 rounded-xl bg-white text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none"
                        />
                      </div>
                      <div className="col-span-5 md:col-span-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-wider">End Time</label>
                        <input
                          type="time"
                          {...register(`schedule.${index}.endTime` as const, {
                            required: true,
                            validate: (val, formValues) => {
                              const start = formValues.schedule[index].startTime;
                              return val > start || "End must be after Start";
                            }
                          })}
                          className="w-full p-3 border border-slate-200 rounded-xl bg-white text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none"
                        />
                      </div>
                      <div className="col-span-2 md:col-span-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => fields.length > 1 && remove(index)}
                          className={`p-3 rounded-xl transition-all ${fields.length > 1 ? 'text-red-400 hover:bg-red-50 hover:text-red-600' : 'text-slate-200 cursor-not-allowed'}`}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                      {errors.schedule?.[index]?.endTime && (
                        <p className="col-span-12 text-[10px] text-red-500 font-black uppercase mt-1 tracking-tighter">
                          {errors.schedule[index]?.endTime?.message}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
              <Link href="/hospital-admin/doctors" className="px-10 py-4 rounded-2xl font-black text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-all text-center uppercase tracking-widest text-xs">
                Discard
              </Link>
              <button
                type="submit"
                disabled={hosAdminLoading}
                className={`group flex items-center justify-center gap-3 px-12 py-4 rounded-2xl font-black text-white shadow-xl transition-all uppercase tracking-[0.15em] text-xs ${hosAdminLoading
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-blue-200 active:scale-95'
                  }`}
              >
                {hosAdminLoading ? (
                  <div className="flex items-center gap-3">
                    {/* Spinner Icon */}
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {/* Loading Text */}
                    <span className="animate-pulse">Registering...</span>
                  </div>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    Confirm Registration
                  </>
                )}
              </button>
            </motion.div>
          </div>
        </form>
      </div>
    </motion.div>
  )
}

const FormInput = ({ label, error, registration, icon, ...props }: any) => (
  <div className="flex flex-col gap-2">
    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
    <div className="relative group">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
          {icon}
        </div>
      )}
      <input
        {...props}
        {...registration}
        className={`block w-full ${icon ? 'pl-11' : 'pl-4'} pr-4 py-3.5 border ${error ? 'border-red-400 bg-red-50/30' : 'border-slate-200 group-focus-within:border-blue-500'} rounded-2xl bg-slate-50 text-slate-900 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-bold transition-all`}
      />
    </div>
    {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-tight">{error}</p>}
  </div>
)

export default AddDoctorPage