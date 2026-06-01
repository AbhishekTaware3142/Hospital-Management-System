/**
 * APPOINTMENT CONTROLLER
 * Handles appointment booking, cancellation, and management
 * ===================================================================
 */

const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const { ROLES, normalizeRole } = require('../utils/roles');

/**
 * BOOK APPOINTMENT - Create new appointment
 * 
 * Expected request body:
 * {
 *   doctor: "doctor_id",
 *   appointmentDate: "2024-06-15",
 *   timeSlot: "10:00 AM - 10:30 AM",
 *   reason: "Regular checkup",
 *   symptoms: "Fever, cough"
 * }
 * 
 * Requires: Authentication (protect middleware), Patient role
 */
const bookAppointment = async (req, res) => {
  try {
    // Destructure appointment data from request body
    const { doctor, appointmentDate, timeSlot, reason, symptoms } = req.body;

    // Validate required fields
    if (!doctor || !appointmentDate || !timeSlot || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Validate appointment date is in the future
    if (new Date(appointmentDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Appointment date must be in the future',
      });
    }

    // Get doctor from Doctor database to verify existence and get fee
    const doctorUser = await Doctor.findById(doctor);
    if (!doctorUser) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found in appointmentController',
      });
    }

    let patientId = req.body.patient || req.user.id;

    if (!patientId) {
      const fallbackUser = await User.findOne({ role: { $in: [ROLES.PATIENT, 'patient'] } }) || await User.findOne();
      patientId = fallbackUser?._id;
    }

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'No patient user found for this appointment',
      });
    }

    // Create new appointment object
    const appointment = new Appointment({
      patient: patientId,
      doctor: doctor,
      appointmentDate: new Date(appointmentDate),
      timeSlot: timeSlot,
      reason: reason,
      symptoms: symptoms || '', // Optional field
      fee: doctorUser.consultationFee || 0, // Copy doctor's fee at booking time
    });

    // Save appointment to database
    await appointment.save();

    // Populate patient and doctor details before returning
    // This replaces IDs with full user documents
    await appointment.populate('patient', 'name phone');
    await appointment.populate('doctor', 'name specialization');

    // Return success with appointment details
    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error booking appointment',
      error: error.message,
    });
  }
};

/**
 * GET APPOINTMENTS - Retrieve appointments
 * - Master admin  → all appointments in DB
 * - Doctor        → only their appointments
 * - Patient       → only their appointments
 */
const getAppointments = async (req, res) => {
  try {
    const { status, page = 1 } = req.query;
    const userRole = normalizeRole(req.user?.role);
    const userId   = req.user?.id;

    // Build filter based on role
    let filter = {};
    if (status) filter.status = status;

    // Non-admin users only see their own appointments
    if (userRole !== ROLES.MASTER && userId) {
      if (userRole === ROLES.DOCTOR) {
        filter.doctor = userId;
      } else {
        filter.patient = userId;
      }
    }
    // Master admin: no extra filter → sees everything

    const pageNum = parseInt(page);
    const limit   = 20;
    const skip    = (pageNum - 1) * limit;

    const appointments = await Appointment.find(filter)
      .skip(skip)
      .limit(limit)
      .populate('patient', 'name phone')
      .populate('doctor',  'name specialization')
      .sort({ appointmentDate: -1 }); // newest first for admin overview

    const total = await Appointment.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: appointments,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limit),
        totalAppointments: total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments',
      error: error.message,
    });
  }
};

/**
 * GET SINGLE APPOINTMENT - Get details of one appointment
 * 
 * URL params:
 * - appointmentId: ID of appointment to retrieve
 * 
 * Open access.
 */
const getAppointment = async (req, res) => {
  try {
    // Get appointment ID from URL parameters
    const { appointmentId } = req.params;

    // Find appointment by ID
    const appointment = await Appointment.findById(appointmentId)
      .populate('patient', 'name phone') // Include patient details
      .populate('doctor', 'name specialization'); // Include doctor details

    // If appointment not found
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Return appointment details
    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching appointment',
      error: error.message,
    });
  }
};

/**
 * CANCEL APPOINTMENT - Cancel a scheduled appointment
 * 
 * URL params:
 * - appointmentId: ID of appointment to cancel
 * 
 * Request body:
 * {
 *   cancellationReason: "Cannot make it" (optional)
 * }
 * 
 * Requires: Authentication
 */
const cancelAppointment = async (req, res) => {
  try {
    // Get appointment ID from URL
    const { appointmentId } = req.params;
    // Get cancellation reason from body
    const { cancellationReason } = req.body;

    // Find appointment by ID
    const appointment = await Appointment.findById(appointmentId);

    // If appointment not found
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Check if appointment is not already completed/cancelled
    if (appointment.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel appointment with status: ${appointment.status}`,
      });
    }

    // Update appointment status to cancelled
    appointment.status = 'cancelled';
    // Set refund status to refunded
    appointment.paymentStatus = 'refunded';
    // Store cancellation reason
    appointment.cancellationReason = cancellationReason || 'No reason provided';

    // Save changes to database
    await appointment.save();

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling appointment',
      error: error.message,
    });
  }
};

/**
 * ADD REVIEW - Patient adds review after appointment
 * 
 * URL params:
 * - appointmentId: ID of appointment to review
 * 
 * Request body:
 * {
 *   rating: 5,
 *   review: "Great doctor, very helpful"
 * }
 * 
 * Requires: Authentication, Patient role, Completed appointment
 */
const addReview = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { rating, review } = req.body;

    // Validate rating is between 1-5
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    // Find appointment
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Check if appointment is completed
    if (appointment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed appointments',
      });
    }

    // Add rating and review to appointment
    appointment.rating = rating;
    appointment.review = review || '';

    // Save updated appointment
    await appointment.save();

    // Return success
    res.status(200).json({
      success: true,
      message: 'Review added successfully',
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding review',
      error: error.message,
    });
  }
};

/**
 * PUT /api/appointments/:appointmentId/status
 * Update appointment status (Doctor only)
 */
const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;

    if (!['scheduled', 'completed', 'cancelled', 'no-show'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Only allow the assigned doctor (or master admin) to change status
    const reqUserId = req.user?.id || req.body?.userId;
    const reqUserRole = req.user?.role || req.body?.userRole;
    
    if (reqUserId && reqUserId !== appointment.doctor.toString() && reqUserRole !== 'Master') {
       return res.status(403).json({ success: false, message: 'Not authorized to update this appointment' });
    }

    // Doctors can only update status for today's appointments
    if (reqUserRole !== 'Master') {
      const today = new Date();
      const apptDate = new Date(appointment.appointmentDate);
      const isSameDay =
        apptDate.getFullYear() === today.getFullYear() &&
        apptDate.getMonth()    === today.getMonth()    &&
        apptDate.getDate()     === today.getDate();

      if (!isSameDay) {
        return res.status(403).json({
          success: false,
          message: 'You can only update the status of today\'s appointments',
        });
      }
    }

    appointment.status = status;
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating status',
      error: error.message,
    });
  }
};

// Export all controller functions
module.exports = {
  bookAppointment,
  getAppointments,
  getAppointment,
  cancelAppointment,
  addReview,
  updateAppointmentStatus,
};
