import PatientProvider from '@/providers/PatientProvider'
import React from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <PatientProvider >
                {children}
            </PatientProvider>
        </>
    )
}

export default layout