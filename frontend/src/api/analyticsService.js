/**
 * ANALYTICS SERVICE
 * API calls for reports and payments data
 */
import api from './axiosConfig'

export const fetchReports  = (params) => api.get('/analytics/reports', { params }).then(r => r.data)
export const fetchPayments = () => api.get('/analytics/payments').then(r => r.data)
