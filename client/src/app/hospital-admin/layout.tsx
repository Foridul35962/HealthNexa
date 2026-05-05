import HospitalAdminProvider from '@/providers/HospitalAdminProvider'
import React from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <HospitalAdminProvider>
                {children}
            </HospitalAdminProvider>
        </>
    )
}

export default layout