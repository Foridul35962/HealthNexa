import PharmacyProvider from '@/providers/PharmacyProvider'
import React from 'react'

const layout = ({children}: {children:React.ReactNode}) => {
    return (
        <>
            <PharmacyProvider>
                {children}
            </PharmacyProvider>
        </>
    )
}

export default layout