/**
 * USER CONTROLLER
 * Handles Master user management actions
 * =====================================
 */

const User = require('../models/User');
const Doctor = require('../models/Doctor');
const { ROLES, normalizeRole } = require('../utils/roles');

const getDuplicateDoctorMessage = (error) => {
  const field = Object.keys(error.keyPattern || error.keyValue || {})[0];
  const value = error.keyValue?.[field];

  if (field === 'phone') {
    return `Phone ${value || 'number'} is already registered. Please use a different phone number.`;
  }

  if (field === 'licenseNumber') {
    return `License number ${value || ''} is already registered. Please use a different license number.`;
  }

  return `A user with these details already exists. Error: ${error.message}`;
};

/**
 * Get all doctors for Master review
 */
const getAllDoctors = async (req, res) => {
  try {
    // Fetch all doctors from the Doctor collection
    const doctors = await Doctor.find({}).select('-password');

    res.status(200).json({ success: true, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching doctors', error: error.message });
  }
};

/**
 * Create a new Docter account (Master only)
 */
const createDoctor = async (req, res) => {
  try {
    const {
      name,
      licenseNumber,
      specialization,
      experience,
      consultationFee,
      password,
    } = req.body;
    const phone = String(req.body.phone || '').trim();

    if (!name || !phone || !licenseNumber || !specialization) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, phone, license number and specialization',
      });
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit phone number',
      });
    }

    // Check if phone already exists in User collection
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      const existingRole = normalizeRole(existingUser.role);
      const roleLabel = existingRole === ROLES.MASTER ? 'an admin' : 'a patient';
      return res.status(400).json({
        success: false,
        message: `Phone ${phone} is already registered as ${roleLabel} (${existingUser.name}). Please use a different phone number.`,
      });
    }

    // Check if phone already exists in Doctor collection
    const existingDoctor = await Doctor.findOne({ phone });
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: `Phone ${phone} is already registered as a doctor (${existingDoctor.name}). Please use a different phone number.`,
      });
    }

    const doctor = new Doctor({
      name: name.trim(),
      phone,
      role: ROLES.DOCTOR,
      licenseNumber: licenseNumber.trim(),
      specialization: specialization.trim(),
      experience: experience ? Number(experience) : 0,
      consultationFee: consultationFee ? Number(consultationFee) : 0,
      // Use provided password or fallback to phone number
      password: password || phone,
    });

    await doctor.save();

    res.status(201).json({
      success: true,
      message: 'Doctor account created successfully',
      data: {
        _id: doctor._id,
        id: doctor._id,
        name: doctor.name,
        phone: doctor.phone,
        specialization: doctor.specialization,
        licenseNumber: doctor.licenseNumber,
        experience: doctor.experience,
        consultationFee: doctor.consultationFee,
        role: normalizeRole(doctor.role),
      },
    });
  } catch (error) {
    console.error('[createDoctor] error:', error); // visible in server terminal
    // Surface Mongoose duplicate key error clearly
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: getDuplicateDoctorMessage(error),
      });
    }
    // Surface Mongoose validation errors clearly
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(e => e.message).join(', ');
      return res.status(400).json({ success: false, message });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating doctor account',
      error: error.message,
    });
  }
};

/**
 * Delete a doctor account (Master only)
 */
const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Doctor.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.status(200).json({ success: true, message: `Doctor ${user.name} deleted successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllDoctors,
  createDoctor,
  deleteDoctor,
};
