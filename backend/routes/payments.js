/**
 * PAYMENT ROUTES
 * GET /api/payments
 * GET /api/payments/:id
 */

const express = require('express');
const router  = express.Router();
const { getPayments, getPayment } = require('../controllers/paymentController');

router.get('/',    getPayments);
router.get('/:id', getPayment);

module.exports = router;
