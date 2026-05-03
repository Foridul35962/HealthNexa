"use client"

import { getRequestHospital } from '@/store/slice/adminSlice'
import { AppDispatch, RootState } from '@/store/store'
import { useParams } from 'next/navigation'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { 
  Building2, Mail, Phone, MapPin, 
  Calendar, User, Activity, ArrowLeft, 
  CheckCircle, XCircle, Clock
} from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// Leaflet dynamic import (SSR avoid korar jonno)
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Leaflet marker icon fix
const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

const HospitalDetailsPage = () => {
  const { hospitalId } = useParams()
  const { adminFetchLoading, hospitalRequest } = useSelector((state: RootState) => state.admin)
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    const fetch = async () => {
      try {
        await dispatch(getRequestHospital({ hospitalId: hospitalId as string })).unwrap()
      } catch (error: any) {
        toast.error(error.message)
      }
    }
    if (hospitalId && hospitalId !== hospitalRequest?._id) {
      fetch()
    }
  }, [hospitalId, dispatch, hospitalRequest?._id])

  if (adminFetchLoading || !hospitalRequest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold animate-pulse">Loading Hospital Data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Navigation & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Link href="/admin/hospital-requests" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-sm">
            <ArrowLeft size={18} /> Back to Requests
          </Link>
          
          <div className="flex items-center gap-3">
            <button className="px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-bold flex items-center gap-2 hover:bg-red-100 transition-all">
              <XCircle size={18} /> Reject
            </button>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all">
              <CheckCircle size={18} /> Approve Registration
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Details (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* General Info Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-4xl p-8 shadow-sm border border-slate-100"
            >
              <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-50">
                <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600">
                  <Building2 size={40} />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-slate-900 capitalize">{hospitalRequest.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      <Clock size={12} /> Pending Verification
                    </span>
                    <span className="text-slate-400 text-sm">• Requested on {new Date(hospitalRequest.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <DetailItem icon={<User size={20}/>} label="Admin Full Name" value={hospitalRequest.fullName} />
                <DetailItem icon={<Mail size={20}/>} label="Official Email" value={hospitalRequest.email} />
                <DetailItem icon={<Phone size={20}/>} label="Admin Phone" value={hospitalRequest.phoneNumber} />
                <DetailItem icon={<Activity size={20}/>} label="Emergency Contact" value={hospitalRequest.contactNumber} />
              </div>
            </motion.div>

            {/* Specialties & Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-4xl p-8 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Hospital Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {hospitalRequest.specialties.map((spec: string, i: number) => (
                    <span key={i} className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold border border-slate-100 capitalize">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-4xl p-8 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Physical Address</h3>
                <div className="space-y-3">
                  <p className="text-slate-600 leading-relaxed font-medium">
                    <span className="block text-[11px] text-slate-400 font-bold uppercase mb-1">Street Address</span>
                    {hospitalRequest.address.street}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[11px] text-slate-400 font-bold uppercase mb-1">City</span>
                      <p className="font-bold text-slate-800">{hospitalRequest.address.city}</p>
                    </div>
                    <div>
                      <span className="block text-[11px] text-slate-400 font-bold uppercase mb-1">Postal Code</span>
                      <p className="font-bold text-slate-800">{hospitalRequest.address.postalCode}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Map (1/3 width) */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-white rounded-[40px] p-4 shadow-xl border border-slate-100 h-150 flex flex-col">
               <div className="px-4 py-4 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800">Geographic Location</h3>
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                    <MapPin size={16} />
                  </div>
               </div>

               <div className="flex-1 rounded-4xl overflow-hidden border border-slate-100 relative z-0">
                  <MapContainer 
                    center={[hospitalRequest.location.coordinates[0], hospitalRequest.location.coordinates[1]]} 
                    zoom={15} 
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker 
                      position={[hospitalRequest.location.coordinates[0], hospitalRequest.location.coordinates[1]]}
                      icon={customIcon}
                    />
                  </MapContainer>
               </div>
               
               <div className="p-6 space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs text-slate-400 font-bold uppercase mb-2">Coordinates</p>
                    <div className="flex justify-between font-mono text-sm">
                      <span className="text-slate-600">LAT: {hospitalRequest.location.coordinates[0]}</span>
                      <span className="text-slate-600">LON: {hospitalRequest.location.coordinates[1]}</span>
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

const DetailItem = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
  <div className="flex items-start gap-4">
    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
      {icon}
    </div>
    <div>
      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{label}</p>
      <p className="text-slate-800 font-bold">{value || 'N/A'}</p>
    </div>
  </div>
)

export default HospitalDetailsPage