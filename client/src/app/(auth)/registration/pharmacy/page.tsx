"use client"

import IndustryRegistration from '@/components/registration/IndustryRegistration'
import RegiVerify from '@/components/registration/RegiVerify'
import RequestSuccess from '@/components/registration/RequestSuccess'
import React, { useState } from 'react'

const page = () => {
  const [email, setEmail] = useState('')
  const [verified, setVerified] = useState(false)
  return (
    <>
      {
        !email ? <IndustryRegistration setEmail={setEmail} registrationType={"Pharmacy"} /> : (
          !verified ?
            <RegiVerify email={email} verifyType={"regiPharmacy"} setVerified={setVerified} /> :
            <RequestSuccess requestType='pharmacy' />
        )
      }
    </>
  )
}

export default page