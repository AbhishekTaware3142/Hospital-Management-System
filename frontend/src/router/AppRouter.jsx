/**
 * AppRouter — central route registry + role-based route guards
 *
 * How route guards work here:
 *   Each case in renderPage() calls canAccess(allowedRoles).
 *   If the logged-in user's role is NOT in allowedRoles,
 *   they are silently redirected to their default landing page
 *   instead of seeing the page or an error.
 *
 * Permission matrix:
 *   dashboard  → all roles
 *   hospitals  → all roles
 *   reports    → Doctor + Master only
 *   payments   → Master only
 *   profile    → all roles
 *   settings   → all roles
 *   book       → Patient only
 *   admin      → Master only
 */
import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@chakra-ui/react'
import { ROLES, normalizeRole } from '../utils/roles'
import AppShell from '../layouts/AppShell'

// Pages
import DashboardPage from '../pages/DashboardPage'
import HospitalsPage from '../pages/HospitalsPage'
import BookPage      from '../pages/BookPage'
import ReportsPage   from '../pages/ReportsPage'
import PaymentsPage  from '../pages/PaymentsPage'
import ProfilePage   from '../pages/ProfilePage'
import SettingsPage  from '../pages/SettingsPage'
import AdminPage     from '../pages/AdminPage'

// Booking modal
import BookingModal from '../components/BookingModal'

// Assistant widget
import AssistantWidget from '../components/AssistantWidget'

export default function AppRouter({ user, onLogout }) {
  const userRole = normalizeRole(user.role)
  const isAdmin  = userRole === ROLES.MASTER
  const toast    = useToast()

  // ── Default landing page per role ──────────────────────────
  // Admin lands on the dashboard (which shows the new admin UI).
  // Non-admin roles also land on dashboard.
  const defaultPage = 'dashboard'

  const [activeNav,      setActiveNav]      = useState(defaultPage)
  const [showBookModal,  setShowBookModal]  = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const openBook  = () => setShowBookModal(true)
  const closeBook = () => setShowBookModal(false)
  const onBooked  = () => { setRefreshTrigger(p => p + 1); closeBook() }

  // ── 403 global listener ────────────────────────────────────
  // axiosConfig.js fires a 'medibook:forbidden' event when the
  // backend returns 403. We listen here and show a toast.
  useEffect(() => {
    const handle403 = (e) => {
      toast({
        title:       'Access Denied',
        description: e.detail?.message || 'You do not have permission for this action.',
        status:      'error',
        duration:    4000,
        isClosable:  true,
        position:    'top-right',
      })
    }

    // Register the listener on the window object
    window.addEventListener('medibook:forbidden', handle403)

    // Clean up when this component unmounts (e.g. on logout)
    return () => window.removeEventListener('medibook:forbidden', handle403)
  }, [toast])

  // ── Route guard helper ─────────────────────────────────────
  // canAccess(allowedRoles) returns true if the user's role
  // is in the allowedRoles array, false otherwise.
  const canAccess = useCallback(
    (allowedRoles) => allowedRoles.includes(userRole),
    [userRole]
  )

  // ── Scroll to top on navigation ───────────────────────────
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [activeNav])

  // ── Safe nav change ────────────────────────────────────────
  // Called when the user clicks a sidebar item.
  // Double-checks the role before switching — even if somehow
  // a nav item appeared that shouldn't have.
  const handleNavChange = (key) => {
    const guards = {
      payments: [ROLES.MASTER],
      admin:    [ROLES.MASTER],
      book:     [ROLES.PATIENT],
    }
    const allowed = guards[key]
    if (allowed && !canAccess(allowed)) {
      // Silently redirect to their default page
      setActiveNav(defaultPage)
      return
    }
    setActiveNav(key)
  }

  // ── Route map ──────────────────────────────────────────────
  const renderPage = () => {
    switch (activeNav) {

      // ── Dashboard — all roles ──────────────────────────────
      case 'dashboard':
        return (
          <DashboardPage
            user={user}
            userRole={userRole}
            refreshTrigger={refreshTrigger}
            onBook={openBook}
          />
        )

      // ── Hospitals — all roles ──────────────────────────────
      case 'hospitals':
        return <HospitalsPage onBook={openBook} />

      // ── Book — Patient only ────────────────────────────────
      // Guard: if not a patient, fall through to default page.
      case 'book':
        if (!canAccess([ROLES.PATIENT])) {
          setActiveNav(defaultPage)
          return null
        }
        return <BookPage onSuccess={onBooked} />

      // ── Reports — Doctor + Master only ────────────────────
      case 'reports':
        if (!canAccess([ROLES.DOCTOR, ROLES.MASTER])) {
          setActiveNav(defaultPage)
          return null
        }
        return <ReportsPage userRole={userRole} />

      // ── Payments — Master only ─────────────────────────────
      // Guard: if not Master, redirect to their default page.
      case 'payments':
        if (!canAccess([ROLES.MASTER])) {
          setActiveNav(defaultPage)
          return null
        }
        return <PaymentsPage />

      // ── Profile — all roles ────────────────────────────────
      case 'profile':
        return <ProfilePage user={user} />

      // ── Settings — all roles ───────────────────────────────
      case 'settings':
        return <SettingsPage user={user} onLogout={onLogout} />

      // ── Admin — Master only ────────────────────────────────
      // Guard: if not Master, redirect to dashboard.
      case 'admin':
        if (!canAccess([ROLES.MASTER])) {
          setActiveNav('dashboard')
          return null
        }
        return <AdminPage />

      // ── Fallback ───────────────────────────────────────────
      default:
        return (
          <DashboardPage
            user={user}
            userRole={userRole}
            refreshTrigger={refreshTrigger}
            onBook={openBook}
          />
        )
    }
  }

  return (
    <>
      <AppShell
        user={user}
        userRole={userRole}
        isAdmin={isAdmin}
        activeNav={activeNav}
        onNavChange={handleNavChange}
        onLogout={onLogout}
      >
        {renderPage()}

        {/* Global booking modal — only patients can open it */}
        {userRole === ROLES.PATIENT && (
          <BookingModal
            isOpen={showBookModal}
            onClose={closeBook}
            onSuccess={onBooked}
          />
        )}
      </AppShell>

      {/* Floating AI assistant — outside AppShell so it never remounts on nav change */}
      <AssistantWidget user={user} userRole={userRole} />
    </>
  )
}
