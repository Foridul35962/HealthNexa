"use client"

import RequestMedicinePage from '@/components/pharmacy/MedicineAddReq'
import RequestSuccessPage from '@/components/pharmacy/RequestSuccess'
import React, { useState } from 'react'

const page = () => {
    const [requestAdd, setRequestAdd] = useState(false)
    return (
        <>
            {
                !requestAdd ? <RequestMedicinePage setRequestAdd={setRequestAdd} /> : <RequestSuccessPage />
            }
        </>
    )
}

export default page