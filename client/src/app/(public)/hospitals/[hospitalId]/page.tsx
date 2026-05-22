"use client"

import { getHospitalDetails } from '@/store/slice/publicSlice'
import { AppDispatch, RootState } from '@/store/store'
import { useParams } from 'next/navigation'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import Link from 'next/link'
import {
    Building2,
    MapPin,
    Phone,
    Stethoscope,
    Layers,
    Calendar,
    Clock,
    DollarSign,
    ChevronRight,
    Users
} from 'lucide-react'

const HospitalDetailsPage = () => {
    const dispatch = useDispatch<AppDispatch>()
    const { fetchLoading, hospitalDetails } = useSelector((state: RootState) => state.public)
    const { user } = useSelector((state: RootState) => state.auth)
    const { hospitalId } = useParams()

    useEffect(() => {
        const fetch = async () => {
            try {
                await dispatch(getHospitalDetails({ hospitalId: hospitalId as string })).unwrap()
            } catch (error: any) {
                toast.error(error.message || "Something went wrong")
            }
        }
        if (hospitalDetails?.hospital._id !== hospitalId) {
            fetch()
        }
    }, [hospitalId, dispatch, hospitalDetails?.hospital._id])

    const handleAppointment = async (doctorId: string) => {

    }

    // Loading State / Skeleton UI
    if (fetchLoading) {
        return (
            <div className="max-w-7xl mx-auto p-6 animate-pulse space-y-8">
                <div className="h-64 bg-gray-200 rounded-2xl w-full"></div>
                <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="h-32 bg-gray-200 rounded-xl md:col-span-2"></div>
                    <div className="h-32 bg-gray-200 rounded-xl"></div>
                </div>
            </div>
        )
    }

    if (!hospitalDetails) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
                <Building2 size={48} className="mb-2 stroke-1" />
                <p>No hospital details found.</p>
            </div>
        )
    }

    const { hospital, stats, departments } = hospitalDetails

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12">
            {/* Hero / Banner Section */}
            <div className="relative bg-linear-to-r from-blue-600 to-indigo-700 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-size-[16px_16px]"></div>
                <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 grid grid-cols-1 md:grid-cols-3 gap-8 items-center relative z-10">

                    {/* Hospital Image or Fallback Placeholder */}
                    <div className="md:col-span-1 flex justify-center">
                        {hospital.image?.url ? (
                            <img
                                src={hospital.image.url}
                                alt={hospital.name}
                                className="w-full max-w-70 h-48 object-cover rounded-2xl shadow-lg border-4 border-white/20"
                            />
                        ) : (
                            <div className="w-full max-w-70 h-48 bg-white/10 rounded-2xl border-2 border-dashed border-white/30 flex flex-col items-center justify-center text-white/80">
                                <Building2 size={48} className="mb-2" />
                                <span className="text-sm font-medium">No Image Available</span>
                            </div>
                        )}
                    </div>

                    {/* Hospital Primary Info */}
                    <div className="md:col-span-2 space-y-4">
                        <span className="inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                            Hospital Profile
                        </span>
                        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">{hospital.name}</h1>

                        <div className="space-y-2 text-white/90">
                            <p className="flex items-start gap-2 text-sm md:text-base">
                                <MapPin size={18} className="shrink-0 mt-0.5 text-blue-200" />
                                <span>
                                    {hospital.address.house}, {hospital.address.street}, {hospital.address.city} - {hospital.address.postalCode}
                                </span>
                            </p>
                            <p className="flex items-center gap-2 text-sm md:text-base">
                                <Phone size={18} className="text-blue-200" />
                                <a href={`tel:${hospital.contactNumber}`} className="hover:underline">{hospital.contactNumber}</a>
                            </p>
                        </div>

                        {/* Specialties Tags */}
                        <div className="flex flex-wrap gap-2 pt-2">
                            {hospital.specialties.map((specialty, idx) => (
                                <span key={idx} className="bg-white text-blue-700 text-xs font-medium px-3 py-1 rounded-lg shadow-sm">
                                    {specialty}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Left Sidebar: Stats & Info */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Quick Stats Widget */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-2 lg:grid-cols-1 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                            <div className="p-2 bg-blue-500 rounded-lg text-white">
                                <Stethoscope size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Total Doctors</p>
                                <p className="text-xl font-bold text-gray-800">{stats.totalDoctors}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl">
                            <div className="p-2 bg-indigo-500 rounded-lg text-white">
                                <Layers size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Departments</p>
                                <p className="text-xl font-bold text-gray-800">{stats.totalDepartments}</p>
                            </div>
                        </div>
                    </div>

                    {/* NEW CARD: Main Global Redirect Button */}
                    <div className="bg-linear-to-br from-indigo-50 to-blue-50 p-5 rounded-2xl border border-blue-100/60 shadow-xs space-y-4">
                        <div>
                            <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                                <Users size={16} className="text-blue-600" /> Looking for someone else?
                            </h4>
                            <p className="text-xs text-slate-500 mt-1">
                                Showing top featured specialists panel. Browse the database to find full staff registries.
                            </p>
                        </div>
                        <Link
                            href={`/doctors/search?hospital=${hospitalId}`}
                            className="w-full text-center bg-blue-600 text-white hover:bg-blue-700 transition-all text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm"
                        >
                            View All {stats.totalDoctors} Doctors
                            <ChevronRight size={14} />
                        </Link>
                    </div>

                    {/* Operational Details Map Info */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            <MapPin size={18} className="text-gray-400" /> Location Coordinates
                        </h3>
                        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-xl border font-mono">
                            Lat: {hospital.location.coordinates[1]} <br />
                            Lng: {hospital.location.coordinates[0]}
                        </div>
                    </div>
                </div>

                {/* Right Side: Departments & Doctors List */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            Featured Specialists Panel
                        </h2>
                        {/* Secondary Contextual Link Action at Head Panel */}
                        <Link
                            href={`/doctors/search?hospital=${hospitalId}`}
                            className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 group self-start sm:self-center"
                        >
                            Search all hospital registry
                            <ChevronRight size={16} className="transform group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>

                    {departments.map((dept, deptIdx) => (
                        <div key={deptIdx} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            {/* Department Header Banner */}
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <Layers className="text-blue-600" size={20} />
                                    <h3 className="text-lg font-bold text-gray-800">{dept.department}</h3>
                                    <span className="bg-blue-100 text-blue-800 text-[11px] font-semibold px-2 py-0.5 rounded-full ml-1">
                                        Current: {dept.doctorCount}
                                    </span>
                                </div>

                                {/* Department level custom filtering dynamic route */}
                                <Link
                                    href={`/doctors/search?hospital=${hospitalId}&department=${encodeURIComponent(dept.department)}`}
                                    className="text-xs font-medium text-slate-500 hover:text-blue-600 flex items-center gap-0.5"
                                >
                                    All {dept.department} Staff
                                    <ChevronRight size={12} />
                                </Link>
                            </div>

                            {/* Doctors Cards Grid inside Department */}
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {dept.doctors.map((doc, docIdx) => (
                                    <div
                                        key={docIdx}
                                        className="group relative border border-gray-100 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 bg-white flex flex-col justify-between"
                                    >
                                        {/* Main Content Area */}
                                        <div className="space-y-4">
                                            {/* Doctor Main Row */}
                                            <div className="flex gap-4 items-start">
                                                {doc.user.image?.url ? (
                                                    <img
                                                        src={doc.user.image.url}
                                                        alt={doc.user.fullName}
                                                        className="w-14 h-14 object-cover rounded-xl border border-gray-100 shadow-xs shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-14 h-14 bg-linear-to-br from-gray-50 to-gray-100 text-gray-400 rounded-xl flex items-center justify-center shrink-0 border border-gray-100">
                                                        <Stethoscope size={24} className="opacity-70" />
                                                    </div>
                                                )}
                                                <div className="space-y-0.5">
                                                    <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200 text-base">
                                                        {doc.user.fullName}
                                                    </h4>
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-100/40">
                                                        Registered Doctor
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Consultation Meta Data */}
                                            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                                                <div className="bg-gray-50/70 p-2.5 rounded-xl border border-gray-100/50">
                                                    <p className="text-gray-400 font-medium mb-0.5">Chamber</p>
                                                    <p className="font-semibold text-gray-700">{doc.chamberNumber}</p>
                                                </div>
                                                <div className="bg-gray-50/70 p-2.5 rounded-xl border border-gray-100/50">
                                                    <p className="text-gray-400 font-medium mb-0.5">Slot Duration</p>
                                                    <p className="font-semibold text-gray-700">{doc.slotDuration} Mins</p>
                                                </div>
                                            </div>

                                            {/* Schedule Timing Row */}
                                            <div className="space-y-2">
                                                <p className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                                                    <Calendar size={14} className="text-gray-400" /> Visiting Hours:
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {doc.schedule.map((sch, schIdx) => (
                                                        <div
                                                            key={schIdx}
                                                            className="bg-slate-50/80 border border-slate-200/60 text-[11px] text-gray-600 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-2xs"
                                                        >
                                                            <span className="font-bold text-blue-600 uppercase text-[10px]">{sch.dayOfWeek}</span>
                                                            <Clock size={11} className="text-gray-400" />
                                                            <span className="font-medium">{sch.startTime} - {sch.endTime}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Fee & Action Bottom Panel */}
                                        <div className="mt-5 pt-4 border-t border-dashed border-gray-100 flex items-center justify-between">
                                            <div className="flex items-baseline text-emerald-600">
                                                <DollarSign size={16} className="self-center -mr-0.5" />
                                                <span className="text-lg font-bold tracking-tight">{doc.consultationFee}</span>
                                                <span className="text-xs text-gray-400 font-normal ml-1">/ visit</span>
                                            </div>

                                            {(!user || user.role === "patient") && (
                                                <button
                                                    onClick={() => handleAppointment(doc.doctorId)}
                                                    className="bg-blue-600 text-white cursor-pointer disabled:cursor-not-allowed hover:bg-blue-700 active:scale-[0.98] transition-all text-xs font-medium px-4 py-2 rounded-xl flex items-center gap-1 shadow-sm hover:shadow-blue-100"
                                                >
                                                    Book Appointment
                                                    <ChevronRight size={14} className="ml-0.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    )
}

export default HospitalDetailsPage