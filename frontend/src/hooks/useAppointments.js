/**
 * useAppointments HOOK
 * Encapsulates all appointment data-fetching and mutation logic
 */
import { useState, useEffect, useCallback } from 'react'
import { fetchAppointments, cancelAppointment, addReview } from '../api/appointmentService'

export function useAppointments({ filterStatus = '', page = 1, refreshTrigger = 0 } = {}) {
  const [appointments, setAppointments] = useState([])
  const [totalPages,   setTotalPages]   = useState(1)
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const params = { page }
      if (filterStatus) params.status = filterStatus
      const data = await fetchAppointments(params)
      setAppointments(data.data)
      setTotalPages(data.pagination.totalPages)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch appointments')
    } finally {
      setLoading(false)
    }
  }, [page, filterStatus, refreshTrigger])

  useEffect(() => { load() }, [load])

  const cancel = async (id) => {
    await cancelAppointment(id, 'Cancelled by patient')
    await load() // re-fetch after cancel
  }

  const review = async (id, rating, text) => {
    await addReview(id, rating, text)
    await load() // re-fetch so the list reflects the new review
  }

  const updateStatus = async (id, status) => {
    // Import updateAppointmentStatus from service
    const { updateAppointmentStatus } = await import('../api/appointmentService')
    await updateAppointmentStatus(id, status)
    await load() // re-fetch so the list reflects the new status immediately
  }

  return { appointments, totalPages, loading, error, refetch: load, cancel, review, updateStatus }
}
