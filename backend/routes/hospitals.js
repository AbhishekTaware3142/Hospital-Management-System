/**
 * HOSPITAL ROUTES
 *
 * Permission matrix:
 *   All hospital endpoints → All logged-in roles
 * ====================================
 */

const express = require('express');
const router  = express.Router();

const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../utils/roles');
const {
  getAllHospitals,
  getHospital,
  getHospitalDoctors,
} = require('../controllers/hospitalController');

// All three routes are open to every logged-in role.
router.get('/',             protect, authorize(ROLES.PATIENT, ROLES.DOCTOR, ROLES.MASTER), getAllHospitals);
router.get('/:id',          protect, authorize(ROLES.PATIENT, ROLES.DOCTOR, ROLES.MASTER), getHospital);
router.get('/:id/doctors',  protect, authorize(ROLES.PATIENT, ROLES.DOCTOR, ROLES.MASTER), getHospitalDoctors);

module.exports = router;
