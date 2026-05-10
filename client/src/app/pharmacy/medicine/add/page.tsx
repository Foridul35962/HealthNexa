"use client"

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { AppDispatch, RootState } from '@/store/store'
import { getMedicineNames } from '@/store/slice/publicSlice'
import { toast } from 'react-toastify'

// Icons
import { Search, Loader2, Pill, AlertCircle, ShoppingCart, CheckCircle2, FlaskConical, Zap } from 'lucide-react'
import Link from 'next/link'
import { addMedicineToShop } from '@/store/slice/pharmacySlice'
import { medicineNameType } from '@/Types/publicTypes'
import { pharmacyMedicineType } from '@/Types/pharmacyTypes'

const AddMedicinePage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { medicineName } = useSelector((state: RootState) => state.public) as { medicineName: medicineNameType[] }
  const { pharmacyLoading } = useSelector((state: RootState) => state.pharmacy)

  const [searchName, setSearchName] = useState("")
  const [selectedMedicine, setSelectedMedicine] = useState<medicineNameType | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<pharmacyMedicineType>({
    defaultValues: { isAvailable: true }
  })

  const priceValue = watch("price")

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchName.length > 3 && !selectedMedicine) {
        setIsSearching(true)
        try {
          await dispatch(getMedicineNames({ medicineName: searchName })).unwrap()
          setShowResults(true)
        } catch (error: any) {
          toast.error(error.message)
        } finally {
          setIsSearching(false)
        }
      } else {
        setShowResults(false)
      }
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchName, dispatch, selectedMedicine])

  const handleSelect = (medicine: medicineNameType) => {
    setSelectedMedicine(medicine)
    setValue("medicineId", medicine._id)
    setSearchName(medicine.name)
    setShowResults(false)
  }

  const onSubmit = async (data: pharmacyMedicineType) => {
    try {
      await dispatch(addMedicineToShop({
        medicineId: data.medicineId,
        price: data.price,
        discountPrice: data.discountPrice
          ? Number(data.discountPrice)
          : undefined,
        stock: data.stock,
        isAvailable: data.isAvailable
      })).unwrap()
      toast.success("Medicine added to your shop successfully!")
      reset()
      setSelectedMedicine(null)
      setSearchName("")
    } catch (error: any) {
      console.log(error)
      toast.error(error.message)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 font-sans text-slate-900">
      <motion.div
        layout
        className="max-w-xl mx-auto bg-white/80 backdrop-blur-md rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white overflow-hidden"
      >
        {/* Header Design */}
        <div className="relative h-32 bg-slate-900 flex items-center px-8 overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="z-10">
            <h2 className="text-white text-2xl font-bold flex items-center gap-2">
              <Pill className="text-blue-400" /> Stock Intake
            </h2>
            <p className="text-slate-400 text-sm">Update your pharmacy inventory</p>
          </div>
        </div>

        <div className="p-8">
          {/* Search Box with Strength */}
          <div className="relative mb-10">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">Identify Medicine</label>
            <div className="group relative">
              <input
                type="text"
                className="w-full pl-4 pr-12 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none shadow-sm"
                placeholder="Ex: Napa Extra..."
                value={searchName}
                onChange={(e) => {
                  setSearchName(e.target.value)
                  if (selectedMedicine) setSelectedMedicine(null)
                }}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {isSearching ? <Loader2 className="w-5 h-5 text-blue-500 animate-spin" /> : <Search className="w-5 h-5 text-slate-400" />}
              </div>
            </div>

            {/* Dropdown with Detailed Info */}
            <AnimatePresence>
              {showResults && searchName.length > 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute z-30 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
                >
                  {medicineName?.length > 0 ? (
                    medicineName.map((med) => (
                      <button
                        key={med._id}
                        onClick={() => handleSelect(med)}
                        className="w-full text-left cursor-pointer p-4 hover:bg-slate-50 flex flex-col border-b border-slate-50 last:border-0 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-800">{med.name}</span>
                          <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">{med.strength}</span>
                        </div>
                        <span className="text-xs text-slate-500 mt-0.5 italic">{med.genericName}</span>
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                      <p className="font-bold text-slate-800">This medicine is not in our database.</p>
                      <p className="text-sm text-slate-500 mt-1">Please request the admin to add it.</p>

                      <Link
                        href="/pharmacy/medicine/new-request"
                        className="inline-block mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700 underline decoration-2 underline-offset-4 transition-colors"
                      >
                        Send Request to Admin
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Detailed Info Card & Form */}
          <AnimatePresence mode="wait">
            {selectedMedicine ? (
              <motion.div
                key="form-section"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                {/* Info Box (Non-editable) */}
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 grid grid-cols-1 gap-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2"><CheckCircle2 className="text-blue-500 w-5 h-5" /></div>
                  <div className="flex items-start gap-3">
                    <div className="bg-white p-2 rounded-lg shadow-sm"><FlaskConical className="w-5 h-5 text-blue-600" /></div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg leading-tight">{selectedMedicine.name} <span className="text-blue-600 ml-1">{selectedMedicine.strength}</span></h3>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-tighter mt-1">{selectedMedicine.genericName}</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase px-1">Unit Price (BDT)</label>
                      <input
                        type="number"
                        {...register("price", { required: "Required", min: 1 })}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase px-1">Stock Qty</label>
                      <input
                        type="number"
                        {...register("stock", { required: "Required", min: 1 })}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold"
                        placeholder="Qty"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase px-1 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-orange-500" /> Discount Price
                    </label>
                    <input
                      type="number"
                      {...register("discountPrice", {
                        validate: v => !v || Number(v) < Number(priceValue) || "Invalid discount"
                      })}
                      className={`w-full p-4 bg-slate-50 border rounded-2xl outline-none transition-all font-semibold ${errors.discountPrice ? 'border-rose-500' : 'border-slate-100 focus:border-blue-500'}`}
                      placeholder="Optional"
                    />
                    {errors.discountPrice && <p className="text-rose-500 text-[10px] font-bold ml-2">{errors.discountPrice.message}</p>}
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-sm font-bold text-slate-600">Mark as Active?</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" {...register("isAvailable")} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={pharmacyLoading}
                    className="w-full py-5 cursor-pointer disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-200 transition-transform active:scale-[0.98] flex items-center justify-center gap-3 tracking-wide"
                  >
                    {pharmacyLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        ADDING TO INVENTORY...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        ADD TO INVENTORY
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-16 text-center border-2 border-dashed border-slate-100 rounded-3xl"
              >
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-white shadow-inner">
                  <Search className="text-slate-300 w-8 h-8" />
                </div>
                <h4 className="text-slate-400 font-bold tracking-tight">Waiting for selection...</h4>
                <p className="text-[10px] text-slate-300 mt-1 uppercase font-black">Search for a drug to begin</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

export default AddMedicinePage