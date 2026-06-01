/**
 * useDoctors HOOK
 * Encapsulates doctor list fetching and creation logic
 */
import { useState, useEffect } from 'react'
import { fetchDoctors, createDoctor, deleteDoctor } from '../api/userService'

export function useDoctors() {
  const [doctors,  setDoctors]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')

  useEffect(() => {
    setLoading(true)
    fetchDoctors()
      .then(data => setDoctors(data.data || []))
      .catch(err => setError(err.response?.data?.message || 'Unable to load doctors'))
      .finally(() => setLoading(false))
  }, [])

  const addDoctor = async (payload) => {
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const data = await createDoctor({
        ...payload,
        phone: payload.phone.trim(),
      })
      setDoctors(prev => [...prev, data.data])
      setSuccess('Doctor added successfully!')
      return { ok: true }
    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data?.error
        || err.message
        || 'Unable to add doctor'
      return { ok: false, message: msg }
    } finally {
      setLoading(false)
    }
  }

  const removeDoctor = async (id) => {
    try {
      await deleteDoctor(id)
      setDoctors(prev => prev.filter(d => d._id !== id))
      return { ok: true }
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || 'Unable to delete doctor' }
    }
  }

  return { doctors, loading, error, success, addDoctor, removeDoctor, setError, setSuccess }
}
