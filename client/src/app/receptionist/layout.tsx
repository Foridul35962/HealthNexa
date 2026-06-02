import ReceptionistProvider from '@/providers/ReceptionistProvider'
import React from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <ReceptionistProvider>
        {children}
      </ReceptionistProvider>
    </>
  )
}

export default layout