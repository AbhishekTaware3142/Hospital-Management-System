/**
 * USER MODEL
 * Represents a user in the system (Patient or Doctor)
 * =====================================================
 */

// ── CHANGED: removed bcrypt import — passwords stored as plain text ──
const mongoose = require('mongoose');

/**
 * Define User Schema
 * This defines the structure of each user document in MongoDB
 */
const userSchema = new mongoose.Schema(
  {
    // User's full name - Required field, must be provided
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    // User's phone number - Required field, used as unique identifier (login identifier)
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
      unique: true,
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number'],
    },

    // Password stored as plain text
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      select: false,
    },

    // User's role - Master or patient
    role: {
      type: String,
      enum: ['Master', 'patient', 'admin'],
      required: true,
      default: 'patient',
    },

    // Address of the user
    address: {
      type: String,
      trim: true,
    },

    // Profile picture URL
    profilePicture: {
      type: String,
      default: null,
    },



    // Is the user account verified
    isVerified: {
      type: Boolean,
      default: false,
    },

    // Is the user account active
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// ── CHANGED: pre-save bcrypt hook removed — passwords saved as-is ──

/**
 * ── CHANGED: comparePassword now does a plain string comparison ──
 * @param {string} enteredPassword - Password user entered at login
 * @returns {boolean} - True if passwords match
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
  return enteredPassword === this.password;
};

module.exports = mongoose.model('User', userSchema);
