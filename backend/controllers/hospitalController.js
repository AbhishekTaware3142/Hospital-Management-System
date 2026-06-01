/**
 * HOSPITAL CONTROLLER
 * Handles hospital data retrieval
 * ================================
 */

const Hospital = require('../models/Hospital');
const User     = require('../models/User');
const Doctor   = require('../models/Doctor');
const { ROLES } = require('../utils/roles');

/**
 * GET /api/hospitals
 * Returns all active hospitals (basic info)
 */
const getAllHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find({ isActive: true })
      .select('name city address rating reviews openStatus image highlight phone website');

    res.status(200).json({ success: true, data: hospitals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching hospitals', error: error.message });
  }
};

/**
 * GET /api/hospitals/:id
 * Returns full hospital detail including departments and services
 */
const getHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    // Count doctors from Doctor collection
    const specialistCount = await Doctor.countDocuments({
      isActive: true,
    });

    res.status(200).json({
      success: true,
      data: {
        ...hospital.toObject(),
        specialists: specialistCount,
        departmentCount: hospital.departments.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching hospital', error: error.message });
  }
};

/**
 * GET /api/hospitals/:id/doctors
 * Returns doctors associated with a hospital (all active doctors for now)
 */
const getHospitalDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({
      isActive: true,
    }).select('name specialization experience consultationFee licenseNumber');

    res.status(200).json({ success: true, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching doctors', error: error.message });
  }
};

module.exports = { getAllHospitals, getHospital, getHospitalDoctors };
