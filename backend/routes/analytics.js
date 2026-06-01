/**
 * ANALYTICS ROUTES
 * Reports and payments data endpoints
 *
 * Permission matrix (your requirement):
 *   GET /reports  → ALL roles  (Patient, Doctor, Master)
 *   GET /payments → Master ONLY
 * =====================================================
 */

const express = require('express');
const router  = express.Router();

// protect  — verifies JWT, sets req.user
// authorize — checks req.user.role against allowed list
const { protect, authorize } = require('../middleware/auth');

const { getReports, getPayments } = require('../controllers/analyticsController');

const { ROLES } = require('../utils/roles');
// ROLES.MASTER  = 'Master'
// ROLES.PATIENT = 'patient'
// ROLES.DOCTOR  = 'Docter'

// ─────────────────────────────────────────────────────────────
// GET /api/analytics/reports
//
// Middleware chain:
//   1. protect   — must be logged in (valid JWT)
//   2. authorize — role must be patient OR Docter OR Master
//      (all three roles are listed → everyone can see reports)
//   3. getReports — the actual controller that queries the DB
// ─────────────────────────────────────────────────────────────
router.get(
  '/reports',
  protect,
  authorize(ROLES.DOCTOR, ROLES.MASTER), // Doctor + Master only
  getReports
);

// ─────────────────────────────────────────────────────────────
// GET /api/analytics/payments
//
// Middleware chain:
//   1. protect   — must be logged in (valid JWT)
//   2. authorize — role must be Master ONLY
//      (only one role listed → patients and doctors get 403)
//   3. getPayments — the actual controller
// ─────────────────────────────────────────────────────────────
router.get(
  '/payments',
  protect,
  authorize(ROLES.MASTER), // Master only
  getPayments
);

module.exports = router;
