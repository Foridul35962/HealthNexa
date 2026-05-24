"use client"

import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
  Activity,
  User,
  Clock,
  Thermometer,
  HeartPulse,
  AlertCircle,
  Pill,
  ShieldAlert,
  FileText,
  Plus,
  X,
  Loader2
} from 'lucide-react'

import SymptomCheckerWithOutAI from '@/components/symptomCheck/SymptomCheckWithOutAI'
import { symptomCheck } from '@/store/slice/aiSlice'
import { AppDispatch, RootState } from '@/store/store'
import { useRouter } from 'next/navigation'

export interface SymptomCheckRequestType {
  age: number;
  gender: "male" | "female" | "other";
  symptoms: string[];
  duration?: string;
  temperature?: number;
  bloodPressure?: string;
  existingConditions?: string[];
  currentMedications?: string[];
  allergies?: string[];
  additionalNotes?: string;
}

const Page = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.auth)
  const { aiLoading, aiResult } = useSelector((state: RootState) => state.ai)
  const router = useRouter()

  // Array inputs internal state tracking for dynamic tags
  const [currentSymptom, setCurrentSymptom] = useState('')
  const [currentCondition, setCurrentCondition] = useState('')
  const [currentMed, setCurrentMed] = useState('')
  const [currentAllergy, setCurrentAllergy] = useState('')

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<SymptomCheckRequestType>({
    defaultValues: {
      age: undefined,
      gender: "male",
      symptoms: [],
      duration: '',
      temperature: undefined,
      bloodPressure: '',
      existingConditions: [],
      currentMedications: [],
      allergies: [],
      additionalNotes: ''
    }
  })

  // Watch arrays for rendering chips
  const watchedSymptoms = watch('symptoms') || []
  const watchedConditions = watch('existingConditions') || []
  const watchedMeds = watch('currentMedications') || []
  const watchedAllergies = watch('allergies') || []

  if (!user) {
    return <SymptomCheckerWithOutAI />
  }

  const onSubmit = async (data: SymptomCheckRequestType) => {
    if (watchedSymptoms.length === 0) {
      toast.error('Please add at least one symptom.')
      return
    }

    try {
      const formattedData = {
        ...data,
        age: Number(data.age),
        temperature: data.temperature ? Number(data.temperature) : undefined
      }
      const response = await dispatch(symptomCheck(formattedData)).unwrap()

      if (response && response.data._id) {
        router.push(`/symptoms/${response.data._id}`)
      }
      toast.success('Symptom check completed successfully!')
    } catch (error: any) {
      toast.error(error?.message || 'Something went wrong')
    }
  }

  // Helper functions to manage array additions/removals
  const addTag = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    fieldName: keyof SymptomCheckRequestType,
    currentArray: string[]
  ) => {
    if (!value.trim()) return
    if (currentArray.includes(value.trim())) {
      toast.warn('This item is already added')
      return
    }
    setValue(fieldName, [...currentArray, value.trim()] as any)
    setter('')
  }

  const removeTag = (
    indexToRemove: number,
    fieldName: keyof SymptomCheckRequestType,
    currentArray: string[]
  ) => {
    setValue(fieldName, currentArray.filter((_, i) => i !== indexToRemove) as any)
  }

  return (
    <div className="min-h-screen bg-blue-100 text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto backdrop-blur-sm bg-white/90 border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
          <Activity className="w-8 h-8 text-emerald-600 animate-pulse" />
          <div>
            <h1 className="text-2xl font-bold bg-linear-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              AI Symptom Analyzer
            </h1>
            <p className="text-sm text-slate-500">Provide details below to get an intelligent health assessment.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Age and Gender Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <User className="w-4 h-4 text-emerald-600" /> Age <span className="text-rose-600">*</span>
              </label>
              <input
                type="number"
                {...register('age', { required: 'Age is required', min: { value: 0, message: 'Invalid age' } })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="e.g. 25"
              />
              {errors.age && <p className="text-rose-600 text-xs mt-1">{errors.age.message}</p>}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <User className="w-4 h-4 text-emerald-600" /> Gender <span className="text-rose-600">*</span>
              </label>
              <select
                {...register('gender', { required: 'Gender is required' })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors appearance-none"
              >
                <option value="male" className="bg-white">Male</option>
                <option value="female" className="bg-white">Female</option>
                <option value="other" className="bg-white">Other</option>
              </select>
            </div>
          </div>

          {/* Dynamic Symptoms Section */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Activity className="w-4 h-4 text-emerald-600" /> Symptoms <span className="text-rose-600">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentSymptom}
                onChange={(e) => setCurrentSymptom(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag(currentSymptom, setCurrentSymptom, 'symptoms', watchedSymptoms)
                  }
                }}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="Press Enter or click Add (e.g. Headache, Dry Cough)"
              />
              <button
                type="button"
                onClick={() => addTag(currentSymptom, setCurrentSymptom, 'symptoms', watchedSymptoms)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 rounded-xl flex items-center justify-center border border-slate-200 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Chips Container */}
            <div className="flex flex-wrap gap-2 mt-3">
              <AnimatePresence>
                {watchedSymptoms.map((symptom, index) => (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    key={`symptom-${index}`}
                    className="flex items-center gap-1.5 bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-medium px-3 py-1.5 rounded-full"
                  >
                    {symptom}
                    <button type="button" onClick={() => removeTag(index, 'symptoms', watchedSymptoms)}>
                      <X className="w-3.5 h-3.5 hover:text-rose-600 transition-colors" />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Duration, Temperature, Blood Pressure Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Clock className="w-4 h-4 text-emerald-600" /> Duration
              </label>
              <input
                type="text"
                {...register('duration')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="e.g. 3 days, 1 week"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Thermometer className="w-4 h-4 text-emerald-600" /> Temp (°C)
              </label>
              <input
                type="number"
                step="0.1"
                {...register('temperature')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="e.g. 37.5"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <HeartPulse className="w-4 h-4 text-emerald-600" /> Blood Pressure
              </label>
              <input
                type="text"
                {...register('bloodPressure')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="e.g. 120/80"
              />
            </div>
          </div>

          {/* Existing Conditions Input */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <AlertCircle className="w-4 h-4 text-emerald-600" /> Existing Conditions
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentCondition}
                onChange={(e) => setCurrentCondition(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag(currentCondition, setCurrentCondition, 'existingConditions', watchedConditions)
                  }
                }}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="e.g. Diabetes, Hypertension"
              />
              <button
                type="button"
                onClick={() => addTag(currentCondition, setCurrentCondition, 'existingConditions', watchedConditions)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 rounded-xl border border-slate-200 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <AnimatePresence>
                {watchedConditions.map((cond, index) => (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    key={`condition-${index}`}
                    className="flex items-center gap-1.5 bg-blue-100 border border-blue-200 text-blue-800 text-xs font-medium px-3 py-1.5 rounded-full"
                  >
                    {cond}
                    <button type="button" onClick={() => removeTag(index, 'existingConditions', watchedConditions)}>
                      <X className="w-3.5 h-3.5 hover:text-rose-600 transition-colors" />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Current Medications Input */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Pill className="w-4 h-4 text-emerald-600" /> Current Medications
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentMed}
                onChange={(e) => setCurrentMed(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag(currentMed, setCurrentMed, 'currentMedications', watchedMeds)
                  }
                }}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="e.g. Metformin, Aspirin"
              />
              <button
                type="button"
                onClick={() => addTag(currentMed, setCurrentMed, 'currentMedications', watchedMeds)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 rounded-xl border border-slate-200 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <AnimatePresence>
                {watchedMeds.map((med, index) => (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    key={`med-${index}`}
                    className="flex items-center gap-1.5 bg-purple-100 border border-purple-200 text-purple-800 text-xs font-medium px-3 py-1.5 rounded-full"
                  >
                    {med}
                    <button type="button" onClick={() => removeTag(index, 'currentMedications', watchedMeds)}>
                      <X className="w-3.5 h-3.5 hover:text-rose-600 transition-colors" />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Allergies Input */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <ShieldAlert className="w-4 h-4 text-emerald-600" /> Allergies
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentAllergy}
                onChange={(e) => setCurrentAllergy(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag(currentAllergy, setCurrentAllergy, 'allergies', watchedAllergies)
                  }
                }}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="e.g. Penicillin, Peanuts"
              />
              <button
                type="button"
                onClick={() => addTag(currentAllergy, setCurrentAllergy, 'allergies', watchedAllergies)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 rounded-xl border border-slate-200 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <AnimatePresence>
                {watchedAllergies.map((allergy, index) => (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    key={`allergy-${index}`}
                    className="flex items-center gap-1.5 bg-amber-100 border border-amber-200 text-amber-800 text-xs font-medium px-3 py-1.5 rounded-full"
                  >
                    {allergy}
                    <button type="button" onClick={() => removeTag(index, 'allergies', watchedAllergies)}>
                      <X className="w-3.5 h-3.5 hover:text-rose-600 transition-colors" />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Additional Notes Area */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <FileText className="w-4 h-4 text-emerald-600" /> Additional Notes
            </label>
            <textarea
              {...register('additionalNotes')}
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
              placeholder="Any other details you would like to share..."
            />
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={aiLoading}
            className="w-full bg-linear-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-semibold py-3 px-4 rounded-xl shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {aiLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing Symptoms...
              </>
            ) : (
              'Analyze with AI'
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}

export default Page