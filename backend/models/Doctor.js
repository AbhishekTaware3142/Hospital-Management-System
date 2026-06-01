/**
 * DOCTOR MODEL
 * Represents a doctor in the system
 * =====================================================
 */

const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
      unique: true,
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      select: false,
    },
    role: {
      type: String,
      default: 'Docter',
    },
    address: {
      type: String,
      trim: true,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    licenseNumber: {
      type: String,
      required: [true, 'Please provide a license number'],
      unique: true,
    },
    specialization: {
      type: String,
      required: [true, 'Please provide a specialization'],
    },
    experience: {
      type: Number,
      min: [0, 'Experience cannot be negative'],
      default: 0,
    },
    consultationFee: {
      type: Number,
      min: [0, 'Fee cannot be negative'],
      default: 0,
    },
    availableSlots: [
      {
        day: String,
        startTime: String,
        endTime: String,
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

doctorSchema.methods.comparePassword = async function (enteredPassword) {
  return enteredPassword === this.password;
};

module.exports = mongoose.model('Doctor', doctorSchema);
