/**
 * AXIOS CONFIGURATION
 * Sets up HTTP client with default settings and interceptors
 * ==========================================================
 */

import axios from 'axios'

// Create one shared axios instance used by every API call in the app.
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
})

// ─────────────────────────────────────────────────────────────
// REQUEST INTERCEPTOR
// Runs before EVERY outgoing request.
// Reads the JWT from localStorage and attaches it to the header
// so the backend protect middleware can verify it.
// ─────────────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // Read the token that was saved during login
    const token = localStorage.getItem('token')

    if (token) {
      // Attach it as a Bearer token — this is what protect reads:
      //   req.headers.authorization = "Bearer eyJhbGci..."
      config.headers.Authorization = `Bearer ${token}`
    }

    return config // pass the modified config along
  },
  (error) => Promise.reject(error)
)

// ─────────────────────────────────────────────────────────────
// RESPONSE INTERCEPTOR
// Runs after EVERY response comes back from the backend.
//
// 401 Unauthorized — token is missing, invalid, or expired.
//   Action: wipe the token and reload to the login screen.
//
// 403 Forbidden — token is valid but the role is not allowed.
//   Action: dispatch a custom event so the UI can show a toast.
//   We do NOT redirect — the user is still logged in, just
//   trying to access something their role cannot see.
// ─────────────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response, // success — pass through unchanged

  (error) => {
    const status = error.response?.status

    if (status === 401) {
      // Token is gone or expired — force logout
      localStorage.removeItem('token')
      // Reload the page; App.jsx will see no token and show LoginPage
      window.location.href = '/'
    }

    if (status === 403) {
      // Role is not allowed for this action.
      // Fire a browser custom event so any component can listen
      // and show a toast without needing prop drilling.
      window.dispatchEvent(
        new CustomEvent('medibook:forbidden', {
          detail: {
            message:
              error.response?.data?.message ||
              'You do not have permission to perform this action.',
          },
        })
      )
    }

    return Promise.reject(error)
  }
)

export default api
