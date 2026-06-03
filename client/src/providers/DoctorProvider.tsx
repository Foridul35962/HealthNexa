"use client"

import FirstLoad from '@/components/loading/FirstLoad'
import { RootState } from '@/store/store'
import { redirect } from 'next/navigation'
import React from 'react'
import { useSelector } from 'react-redux'

const DoctorProvider = ({ children }: { children: React.ReactNode }) => {
    const { user, fetchLoading } = useSelector((state: RootState) => state.auth)
    if (fetchLoading && user?.role !== "hospitalStaff" && user?.staffRole !== "doctor") {
        redirect('/')
    }
    return (
        <>
            {
                !fetchLoading ? <FirstLoad /> : children
            }
        </>
    )
}

export default DoctorProvider