/**
 * PAYMENT CONTROLLER
 * Handles payment listing and status queries
 * ==========================================
 */

const Payment = require('../models/Payment');

/**
 * GET /api/payments — list all payments (with populate)
 */
const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('patient', 'name phone')
      .populate('doctor',  'name specialization')
      .populate('appointment', 'appointmentDate timeSlot reason')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/payments/:id — single payment detail
 */
const getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('patient', 'name phone')
      .populate('doctor',  'name specialization')
      .populate('appointment', 'appointmentDate timeSlot reason status');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getPayments, getPayment };
