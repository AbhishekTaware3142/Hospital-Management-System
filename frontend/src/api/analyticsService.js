/**
 * ANALYTICS SERVICE
 * API calls for reports and payments data
 */
import api from './axiosConfig'

export const fetchReports  = () => api.get('/analytics/reports').then(r => r.data)
export const fetchPayments = () => api.get('/analytics/payments').then(r => r.data)
