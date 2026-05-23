import SymptomCheckProvider from '@/providers/SymptomCheckProvider'
import React from 'react'

const layout = ({children}:{children:React.ReactNode}) => {
  return (
        <>
            <SymptomCheckProvider >
                {children}
            </SymptomCheckProvider>
        </>
    )
}

export default layout