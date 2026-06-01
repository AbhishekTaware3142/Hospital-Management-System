/**
 * AssistantWidget — WhatsApp-style floating chat widget
 * Real DB access, role-aware, smooth chat UX
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import { useColorModeValue } from '@chakra-ui/react'
import api from '../api/axiosConfig'
import { ROLES } from '../utils/roles'

// ─── tiny helpers ────────────────────────────────────────────────────────────
const ts = () =>
  new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

const DATA_INTENTS = [
  'appointments', 'today', 'reports', 'payments_summary', 'doctors', 'hospitals',
]

// ─── intent detection ────────────────────────────────────────────────────────
function detectIntent(text, userRole) {
  const q = text.toLowerCase()
  if (/schedul|upcoming|next appoint|future/.test(q))
    return { intent: 'appointments', params: { status: 'scheduled' } }
  if (/complet|done|finish|past appoint|visited/.test(q))
    return { intent: 'appointments', params: { status: 'completed' } }
  if (/cancel/.test(q))
    return { intent: 'appointments', params: { status: 'cancelled' } }
  if (/no.show|missed|absent/.test(q))
    return { intent: 'appointments', params: { status: 'no-show' } }
  if (/today/.test(q))
    return { intent: 'today' }
  if (/all appoint|every appoint|list appoint|my appoint|show appoint/.test(q))
    return { intent: 'appointments', params: {} }
  if (/payment|paid|bill|invoice|fee|due/.test(q))
    return userRole === ROLES.MASTER
      ? { intent: 'payments_summary' }
      : { intent: 'appointments', params: { paymentFocus: true } }
  if (/report|stat|summary|overview|revenue|earning/.test(q) && userRole === ROLES.MASTER)
    return { intent: 'reports' }
  if (/patient|patients/.test(q) && userRole !== ROLES.PATIENT)
    return { intent: 'appointments', params: {} }
  if (/doctor|specialist/.test(q))  return { intent: 'doctors' }
  if (/hospital|clinic/.test(q))    return { intent: 'hospitals' }
  if (/hello|hi\b|hey\b|help|start|what can/.test(q)) return { intent: 'greeting' }
  if (/book|schedule new|make appoint|reserve/.test(q)) return { intent: 'guide_book' }
  if (/profile|account|update me/.test(q))  return { intent: 'guide_profile' }
  if (/setting|password|notif/.test(q))     return { intent: 'guide_settings' }
  if (/logout|log out|sign out/.test(q))    return { intent: 'guide_logout' }
  if (/thank|thanks|great|awesome/.test(q)) return { intent: 'thanks' }
  return { intent: 'unknown' }
}

// ─── static replies ───────────────────────────────────────────────────────────
function staticReply(intent, userRole) {
  const hints = {
    [ROLES.PATIENT]: '• My scheduled appointments\n• Completed visits\n• Cancelled appointments\n• Payment status\n• List all appointments',
    [ROLES.DOCTOR]:  '• Today\'s schedule\n• Scheduled patients\n• Completed appointments\n• All appointments',
    [ROLES.MASTER]:  '• All appointments\n• Today\'s schedule\n• Revenue summary\n• Payment overview\n• Reports',
  }
  switch (intent) {
    case 'greeting':     return `👋 Hi! I'm your HMS assistant with live data access.\n\nHere's what you can ask:\n${hints[userRole] || ''}`
    case 'guide_book':   return '📅 To book an appointment:\n1. Click Book in the sidebar\n2. Choose a hospital & doctor\n3. Pick a date & time slot\n4. Confirm your booking'
    case 'guide_profile':return '👤 Go to Profile in the sidebar to update your name, phone, or address.'
    case 'guide_settings':return '⚙️ Visit Settings to change your password and manage preferences.'
    case 'guide_logout': return '🚪 Click Logout at the bottom of the sidebar to sign out.'
    case 'thanks':       return '😊 Happy to help! Let me know if you need anything else.'
    default:             return `🤔 I didn't quite get that.\n\nTry asking:\n${hints[userRole] || '"Show my appointments"'}`
  }
}

// ─── data formatters ──────────────────────────────────────────────────────────
const STATUS_EMOJI = { scheduled: '🕐', completed: '✅', cancelled: '❌', 'no-show': '⚠️' }
const PAY_EMOJI    = { pending: '⏳', completed: '💚', refunded: '🔄' }

function formatAppointments(list, paymentFocus, userRole) {
  if (!list?.length) return '📭 No appointments found.'
  return list.slice(0, 8).map((a, i) => {
    const date = new Date(a.appointmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    const who  = userRole === ROLES.PATIENT
      ? (a.doctor?.name ? `Dr. ${a.doctor.name}${a.doctor.specialization ? ` · ${a.doctor.specialization}` : ''}` : '')
      : (a.patient?.name ? `Patient: ${a.patient.name}` : '')
    const fee  = a.fee ? ` · ₹${a.fee.toLocaleString('en-IN')}` : ''
    const pay  = paymentFocus ? ` · ${PAY_EMOJI[a.paymentStatus] || ''} ${a.paymentStatus}` : ''
    return `${i + 1}. ${STATUS_EMOJI[a.status] || '•'} ${date}  ${a.timeSlot || ''}\n    ${who}${fee}${pay}\n    ${a.reason || ''}`
  }).join('\n\n') + (list.length > 8 ? `\n\n…and ${list.length - 8} more.` : '')
}

function formatReports(data) {
  const stats   = (data.stats   || []).map(s => `${s.icon} ${s.label}: ${s.value}  (${s.detail})`).join('\n')
  const summary = (data.summary || []).map(s => `• ${s.label}: ${s.value}`).join('\n')
  return `📊 Reports Overview\n\n${stats}\n\n${summary}`
}

function formatPayments(data) {
  const s = data.summary || {}
  const rows = (data.invoices || []).slice(0, 5).map((inv, i) => {
    const date = new Date(inv.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    const e = inv.status === 'Paid' ? '💚' : inv.status === 'Refunded' ? '🔄' : '⏳'
    return `${i + 1}. ${e} ${inv.id} · ${inv.patient} · ${inv.amount} · ${date}`
  }).join('\n')
  return `💳 Payment Summary\n• Total Paid: ${s.totalPaid}\n• Pending: ${s.pendingCount} (${s.dueAmount} due)\n\nRecent Invoices:\n${rows}`
}

function formatDoctors(list) {
  if (!list?.length) return '🩺 No doctors found.'
  return `🩺 Doctors (${list.length})\n\n` +
    list.slice(0, 8).map((d, i) =>
      `${i + 1}. ${d.name} — ${d.specialization}\n    ${d.experience}yr exp · ₹${d.consultationFee}`
    ).join('\n\n')
}

function formatHospitals(list) {
  if (!list?.length) return '🏥 No hospitals found.'
  return `🏥 Hospitals (${list.length})\n\n` +
    list.slice(0, 6).map((h, i) =>
      `${i + 1}. ${h.name} — ${h.city}\n    ${h.openStatus} · ⭐ ${h.rating}`
    ).join('\n\n')
}

// ─── quick chips per role ─────────────────────────────────────────────────────
const CHIPS = {
  [ROLES.PATIENT]: ['My scheduled', 'Completed visits', 'Cancelled', 'Payment status'],
  [ROLES.DOCTOR]:  ["Today's schedule", 'Scheduled patients', 'Completed', 'All appointments'],
  [ROLES.MASTER]:  ['All appointments', "Today's schedule", 'Revenue summary', 'Payment overview'],
}

// ─────────────────────────────────────────────────────────────────────────────
export default function AssistantWidget({ user, userRole }) {
  const firstName = user?.name?.split(' ')[0] || 'there'
  const chips     = CHIPS[userRole] || []

  const [isOpen,  setIsOpen]  = useState(false)
  const [msgs,    setMsgs]    = useState(() => [
    {
      id: 0, from: 'bot', time: ts(),
      text: `Hi ${firstName} 👋  I'm your HMS assistant.\nWhat would you like to check today?`,
    },
    {
      id: 1, from: 'bot', time: ts(),
      type: 'options',
      options: chips,
    },
  ])
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const [badge,   setBadge]   = useState(true)
  const msgId   = useRef(2)
  const listRef = useRef(null)
  const inputRef = useRef(null)

  // ── colors ──────────────────────────────────────────────────────────────
  const isDark      = document.documentElement.getAttribute('data-theme') === 'dark'
  const bg          = useColorModeValue('#f0f2f5', '#1a1f2e')
  const panelBg     = useColorModeValue('#ffffff', '#1e2535')
  const headerBg    = useColorModeValue('#0d4f8c', '#0d3a6e')
  const userBubble  = useColorModeValue('#0d8c6e', '#0a7a5e')
  const botBubble   = useColorModeValue('#ffffff', '#2a3347')
  const botText     = useColorModeValue('#111827', '#e2e8f0')
  const timeColor   = useColorModeValue('rgba(0,0,0,0.35)', 'rgba(255,255,255,0.35)')
  const inputBg     = useColorModeValue('#ffffff', '#2a3347')
  const inputBorder = useColorModeValue('#e2e8f0', '#3a4560')
  const chipBg      = useColorModeValue('rgba(13,79,140,0.08)', 'rgba(255,255,255,0.08)')
  const chipColor   = useColorModeValue('#0d4f8c', '#7eb8f7')
  const chipBorder  = useColorModeValue('rgba(13,79,140,0.25)', 'rgba(255,255,255,0.15)')
  const sendBg      = useColorModeValue('#0d8c6e', '#0a7a5e')
  const placeholderColor = useColorModeValue('#9ca3af', '#6b7280')

  // ── auto scroll ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (listRef.current)
      listRef.current.scrollTop = listRef.current.scrollHeight
  }, [msgs, loading])

  // ── focus input on open ──────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100)
  }, [isOpen])

  // ── fetch ────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async (intent, params) => {
    try {
      switch (intent) {
        case 'appointments': {
          const q = params.status ? { status: params.status } : {}
          const res = await api.get('/appointments', { params: q })
          const list = res.data?.data || []
          const label = params.status
            ? params.status.charAt(0).toUpperCase() + params.status.slice(1) + ' appointments'
            : 'All appointments'
          return `📋 ${label} (${list.length} found)\n\n` +
            formatAppointments(list, params.paymentFocus, userRole)
        }
        case 'today': {
          const res = await api.get('/appointments')
          const today = new Date().toDateString()
          const list  = (res.data?.data || []).filter(
            a => new Date(a.appointmentDate).toDateString() === today
          )
          return `📅 Today's Appointments (${list.length} found)\n\n` +
            formatAppointments(list, false, userRole)
        }
        case 'reports': {
          const res = await api.get('/analytics/reports')
          return formatReports(res.data?.data || {})
        }
        case 'payments_summary': {
          const res = await api.get('/analytics/payments')
          return formatPayments(res.data?.data || {})
        }
        case 'doctors': {
          const res = await api.get('/users/doctors')
          return formatDoctors(res.data?.data || res.data || [])
        }
        case 'hospitals': {
          const res = await api.get('/hospitals')
          return formatHospitals(res.data?.data || res.data || [])
        }
        default: return null
      }
    } catch (err) {
      if (err.response?.status === 403) return '🔒 You don\'t have permission to view that.'
      return `⚠️ ${err.response?.data?.message || err.message}`
    }
  }, [userRole])

  // ── send ─────────────────────────────────────────────────────────────────
  const send = useCallback(async (text) => {
    const t = (text || input).trim()
    if (!t || loading) return
    setInput('')

    // user bubble
    setMsgs(p => [...p, { id: msgId.current++, from: 'user', text: t, time: ts() }])
    setLoading(true)

    const { intent, params } = detectIntent(t, userRole)
    let reply
    if (DATA_INTENTS.includes(intent)) {
      reply = await fetchData(intent, params || {})
    } else {
      await new Promise(r => setTimeout(r, 500))
      reply = staticReply(intent, userRole)
    }

    setLoading(false)
    setMsgs(p => [...p, { id: msgId.current++, from: 'bot', text: reply, time: ts() }])
  }, [input, loading, userRole, fetchData])

  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── CHAT WINDOW ─────────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed',
        bottom: '88px',
        right: '24px',
        width: '360px',
        height: '520px',
        zIndex: 1000,
        display: isOpen ? 'flex' : 'none',
        flexDirection: 'column',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 12px 48px rgba(0,0,0,0.28)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}>

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div style={{
          background: headerBg,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexShrink: 0,
        }}>
          {/* Avatar */}
          <div style={{
            width: 40, height: 40,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, flexShrink: 0,
            border: '2px solid rgba(255,255,255,0.2)',
          }}>🤖</div>

          {/* Name + status */}
          <div style={{ flex: 1 }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>
              HMS Assistant
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <div style={{
                width: 7, height: 7, borderRadius: '50%',
                background: '#4ade80',
                boxShadow: '0 0 6px #4ade80',
              }} />
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>
                Online · {userRole === ROLES.MASTER ? 'Admin' : userRole === ROLES.DOCTOR ? 'Doctor' : 'Patient'} view
              </span>
            </div>
          </div>

          {/* Close */}
          <button
            onClick={() => {
                setIsOpen(false)
                setMsgs([
                  {
                    id: 0, from: 'bot', time: ts(),
                    text: `Hi ${firstName} 👋  I'm your HMS assistant.\nWhat would you like to check today?`,
                  },
                  {
                    id: 1, from: 'bot', time: ts(),
                    type: 'options',
                    options: chips,
                  },
                ])
                msgId.current = 2
                setInput('')
                setLoading(false)
              }}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none', borderRadius: '50%',
              width: 30, height: 30,
              color: 'rgba(255,255,255,0.8)',
              cursor: 'pointer', fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >✕</button>
        </div>

        {/* ── MESSAGES ────────────────────────────────────────────────────── */}
        <div
          ref={listRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            background: bg,
            padding: '12px 12px 4px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            scrollBehavior: 'smooth',
          }}
        >
          {/* Date divider */}
          <div style={{
            textAlign: 'center', fontSize: 11,
            color: timeColor, marginBottom: 4,
          }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>

          {msgs.map((msg) => {
            const isUser = msg.from === 'user'

            // ── Options bubble (bot asks with clickable chips) ──────────────
            if (msg.type === 'options') {
              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-end',
                    gap: 6,
                    animation: 'fadeSlide 0.2s ease',
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: headerBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, flexShrink: 0,
                  }}>🤖</div>

                  <div style={{
                    background: botBubble,
                    borderRadius: '18px 18px 18px 4px',
                    padding: '10px 12px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
                    maxWidth: '80%',
                  }}>
                    <div style={{
                      fontSize: 12,
                      color: botText,
                      marginBottom: 8,
                      opacity: 0.7,
                      fontWeight: 500,
                    }}>
                      Choose an option:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {msg.options.map(opt => (
                        <button
                          key={opt}
                          onClick={() => send(opt)}
                          disabled={loading}
                          style={{
                            background: 'transparent',
                            border: `1.5px solid ${headerBg}`,
                            borderRadius: 20,
                            color: headerBg,
                            fontSize: 12,
                            fontWeight: 600,
                            padding: '6px 14px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.15s',
                            opacity: loading ? 0.5 : 1,
                          }}
                          onMouseEnter={e => {
                            if (!loading) {
                              e.currentTarget.style.background = headerBg
                              e.currentTarget.style.color = '#fff'
                            }
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.color = headerBg
                          }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    <div style={{
                      textAlign: 'right', fontSize: 10,
                      color: timeColor, marginTop: 6,
                    }}>
                      {msg.time}
                    </div>
                  </div>
                </div>
              )
            }

            // ── Normal text bubble ─────────────────────────────────────────
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-end',
                  gap: 6,
                  animation: 'fadeSlide 0.2s ease',
                }}
              >
                {/* Bot avatar */}
                {!isUser && (
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: headerBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, flexShrink: 0,
                  }}>🤖</div>
                )}

                {/* Bubble */}
                <div style={{
                  maxWidth: '75%',
                  background: isUser ? userBubble : botBubble,
                  color: isUser ? '#fff' : botText,
                  borderRadius: isUser
                    ? '18px 18px 4px 18px'
                    : '18px 18px 18px 4px',
                  padding: '8px 12px 6px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
                  fontSize: 13,
                  lineHeight: 1.55,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {msg.text}
                  {/* Timestamp + tick */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: 3,
                    marginTop: 3,
                  }}>
                    <span style={{ fontSize: 10, color: isUser ? 'rgba(255,255,255,0.6)' : timeColor }}>
                      {msg.time}
                    </span>
                    {isUser && (
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>✓✓</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: headerBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, flexShrink: 0,
              }}>🤖</div>
              <div style={{
                background: botBubble,
                borderRadius: '18px 18px 18px 4px',
                padding: '10px 16px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
                display: 'flex', gap: 4, alignItems: 'center',
              }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 7, height: 7,
                    borderRadius: '50%',
                    background: '#94a3b8',
                    animation: `typingDot 1.2s ${i * 0.2}s infinite ease-in-out`,
                  }} />
                ))}
              </div>
            </div>
          )}

          <div style={{ height: 4 }} />
        </div>

        {/* ── INPUT BAR ───────────────────────────────────────────────────── */}
        <div style={{
          background: panelBg,
          borderTop: `1px solid ${inputBorder}`,
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexShrink: 0,
        }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            disabled={loading}
            placeholder="Type a message…"
            style={{
              flex: 1,
              background: inputBg,
              border: `1px solid ${inputBorder}`,
              borderRadius: 24,
              padding: '9px 16px',
              fontSize: 13,
              color: botText,
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = '#0d8c6e'}
            onBlur={e => e.target.style.borderColor = inputBorder}
          />

          {/* Send button */}
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            style={{
              width: 40, height: 40,
              borderRadius: '50%',
              background: (!input.trim() || loading) ? '#94a3b8' : sendBg,
              border: 'none',
              color: '#fff',
              fontSize: 16,
              cursor: (!input.trim() || loading) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              transition: 'background 0.2s, transform 0.1s',
              boxShadow: (!input.trim() || loading) ? 'none' : '0 2px 8px rgba(13,140,110,0.4)',
            }}
            onMouseEnter={e => { if (input.trim() && !loading) e.currentTarget.style.transform = 'scale(1.08)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
          >
            ➤
          </button>
        </div>
      </div>

      {/* ── FAB BUTTON ──────────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed',
        bottom: 28, right: 24,
        zIndex: 1001,
      }}>
        {/* Pulse ring */}
        {!isOpen && (
          <div style={{
            position: 'absolute',
            inset: -5,
            borderRadius: '50%',
            border: '2px solid #0d8c6e',
            opacity: 0.5,
            animation: 'fabPulse 2s infinite',
            pointerEvents: 'none',
          }} />
        )}

        <button
          onClick={() => {
              const opening = !isOpen
              setIsOpen(opening)
              setBadge(false)
              // Reset chat to welcome + options every time it's closed
              if (!opening) {
                setMsgs([
                  {
                    id: 0, from: 'bot', time: ts(),
                    text: `Hi ${firstName} 👋  I'm your HMS assistant.\nWhat would you like to check today?`,
                  },
                  {
                    id: 1, from: 'bot', time: ts(),
                    type: 'options',
                    options: chips,
                  },
                ])
                msgId.current = 2
                setInput('')
                setLoading(false)
              }
            }}
          style={{
            width: 54, height: 54,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0d8c6e, #0a6e57)',
            border: 'none',
            color: '#fff',
            fontSize: 22,
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(13,140,110,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.2s, box-shadow 0.2s',
            position: 'relative',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.1)'
            e.currentTarget.style.boxShadow = '0 6px 28px rgba(13,140,110,0.6)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(13,140,110,0.5)'
          }}
        >
          {isOpen ? '✕' : '🤖'}

          {/* Unread badge */}
          {!isOpen && badge && (
            <div style={{
              position: 'absolute',
              top: -2, right: -2,
              width: 18, height: 18,
              borderRadius: '50%',
              background: '#ef4444',
              color: '#fff',
              fontSize: 10, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid white',
            }}>1</div>
          )}
        </button>
      </div>

      {/* ── KEYFRAME STYLES ─────────────────────────────────────────────── */}
      <style>{`
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30%            { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes fabPulse {
          0%, 100% { transform: scale(1);    opacity: 0.5; }
          50%       { transform: scale(1.18); opacity: 0; }
        }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
