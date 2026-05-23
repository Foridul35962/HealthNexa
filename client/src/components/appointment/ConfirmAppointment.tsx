"use client"
import React from 'react'

interface Props {
    doctorId: string
    name: string
    hospitalName: string
    department: string
    chamberNumber: string
    consultationFee: number
    onClose: () => void
    onConfirm: () => void
}

const ConfirmAppointment = ({ doctorId, name, hospitalName, department, chamberNumber, consultationFee, onClose, onConfirm }: Props) => {
    const details = [
        { label: 'Doctor', value: `Dr. ${name}` },
        { label: 'Department', value: department },
        { label: 'Hospital', value: hospitalName },
        { label: 'Chamber', value: chamberNumber },
        { label: 'Consultation Fee', value: `৳${consultationFee}` },
    ]

    const handleAppointment = ()=>{
        console.log("appointment for", doctorId)
        onConfirm()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-0 sm:px-4">
            <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-white font-bold text-base">Confirm Appointment</h2>
                        <p className="text-blue-100 text-xs mt-0.5">Please review the details below</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/70 hover:text-white transition-colors text-xl leading-none cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    {/* Details */}
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-3">
                        <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest">
                            Appointment Summary
                        </p>
                        <div className="space-y-2.5">
                            {details.map(({ label, value }) => (
                                <div key={label} className="flex justify-between text-sm">
                                    <span className="text-slate-500">{label}</span>
                                    <span className="text-slate-800 font-semibold text-right">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl font-semibold text-sm border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAppointment}
                            className="flex-1 py-3 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer active:scale-[0.98]"
                        >
                            Confirm Booking
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default ConfirmAppointment