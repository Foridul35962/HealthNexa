"use client"

import { getMedicineNames, getNearestShop, setLocation, getMedicineDetails } from '@/store/slice/publicSlice'
import { AppDispatch, RootState } from '@/store/store'
import { medicineNameType, PharmacyMedicineItemType, MedicineDetailsType } from '@/Types/publicTypes'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Loader2, Search, MapPin, Phone, Info, Layers, Building2, AlertTriangle, FileText } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'

// Icons
import { CiTablets1 } from "react-icons/ci";
import { FaCapsules, FaFillDrip, FaSprayCanSparkles } from "react-icons/fa6";
import { TbMedicineSyrup } from "react-icons/tb";
import { GiLoveInjection } from "react-icons/gi";
import { IoEyedropSharp } from "react-icons/io5";
import { MdOutlineAir } from "react-icons/md";

// Medicine UI Config
const medicineConfig: any = {
  tablet: { icon: CiTablets1, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", label: "Tablet" },
  capsule: { icon: FaCapsules, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200", label: "Capsule" },
  syrup: { icon: TbMedicineSyrup, color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-200", label: "Syrup" },
  injection: { icon: GiLoveInjection, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", label: "Injection" },
  cream: { icon: FaSprayCanSparkles, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", label: "Cream" },
  ointment: { icon: FaFillDrip, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", label: "Ointment" },
  drops: { icon: IoEyedropSharp, color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-200", label: "Drops" },
  inhaler: { icon: MdOutlineAir, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200", label: "Inhaler" },
}

const NearestPharmacyPage = () => {
  const dispatch = useDispatch<AppDispatch>()

  // Redux states
  const { medicineName } = useSelector((state: RootState) => state.public) as { medicineName: medicineNameType[] }
  const { publicLoading, nearestShop, publicLocation, medicineDetails } = useSelector((state: RootState) => state.public) as {
    publicLoading: boolean;
    nearestShop: PharmacyMedicineItemType[];
    publicLocation: { lat: number; lon: number } | null;
    medicineDetails: MedicineDetailsType | null
  }

  // Local UI states
  const [searchName, setSearchName] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // 1. Debounce Medicine Name Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchName.length > 3) {
        setIsSearching(true)
        try {
          await dispatch(getMedicineNames({ medicineName: searchName })).unwrap()
          setShowResults(true)
        } catch (error: any) {
          toast.error(error.message || "Medicine fetch failed")
        } finally {
          setIsSearching(false)
        }
      } else {
        setShowResults(false)
      }
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchName, dispatch])

  // Helper function to dispatch nearest shop and medicine details APIs
  const fetchShops = async (medicineId: string, latitude: number, longitude: number) => {
    try {
      await dispatch(getNearestShop({
        medicineId,
        location: { lat: latitude, lon: longitude }
      })).unwrap()
      await dispatch(getMedicineDetails({ medicineId })).unwrap()
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch data")
    }
  };

  // 2. Select Medicine & Instant Fetch Flow (No Extra Button)
  const handleSelectAndSearch = async (medicine: medicineNameType) => {
    setSearchName(medicine.name)
    setShowResults(false)
    setHasSearched(true)

    // Case A: If location already exists in Redux Store, fetch instantly
    if (publicLocation && publicLocation.lat && publicLocation.lon) {
      await fetchShops(medicine._id, publicLocation.lat, publicLocation.lon)
      return
    }

    // Case B: If location does not exist, trigger browser geolocation API
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.")
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        // Store location in Redux
        dispatch(setLocation({ lat: latitude, lon: longitude }))

        // Fetch data instantly
        await fetchShops(medicine._id, latitude, longitude)
        setIsLocating(false)
      },
      (error) => {
        setIsLocating(false)
        if (error.code === error.PERMISSION_DENIED) {
          toast.error("Location access is required to find nearest pharmacies.")
        } else {
          toast.error("Error getting your location. Please try again.")
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header Section */}
      <header className="bg-linear-to-br from-blue-600 via-blue-700 to-indigo-800 text-white pt-16 pb-28 px-4 text-center rounded-b-4xl shadow-md">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            Find Medicines Near You
          </h1>
          <p className="text-blue-100 text-sm md:text-base max-w-md mx-auto opacity-90">
            Type medicine name and select it. We will instantly locate the nearest pharmacies with live stock.
          </p>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-4xl mx-auto -mt-12 px-4">

        {/* Search Engine Input Box */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-5 md:p-6 mb-8 relative">
          <div className="relative w-full">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
              Search Medicine Name
            </label>
            <div className="relative">
              <input
                type="text"
                className="w-full pl-11 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none font-medium text-slate-800 placeholder-slate-400 shadow-inner"
                placeholder="Type medicine name (Ex: Napa Extra, Sergel)..."
                value={searchName}
                onChange={(e) => {
                  setSearchName(e.target.value)
                  if (!e.target.value) setHasSearched(false)
                }}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Search className="w-5 h-5 text-slate-400" />
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {isSearching && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
              </div>
            </div>

            {/* Suggestions Dropdown with Dynamic Icons Mapping */}
            <AnimatePresence>
              {showResults && searchName.length > 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute z-30 w-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden max-h-64 overflow-y-auto split-y divide-slate-100"
                >
                  {medicineName?.length > 0 ? (
                    medicineName.map((med) => {
                      const config = medicineConfig[med.medicineType] || { icon: Info, color: "text-slate-500", bg: "bg-slate-50", label: med.medicineType };
                      const MedIcon = config.icon;

                      return (
                        <button
                          key={med._id}
                          type="button"
                          onClick={() => handleSelectAndSearch(med)}
                          className="w-full text-left p-4 hover:bg-slate-50/80 flex items-center gap-3 transition-colors cursor-pointer group"
                        >
                          {/* Medicine Dynamic Icon Container */}
                          <div className={`p-2.5 rounded-xl ${config.bg} ${config.color} shrink-0 transition-transform group-hover:scale-105`}>
                            <MedIcon className="w-5 h-5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center gap-2">
                              <span className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">{med.name}</span>
                              <span className="shrink-0 text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-bold border border-slate-200">{med.strength}</span>
                            </div>
                            <span className="text-xs text-slate-500 mt-0.5 flex items-center gap-1 truncate">
                              <Layers className="w-3 h-3 text-slate-400" /> {med.genericName}
                            </span>
                          </div>
                        </button>
                      )
                    })
                  ) : (
                    <div className="p-6 text-center">
                      <AlertCircle className="w-9 h-9 text-rose-500 mx-auto mb-2" />
                      <p className="font-semibold text-slate-700">This medicine is not in our database.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 3. Medicine Details Card (Shows on successful selection) */}
        <AnimatePresence>
          {medicineDetails && !publicLoading && !isLocating && (
            <motion.section
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white border-2 border-blue-100 rounded-2xl shadow-md p-5 md:p-6 mb-8 overflow-hidden relative"
            >
              {/* Badge for Type and Prescription */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  {(() => {
                    const config = medicineConfig[medicineDetails.medicineType] || { icon: Info, color: "text-slate-500", bg: "bg-slate-50", label: medicineDetails.medicineType };
                    const DetailIcon = config.icon;
                    return (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${config.bg} ${config.color} border ${config.border || "border-slate-200"}`}>
                        <DetailIcon className="w-4 h-4" /> {config.label}
                      </span>
                    )
                  })()}
                  {medicineDetails.category && (
                    <span className="bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-lg font-medium">
                      {medicineDetails.category}
                    </span>
                  )}
                </div>

                {medicineDetails.requiresPrescription ? (
                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-2.5 py-1 rounded-lg">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Rx - Prescription Required
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-lg">
                    OTC - Over The Counter
                  </span>
                )}
              </div>

              {/* Grid Layout for details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-baseline gap-1.5">
                    {medicineDetails.name}
                    <span className="text-xs font-bold text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">{medicineDetails.strength}</span>
                  </h2>
                  <p className="text-xs text-blue-600 font-bold mt-1 italic flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" /> {medicineDetails.genericName}
                  </p>

                  {medicineDetails.description && (
                    <p className="text-xs text-slate-600 mt-3 leading-relaxed bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                      {medicineDetails.description}
                    </p>
                  )}
                </div>

                <div className="space-y-3 bg-slate-50/40 p-4 rounded-xl border border-slate-100/80">
                  <div className="flex items-start gap-2">
                    <Building2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Manufacturer</span>
                      <span className="text-xs font-bold text-slate-700">{medicineDetails.manufacturer}</span>
                    </div>
                  </div>

                  {medicineDetails.sideEffects && medicineDetails.sideEffects.length > 0 && (
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Possible Side Effects</span>
                        <p className="text-xs font-semibold text-slate-600 line-clamp-2" title={medicineDetails.sideEffects.join(", ")}>
                          {medicineDetails.sideEffects.join(", ")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* 4. Results / Loading List View */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Available Stores Nearby
          </h3>

          {publicLoading || isLocating ? (
            // Skeleton Loader Blocks
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 h-40 animate-pulse space-y-3">
                  <div className="h-5 bg-slate-200 rounded w-2/3"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                  <div className="h-10 bg-slate-50 rounded w-full mt-4"></div>
                </div>
              ))}
            </div>
          ) : nearestShop && nearestShop.length > 0 ? (

            // Render Pharmacy Cards (Nearest 10 items)
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nearestShop.slice(0, 10).map((shop) => {
                const hasDiscount = !!shop.discountPrice && shop.discountPrice < shop.price;
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={shop.pharmacyId}
                    className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between group hover:border-blue-200"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h3 className="font-bold text-slate-800 text-base md:text-lg group-hover:text-blue-600 transition-colors">
                          {shop.name}
                        </h3>

                        {/* Distance Badge */}
                        <span className="shrink-0 text-xs font-extrabold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg flex items-center gap-1 border border-blue-100 shadow-xs">
                          <MapPin className="w-3 h-3 text-blue-500" />
                          {shop.distance < 1000
                            ? `${shop.distance.toFixed(0)} m`
                            : `${(shop.distance / 1000).toFixed(1)} km`
                          }
                        </span>
                      </div>

                      {/* Address Display */}
                      <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                        {shop.address.house ? `${shop.address.house}, ` : ""}{shop.address.street}, {shop.address.city} - {shop.address.postalCode}
                      </p>

                      {/* Pricing & Stock Split Row */}
                      <div className="grid grid-cols-2 gap-2 border-t border-b border-slate-50 py-3 mb-4">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-0.5">Price</span>
                          <div className="flex items-baseline gap-1">
                            {hasDiscount ? (
                              <>
                                <span className="text-base font-black text-emerald-600">৳{shop.discountPrice}</span>
                                <span className="text-xs text-slate-400 line-through">৳{shop.price}</span>
                              </>
                            ) : (
                              <span className="text-base font-black text-slate-800">৳{shop.price}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">Stock Status</span>
                          {shop.stock > 0 ? (
                            <span className="inline-block text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                              {shop.stock} Available
                            </span>
                          ) : (
                            <span className="inline-block text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                              Out of Stock
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Call Button */}
                    <a
                      href={`tel:${shop.contactNumber}`}
                      className="w-full bg-slate-50 hover:bg-blue-600 text-slate-700 hover:text-white font-bold py-2.5 rounded-xl text-xs text-center transition-all border border-slate-200/70 flex items-center justify-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Store: {shop.contactNumber}</span>
                    </a>
                  </motion.div>
                )
              })}
            </div>
          ) : hasSearched ? (

            // Clean Empty State
            <div className="text-center bg-white rounded-2xl border border-slate-100 p-12 shadow-sm">
              <Info className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h3 className="font-bold text-slate-800">No Pharmacies Found</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto mt-1">
                We couldn't find any pharmacy with this medicine in your current radius.
              </p>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  )
}

export default NearestPharmacyPage