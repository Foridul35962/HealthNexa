"use client"

import PatientRegister from '@/components/registration/PatientRegi'
import RegiVerify from '@/components/registration/RegiVerify'
import React, { useState } from 'react'

const page = () => {
    const [email, setEmail] = useState('')
  return (
    <>
    {
        !email ? <PatientRegister setEmail={setEmail}/> : <RegiVerify email={email}/>
    }
    </>
  )
}

export default page