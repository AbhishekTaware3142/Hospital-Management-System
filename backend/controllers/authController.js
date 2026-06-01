/**
 * AUTHENTICATION CONTROLLER
 * Handles user registration, login, and token generation
 * ============================================================
 */

const User   = require('../models/User');
const Doctor = require('../models/Doctor');
const jwt    = require('jsonwebtoken');
const { ROLES, normalizeRole } = require('../utils/roles');

// ─────────────────────────────────────────────────────────────
// Helper — generateToken
//   Creates a signed JWT that the frontend stores and sends
//   back on every request inside the Authorization header.
// ─────────────────────────────────────────────────────────────
const generateToken = (userId, role) => {
  return jwt.sign(
    {
      id:   userId,              // stored so protect middleware can find the user
      role: normalizeRole(role), // stored so authorize middleware can check the role
    },
    process.env.JWT_SECRET,      // secret key — only the server knows this
    { expiresIn: '30d' }         // token expires after 30 days
  );
};

// ─────────────────────────────────────────────────────────────
// POST /api/auth/register
//   Creates a new patient account only.
//   Doctors are created by Master admin via /api/users/doctors.
// ─────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, phone and password' });
    }

    // Check if phone is already registered
    const existing = await User.findOne({ phone });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User already exists with this phone number' });
    }

    // Always create as patient — role cannot be chosen at registration
    const user = new User({ name, phone, password, role: ROLES.PATIENT });
    await user.save();

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data:  { id: user._id, name: user.name, phone: user.phone, role: ROLES.PATIENT },
      token,
    });
  } catch (error) {
    const message = error?.errors
      ? Object.values(error.errors).map(e => e.message).join(', ')
      : error.message;
    res.status(500).json({ success: false, message, error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/auth/login
//   Looks up the phone in User collection first, then Doctor.
//   Returns a JWT that encodes the user's real role from the DB.
// ─────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const loginValue = (phone || '').trim();

    if (!loginValue || !password) {
      return res.status(400).json({ success: false, message: 'Please provide phone and password' });
    }

    // Try User collection first (patients + Master admin)
    let user = await User.findOne({ phone: loginValue }).select('+password');

    // If not found in User, try Doctor collection
    if (!user) {
      user = await Doctor.findOne({ phone: loginValue }).select('+password');
    }

    // Neither collection had this phone number
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid mobile number or password' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid mobile number or password' });
    }

    // Build token with the role that is ACTUALLY stored in the DB
    const token = generateToken(user._id, user.role);

    // Build response — strip password, add id alias
    const userData      = user.toObject();
    userData.id         = user._id;
    userData.role       = normalizeRole(user.role); // normalise before sending
    delete userData.password;                        // never send password to client

    res.status(200).json({ success: true, message: 'Login successful', data: userData, token });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error during login', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/auth/me
//   Returns the profile of whoever owns the JWT.
//   protect middleware already verified the token and set req.user.
// ─────────────────────────────────────────────────────────────
const getCurrentUser = async (req, res) => {
  try {
    // req.user.id and req.user.role are guaranteed here because
    // protect middleware runs before this and would have returned
    // 401 already if the token was missing or invalid.
    let user;

    if (normalizeRole(req.user.role) === ROLES.DOCTOR) {
      // Doctor accounts live in the Doctor collection
      user = await Doctor.findById(req.user.id);
    } else {
      // Patient and Master accounts live in the User collection
      user = await User.findById(req.user.id);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userData  = user.toObject();
    userData.id     = user._id;
    userData.role   = normalizeRole(user.role);

    res.status(200).json({ success: true, data: userData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching user', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/auth/profile
//   Updates name and/or password for the logged-in user.
// ─────────────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const role = normalizeRole(req.user.role);

    let user;
    if (role === ROLES.DOCTOR) {
      user = await Doctor.findById(req.user.id).select('+password');
    } else {
      user = await User.findById(req.user.id).select('+password');
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name && name.trim()) user.name = name.trim();

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password is required' });
      }
      const isValid = await user.comparePassword(currentPassword);
      if (!isValid) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
      }
      user.password = newPassword;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { id: user._id, name: user.name, phone: user.phone, role: normalizeRole(user.role) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error updating profile' });
  }
};

module.exports = { register, login, getCurrentUser, updateProfile };
