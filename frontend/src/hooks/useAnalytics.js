/**
 * useAnalytics HOOK
 * Fetches reports and payments data from the API
 */
import { useState, useEffect } from 'react'
import { fetchReports, fetchPayments } from '../api/analyticsService'

export function useReports() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    fetchReports()
      .then(res => setData(res.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load reports'))
      .finally(() => setLoading(false))
  }, [])

  return { data, loading, error }
}

export function usePayments() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    fetchPayments()
      .then(res => setData(res.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load payments'))
      .finally(() => setLoading(false))
  }, [])

  return { data, loading, error }
}
