"use client"

import HospitalRegistration from '@/components/registration/HospitalRegistration'
import RegiVerify from '@/components/registration/RegiVerify'
import RequestSuccess from '@/components/registration/RequestSuccess'
import React, { useState } from 'react'

const page = () => {
  const [email, setEmail] = useState('')
  const [verified, setVerified] = useState(false)
  return (
    <>
      {
        !email ? <HospitalRegistration setEmail={setEmail} /> : (
          !verified ?
            <RegiVerify email={email} verifyType={"regiHospital"} setVerified={setVerified} /> :
            <RequestSuccess requestType='hospital' />
        )
      }
    </>
  )
}

export default page