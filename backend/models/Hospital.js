/**
 * HOSPITAL MODEL
 * Represents a hospital in the system
 * =====================================
 */

const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  title:    { type: String, required: true, trim: true },
  subtitle: { type: String, trim: true },
  icon:     { type: String, default: '🏥' },
}, { _id: false });

const serviceSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true },
  icon:  { type: String, default: '✅' },
}, { _id: false });

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=1600&auto=format&fit=crop',
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    openStatus: {
      type: String,
      default: 'Open 24/7',
    },
    highlight: {
      type: String,
      trim: true,
    },
    departments: [departmentSchema],
    services:    [serviceSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hospital', hospitalSchema);
