/**
 * HOSPITAL SERVICE
 * All API calls related to hospitals
 */
import api from './axiosConfig'

export const fetchHospitals = () =>
  api.get('/hospitals').then(r => r.data)

export const fetchHospital = (id) =>
  api.get(`/hospitals/${id}`).then(r => r.data)

export const fetchHospitalDoctors = (id) =>
  api.get(`/hospitals/${id}/doctors`).then(r => r.data)
