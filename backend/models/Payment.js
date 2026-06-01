/**
 * PAYMENT MODEL
 * Separate collection tracking every payment transaction
 * =======================================================
 */

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    // Link to the appointment this payment is for
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: [true, 'Appointment reference is required'],
    },

    // Patient who made the payment
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient reference is required'],
    },

    // Doctor who received the payment
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor reference is required'],
    },

    // Amount paid in rupees
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Amount cannot be negative'],
    },

    // Payment status
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },

    // Payment method used
    method: {
      type: String,
      enum: ['UPI', 'Card', 'Net Banking', 'Wallet', 'Cash'],
      default: 'UPI',
    },

    // Unique transaction ID (simulated)
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },

    // Gateway used (simulated)
    gateway: {
      type: String,
      enum: ['Razorpay', 'Paytm', 'PhonePe', 'GooglePay', 'Manual'],
      default: 'Razorpay',
    },

    // Notes (e.g. refund reason)
    notes: {
      type: String,
      trim: true,
    },

    // When the payment was processed
    paidAt: {
      type: Date,
    },

    // When refund was issued (if applicable)
    refundedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Index for fast lookups by patient and appointment
paymentSchema.index({ patient: 1, createdAt: -1 });
paymentSchema.index({ appointment: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
