/**
 * AUTH MIDDLEWARE
 * JWT verification + role-based access control
 * =============================================
 *
 * Two middleware functions are exported:
 *   1. protect   — verifies the JWT token is real and not expired
 *   2. authorize — checks the user's role against allowed roles
 */

const jwt = require('jsonwebtoken');
const { normalizeRole } = require('../utils/roles');

// ─────────────────────────────────────────────────────────────
// 1. protect
//    Runs on every route that needs a logged-in user.
//    It reads the Authorization header, verifies the token,
//    and attaches the decoded user info to req.user.
// ─────────────────────────────────────────────────────────────
const protect = (req, res, next) => {

  // Step 1 — Read the Authorization header from the request.
  //   The frontend sends:  Authorization: Bearer <token>
  const authHeader = req.headers.authorization;

  // Step 2 — Check the header exists AND starts with "Bearer ".
  //   If not, the user is not logged in → send 401 Unauthorized.
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Please log in.',
    });
  }

  // Step 3 — Extract just the token string after "Bearer ".
  //   e.g. "Bearer eyJhbGci..." → "eyJhbGci..."
  const token = authHeader.substring(7);

  // Step 4 — Verify the token using the secret key from .env.
  //   jwt.verify() does TWO things at once:
  //     a) checks the signature (was this token made by us?)
  //     b) checks the expiry  (is it still valid?)
  //   If either check fails it throws an error → caught below.
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Step 5 — Attach the decoded payload to req.user so every
    //   route handler downstream can read who is making the request.
    //   decoded looks like: { id: "abc123", role: "patient", iat: ..., exp: ... }
    req.user = {
      id:   decoded.id,
      role: normalizeRole(decoded.role), // normalise spelling variants
    };

    // Step 6 — Call next() to pass control to the next middleware
    //   or the actual route handler.
    next();

  } catch (err) {
    // jwt.verify threw — token is invalid or expired.
    return res.status(401).json({
      success: false,
      message: 'Token is invalid or has expired. Please log in again.',
    });
  }
};

// ─────────────────────────────────────────────────────────────
// 2. authorize(...allowedRoles)
//    Runs AFTER protect (so req.user is already set).
//    It checks whether the logged-in user's role is in the
//    list of roles that are allowed to use this route.
//
//    Usage in a route file:
//      router.get('/admin', protect, authorize('Master'), handler)
//      router.get('/data',  protect, authorize('Master','Docter'), handler)
// ─────────────────────────────────────────────────────────────
const authorize = (...allowedRoles) => {
  // authorize() returns a middleware function.
  // The ...allowedRoles syntax collects all arguments into an array.
  // e.g. authorize('Master', 'Docter') → allowedRoles = ['Master', 'Docter']

  return (req, res, next) => {

    // Step 1 — Read the role that was set by protect middleware.
    const userRole = req.user?.role;

    // Step 2 — Check if the user's role is in the allowed list.
    //   Array.includes() returns true if the value is found.
    if (!allowedRoles.includes(userRole)) {
      // Role is NOT allowed → 403 Forbidden.
      // 403 means "I know who you are, but you can't do this."
      // (401 means "I don't know who you are.")
      return res.status(403).json({
        success: false,
        message: `Access denied. This area is restricted to: ${allowedRoles.join(', ')}.`,
      });
    }

    // Step 3 — Role is allowed → continue to the route handler.
    next();
  };
};

// ─────────────────────────────────────────────────────────────
// 3. errorHandler
//    Global error catcher — must be the LAST app.use() in server.js
// ─────────────────────────────────────────────────────────────
const errorHandler = (err, req, res, next) => {
  console.error(err);

  let statusCode = err.statusCode || 500;
  let message    = err.message    || 'Internal Server Error';

  // Mongoose validation error (e.g. required field missing)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)[0].message;
  }

  // MongoDB duplicate key (e.g. phone already registered)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { protect, authorize, errorHandler };
