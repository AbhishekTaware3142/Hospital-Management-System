/**
 * APPOINTMENT ROUTES
 *
 * Permission matrix:
 *   POST   /              → Patient only  (book)
 *   GET    /              → All roles     (each role sees their own slice)
 *   GET    /:id           → All roles
 *   PUT    /:id/cancel    → Patient only
 *   PUT    /:id/status    → Doctor + Master
 *   POST   /:id/review    → Patient only
 * =========================================================================
 */

const express = require('express');
const router  = express.Router();

const {
  bookAppointment,
  getAppointments,
  getAppointment,
  cancelAppointment,
  addReview,
  updateAppointmentStatus,
} = require('../controllers/appointmentController');

const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../utils/roles');

// ── Book a new appointment ────────────────────────────────────
// Only patients can book. Doctors and Master cannot.
router.post(
  '/',
  protect,
  authorize(ROLES.PATIENT),          // 403 for Doctor / Master
  bookAppointment
);

// ── List appointments ─────────────────────────────────────────
// All roles can list — the controller filters by role internally.
router.get(
  '/',
  protect,
  authorize(ROLES.PATIENT, ROLES.DOCTOR, ROLES.MASTER),
  getAppointments
);

// ── Single appointment detail ─────────────────────────────────
router.get(
  '/:appointmentId',
  protect,
  authorize(ROLES.PATIENT, ROLES.DOCTOR, ROLES.MASTER),
  getAppointment
);

// ── Cancel appointment ────────────────────────────────────────
// Only the patient who booked can cancel.
router.put(
  '/:appointmentId/cancel',
  protect,
  authorize(ROLES.PATIENT),
  cancelAppointment
);

// ── Update appointment status ─────────────────────────────────
// Doctors mark completed/no-show. Master can override anything.
router.put(
  '/:appointmentId/status',
  protect,
  authorize(ROLES.DOCTOR, ROLES.MASTER),
  updateAppointmentStatus
);

// ── Submit a review ───────────────────────────────────────────
// Only patients can leave reviews.
router.post(
  '/:appointmentId/review',
  protect,
  authorize(ROLES.PATIENT),
  addReview
);

module.exports = router;
