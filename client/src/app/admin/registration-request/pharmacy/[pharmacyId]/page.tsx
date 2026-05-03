"use client"

import { getRequestPharmacy } from '@/store/slice/adminSlice'
import { AppDispatch, RootState } from '@/store/store'
import { useParams } from 'next/navigation'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { 
  Pill, Mail, Phone, MapPin, 
  Calendar, User, Store, ArrowLeft, 
  CheckCircle, XCircle, Clock, Smartphone
} from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// Leaflet dynamic import for Next.js SSR
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Leaflet marker fix
const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

const PharmacyDetailsPage = () => {
  const { pharmacyId } = useParams()
  const { adminFetchLoading, pharmacyRequest } = useSelector((state: RootState) => state.admin)
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    const fetch = async () => {
      try {
        await dispatch(getRequestPharmacy({ pharmacyId: pharmacyId as string })).unwrap()
      } catch (error: any) {
        toast.error(error.message)
      }
    }
    if (pharmacyId && pharmacyId !== pharmacyRequest?._id) {
      fetch()
    }
  }, [pharmacyId, dispatch, pharmacyRequest?._id])

  if (adminFetchLoading || !pharmacyRequest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50/20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-emerald-700 font-bold animate-pulse">Fetching Pharmacy Details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Link href="/admin/pharmacy-requests" className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors font-bold text-sm">
            <ArrowLeft size={18} /> Back to Pharmacy Requests
          </Link>
          
          <div className="flex items-center gap-3">
            <button className="px-6 py-3 bg-white text-red-500 border border-red-100 rounded-2xl font-bold flex items-center gap-2 hover:bg-red-50 transition-all">
              <XCircle size={18} /> Decline
            </button>
            <button className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all">
              <CheckCircle size={18} /> Approve Partner
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Details Section */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-4xl p-8 shadow-sm border border-slate-100"
            >
              <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-50">
                <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                  <Pill size={40} />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-slate-900 capitalize">{pharmacyRequest.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                      <Clock size={12} /> Pending Approval
                    </span>
                    <span className="text-slate-400 text-sm">• Received on {new Date(pharmacyRequest.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InfoBlock icon={<User size={20}/>} label="Pharmacist / Admin" value={pharmacyRequest.fullName} />
                <InfoBlock icon={<Mail size={20}/>} label="Business Email" value={pharmacyRequest.email} />
                <InfoBlock icon={<Smartphone size={20}/>} label="Personal Number" value={pharmacyRequest.phoneNumber} />
                <InfoBlock icon={<Phone size={20}/>} label="Pharmacy Contact" value={pharmacyRequest.contactNumber} />
              </div>
            </motion.div>

            {/* Address Card */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
               className="bg-white rounded-4xl p-8 shadow-sm border border-slate-100"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                        <Store size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Pharmacy Location Details</h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <p className="text-slate-600 font-medium leading-relaxed">
                            <span className="block text-[11px] text-slate-400 font-bold uppercase mb-1">House/Area</span>
                            {pharmacyRequest.address.house || 'Not Specified'}
                        </p>
                        <p className="text-slate-600 font-medium leading-relaxed">
                            <span className="block text-[11px] text-slate-400 font-bold uppercase mb-1">Street Address</span>
                            {pharmacyRequest.address.street}
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl">
                            <span className="block text-[11px] text-slate-400 font-bold uppercase mb-1">City</span>
                            <p className="font-bold text-slate-800">{pharmacyRequest.address.city}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl">
                            <span className="block text-[11px] text-slate-400 font-bold uppercase mb-1">Postal Code</span>
                            <p className="font-bold text-slate-800">{pharmacyRequest.address.postalCode}</p>
                        </div>
                    </div>
                </div>
            </motion.div>
          </div>

          {/* Sticky Map Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-white rounded-[40px] p-4 shadow-xl border border-slate-100 h-145 flex flex-col">
               <div className="px-4 py-4 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800">Verification Map</h3>
                  <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                    <MapPin size={16} />
                  </div>
               </div>

               <div className="flex-1 rounded-4xl overflow-hidden border border-slate-100 relative z-0">
                  <MapContainer 
                    center={[pharmacyRequest.location.coordinates[0], pharmacyRequest.location.coordinates[1]]} 
                    zoom={16} 
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker 
                      position={[pharmacyRequest.location.coordinates[0], pharmacyRequest.location.coordinates[1]]}
                      icon={customIcon}
                    />
                  </MapContainer>
               </div>
               
               <div className="p-5">
                  <div className="flex items-center gap-4 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                    <div className="text-xs text-emerald-700 font-medium">
                        Coordinates: <span className="font-mono ml-2">
                          {pharmacyRequest.location.coordinates[0].toFixed(4)}, {pharmacyRequest.location.coordinates[1].toFixed(4)}
                        </span>
                    </div>
                  </div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

const InfoBlock = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
  <div className="flex items-start gap-4 group">
    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
      {icon}
    </div>
    <div>
      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{label}</p>
      <p className="text-slate-800 font-bold group-hover:text-emerald-700 transition-colors">{value || 'N/A'}</p>
    </div>
  </div>
)

export default PharmacyDetailsPage