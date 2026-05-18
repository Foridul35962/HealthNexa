"use client"

import React, { useEffect, useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { motion } from "framer-motion"
import {
  Store,
  Phone,
  MapPin,
  ImageIcon,
  Save,
  Clock3,
  Loader2,
} from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/store/store"
import { editPharmacy, getMyPharmacy } from "@/store/slice/pharmacySlice"
import { toast } from "react-toastify"
import EditPharmacyLoad from "@/components/loading/EditPharmacyLoad"

interface FormInput {
  name: string;
  contactNumber: string;
}

const PharmacyEditPage = () => {
  const dispatch = useDispatch<AppDispatch>()

  const { pharmacy, pharmacyFetchLoading, pharmacyLoading } = useSelector(
    (state: RootState) => state.pharmacy
  )

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")

  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInput>()

  useEffect(() => {
    const fetchPharmacyData = async () => {
      try {
        await dispatch(getMyPharmacy(null)).unwrap()
      } catch (error: any) {
        toast.error(error?.message || "Failed to fetch pharmacy data")
      }
    }
    if (!pharmacy) {
      fetchPharmacyData()
    }
  }, [dispatch, pharmacy])

  useEffect(() => {
    if (pharmacy) {
      reset({
        name: pharmacy.name || "",
        contactNumber: pharmacy.contactNumber || "",
      })
      if (pharmacy.image?.url) {
        setImagePreview(pharmacy.image.url)
      }
    }
  }, [pharmacy, reset])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed!")
        return
      }
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const onSubmit = async (data: FormInput) => {
    try {
      const formData = new FormData()
      formData.append("name", data.name.trim())
      formData.append("contactNumber", data.contactNumber.trim())
      
      if (imageFile) {
        formData.append("image", imageFile)
      }

      const updatedPharmacy = await dispatch(editPharmacy(formData)).unwrap()

      toast.success("Pharmacy updated successfully!")
      
      setImageFile(null)

      if (updatedPharmacy) {
        reset({
          name: updatedPharmacy.name || data.name,
          contactNumber: updatedPharmacy.contactNumber || data.contactNumber,
        })
        if (updatedPharmacy.image?.url) {
          setImagePreview(updatedPharmacy.image.url)
        }
      }
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong")
    }
  }

  if (pharmacyFetchLoading) {
    return <EditPharmacyLoad />
  }

  return (
    <div className="min-h-screen text-black bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Pharmacy Settings</h1>
            <p className="mt-2 text-gray-500">
              Manage your pharmacy profile details, branding and security.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* LEFT SIDE: Profile & Quick Info */}
          <div className="space-y-6 lg:col-span-1">

            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
            >
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <img
                    src={imagePreview || "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=400"}
                    alt="pharmacy"
                    className="h-28 w-28 rounded-full object-cover ring-4 ring-blue-50"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 rounded-full bg-blue-600 p-2.5 text-white shadow-md hover:bg-blue-700 transition"
                  >
                    <ImageIcon size={16} />
                  </button>
                </div>

                <h2 className="mt-4 text-xl font-bold text-gray-800 text-center">
                  {pharmacy?.name || "MediCare Pharmacy"}
                </h2>

                <p className="mt-1 text-sm text-gray-500 text-center">
                  {pharmacy?.address
                    ? `${pharmacy.address.street}, ${pharmacy.address.city}`
                    : "Location not set"}
                </p>

                <div className="mt-5 flex items-center gap-2 rounded-full bg-green-50 px-4 py-1.5 text-xs font-semibold text-green-700 border border-green-200">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                  Active Account
                </div>
              </div>
            </motion.div>

            {/* Quick Info (Read-Only) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
            >
              <h3 className="mb-5 text-lg font-bold text-gray-800">Quick Meta</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="text-gray-400 mt-0.5 shrink-0" size={18} />
                  <div className="text-sm text-gray-600">
                    <p className="font-semibold text-gray-700">Full Address</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {pharmacy?.address
                        ? `House: ${pharmacy.address.house}, ${pharmacy.address.street}, ${pharmacy.address.city} - ${pharmacy.address.postalCode}`
                        : "No address attached."}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock3 className="text-gray-400 mt-0.5 shrink-0" size={18} />
                  <div className="text-sm text-gray-600">
                    <p className="font-semibold text-gray-700">System Logs</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Created: {pharmacy?.createdAt ? new Date(pharmacy.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT SIDE: Edit Form */}
          <div className="space-y-6 lg:col-span-2">

            {/* General Settings Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
            >
              <div className="mb-6 flex items-center gap-3">
                <Store className="text-blue-600" />
                <h2 className="text-xl font-bold text-gray-800">
                  Update General Details
                </h2>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">

                  {/* Pharmacy Name Input */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Pharmacy Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. MediCare Plus"
                      className={`w-full rounded-xl border bg-gray-50 px-4 py-3 text-sm outline-none transition focus:bg-white focus:border-blue-500 ${errors.name ? "border-red-400 focus:border-red-400" : "border-gray-200"
                        }`}
                      {...register("name", { required: "Pharmacy name is required" })}
                    />
                    {errors.name && (
                      <p className="mt-1.5 text-xs text-red-500">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Contact Number Input */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Contact Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-3.5 text-gray-400" size={16} />
                      <input
                        type="text"
                        placeholder="+8801XXXXXXXXX"
                        className={`w-full rounded-xl border bg-gray-50 pl-11 pr-4 py-3 text-sm outline-none transition focus:bg-white focus:border-blue-500 ${errors.contactNumber ? "border-red-400 focus:border-red-400" : "border-gray-200"
                          }`}
                        {...register("contactNumber", {
                          required: "Contact number is required",
                          pattern: {
                            value: /^(?:\+8801|8801|01)[3-9]\d{8}$/,
                            message: "Please enter a valid Bangladeshi number",
                          },
                        })}
                      />
                    </div>
                    {errors.contactNumber && (
                      <p className="mt-1.5 text-xs text-red-500">{errors.contactNumber.message}</p>
                    )}
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={pharmacyLoading}
                    className="flex items-center cursor-pointer disabled:cursor-not-allowed gap-2 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-70"
                  >
                    {pharmacyLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Save size={18} />
                    )}
                    {pharmacyLoading ? "Saving Changes..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default PharmacyEditPage