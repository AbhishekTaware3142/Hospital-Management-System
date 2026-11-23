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
import TrendLineChart from "../components/TrendLineChart";
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

const appointmentSeries = [
  { key:"scheduled", label:"Scheduled", color:"#0ea5e9" },
  { key:"completed", label:"Completed", color:"#22c55e" },
  { key:"cancelled", label:"Cancelled", color:"#f43f5e" },
  { key:"noShow", label:"No show", color:"#eab308" },
];

const currentMonth = () => new Date().toISOString().slice(0, 7);
const formatMonth = (month) =>
  new Date(`${month}-01T00:00:00.000Z`).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

const initial = (name = "") => (name.trim()[0] || "?").toUpperCase();

const avatarColors = ["#0d9488","#6366f1","#f59e0b","#ec4899","#8b5cf6","#14b8a6","#f43f5e","#10b981"];
const colorFor = (str = "") => avatarColors[str.charCodeAt(0) % avatarColors.length];

function AppointmentStatusOverview({ appointmentData = [], periodLabel }) {
  const totals = appointmentSeries.map(({ key, label, color }) => ({
    key,
    label,
    color,
    count: appointmentData.reduce((sum, period) => sum + (Number(period[key]) || 0), 0),
  }));
  const total = totals.reduce((sum, item) => sum + item.count, 0);
  let offset = 0;
  const segments = totals.map((item) => {
    const start = offset;
    offset += total ? (item.count / total) * 100 : 0;
    return `${item.color} ${start}% ${offset}%`;
  });

  return (
    <section className="db-panel db-status-panel" aria-label={`Appointment status summary for ${periodLabel}`}>
      <div className="db-panel-heading">
        <div>
          <h2>Appointments by status</h2>
          <p>{periodLabel}</p>
        </div>
        <span className="db-panel-tag">OVERVIEW</span>
      </div>
      <div className="db-status-content">
        <div
          className="db-donut"
          style={{ background: total ? `conic-gradient(${segments.join(", ")})` : "#e2e8f0" }}
          role="img"
          aria-label={`${total} appointments in total`}
        >
          <div className="db-donut-center">
            <span>Total</span>
            <strong>{total.toLocaleString("en-IN")}</strong>
          </div>
        </div>
        <div className="db-status-legend">
          {totals.map(({ key, label, color, count }) => (
            <div className="db-status-legend-row" key={key}>
              <span className="db-status-label">
                <span className="db-legend-dot" style={{ background:color }} />
                {label}
              </span>
              <strong>{count.toLocaleString("en-IN")}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════
// Admin dashboard — new custom UI
// ════════════════════════════════════════════════════════════
function AdminDashboard({ user, userRole, refreshTrigger }) {
  const displayName = user?.name || "Admin";

  const [filter, setFilter] = useState("");
  const [page,   setPage]   = useState(1);
  const [chartEndMonth, setChartEndMonth] = useState(currentMonth);
  const [chartMode, setChartMode] = useState("sixMonths");

  const { appointments, totalPages, loading: apptLoading, error: apptError } =
    useAppointments({ filterStatus: filter, page, refreshTrigger });

  const [statsData,    setStatsData]    = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError,   setStatsError]   = useState("");

  useEffect(() => {
    let cancelled = false;
    setStatsLoading(true);
    setStatsError("");
    fetchReports({ endMonth: chartEndMonth })
      .then((res) => { if (!cancelled) setStatsData(res.data); })
      .catch((err) => {
        if (!cancelled) setStatsError(err.response?.data?.message || "Failed to load dashboard analytics");
      })
      .finally(() => { if (!cancelled) setStatsLoading(false); });
    return () => { cancelled = true; };
  }, [refreshTrigger, chartEndMonth]);

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
    <div className="db-dashboard">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Sora:wght@600;700;800&display=swap');
        .db-dashboard { display:flex; flex-direction:column; gap:18px; padding:clamp(12px,2vw,22px); border-radius:22px; background:linear-gradient(145deg,#dfeefa 0%,#dff1ed 100%); font-family:'DM Sans','Segoe UI',sans-serif; color:#16324a; }
        .db-heading { display:flex; align-items:center; justify-content:space-between; gap:16px; padding:2px 2px 4px; flex-wrap:wrap; }
        .db-heading-kicker { color:#3986b2; font-size:10px; font-weight:800; letter-spacing:1.6px; text-transform:uppercase; margin-bottom:5px; }
        .db-heading h1 { font-family:'Sora',sans-serif; font-size:24px; line-height:1.25; font-weight:800; letter-spacing:-.6px; color:#16324a; }
        .db-heading p { color:#71869a; font-size:13px; margin-top:4px; }
        .db-date-chip { display:flex; align-items:center; gap:8px; color:#315d78; background:linear-gradient(145deg,#e9f4fb,#e3f2ef); border:1px solid #c7dce8; border-radius:11px; padding:9px 13px; font-size:12px; font-weight:700; box-shadow:0 2px 8px rgba(27,65,99,.04); }
        .db-stats-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:14px; }
        .db-stat-card {
          background:linear-gradient(145deg,#edf6fc 0%,#e7f4f1 100%); border-radius:15px; padding:17px 18px;
          min-width:0; min-height:104px; box-shadow:0 2px 10px rgba(25,60,90,.07);
          border:1px solid #ccdfeb; transition:transform .2s,box-shadow .2s;
          position:relative; overflow:hidden;
        }
        .db-stat-card:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(25,60,90,.1); }
        .db-stat-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
        .db-stat-icon { width:35px; height:35px; display:flex; align-items:center; justify-content:center; border-radius:11px; font-size:17px; }
        .db-stat-live { display:flex; align-items:center; gap:5px; border-radius:99px; padding:4px 8px; background:#e9f8f2; color:#16835d; font-size:9px; font-weight:800; letter-spacing:.5px; }
        .db-stat-live::before { content:''; width:6px; height:6px; border-radius:50%; background:#20b981; }
        .db-stat-value { font-family:'Sora',sans-serif; font-weight:800; font-size:25px; color:#18344c; line-height:1.1; }
        .db-stat-label { color:#71869a; font-size:11px; font-weight:700; margin-top:5px; }
        .db-stat-trend { color:#54819f; font-size:10px; font-weight:600; margin-top:7px; }
        .db-chart-grid { display:grid; grid-template-columns:minmax(0,1.7fr) minmax(270px,1fr); gap:14px; align-items:stretch; }
        .db-panel { background:linear-gradient(145deg,#eaf4fb 0%,#e4f2ef 100%); border-radius:16px; padding:19px; box-shadow:0 2px 10px rgba(25,60,90,.07); border:1px solid #cbdfea; min-width:0; }
        .db-panel-heading { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:10px; }
        .db-panel-heading h2 { font-family:'Sora',sans-serif; font-size:15px; color:#18344c; font-weight:700; }
        .db-panel-heading p { color:#8a9bad; font-size:11px; margin-top:3px; }
        .db-panel-tag { border-radius:7px; padding:5px 7px; background:#eff6fc; color:#5680a0; font-size:8px; font-weight:800; letter-spacing:.7px; }
        .db-status-panel { display:flex; flex-direction:column; }
        .db-status-content { display:flex; flex:1; flex-direction:column; align-items:center; justify-content:center; gap:16px; padding:5px 0; }
        .db-donut { width:142px; height:142px; flex:none; border-radius:50%; display:grid; place-items:center; }
        .db-donut-center { width:112px; height:112px; border-radius:50%; background:#e9f4f4; display:flex; flex-direction:column; align-items:center; justify-content:center; }
        .db-donut-center span { color:#8a9bad; font-size:10px; }
        .db-donut-center strong { color:#18344c; font-family:'Sora',sans-serif; font-size:22px; }
        .db-status-legend { width:100%; display:grid; grid-template-columns:1fr 1fr; gap:9px 12px; }
        .db-status-legend-row { display:flex; justify-content:space-between; align-items:center; gap:8px; color:#60768a; font-size:10px; }
        .db-status-label { display:flex; align-items:center; gap:6px; }
        .db-legend-dot { width:7px; height:7px; border-radius:50%; flex:none; }
        .db-status-legend-row strong { color:#28445d; font-size:11px; }
        .db-appointments-panel { background:linear-gradient(145deg,#eaf4fb 0%,#e4f2ef 100%); border-radius:16px; padding:20px; box-shadow:0 2px 10px rgba(25,60,90,.07); border:1px solid #cbdfea; }
        .db-appointments-heading { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:16px; flex-wrap:wrap; }
        .db-appointments-heading h2 { font-family:'Sora',sans-serif; font-weight:700; font-size:16px; color:#18344c; }
        .db-appointments-heading p { color:#8a9bad; font-size:11px; margin-top:3px; }
        .db-appt-row {
          background:linear-gradient(120deg,#eff7fc,#ebf6f3); border-radius:12px; padding:13px 15px;
          display:flex; align-items:center; gap:18px; flex-wrap:wrap;
          border:1px solid #d5e5ed;
          transition:all .18s; cursor:pointer;
        }
        .db-appt-row:hover { transform:translateX(2px); box-shadow:0 4px 14px rgba(25,60,90,.08); border-color:#c7d8eb; }
        .db-badge {
          display:inline-flex; align-items:center; gap:5px;
          padding:5px 12px; border-radius:20px; font-size:12px; font-weight:600; white-space:nowrap;
        }
        .db-filter-select {
          background:#e9f4f7; border:1.5px solid #bfd7e2; border-radius:10px;
          padding:9px 14px; font-size:13px; font-weight:600; color:#31556d;
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
          font-size:13px; font-weight:600; cursor:pointer; user-select:none; border:none;
        }
        .db-skeleton {
          background:linear-gradient(90deg,#dfedf3 25%,#cfe2e9 50%,#dfedf3 75%);
          background-size:200% 100%; animation:db-shimmer 1.4s infinite; border-radius:8px;
        }
        @keyframes db-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @media (max-width: 1050px) {
          .db-stats-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
          .db-chart-grid { grid-template-columns:minmax(0,1.4fr) minmax(250px,1fr); }
        }
        @media (max-width: 720px) {
          .db-chart-grid { grid-template-columns:1fr; }
          .db-heading h1 { font-size:21px; }
        }
        @media (max-width: 480px) {
          .db-stats-grid { grid-template-columns:1fr 1fr; gap:9px; }
          .db-stat-card { padding:13px; }
          .db-stat-value { font-size:21px; }
          .db-stat-label { font-size:10px; }
          .db-panel, .db-appointments-panel { padding:15px; }
          .db-appt-row { gap:11px; padding:12px; }
        }
      `}</style>

      <header className="db-heading">
        <div>
          <div className="db-heading-kicker">Hospital management · Admin</div>
          <h1>Welcome back, {displayName}</h1>
          <p>Here’s what’s happening with your appointments.</p>
        </div>
        <div className="db-date-chip">
          <span aria-hidden="true">📅</span>
          {new Date().toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
        </div>
      </header>

      {/* Stats */}
      <div className="db-stats-grid">
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
                <div className="db-stat-top">
                  <div className="db-stat-icon" style={{ color:s.color, background:s.color+"16" }}>{s.icon}</div>
                  <div className="db-stat-live">LIVE</div>
                </div>
                <div className="db-stat-value">{s.value}</div>
                <div className="db-stat-label">{s.label}</div>
                <div className="db-stat-trend" style={{ color:s.color }}>{s.trend}</div>
              </div>
            ))
        }
      </div>

      {statsError && (
        <div role="alert" style={{ background:"#fff1f2", color:"#be123c", border:"1px solid #ffe4e6", borderRadius:12, padding:"12px 15px", fontSize:13 }}>
          ⚠️ {statsError}
        </div>
      )}

      <div className="db-chart-grid">
        <TrendLineChart
          title="Appointment trend"
          subtitle={`${chartMode === "daysInMonth" ? "Daily appointments" : "Monthly appointments"} by status${chartMode === "daysInMonth" ? ` · ${formatMonth(chartEndMonth)}` : ` · 3 months through ${formatMonth(chartEndMonth)}`}`}
          data={chartMode === "daysInMonth" ? statsData?.appointmentsByDay : statsData?.appointmentsByMonth}
          series={appointmentSeries}
          valueFormat={(value) => String(value)}
          loading={statsLoading}
          error={statsError}
          endMonth={chartEndMonth}
          onEndMonthChange={setChartEndMonth}
          onXAxisModeChange={setChartMode}
          variant="dashboard"
          xAxisMode={chartMode}
          periodCount={3}
        />
        <AppointmentStatusOverview
          appointmentData={chartMode === "daysInMonth" ? statsData?.appointmentsByDay : statsData?.appointmentsByMonth}
          periodLabel={chartMode === "daysInMonth" ? formatMonth(chartEndMonth) : `3 months through ${formatMonth(chartEndMonth)}`}
        />
      </div>

      {/* Appointments table */}
      <div className="db-appointments-panel">
        <div className="db-appointments-heading">
          <div>
            <h2>Appointments</h2>
            <p>Track all upcoming and past visits</p>
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
                  📅 No appointments found !
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
