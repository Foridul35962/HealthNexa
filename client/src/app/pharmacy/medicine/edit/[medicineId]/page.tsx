"use client"

import { editMedicineToShop, getPharMedi } from '@/store/slice/pharmacySlice'
import { AppDispatch, RootState } from '@/store/store'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Pill, 
  Loader2, 
  FlaskConical, 
  CheckCircle2, 
  Zap, 
  Save, 
  ArrowLeft 
} from 'lucide-react'

interface EditFormInputs {
  stock: number;
  price: number;
  discountPrice: number;
  isAvailable: boolean;
}

const EditMedicinePage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { medicineId } = useParams()
  const { pharmacyFetchLoading, editPharMedi, pharmacyLoading } = useSelector((state: RootState) => state.pharmacy)

  const { 
    register, 
    handleSubmit, 
    setValue, 
    watch, 
    formState: { errors } 
  } = useForm<EditFormInputs>()

  const priceValue = watch("price")

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(getPharMedi({ medicineId: medicineId as string })).unwrap()
      } catch (error: any) {
        toast.error(error.message || "Failed to fetch data")
      }
    }

    if (editPharMedi?._id !== medicineId) {
      fetchData()
    }
  }, [medicineId, editPharMedi, setValue, dispatch])

  useEffect(() => {
    if (editPharMedi) {
      setValue('stock', editPharMedi.stock)
      setValue('price', editPharMedi.price)
      setValue('discountPrice', editPharMedi.discountPrice || 0)
      setValue('isAvailable', editPharMedi.isAvailable)
    }
  }, [editPharMedi, dispatch, medicineId])

  const onSubmit = async (data: EditFormInputs) => {
    try {
      await dispatch(editMedicineToShop({ pharMediId: medicineId as string, data })).unwrap()
      toast.success("Inventory updated successfully!")
      router.back()
    } catch (error: any) {
      toast.error(error.message || "Update failed")
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 font-sans text-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto bg-white/80 backdrop-blur-md rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white overflow-hidden"
      >
        {/* Header Design */}
        <div className="relative h-32 bg-slate-900 flex items-center px-8 overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-blue-500/20 rounded-full blur-3xl" />
          <button 
            onClick={() => router.back()}
            className="absolute left-4 top-4 p-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="z-10">
            <h2 className="text-white text-2xl font-bold flex items-center gap-2">
              <Pill className="text-blue-400" /> Edit Inventory
            </h2>
            <p className="text-slate-400 text-sm">Modify stock and pricing details</p>
          </div>
        </div>

        <div className="p-8">
          {pharmacyFetchLoading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-slate-500 font-medium">Fetching medicine details...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key="form-section"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                {/* Info Box (Medicine Identity) */}
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 grid grid-cols-1 gap-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2">
                    <CheckCircle2 className="text-blue-500 w-5 h-5" />
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <FlaskConical className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg leading-tight">
                        {editPharMedi?.medicineId?.name} 
                        <span className="text-blue-600 ml-1">{editPharMedi?.medicineId?.strength}</span>
                      </h3>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-tighter mt-1">
                        {editPharMedi?.medicineId?.genericName} • {editPharMedi?.medicineId?.medicineType}
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Unit Price */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase px-1">Unit Price (BDT)</label>
                      <input
                        type="number"
                        step="0.01"
                        {...register("price", { required: "Required", min: 0 })}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold text-lg"
                        placeholder="0.00"
                      />
                    </div>
                    {/* Stock Qty */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase px-1">Stock Qty</label>
                      <input
                        type="number"
                        {...register("stock", { required: "Required", min: 0 })}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold text-lg"
                        placeholder="Qty"
                      />
                    </div>
                  </div>

                  {/* Discount Price */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase px-1 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-orange-500" /> Discount Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("discountPrice", {
                        validate: v => !v || Number(v) < Number(priceValue) || "Discount must be less than price"
                      })}
                      className={`w-full p-4 bg-slate-50 border rounded-2xl outline-none transition-all font-semibold text-lg ${errors.discountPrice ? 'border-rose-500' : 'border-slate-100 focus:border-blue-500'}`}
                      placeholder="Optional"
                    />
                    {errors.discountPrice && (
                      <p className="text-rose-500 text-[10px] font-bold ml-2 uppercase tracking-wide">
                        {errors.discountPrice.message}
                      </p>
                    )}
                  </div>

                  {/* Availability Toggle */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-600">Inventory Status</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Show to customers?</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" {...register("isAvailable")} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={pharmacyLoading}
                    className="w-full py-5 cursor-pointer disabled:cursor-not-allowed bg-slate-900 hover:bg-black text-white font-black rounded-2xl shadow-xl shadow-slate-200 transition-transform active:scale-[0.98] flex items-center justify-center gap-3 tracking-widest uppercase"
                  >
                    {pharmacyLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 text-blue-400" />
                        Update Inventory
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default EditMedicinePage