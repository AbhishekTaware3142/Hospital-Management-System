/**
 * DashboardPage
 *
 * Admin (Master) → new custom UI: live stats + full appointments table
 * Patient/Doctor → original Chakra UI: welcome banner + AppointmentsList
 */
import { useState, useEffect } from "react";
import { ROLES, normalizeRole } from "../utils/roles";
import { useAppointments } from "../hooks/useAppointments";
import { fetchReports } from "../api/analyticsService";
import AppointmentsList from "../components/AppointmentsList";
import {
  Box, Flex, Stack, Heading, Text, Button, useColorModeValue,
} from "@chakra-ui/react";

// ── status badge config ──────────────────────────────────────
const statusConfig = {
  scheduled: { bg: "#e0f2fe", color: "#0369a1", dot: "#0ea5e9", label: "Scheduled" },
  cancelled:  { bg: "#ffe4e6", color: "#be123c", dot: "#f43f5e", label: "Cancelled"  },
  completed:  { bg: "#dcfce7", color: "#15803d", dot: "#22c55e", label: "Completed"  },
  "no-show":  { bg: "#fef9c3", color: "#854d0e", dot: "#eab308", label: "No Show"    },
};

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

const initial = (name = "") => (name.trim()[0] || "?").toUpperCase();

const avatarColors = ["#0d9488","#6366f1","#f59e0b","#ec4899","#8b5cf6","#14b8a6","#f43f5e","#10b981"];
const colorFor = (str = "") => avatarColors[str.charCodeAt(0) % avatarColors.length];

