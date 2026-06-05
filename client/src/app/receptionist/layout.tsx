import Sidebar from '@/components/Sidebar'
import ReceptionistProvider from '@/providers/ReceptionistProvider'
import React from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <ReceptionistProvider>
        <div className="flex h-screen overflow-hidden bg-linear-to-br from-slate-50 via-blue-50/40 to-white">
          <Sidebar />
          <main className="flex-1 overflow-y-auto pt-14 md:pt-0 overflow-x-hidden min-w-0">
            {children}
          </main>
        </div>
      </ReceptionistProvider>
    </>
  )
}

export default layout