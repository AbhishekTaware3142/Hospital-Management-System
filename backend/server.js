/**
 * HOSPITAL MANAGEMENT SYSTEM SERVER
 * Main entry point for the backend application
 * ============================================
 */

// Load environment variables from .env file
// This reads PORT, MONGODB_URI, JWT_SECRET, etc.
require('dotenv').config();

// Import Express framework
const express = require('express');

// Import CORS middleware for cross-origin requests
// Allows frontend (different port) to communicate with backend
const cors = require('cors');

// Import database connection function
const connectDB = require('./config/database');

// Import route files
const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointments');
const userRoutes = require('./routes/users');
const hospitalRoutes = require('./routes/hospitals');
const analyticsRoutes = require('./routes/analytics');
const paymentRoutes = require('./routes/payments');

// Import middleware
const { errorHandler } = require('./middleware/auth');

/**
 * Create Express application instance
 * This is the main server object
 */
const app = express();

/**
 * ==================== MIDDLEWARE SETUP ====================
 * Middleware functions that process requests before routes
 */

// Parse incoming JSON request bodies
// Converts request.body from JSON string to JavaScript object
app.use(express.json());

// Enable CORS (Cross-Origin Resource Sharing)
// Allows requests from frontend running on different origin
// By default, allows requests from any origin
app.use(cors());

/**
 * ==================== DATABASE CONNECTION ====================
 * Connect to MongoDB before starting server
 */
const startServer = async () => {
  await connectDB();

  /**
   * ==================== ROUTES ====================
   * Define API endpoints
   */
  app.use('/api/auth', authRoutes);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/hospitals', hospitalRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/payments', paymentRoutes);

  /**
   * ==================== HEALTH CHECK ====================
   * Simple endpoint to test if server is running
   */
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Hospital Management System API is running',
      timestamp: new Date(),
    });
  });

  /**
   * ==================== 404 HANDLER ====================
   * Handles requests to non-existent endpoints
   */
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'API endpoint not found',
      path: req.originalUrl,
    });
  });

  /**
   * ==================== ERROR HANDLER ====================
   * Catches errors from any middleware or route handler
   * Must be last middleware registered
   */
  app.use(errorHandler);

  /**
   * ==================== START SERVER ====================
   * Listen on specified port
   */
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════╗
║   🏥 Hospital Management System Started 🏥 ║
╠════════════════════════════════════════════╣
║ Server running on: http://localhost:${PORT}║
║ Environment: ${process.env.NODE_ENV}       ║
║ Database: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/Medibook'}           ║
╚════════════════════════════════════════════╝
    `);
  });
};

startServer();

// trigger restart 2
