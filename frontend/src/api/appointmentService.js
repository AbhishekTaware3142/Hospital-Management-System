/**
 * APPOINTMENT SERVICE
 * All API calls related to appointments
 */
import api from './axiosConfig'

export const fetchAppointments = (params) =>
  api.get('/appointments', { params }).then(r => r.data)

export const cancelAppointment = (id, reason) =>
  api.put(`/appointments/${id}/cancel`, { cancellationReason: reason }).then(r => r.data)

export const addReview = (id, rating, review) =>
  api.post(`/appointments/${id}/review`, { rating, review }).then(r => r.data)

export const bookAppointment = (payload) =>
  api.post('/appointments', payload).then(r => r.data)

export const updateAppointmentStatus = (id, status) =>
  api.put(`/appointments/${id}/status`, { status }).then(r => r.data)
