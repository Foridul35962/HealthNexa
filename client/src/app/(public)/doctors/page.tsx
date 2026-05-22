"use client"

import { getHospitalNames, getDoctors, setLocation } from '@/store/slice/publicSlice'
import { AppDispatch, RootState } from '@/store/store'
import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'react-toastify'
import Link from 'next/link'
import { DoctorItem, DoctorsResponseData, hospitalNameType } from '@/Types/publicTypes'

const DoctorSearchPage = () => {
    const dispatch = useDispatch<AppDispatch>()
    const router = useRouter()
    const searchParams = useSearchParams()

    // Redux Selectors
    const doctorslist = useSelector((state: RootState) => state.public.doctorslist) as DoctorsResponseData | null
    const hospitalNames = useSelector((state: RootState) => state.public.hospitalNames) as hospitalNameType[] | null
    const publicLocation = useSelector((state: RootState) => state.public.publicLocation)
    const fetchLoading = useSelector((state: RootState) => state.public.fetchLoading)

    // Component States
    const [isLocating, setIsLocating] = useState<boolean>(false)
    const [hospitalInput, setHospitalInput] = useState<string>("")
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false)
    const [isSearchingHospital, setIsSearchingHospital] = useState<boolean>(false)

    // Form Filters State
    const [filters, setFilters] = useState({
        doctorName: searchParams.get('doctorName') || "",
        hospital: searchParams.get('hospital') || "", 
        department: searchParams.get('department') || "",
        page: Number(searchParams.get('page')) || 1
    })

    const suggestionRef = useRef<HTMLDivElement>(null)

    // default page set 1
    useEffect(() => {
        if (!searchParams.get('page')) {
            const params = new URLSearchParams(searchParams.toString())
            params.set('page', '1')
            router.replace(`/doctors?${params.toString()}`)
        }
    }, [searchParams, router])

    // location set
    useEffect(() => {
        if (!publicLocation) {
            setIsLocating(true)
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const locationData = {
                            location: {
                                lat: position.coords.latitude,
                                lon: position.coords.longitude
                            }
                        }
                        dispatch(setLocation(locationData))
                        setIsLocating(false)
                    },
                    (error) => {
                        setIsLocating(false)
                        toast.error("Location access denied. Please enable location to find closest doctors.")
                    }
                );
            } else {
                setIsLocating(false)
                toast.error("Geolocation is not supported by your browser.")
            }
        }
    }, [publicLocation, dispatch])

    // hospital name fetch
    useEffect(() => {
        if (hospitalInput.trim().length < 3) {
            setShowSuggestions(false)
            return
        }

        // waste api call reduce
        const selectedHospital = hospitalNames?.find(h => h._id === filters.hospital)
        if (selectedHospital && hospitalInput === selectedHospital.name) {
            return
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsSearchingHospital(true)
            try {
                await dispatch(getHospitalNames({ hospitalName: hospitalInput.trim() })).unwrap()
                setShowSuggestions(true)
            } catch (error: any) {
                toast.error(error.message || "Failed to fetch hospitals")
            } finally {
                setIsSearchingHospital(false)
            }
        }, 2000)

        return () => clearTimeout(delayDebounceFn)
    }, [hospitalInput, dispatch, filters.hospital])

    // for hide suggesion box
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
                setShowSuggestions(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // doctor data fetch
    useEffect(() => {
        const docName = searchParams.get('doctorName') || ""
        const hospId = searchParams.get('hospital') || ""
        const dept = searchParams.get('department') || ""
        const currentPage = Number(searchParams.get('page')) || 1

        setFilters({
            doctorName: docName,
            hospital: hospId,
            department: dept,
            page: currentPage
        })

        if (!publicLocation) return;

        const fetchFilteredDoctors = async () => {
            const queryParts: string[] = []
            if (hospId) queryParts.push(`hospital=${hospId}`)
            if (dept) queryParts.push(`department=${dept}`)
            if (docName) queryParts.push(`doctorName=${docName}`)
            queryParts.push(`page=${currentPage}`)

            const searchUrlSegments = queryParts.join("&")

            try {
                await dispatch(getDoctors({
                    searchUrl: searchUrlSegments,
                    data: publicLocation
                })).unwrap()
            } catch (error: any) {
                toast.error(error?.message || "Something went wrong fetching doctors.")
            }
        }

        fetchFilteredDoctors()
    }, [searchParams, publicLocation, dispatch])

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const params = new URLSearchParams()
        if (filters.doctorName) params.set('doctorName', filters.doctorName)
        if (filters.hospital) params.set('hospital', filters.hospital)
        if (filters.department) params.set('department', filters.department)
        params.set('page', '1')

        router.push(`/doctors?${params.toString()}`)
    }

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > (doctorslist?.totalPages || 1)) return;

        const params = new URLSearchParams(searchParams.toString())
        params.set('page', newPage.toString())
        router.push(`/doctors?${params.toString()}`)
    }

    const staticDepartments = ["Cardiology", "Neurology", "Dermatology", "Orthopedics", "Medicine", "Pediatrics"]

    return (
        <div className="min-h-screen bg-slate-50/50 antialiased selection:bg-blue-500 selection:text-white">
            
            <div className="relative overflow-hidden bg-slate-900 pb-20 pt-16">
                {/* background */}
                <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
                <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
                
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center lg:text-left">
                    <div className="max-w-3xl">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-400 border border-blue-500/20">
                            ✨ Smart Health Assistant
                        </span>
                        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                            Find Nearest <span className="bg-linear-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">Top Doctors</span>
                        </h1>
                        <p className="mt-4 text-lg text-slate-400 max-w-xl">
                            Search elite medical specialists based on your instant coordinates. Access profile availability and lock entries seamless.
                        </p>
                    </div>

                    <form onSubmit={handleSearchSubmit} className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">

                            {/* doctor name input */}
                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Doctor Name</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 text-sm">👨‍⚕️</span>
                                    <input
                                        type="text"
                                        value={filters.doctorName}
                                        onChange={(e) => setFilters({ ...filters, doctorName: e.target.value })}
                                        placeholder="e.g. Dr. Sarah"
                                        className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 pl-10 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-blue-500 focus:bg-slate-950"
                                    />
                                </div>
                            </div>

                            {/* hospital suggesion */}
                            <div className="relative" ref={suggestionRef}>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Hospital Name</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 text-sm">🏥</span>
                                    <input
                                        type="text"
                                        value={hospitalInput}
                                        onChange={(e) => {
                                            setHospitalInput(e.target.value)
                                            if (e.target.value === "") {
                                                setFilters({ ...filters, hospital: "" })
                                            }
                                        }}
                                        onFocus={() => hospitalInput.trim().length >= 3 && setShowSuggestions(true)}
                                        placeholder="Type & wait 3s..."
                                        className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 pl-10 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-blue-500 focus:bg-slate-950"
                                    />
                                    {isSearchingHospital && (
                                        <div className="absolute right-3.5 top-3.5 flex h-4 w-4 items-center justify-center">
                                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                                        </div>
                                    )}
                                </div>

                                {/* suggestion box */}
                                {showSuggestions && hospitalNames && hospitalNames.length > 0 && (
                                    <div className="absolute left-0 right-0 z-50 mt-2 max-h-60 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900 p-1.5 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl">
                                        {hospitalNames.map((hosp) => (
                                            <div
                                                key={hosp._id}
                                                onClick={() => {
                                                    setFilters({ ...filters, hospital: hosp._id })
                                                    setHospitalInput(hosp.name)
                                                    setTimeout(() => setShowSuggestions(false), 100)
                                                }}
                                                className="cursor-pointer rounded-lg px-3.5 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                                            >
                                                {hosp.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* department */}
                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Department</label>
                                <select
                                    value={filters.department}
                                    onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                                    className="w-full appearance-none rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none transition-all focus:border-blue-500 focus:bg-slate-950"
                                >
                                    <option value="" className="bg-slate-900">All Departments</option>
                                    {staticDepartments.map((dept, index) => (
                                        <option key={index} value={dept} className="bg-slate-900">{dept}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    className="w-full rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/50 transition-all hover:brightness-110 active:scale-[0.98]"
                                >
                                    Apply Search
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <div className="mx-auto -mt-12 max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
                
                {/* global loading */}
                {(isLocating || fetchLoading) && !doctorslist && (
                    <div className="mb-8 flex items-center justify-center gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-sm font-medium text-blue-800 shadow-sm backdrop-blur">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                        <span>{isLocating ? "Syncing GPS relative coordinates..." : "Compiling matches..."}</span>
                    </div>
                )}

                {!fetchLoading && doctorslist?.doctors?.length === 0 && (
                    <div className="rounded-2xl bg-white p-16 mt-10 text-center border border-slate-100 shadow-sm">
                        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-2xl">🔍</span>
                        <h3 className="mt-4 text-lg font-bold text-slate-800">No Specialists Listed</h3>
                        <p className="mx-auto mt-2 max-w-xs text-sm text-slate-500">
                            We couldn&apos;t match any professionals matching current criteria. Try altering keywords.
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {fetchLoading ? (
                        Array.from({ length: 6 }).map((_, idx) => (
                            <div key={idx} className="animate-pulse rounded-2xl bg-white border border-slate-100 p-6 space-y-4 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-16 rounded-xl bg-slate-100" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-2/3 rounded bg-slate-100" />
                                        <div className="h-3 w-1/3 rounded bg-slate-100" />
                                    </div>
                                </div>
                                <div className="h-px bg-slate-100" />
                                <div className="space-y-2">
                                    <div className="h-3 w-4/5 rounded bg-slate-100" />
                                    <div className="h-3 w-1/2 rounded bg-slate-100" />
                                </div>
                            </div>
                        ))
                    ) : (
                        doctorslist?.doctors?.map((item: DoctorItem) => (
                            <div
                                key={item._id}
                                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={item.doctor?.image || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop"}
                                                alt={item.doctor?.name}
                                                className="h-16 w-16 rounded-xl object-cover ring-2 ring-slate-100 transition-transform duration-300 group-hover:scale-105"
                                            />
                                            <div>
                                                <h3 className="font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                                                    {item.doctor?.name}
                                                </h3>
                                                <span className="mt-1.5 inline-block rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                                                    {item.department}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* information block */}
                                    <div className="mt-6 space-y-2.5 border-t border-slate-50 pt-4 text-sm text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <span className="text-base text-slate-400">🏥</span>
                                            <span className="font-medium text-slate-700 truncate">{item.hospital?.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-base text-slate-400">💳</span>
                                            <span>Fee: <strong className="font-semibold text-slate-900">${item.consultationFee}</strong></span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center justify-between gap-2 border-t border-slate-50 pt-4">
                                    <div className="flex items-center gap-1 text-xs text-slate-400">
                                        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                                        <span>Nearby active</span>
                                    </div>
                                    <Link href={`/doctors/${item._id}`} className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-blue-600">
                                        Doctor Details
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* pagination panel */}
                {doctorslist && doctorslist.totalPages > 1 && (
                    <div className="mt-12 flex items-center justify-center gap-3">
                        <button
                            onClick={() => handlePageChange(filters.page - 1)}
                            disabled={filters.page === 1}
                            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
                        >
                            Previous
                        </button>

                        <div className="flex items-center gap-1.5">
                            {Array.from({ length: doctorslist.totalPages }, (_, idx) => idx + 1).map((pNum) => (
                                <button
                                    key={pNum}
                                    onClick={() => handlePageChange(pNum)}
                                    className={`h-10 w-10 rounded-xl text-sm font-bold transition-all ${
                                        filters.page === pNum
                                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                    }`}
                                >
                                    {pNum}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => handlePageChange(filters.page + 1)}
                            disabled={filters.page === doctorslist.totalPages}
                            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default DoctorSearchPage