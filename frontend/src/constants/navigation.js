/**
 * NAVIGATION CONSTANTS
 * Single source of truth for sidebar nav items.
 *
 * Each item has an optional `roles` array.
 * If `roles` is present, only those roles see the item.
 * If `roles` is absent, every logged-in user sees it.
 *
 * Permission matrix (your requirement):
 *   Dashboard  → all roles
 *   Hospitals  → all roles
 *   Reports    → all roles  (Patient, Doctor, Master)
 *   Payments   → Master only
 *   Profile    → all roles
 *   Settings   → all roles
 *   Book       → Patient only
 *   Admin      → Master only
 */

export const ROLES = {
  MASTER:  'Master',
  PATIENT: 'patient',
  DOCTOR:  'Docter',
}

// ── Full nav list with role restrictions ──────────────────────
// Used by AppShell to build the sidebar.
// AppShell filters this list by the logged-in user's role.
export const ALL_NAV_ITEMS = [
  // visible to everyone
  { key: 'dashboard', label: 'Dashboard',        icon: '📊' },
  { key: 'hospitals', label: 'Hospitals',         icon: '🏥' },

  // Reports — Doctor + Master only
  { key: 'reports',   label: 'Reports',           icon: '📈', roles: [ROLES.DOCTOR, ROLES.MASTER] },

  // Payments — Master only
  { key: 'payments',  label: 'Payments',          icon: '💳', roles: [ROLES.MASTER] },

  // Profile & Settings — everyone
  { key: 'profile',   label: 'Profile',           icon: '👤' },
  { key: 'settings',  label: 'Settings',          icon: '⚙️' },

  // Book appointment — Patient only
  { key: 'book',      label: 'Book Appointment',  icon: '📅', roles: [ROLES.PATIENT] },

  // Admin panel — Master only
  { key: 'admin',     label: 'Admin Panel',       icon: '🛡️', roles: [ROLES.MASTER] },
]

// ── Legacy exports kept so existing imports don't break ───────
export const NAV_ITEMS_COMMON  = ALL_NAV_ITEMS.filter(i => !i.roles)
export const NAV_ITEMS_PATIENT = [{ key: 'book', label: 'Book Appointment', icon: '📅' }]
export const NAV_ITEMS_ADMIN   = [{ key: 'admin', label: 'Admin Panel', icon: '🛡️' }]
export const NAV_ITEMS         = NAV_ITEMS_COMMON

export const PAGE_META = {
  dashboard: { sub: 'Overview',            title: 'Dashboard'       },
  hospitals:  { sub: 'Hospital Details',    title: 'City Hospital'   },
  book:       { sub: 'Appointment Booking', title: 'Book Appointment'},
  reports:    { sub: 'Analytics',           title: 'Health Reports'  },
  payments:   { sub: 'Finance',             title: 'Billing Overview'},
  profile:    { sub: 'Account',             title: 'Your Profile'    },
  settings:   { sub: 'Preferences',         title: 'Settings'        },
  admin:      { sub: 'Administration',      title: 'Admin Dashboard' },
}
