"use client"

import { getUser } from '@/store/slice/authSlice'
import { AppDispatch } from '@/store/store'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'

const GetUser = () => {
  const dispatch = useDispatch<AppDispatch>()
  useEffect(() => {
    const fetchUser = async () => {
      try {
        await dispatch(getUser(null)).unwrap()
      } catch (error) {
      }
    }

    fetchUser()
  }, [])
  return null
}

export default GetUser