// ════════════════════════════════════════════════════════════
// Admin dashboard — new custom UI
// ════════════════════════════════════════════════════════════
function AdminDashboard({ user, userRole, refreshTrigger }) {
  const displayName = user?.name || "Admin";

  const [filter, setFilter] = useState("");
  const [page,   setPage]   = useState(1);

  const { appointments, totalPages, loading: apptLoading, error: apptError } =
    useAppointments({ filterStatus: filter, page, refreshTrigger });

  const [statsData,    setStatsData]    = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setStatsLoading(true);
    fetchReports()
      .then((res) => { if (!cancelled) setStatsData(res.data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setStatsLoading(false); });
    return () => { cancelled = true; };
  }, [refreshTrigger]);

  const statCards = statsData
    ? [
        {
          label: "Appointments this week",
          value: String(statsData.stats[0]?.value ?? "—"),
          icon: "📅", trend: statsData.stats[0]?.detail ?? "", color: "#0d9488",
        },
        {
          label: "Upcoming",
          value: statsData.summary.find(s => s.label === "Upcoming follow-ups")?.value ?? "—",
          icon: "🕐", trend: "scheduled & future", color: "#6366f1",
        },
        {
          label: "Completed visits",
          value: statsData.summary.find(s => s.label === "Completed visits")?.value ?? "—",
          icon: "✅", trend: "all time", color: "#10b981",
        },
        {
          label: "New patients",
          value: String(statsData.stats[1]?.value ?? "—"),
          icon: "👥", trend: statsData.stats[1]?.detail ?? "", color: "#8b5cf6",
        },
      ]
    : [];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:22, fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Sora:wght@600;700;800&display=swap');
        .db-stat-card {
          background:#fff; border-radius:16px; padding:20px 22px;
          flex:1; min-width:160px; box-shadow:0 2px 12px rgba(0,0,0,.06);
          border:1px solid #e8eef4; transition:transform .2s,box-shadow .2s;
          position:relative; overflow:hidden; cursor:default;
        }
        .db-stat-card:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,.1); }
        .db-appt-row {
          background:#fff; border-radius:14px; padding:16px 20px;
          display:flex; align-items:center; gap:18px; flex-wrap:wrap;
          box-shadow:0 1px 6px rgba(0,0,0,.05); border:1px solid #eef2f7;
          transition:all .18s; cursor:pointer;
        }
        .db-appt-row:hover { transform:translateX(3px); box-shadow:0 4px 16px rgba(0,0,0,.1); border-color:#c7d8eb; }
        .db-badge {
          display:inline-flex; align-items:center; gap:5px;
          padding:5px 12px; border-radius:20px; font-size:12px; font-weight:600; white-space:nowrap;
        }
        .db-filter-select {
          background:#fff; border:1.5px solid #e2e8f0; border-radius:10px;
          padding:9px 14px; font-size:13px; font-weight:500; color:#334155;
          outline:none; cursor:pointer; font-family:inherit;
        }
        .db-avatar {
          width:44px; height:44px; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          font-weight:700; font-size:16px; color:#fff; flex-shrink:0;
        }
        .db-left-bar { width:5px; position:absolute; left:0; top:0; bottom:0; border-radius:16px 0 0 16px; }
        .db-page-btn {
          width:32px; height:32px; border-radius:8px;
          display:flex; align-items:center; justify-content:center;
          font-size:13px; font-weight:600; cursor:pointer; user-select:none;
        }
        .db-skeleton {
          background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);
          background-size:200% 100%; animation:db-shimmer 1.4s infinite; border-radius:8px;
        }
        @keyframes db-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>

      {/* Welcome Banner */}
      <div style={{
        background:"linear-gradient(135deg,#0f2a35 0%,#0d4a5a 50%,#0d9488 100%)",
        borderRadius:20, padding:"28px 32px", position:"relative", overflow:"hidden",
        display:"flex", alignItems:"center", justifyContent:"space-between", gap:16,
      }}>
        <div style={{ position:"absolute", right:-30, top:-30, width:200, height:200, borderRadius:"50%", background:"rgba(255,255,255,.04)" }} />
        <div style={{ position:"absolute", right:60, bottom:-50, width:150, height:150, borderRadius:"50%", background:"rgba(13,148,136,.15)" }} />
        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ color:"#7dd3fc", fontSize:11, fontWeight:700, letterSpacing:"2px", textTransform:"uppercase", marginBottom:6 }}>
            Welcome back
          </div>
          <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:28, color:"#fff", letterSpacing:"-0.5px", marginBottom:6 }}>
            {displayName} 👋
          </div>
          <div style={{ color:"#94d3e6", fontSize:14 }}>
            Viewing all appointments across the system
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
        {statsLoading
          ? [1,2,3,4].map(i => (
              <div key={i} className="db-stat-card">
                <div className="db-skeleton" style={{ height:22, width:22, borderRadius:"50%", marginBottom:10 }} />
                <div className="db-skeleton" style={{ height:30, width:60, marginBottom:6 }} />
                <div className="db-skeleton" style={{ height:12, width:120 }} />
              </div>
            ))
          : statCards.map((s) => (
              <div key={s.label} className="db-stat-card">
                <div className="db-left-bar" style={{ background:s.color }} />
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:10 }}>
                  <div style={{ fontSize:22 }}>{s.icon}</div>
                  <div style={{ background:s.color+"22", color:s.color, padding:"3px 8px", borderRadius:8, fontSize:11, fontWeight:700 }}>Live</div>
                </div>
                <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:30, color:"#0f172a", lineHeight:1 }}>{s.value}</div>
                <div style={{ color:"#64748b", fontSize:12, fontWeight:600, marginTop:4 }}>{s.label}</div>
                <div style={{ color:s.color, fontSize:11, fontWeight:600, marginTop:8 }}>{s.trend}</div>
              </div>
            ))
        }
      </div>

      {/* Appointments table */}
      <div style={{ background:"#fff", borderRadius:20, padding:"24px", boxShadow:"0 2px 12px rgba(0,0,0,.06)", border:"1px solid #e8eef4" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:12 }}>
          <div>
            <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:18, color:"#0f172a" }}>Appointments</div>
            <div style={{ color:"#94a3b8", fontSize:13, marginTop:2 }}>Track all upcoming and past visits</div>
          </div>
          <select
            className="db-filter-select"
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {apptError && (
          <div style={{ background:"#ffe4e6", color:"#be123c", borderRadius:12, padding:"12px 16px", marginBottom:16, fontSize:13 }}>
            ⚠️ {apptError}
          </div>
        )}

        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {apptLoading
            ? [1,2,3].map(i => (
                <div key={i} style={{ background:"#fff", borderRadius:14, padding:"18px 22px", border:"1px solid #eef2f7" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:18 }}>
                    <div className="db-skeleton" style={{ width:44, height:44, borderRadius:"50%", flexShrink:0 }} />
                    <div style={{ flex:1, display:"flex", flexDirection:"column", gap:6 }}>
                      <div className="db-skeleton" style={{ height:14, width:160 }} />
                      <div className="db-skeleton" style={{ height:11, width:100 }} />
                    </div>
                    <div className="db-skeleton" style={{ height:28, width:90, borderRadius:20 }} />
                  </div>
                </div>
              ))
            : appointments.length === 0
              ? (
                <div style={{ textAlign:"center", padding:"40px 0", color:"#94a3b8", fontSize:15 }}>
                  📅 No appointments found
                </div>
              )
              : appointments.map((a) => {
                  const sc = statusConfig[a.status] || statusConfig.scheduled;
                  const patientName = a.patient?.name || "Patient";
                  const doctorName  = a.doctor?.name  || "—";
                  const specialty   = a.doctor?.specialization || "";

                  return (
                    <div key={a._id} className="db-appt-row">
                      <div className="db-avatar" style={{ background: colorFor(patientName) }}>
                        {initial(patientName)}
                      </div>

                      {/* Patient name + date */}
                      <div style={{ flex:"0 0 160px", minWidth:0 }}>
                        <div style={{ fontWeight:700, color:"#0f172a", fontSize:15 }}>{patientName}</div>
                        <div style={{ color:"#0d9488", fontSize:12, fontWeight:600, marginTop:2 }}>{fmtDate(a.appointmentDate)}</div>
                        <div style={{ color:"#94a3b8", fontSize:11, marginTop:1 }}>{a.timeSlot}</div>
                      </div>

                      {/* Doctor */}
                      <div style={{ flex:"0 0 180px", minWidth:0 }}>
                        <div style={{ fontSize:10, color:"#94a3b8", fontWeight:700, letterSpacing:"1px", textTransform:"uppercase", marginBottom:3 }}>Doctor</div>
                        <div style={{ color:"#6366f1", fontWeight:600, fontSize:14 }}>{doctorName}</div>
                        <div style={{ color:"#94a3b8", fontSize:12 }}>{specialty}</div>
                      </div>

                      {/* Reason */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:10, color:"#94a3b8", fontWeight:700, letterSpacing:"1px", textTransform:"uppercase", marginBottom:3 }}>Reason</div>
                        <div style={{ color:"#334155", fontSize:14, fontWeight:500 }}>{a.reason}</div>
                      </div>

                      {/* Status */}
                      <div>
                        <div className="db-badge" style={{ background:sc.bg, color:sc.color }}>
                          <span style={{ width:6, height:6, borderRadius:"50%", background:sc.dot, display:"inline-block" }} />
                          {sc.label}
                        </div>
                      </div>
                    </div>
                  );
                })
          }
        </div>

        {/* Pagination */}
        {!apptLoading && totalPages > 1 && (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:20, paddingTop:16, borderTop:"1px solid #f1f5f9", flexWrap:"wrap", gap:8 }}>
            <div style={{ color:"#94a3b8", fontSize:13 }}>Page {page} of {totalPages}</div>
            <div style={{ display:"flex", gap:6 }}>
              <div
                className="db-page-btn"
                style={{ background: page===1 ? "#f1f5f9" : "linear-gradient(135deg,#0d9488,#0891b2)", color: page===1 ? "#94a3b8" : "#fff", opacity: page===1 ? 0.5 : 1 }}
                onClick={() => page > 1 && setPage(p => p - 1)}
              >←</div>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <div
                  key={p}
                  className="db-page-btn"
                  style={{ background: p===page ? "linear-gradient(135deg,#0d9488,#0891b2)" : "#f1f5f9", color: p===page ? "#fff" : "#64748b" }}
                  onClick={() => setPage(p)}
                >{p}</div>
              ))}
              <div
                className="db-page-btn"
                style={{ background: page===totalPages ? "#f1f5f9" : "linear-gradient(135deg,#0d9488,#0891b2)", color: page===totalPages ? "#94a3b8" : "#fff", opacity: page===totalPages ? 0.5 : 1 }}
                onClick={() => page < totalPages && setPage(p => p + 1)}
              >→</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// Patient / Doctor dashboard — original Chakra UI
