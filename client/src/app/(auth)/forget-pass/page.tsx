"use client"

import ForgetPassDesign from '@/components/forgetPass/ForgetPassDesign'
import ResetPass from '@/components/forgetPass/ResetPass'
import RegiVerify from '@/components/registration/RegiVerify'
import React, { useState } from 'react'

const page = () => {
    const [email, setEmail] = useState('')
    const [verified, setVerified] = useState(false)
    return (
        <>
            {
                !email ? <ForgetPassDesign setEmail={setEmail} />
                 : (
                    !verified ? <RegiVerify email={email} setVerified={setVerified} verifyType={"forgetPass"}/> :
                        <ResetPass email={email} />
                )
            }
        </>
    )
}

export default page