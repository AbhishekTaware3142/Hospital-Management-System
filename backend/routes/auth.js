/**
 * AUTHENTICATION ROUTES
 * Defines endpoints for user registration, login, and profile
 * ==============================================================
 */

// Import Express Router to create modular routes
const express = require('express');
const router = express.Router();

// Import authentication controller functions
const { register, login, getCurrentUser, updateProfile } = require('../controllers/authController');

// Import middleware functions
const { protect } = require('../middleware/auth');

/**
 * POST /api/auth/register
 * 
 * Register a new user (patient or Docter)
 * 
 * Request body:
 * {
 *   "name": "John Doe",
 *   "phone": "9876543210",
 *   "password": "password123",
 *   "role": "patient"
 * }
 * 
 * Response: { success: true, token, data: user }
 */
router.post('/register', register);

/**
 * POST /api/auth/login
 * 
 * Login user and receive authentication token
 * 
 * Request body:
 * {
 *   "phone": "9876543210"
 * }
 * 
 * Response: { success: true, token, data: user }
 */
router.post('/login', login);

/**
 * GET /api/auth/me
 * 
 * Get current authenticated user's profile
 * Requires JWT token in Authorization header
 * 
 * Header: Authorization: Bearer <token>
 * 
 * Response: { success: true, data: user }
 */
router.get('/me', protect, getCurrentUser);

/**
 * PUT /api/auth/profile
 * Update name and/or password for the logged-in user
 */
router.put('/profile', protect, updateProfile);

// Export router to be used in server.js
module.exports = router;
