/**
 * APPOINTMENT MODEL
 * Represents an appointment booking between patient and doctor
 * ==============================================================
 */

const mongoose = require('mongoose');

/**
 * Define Appointment Schema
 */
const appointmentSchema = new mongoose.Schema(
  {
    // Reference to patient user
    // ObjectId links to User collection with role 'patient'
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to User model
      required: [true, 'Patient ID is required'],
    },

    // Reference to doctor user
    // ObjectId links to Doctor collection
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor', // Reference to Doctor model
      required: [true, 'Doctor ID is required'],
    },

    // Date of appointment
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },

    // Time slot for appointment (e.g., "10:00 AM" to "10:30 AM")
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
    },

    // Status of appointment
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
      default: 'scheduled', // Default status when created
    },

    // Reason for appointment (e.g., "Regular checkup", "Headache")
    reason: {
      type: String,
      required: [true, 'Reason for appointment is required'],
      trim: true,
    },

    // Symptoms or additional notes from patient
    symptoms: {
      type: String,
      trim: true,
    },

    // Doctor's notes after appointment (filled after consultation)
    doctorNotes: {
      type: String,
      sparse: true,
    },

    // Prescription given by doctor (if any)
    prescription: {
      type: String,
      sparse: true,
    },

    // Consultation fee (copied from doctor's fee at time of booking)
    fee: {
      type: Number,
      required: true,
    },

    // Is payment completed for this appointment
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'refunded'],
      default: 'pending',
    },

    // Appointment rating (1-5) given by patient after completion
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      sparse: true,
    },

    // Review/feedback from patient
    review: {
      type: String,
      sparse: true,
      trim: true,
    },

    // Cancellation reason (if appointment was cancelled)
    cancellationReason: {
      type: String,
      sparse: true,
    },

    // Email reminder sent to patient
    reminderEmailSent: {
      type: Boolean,
      default: false,
    },

    // Timestamps - createdAt and updatedAt
  },
  { timestamps: true }
);

/**
 * Create compound index for patient and appointmentDate
 * This speeds up queries like "get all appointments for patient"
 */
appointmentSchema.index({ patient: 1, appointmentDate: 1 });

/**
 * Create compound index for doctor and appointmentDate
 * This speeds up queries like "get all appointments for doctor"
 */
appointmentSchema.index({ doctor: 1, appointmentDate: 1 });

/**
 * Pre-save middleware to validate appointment
 * Ensures the selected doctor exists.
 */
appointmentSchema.pre('save', async function (next) {
  if (!this.isNew) {
    next(); // If updating existing, skip validation
    return;
  }

  try {
    // Find doctor and check if slot is available
    const Doctor = mongoose.model('Doctor');
    const doctor = await Doctor.findById(this.doctor);

    if (!doctor) {
      throw new Error('Doctor not found in Appointment hook');
    }

    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Create and export Appointment model
 */
module.exports = mongoose.model('Appointment', appointmentSchema);