// ════════════════════════════════════════════════════════════
function UserDashboard({ user, userRole, refreshTrigger, onBook }) {
  const cardBg     = useColorModeValue("white", "hsl(222,24%,13%)");
  const cardBorder = useColorModeValue("gray.100", "whiteAlpha.100");

  return (
    <Box>
      {/* Welcome banner */}
      <Box
        mb={6} p={6} rounded="3xl" overflow="hidden" position="relative"
        bgGradient="linear(135deg, hsl(215,60%,22%) 0%, hsl(184,85%,18%) 100%)"
        boxShadow="0 8px 32px rgba(13,158,140,0.2)"
      >
        <Box
          position="absolute" top="-40px" right="-40px"
          w="200px" h="200px" borderRadius="full"
          bg="radial-gradient(circle, rgba(38,197,241,0.15) 0%, transparent 70%)"
        />
        <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
          <Stack spacing={1}>
            <Text fontSize="xs" color="whiteAlpha.600" fontWeight="700"
              textTransform="uppercase" letterSpacing="1px">
              Welcome back
            </Text>
            <Heading size="lg" color="white" fontWeight="800" letterSpacing="-0.5px">
              {user.name} 👋
            </Heading>
            <Text fontSize="sm" color="whiteAlpha.700">
              Manage your health appointments in one place
            </Text>
          </Stack>
          <Button
            colorScheme="teal" rounded="2xl" size="lg" px={8} fontWeight="700"
            bgGradient="linear(135deg, teal.400, cyan.400)"
            _hover={{
              bgGradient: "linear(135deg, teal.500, cyan.500)",
              transform: "translateY(-2px)",
              boxShadow: "0 8px 24px rgba(13,158,140,0.4)",
            }}
            onClick={onBook}
          >
            + Book Appointment
          </Button>
        </Flex>
      </Box>

      {/* Appointments */}
      <Box bg={cardBg} p={6} rounded="3xl" border="1px solid" borderColor={cardBorder} boxShadow="sm">
        <AppointmentsList
          userId={user.id}
          userRole={userRole}
          refreshTrigger={refreshTrigger}
        />
      </Box>
    </Box>
  );
}

// ════════════════════════════════════════════════════════════
// Root export — splits on role
// ════════════════════════════════════════════════════════════
export default function DashboardPage({ user, userRole, refreshTrigger, onBook }) {
  const isAdmin = normalizeRole(userRole) === ROLES.MASTER;

  if (isAdmin) {
    return (
      <AdminDashboard
        user={user}
        userRole={userRole}
        refreshTrigger={refreshTrigger}
      />
    );
  }

  return (
    <UserDashboard
      user={user}
      userRole={userRole}
      refreshTrigger={refreshTrigger}
      onBook={onBook}
    />
  );
}
