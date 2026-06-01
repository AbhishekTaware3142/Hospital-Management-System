/**
 * USER SERVICE
 * All API calls related to users / doctors
 */
import api from './axiosConfig'

export const fetchDoctors  = ()         => api.get('/users/doctors').then(r => r.data)
export const createDoctor  = (payload)  => api.post('/users/doctors', payload).then(r => r.data)
export const deleteDoctor  = (id)       => api.delete(`/users/doctors/${id}`).then(r => r.data)
export const getCurrentUser = ()        => api.get('/auth/me').then(r => r.data)
