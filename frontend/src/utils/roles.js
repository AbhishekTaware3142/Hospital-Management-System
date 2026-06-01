export const ROLES = {
  MASTER: 'Master',
  PATIENT: 'patient',
  DOCTOR: 'Docter',
}

const ROLE_ALIASES = {
  admin: ROLES.MASTER,
  Master: ROLES.MASTER,
  patient: ROLES.PATIENT,
  doctor: ROLES.DOCTOR,
  Docter: ROLES.DOCTOR,
}

export const normalizeRole = (role) => ROLE_ALIASES[role] || role

export const roleLabel = (role) => {
  const normalized = normalizeRole(role)

  if (normalized === ROLES.DOCTOR) return 'Docter'
  if (normalized === ROLES.MASTER) return 'Master'
  return 'Patient'
}
