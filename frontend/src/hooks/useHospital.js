/**
 * useHospital HOOK
 * Returns static hospital details — no database fetch required
 */
import { HOSPITAL, DEPARTMENTS, FEATURED_DOCTORS, SERVICES } from '../constants/hospitalData'

export function useHospital() {
  // Build a single hospital object that matches the shape HospitalsPage expects
  const hospital = {
    ...HOSPITAL,
    departments: DEPARTMENTS,
    services:    SERVICES,
  }

  return {
    hospital,
    doctors: FEATURED_DOCTORS,
    loading: false,
    error:   '',
  }
}
