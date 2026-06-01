const ROLES = {
  MASTER: 'Master',
  PATIENT: 'patient',
  DOCTOR: 'Docter',
};

const ROLE_ALIASES = {
  admin: ROLES.MASTER,
  Master: ROLES.MASTER,
  patient: ROLES.PATIENT,
  doctor: ROLES.DOCTOR,
  Docter: ROLES.DOCTOR,
};

const normalizeRole = (role) => ROLE_ALIASES[role] || role;

module.exports = {
  ROLES,
  normalizeRole,
};
