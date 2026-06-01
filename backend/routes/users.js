/**
 * USER ROUTES
 *
 * Permission matrix:
 *   GET    /doctors     → All roles (patients need this to search doctors when booking)
 *   POST   /doctors     → Master only (create a doctor account)
 *   DELETE /doctors/:id → Master only (remove a doctor)
 * =============================================
 */

const express = require('express');
const router  = express.Router();

const { protect, authorize } = require('../middleware/auth');
const { getAllDoctors, createDoctor, deleteDoctor } = require('../controllers/userController');
const { ROLES } = require('../utils/roles');

// ── List all doctors ──────────────────────────────────────────
// Patients need this to search for a doctor when booking.
// All logged-in roles can read the list.
router.get(
  '/doctors',
  protect,
  authorize(ROLES.PATIENT, ROLES.DOCTOR, ROLES.MASTER),
  getAllDoctors
);

// ── Create a doctor account ───────────────────────────────────
// Only Master admin can add new doctors.
router.post(
  '/doctors',
  protect,
  authorize(ROLES.MASTER),
  createDoctor
);

// ── Delete a doctor account ───────────────────────────────────
// Only Master admin can remove doctors.
router.delete(
  '/doctors/:id',
  protect,
  authorize(ROLES.MASTER),
  deleteDoctor
);

module.exports = router;
