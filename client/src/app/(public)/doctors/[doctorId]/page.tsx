"use client"

import { getDoctorById } from '@/store/slice/publicSlice'
import { AppDispatch, RootState } from '@/store/store'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import Link from 'next/link'
import Image from 'next/image'
import ConfirmAppointment from '@/components/appointment/ConfirmAppointment'
import DoctorDetailsLoad from '@/components/loading/DoctorDetailsLoad'

const page = () => {
    const { doctorId } = useParams()
    const dispatch = useDispatch<AppDispatch>()
    const { fetchLoading, doctorInfo } = useSelector((state: RootState) => state.public)
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        const fetch = async () => {
            try {
                await dispatch(getDoctorById({ doctorId: doctorId as string })).unwrap()
            } catch (error: any) {
                toast.error(error.message)
            }
        }
        if (doctorId !== doctorInfo?._id) {
            fetch()
        }
    }, [dispatch, doctorId])

    if (fetchLoading) {
        return (
            <DoctorDetailsLoad />
        )
    }

    if (!doctorInfo) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 max-w-sm w-full text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl mx-auto mb-4">
                    🩺
                </div>
                <h2 className="text-lg font-bold text-slate-800 mb-1">Doctor Not Found</h2>
                <p className="text-slate-500 text-sm mb-6">
                    The doctor you're looking for doesn't exist or may have been removed.
                </p>
                <Link
                    href="/doctors"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all active:scale-95"
                >
                    Browse Doctors
                </Link>
            </div>
        </div>
    )

    const { userId, hospitalId, department, chamberNumber, consultationFee, slotDuration, schedule } = doctorInfo

    const dayLabels: Record<string, string> = {
        Sun: 'Sunday', Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday',
        Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday',
    }

    const formatTime = (time: string) => {
        const [h, m] = time.split(':').map(Number)
        const ampm = h >= 12 ? 'PM' : 'AM'
        const hour = h % 12 || 12
        return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`
    }

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4">
            <div className="max-w-3xl mx-auto space-y-5">

                {/* Doctor Header Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-blue-50 border border-blue-100">
                            {userId?.image?.url ? (
                                <Image
                                    src={userId.image.url}
                                    alt={userId.fullName}
                                    width={96}
                                    height={96}
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-400 text-3xl font-bold">
                                    {userId?.fullName?.charAt(0)}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="text-2xl font-bold text-slate-800">
                            Dr. {userId?.fullName}
                        </h1>
                        <p className="text-blue-600 font-semibold capitalize mt-0.5 text-sm tracking-wide">
                            {department}
                        </p>

                        <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                                🏥 Chamber {chamberNumber}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                                ⏱ {slotDuration} min slots
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                                💳 ৳{consultationFee} fee
                            </span>
                        </div>
                    </div>

                    {/* Book Appointment Button */}
                    <div className="shrink-0">
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-sm cursor-pointer">
                            Book Appointment
                        </button>
                    </div>
                </div>

                {/* Hospital Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">
                        Hospital
                    </h2>
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 text-lg shrink-0">
                            🏨
                        </div>
                        <div className="flex-1">
                            <Link
                                href={`/hospitals/${hospitalId?._id}`}
                                className="text-blue-600 hover:text-blue-800 hover:underline font-semibold text-base transition-colors"
                            >
                                {hospitalId?.name}
                            </Link>
                            <p className="text-slate-500 text-sm mt-1">
                                {[
                                    hospitalId?.address?.house,
                                    hospitalId?.address?.street,
                                    hospitalId?.address?.city,
                                    hospitalId?.address?.postalCode,
                                ]
                                    .filter(Boolean)
                                    .join(', ')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Schedule Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">
                        Weekly Schedule
                    </h2>
                    {schedule && schedule.length > 0 ? (
                        <div className="space-y-3">
                            {schedule.map((slot: any) => (
                                <div
                                    key={slot._id}
                                    className="flex items-center justify-between bg-slate-50 hover:bg-blue-50 transition-colors rounded-xl px-4 py-3 border border-slate-100"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                                            {slot.dayOfWeek}
                                        </span>
                                        <span className="text-slate-700 font-medium text-sm">
                                            {dayLabels[slot.dayOfWeek] ?? slot.dayOfWeek}
                                        </span>
                                    </div>
                                    <span className="text-blue-700 font-semibold text-sm bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                                        {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-400 text-sm">No schedule available.</p>
                    )}
                </div>

            </div>

            {/* Appointment Modal */}
            {showModal && (
                <ConfirmAppointment
                    doctorId={doctorId as string}
                    name={userId?.fullName}
                    hospitalName={hospitalId?.name}
                    department={department}
                    chamberNumber={chamberNumber}
                    consultationFee={consultationFee}
                    onClose={() => setShowModal(false)}
                    onConfirm={() => {
                        setShowModal(false)
                        toast.success('Appointment booked successfully!')
                    }}
                />
            )}
        </div>
    )
}

export default page