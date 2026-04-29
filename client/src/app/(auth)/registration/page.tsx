"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, Building2, Pill, ArrowRight } from 'lucide-react'

const SelectionPage = () => {
    const router = useRouter()

    const roles = [
        {
            title: 'Patient',
            description: 'Book appointments, track your health records, and connect with doctors.',
            icon: <User className="w-8 h-8" />,
            path: '/registration/patient',
            color: 'bg-blue-600',
            lightColor: 'bg-blue-50',
            textColor: 'text-blue-600'
        },
        {
            title: 'Hospital',
            description: 'Manage medical staff, patient admissions, and healthcare workflows.',
            icon: <Building2 className="w-8 h-8" />,
            path: '/registration/hospital',
            color: 'bg-emerald-600',
            lightColor: 'bg-emerald-50',
            textColor: 'text-emerald-600'
        },
        {
            title: 'Pharmacy',
            description: 'Process prescriptions, manage inventory, and serve local patients.',
            icon: <Pill className="w-8 h-8" />,
            path: '/registration/pharmacy',
            color: 'bg-purple-600',
            lightColor: 'bg-purple-50',
            textColor: 'text-purple-600'
        }
    ]

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-10 font-sans">
            <div className="text-center mb-12 max-w-2xl">
                <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Join HealthNexa</h1>
                <p className="text-slate-500 text-lg">Select your role to start the registration process. Each account is tailored to your specific needs.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
                {roles.map((role, index) => (
                    <motion.div
                        key={index}
                        whileHover={{ y: -10, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push(role.path)}
                        className="group bg-white p-8 rounded-4xl shadow-sm border border-slate-100 cursor-pointer transition-all hover:shadow-xl hover:shadow-slate-200/50 flex flex-col items-start h-full"
                    >
                        <div className={`${role.lightColor} ${role.textColor} p-4 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                            {role.icon}
                        </div>
                        
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">{role.title}</h2>
                        <p className="text-slate-500 leading-relaxed mb-8 grow">
                            {role.description}
                        </p>

                        <div className={`mt-auto flex items-center font-semibold ${role.textColor} group-hover:translate-x-2 transition-transform`}>
                            Register as {role.title}
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </div>
                    </motion.div>
                ))}
            </div>

            <p className="mt-12 text-slate-400 text-sm">
                Already have an account? <button onClick={() => router.push('/login')} className="text-blue-600 font-medium hover:underline">Sign in here</button>
            </p>
        </div>
    )
}

export default SelectionPage