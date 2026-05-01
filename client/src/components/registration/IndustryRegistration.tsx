"use client"

import React, { useState, useEffect, SetStateAction } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2, Mail, Lock, Phone, Home,
  Stethoscope, User, ArrowRight, Loader2,
  Map as MapIcon, LocateFixed
} from 'lucide-react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import { LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import axios from 'axios'

import L from 'leaflet'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store/store'
import { registrationHospital, registrationPharmacy } from '@/store/slice/authSlice'
import { toast } from 'react-toastify'

let DefaultIcon = L.icon({
  iconUrl: typeof markerIcon === 'string' ? markerIcon : (markerIcon as any).src,
  shadowUrl: typeof markerShadow === 'string' ? markerShadow : (markerShadow as any).src,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon

const ReCenterMap = ({ lat, lon }: { lat: number; lon: number }) => {
  const map = useMap()
  useEffect(() => {
    if (lat && lon) {
      map.setView([lat, lon], 16)
    }
  }, [lat, lon, map])
  return null
}

const IndustryRegistration = ({ setEmail, registrationType }: {
  setEmail: React.Dispatch<SetStateAction<string>>,
  registrationType: "Hospital" | "Pharmacy"
}) => {
  const [step, setStep] = useState(1)
  const [suggestions, setSuggestions] = useState([])
  const [mapPos, setMapPos] = useState({ lat: 23.8103, lon: 90.4125 })
  const [searchQuery, setSearchQuery] = useState("")
  const dispatch = useDispatch<AppDispatch>()
  const { authLoading } = useSelector((state: RootState) => state.auth)

  const { register, handleSubmit, setValue, trigger, formState: { errors } } = useForm({
    defaultValues: {
      fullName: '', email: '', phoneNumber: '', password: '',
      name: '',
      address: { house: '', street: '', city: '', postalCode: '' },
      location: { lat: 23.8103, lon: 90.4125 },
      contactNumber: '',
      specialties: ''
    }
  })

  const position: LatLngExpression = [mapPos.lat, mapPos.lon];

  // Address helper function
  const fillAddressDetails = (data: any) => {
    setValue("address.house", data.housenumber || data.building || data.name || "")
    setValue("address.city", data.city || data.state || "")
    setValue("address.street", data.street || data.suburb || "")
    setValue("address.postalCode", data.postcode || "")
  }

  // --- Debounced Address Search ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length > 3) {
        performSearch(searchQuery)
      } else {
        setSuggestions([])
      }
    }, 300)
    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const performSearch = async (val: string) => {
    try {
      const res = await axios.get(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(val)}&apiKey=${process.env.NEXT_PUBLIC_GEOAPI_KEY}`)
      setSuggestions(res.data.features)
    } catch (error) { console.error(error) }
  }

  const selectSuggestion = (feature: any) => {
    const { lat, lon } = feature.properties
    setMapPos({ lat, lon })
    setValue("location.lat", lat)
    setValue("location.lon", lon)
    fillAddressDetails(feature.properties)
    setSuggestions([])
    setSearchQuery(feature.properties.formatted)
  }

  const handleFindMe = () => {
    navigator.geolocation.getCurrentPosition(async (p) => {
      const { latitude, longitude } = p.coords
      setMapPos({ lat: latitude, lon: longitude })
      setValue("location.lat", latitude)
      setValue("location.lon", longitude)
      try {
        const res = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${process.env.NEXT_PUBLIC_GEOAPI_KEY}`)
        if (res.data.results.length > 0) {
          fillAddressDetails(res.data.results[0])
        }
      } catch (error) { console.error("Reverse Geocode Error:", error) }
    })
  }

  const onDragEnd = async (e: any) => {
    const { lat, lng } = e.target.getLatLng()
    setMapPos({ lat, lon: lng })
    setValue("location.lat", lat)
    setValue("location.lon", lng)
    try {
      const res = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${process.env.NEXT_PUBLIC_GEOAPI_KEY}`)
      if (res.data.results.length > 0) {
        fillAddressDetails(res.data.results[0])
      }
    } catch (error) { console.error(error) }
  }

  const onSubmit = async (data: any) => {
    try {
      if (registrationType === "Hospital") {
        const formattedData = {
          ...data,
          specialties: data.specialties
            ? data.specialties.split(',').map((s: string) => s.trim()).filter((s: string) => s !== "")
            : []
        }
        await dispatch(registrationHospital(formattedData)).unwrap()
        setEmail(formattedData.email)
      } else if (registrationType === "Pharmacy") {
        await dispatch(registrationPharmacy(data)).unwrap()
        setEmail(data.email)
      }
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <div className="min-h-screen text-black bg-[#f8fafc] flex items-center justify-center p-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl bg-white p-8 md:p-12 rounded-[40px] shadow-2xl border border-slate-100"
      >
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">{registrationType} Connect</h1>
          <p className="text-slate-500 mt-2">Create your professional healthcare profile</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                <div className="space-y-5">
                  <h3 className="font-bold text-blue-600 text-xs uppercase tracking-[0.2em]">Admin Credentials</h3>
                  <InputField
                    icon={<User size={18} />}
                    label="Full Name"
                    placeholder="Foridul Ibne Qauser"
                    error={errors.fullName?.message}
                    register={register("fullName", { required: "Full name is required" })}
                  />
                  <InputField
                    icon={<Mail size={18} />}
                    label="Email Address"
                    type="email"
                    placeholder="example@email.com"
                    error={errors.email?.message}
                    register={register("email", {
                      required: "Email is required",
                      pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" }
                    })}
                  />
                  <InputField
                    icon={<Phone size={18} />}
                    label="Phone Number"
                    placeholder="01712XXXXXX"
                    error={errors.phoneNumber?.message}
                    register={register("phoneNumber", {
                      required: "Phone number is required",
                      minLength: { value: 11, message: "Minimum 11 digits required" }
                    })}
                  />
                  <InputField
                    icon={<Lock size={18} />}
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    error={errors.password?.message}
                    register={register("password", {
                      required: "Password is required",
                      minLength: { value: 6, message: "Password must be at least 6 characters" }
                    })}
                  />
                </div>

                <div className="bg-blue-50 rounded-4xl p-8 flex flex-col justify-center items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
                    <Stethoscope size={32} />
                  </div>
                  <h4 className="text-xl font-bold text-slate-800">Ready to expand?</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">Join thousands of healthcare providers and manage your patients efficiently.</p>
                  <button
                    type="button"
                    onClick={async () => (await trigger(['fullName', 'email', 'phoneNumber', 'password'])) && setStep(2)}
                    className="w-full mt-4 cursor-pointer py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
                  >
                    {registrationType} Details <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="space-y-5">
                    <h3 className="font-bold text-blue-600 text-xs uppercase tracking-[0.2em]">Institutional Profile</h3>

                    <InputField
                      icon={<Building2 size={18} />}
                      label={`${registrationType} Name`}
                      placeholder={`Abc ${registrationType}`}
                      error={errors.name?.message}
                      register={register("name", { required: `${registrationType} name is required` })}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField
                        icon={<Home size={18} />}
                        label="House / Building"
                        placeholder="House 12, Floor 3"
                        error={errors.address?.house?.message}
                        register={register("address.house")}
                      />
                      <div className="relative">
                        <InputField
                          icon={<MapIcon size={18} />}
                          label="Street / Search"
                          placeholder="Enter street"
                          error={errors.address?.street?.message}
                          register={register("address.street", { required: "Street is required" })}
                          value={searchQuery}
                          onChange={(e: any) => setSearchQuery(e.target.value)}
                          autoComplete="off"
                        />
                        {suggestions.length > 0 && (
                          <ul className="absolute z-1001 w-full bg-white border border-slate-100 rounded-2xl shadow-2xl mt-2 max-h-48 overflow-y-auto">
                            {suggestions.map((s: any, i) => (
                              <li key={i} onClick={() => selectSuggestion(s)} className="p-4 hover:bg-blue-50 cursor-pointer text-sm border-b border-slate-50 last:border-0 transition-colors">
                                {s.properties.formatted}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <InputField
                        label="City"
                        type="text"
                        error={errors.address?.city?.message}
                        placeholder="Enter city"
                        register={register("address.city", { required: "City is required" })}
                      />
                      <InputField
                        label="Postal Code"
                        type="text"
                        error={errors.address?.postalCode?.message}
                        placeholder="Code"
                        register={register("address.postalCode", { required: "Postal Code required" })}
                      />
                    </div>

                    <InputField
                      icon={<Phone size={18} />}
                      label={`${registrationType} Contact Number`}
                      placeholder="01712XXXXXX"
                      error={errors.contactNumber?.message}
                      register={register("contactNumber", {
                        required: `${registrationType} contact number is required`,
                        minLength: { value: 11, message: "Minimum 11 digits required" }
                      })}
                    />

                    {registrationType === "Hospital" && <InputField
                      icon={<Stethoscope size={18} />}
                      label="Specialties (comma separated)"
                      placeholder="Cardiology, Emergency, Orthopedics"
                      error={errors.specialties?.message}
                      register={register("specialties", {
                        required: "At least one specialty is required",
                        validate: (value: string) => value.split(',').filter(s => s.trim()).length > 0 || "Please enter specialties separated by commas"
                      })}
                    />}
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end px-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Pin Location</label>
                      <button
                        type="button"
                        onClick={handleFindMe}
                        className="text-blue-600 flex items-center gap-1.5 text-xs font-bold hover:bg-blue-50 px-3 py-1.5 rounded-full transition-all"
                      >
                        <LocateFixed size={14} /> Find Me
                      </button>
                    </div>

                    <div className="h-80 w-full rounded-4xl overflow-hidden border-8 border-slate-50 shadow-inner relative z-0">
                      <MapContainer
                        center={position}
                        zoom={15}
                        className="h-full w-full"
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <ReCenterMap lat={mapPos.lat} lon={mapPos.lon} />
                        <Marker
                          position={position}
                          draggable={true}
                          eventHandlers={{ dragend: onDragEnd }}
                        />
                      </MapContainer>
                    </div>
                    <p className="text-[10px] text-slate-400 italic text-center px-4">
                      * Drag the marker and select the exact entry point of the {registrationType}.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">Back</button>
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="flex-2 py-4 bg-blue-600 text-white cursor-pointer disabled:cursor-not-allowed rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    {authLoading ? <Loader2 className="animate-spin" /> : `Register ${registrationType}`}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </motion.div>
    </div>
  )
}

const InputField = ({ icon, label, register, error, ...props }: any) => (
  <div className="space-y-1.5 w-full text-left">
    <div className="flex justify-between items-center ml-1">
      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">{label}</label>
      {error && <span className="text-[10px] text-red-500 font-semibold">{error}</span>}
    </div>
    <div className="relative group">
      {icon && (
        <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${error ? 'text-red-400' : 'text-slate-400 group-focus-within:text-blue-600'}`}>
          {icon}
        </div>
      )}
      <input
        {...register}
        {...props}
        className={`w-full ${icon ? 'pl-12' : 'px-5'} pr-5 py-4 border rounded-2xl outline-none transition-all text-sm font-medium 
          ${error
            ? 'bg-red-50/50 border-red-200 text-red-900 focus:border-red-400 focus:ring-4 focus:ring-red-500/5'
            : 'bg-slate-100 border-slate-100 text-slate-700 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5'
          } placeholder:text-slate-400`}
      />
    </div>
  </div>
)

export default IndustryRegistration;