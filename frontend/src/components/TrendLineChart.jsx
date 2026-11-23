import { useState } from "react";

const getLastSixMonths = (data, endMonth) => {
  const valuesByMonth = new Map(data.map((item) => [item.month, item]));
  const anchorDate = endMonth ? new Date(`${endMonth}-01T00:00:00.000Z`) : new Date();
  anchorDate.setUTCDate(1);
  anchorDate.setUTCHours(0, 0, 0, 0);

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(anchorDate);
    date.setUTCMonth(date.getUTCMonth() - 5 + index);
    const month = date.toISOString().slice(0, 7);

    return {
      month,
      label: date.toLocaleDateString("en-IN", { month: "short", timeZone: "UTC" }),
      ...(valuesByMonth.get(month) || {}),
    };
  });
};

const getDaysInMonth = (data, selectedMonth) => {
  const valuesByDate = new Map(data.map((item) => [item.date, item]));
  const monthDate = new Date(`${selectedMonth}-01T00:00:00.000Z`);
  const year = monthDate.getUTCFullYear();
  const monthIndex = monthDate.getUTCMonth();
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();

  return Array.from({ length: daysInMonth }, (_, index) => {
    const date = new Date(Date.UTC(year, monthIndex, index + 1));
    const key = date.toISOString().slice(0, 10);
    return {
      date: key,
      label: String(index + 1),
      ...(valuesByDate.get(key) || {}),
    };
  });
};

export default function TrendLineChart({
  title,
  subtitle,
  data = [],
  series,
  valueFormat = (value) => String(value),
  loading = false,
  error = "",
  endMonth,
  onEndMonthChange,
  onXAxisModeChange,
  variant = "default",
  xAxisMode = "sixMonths",
  periodCount = 6,
}) {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const pointsByPeriod = xAxisMode === "daysInMonth"
    ? getDaysInMonth(data, endMonth)
    : getLastSixMonths(data, endMonth).slice(-periodCount);
  const maxValue = Math.max(0, ...pointsByPeriod.flatMap((period) =>
    series.map(({ key }) => Number(period[key]) || 0)
  ));
  const axisMax = Math.max(4, Math.ceil(maxValue / 4) * 4);
  const left = 82;
  const right = 18;
  const top = 18;
  const baseline = 208;
  const plotHeight = baseline - top;
  const plotWidth = 720 - left - right;

  const showPointDetails = (point, label, color) => {
    const dateLabel = xAxisMode === "daysInMonth"
      ? `${point.label} ${new Date(`${endMonth}-01T00:00:00.000Z`).toLocaleDateString("en-IN", {
          month:"long",
          year:"numeric",
          timeZone:"UTC",
        })}`
      : new Date(`${point.month}-01T00:00:00.000Z`).toLocaleDateString("en-IN", {
          month:"long",
          year:"numeric",
          timeZone:"UTC",
        });

    setHoveredPoint({
      x:point.x,
      y:point.y,
      dateLabel,
      label,
      value:point.value,
      color,
    });
  };

  return (
    <section
      aria-label={title}
      style={{
        background: variant === "dashboard"
          ? "linear-gradient(145deg,#eaf4fb 0%,#e6f4f2 100%)"
          : "#fff",
        borderRadius:20,
        padding:"24px",
        boxShadow: variant === "dashboard"
          ? "0 6px 20px rgba(22,76,108,.09)"
          : "0 2px 12px rgba(0,0,0,.06)",
        border: variant === "dashboard" ? "1px solid #cfe2ed" : "1px solid #e8eef4",
      }}
    >
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:14, flexWrap:"wrap", marginBottom:14 }}>
        <div>
          <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:18, color:"#173b56" }}>
            {title}
          </div>
          <div style={{ color:"#638198", fontSize:13, marginTop:2 }}>{subtitle}</div>
        </div>
        {(onEndMonthChange || onXAxisModeChange) && (
          <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
            {onXAxisModeChange && (
              <div role="group" aria-label="Appointment graph time scale" style={{ display:"flex", gap:3, padding:3, borderRadius:10, background:"#dcebf1" }}>
                {[
                  { value:"daysInMonth", label:"Daily" },
                  { value:"sixMonths", label:"Monthly" },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={xAxisMode === value}
                    onClick={() => onXAxisModeChange(value)}
                    style={{
                      border:0,
                      borderRadius:8,
                      padding:"6px 9px",
                      background:xAxisMode === value ? "#f5fbff" : "transparent",
                      color:xAxisMode === value ? "#205878" : "#638198",
                      fontFamily:"inherit",
                      fontSize:11,
                      fontWeight:700,
                      cursor:"pointer",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
            {onEndMonthChange && (
              <label style={{ display:"flex", alignItems:"center", gap:8, color:"#50708a", fontSize:11, fontWeight:700 }}>
                <span>Month</span>
                <input
                  type="month"
                  value={endMonth}
                  max={new Date().toISOString().slice(0, 7)}
                  onChange={(event) => onEndMonthChange(event.target.value)}
                  aria-label="Select the month shown in the appointment graph"
                  style={{
                    color:"#244b65",
                    background:"#f5fbff",
                    border:"1px solid #bad5e5",
                    borderRadius:9,
                    padding:"7px 9px",
                    fontFamily:"inherit",
                    fontSize:12,
                    fontWeight:700,
                  }}
                />
              </label>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="db-skeleton" style={{ height:240, width:"100%" }} aria-label={`Loading ${title.toLowerCase()}`} />
      ) : error ? (
        <div role="alert" style={{ color:"#be123c", padding:"32px 12px", textAlign:"center", fontSize:14 }}>
          Unable to load chart: {error}
        </div>
      ) : (
        <>
          <div
            style={{ position:"relative" }}
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <svg
              viewBox="0 0 720 250"
              role="img"
              aria-label={`${title}: ${series.map(({ label }) => label).join(", ")} for ${xAxisMode === "daysInMonth" ? endMonth : `${periodCount} months through ${endMonth}`}`}
              style={{ display:"block", width:"100%", height:"auto", overflow:"visible" }}
            >
            {[0, 1, 2, 3, 4].map((step) => {
              const value = (axisMax / 4) * step;
              const y = baseline - (plotHeight * step) / 4;

              return (
                <g key={step}>
                  <line x1={left} y1={y} x2={720 - right} y2={y} stroke={variant === "dashboard" ? "#c8dce8" : "#e8eef4"} strokeDasharray={step === 0 ? undefined : "4 5"} />
                  <text x={left - 10} y={y + 4} textAnchor="end" fill="#638198" fontSize="10">
                    {valueFormat(value)}
                  </text>
                </g>
              );
            })}
            {series.map(({ key, label, color }) => {
              const points = pointsByPeriod.map((period, index) => {
                const value = Number(period[key]) || 0;
                return {
                  x: left + (plotWidth * (index + 0.5)) / pointsByPeriod.length,
                  y: baseline - (value / axisMax) * plotHeight,
                  value,
                  label: period.label,
                  date: period.date,
                  month: period.month,
                };
              });
              const linePath = points.reduce((path, point, index) => {
                if (index === 0) return `M ${point.x} ${point.y}`;
                const previous = points[index - 1];
                const middleX = (previous.x + point.x) / 2;
                return `${path} Q ${middleX} ${previous.y} ${middleX} ${(previous.y + point.y) / 2} T ${point.x} ${point.y}`;
              }, "");

              return (
                <g key={key}>
                  <path
                    d={linePath}
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d={linePath}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="14"
                    pointerEvents="stroke"
                    onMouseMove={(event) => {
                      const bounds = event.currentTarget.ownerSVGElement.getBoundingClientRect();
                      const cursorX = ((event.clientX - bounds.left) / bounds.width) * 720;
                      const nearestIndex = Math.max(
                        0,
                        Math.min(
                          points.length - 1,
                          Math.round(((cursorX - left) / plotWidth) * points.length - 0.5)
                        )
                      );
                      showPointDetails(points[nearestIndex], label, color);
                    }}
                  />
                  {points.map((point, index) => (
                    <g key={`${key}-${point.label}-${index}`}>
                      <title>{`${point.label}${xAxisMode === "daysInMonth" ? ` ${endMonth}` : ""} ${label.toLowerCase()}: ${valueFormat(point.value)}`}</title>
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="4.5"
                        fill={variant === "dashboard" ? "#eaf4fb" : "#fff"}
                        stroke={color}
                        strokeWidth="3"
                      />
                    </g>
                  ))}
                  {/*
                    Larger invisible targets keep chart points usable on touch screens.
                  */}
                  {points.map((point, index) => (
                    <g key={`${key}-${point.label}-${index}-target`}>
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="12"
                        fill="transparent"
                        style={{ cursor:"pointer" }}
                        tabIndex={0}
                        aria-label={`${point.date || point.month} ${label}: ${valueFormat(point.value)}`}
                        onMouseEnter={() => showPointDetails(point, label, color)}
                        onFocus={() => showPointDetails(point, label, color)}
                        onBlur={() => setHoveredPoint(null)}
                      />
                    </g>
                  ))}
                </g>
              );
            })}
            {pointsByPeriod.map(({ date, month, label }, index) => (
              <text
                key={date || month}
                x={left + (plotWidth * (index + 0.5)) / pointsByPeriod.length}
                y={baseline + 24}
                textAnchor="middle"
                fill="#638198"
                fontSize={xAxisMode === "daysInMonth" ? "8" : "12"}
              >
                {xAxisMode === "daysInMonth" && Number(label) % 5 !== 1 ? "" : label}
              </text>
            ))}
            </svg>
            {hoveredPoint && (
              <div
                role="status"
                style={{
                  position:"absolute",
                  left:`${(hoveredPoint.x / 720) * 100}%`,
                  top:`${(hoveredPoint.y / 250) * 100}%`,
                  transform:"translate(-50%, calc(-100% - 12px))",
                  pointerEvents:"none",
                  zIndex:1,
                  minWidth:112,
                  padding:"9px 11px",
                  borderRadius:10,
                  background:"#173b56",
                  color:"#fff",
                  boxShadow:"0 5px 16px rgba(16,45,68,.22)",
                  fontSize:11,
                }}
              >
                <div style={{ color:"#b9d5e5", fontSize:10, marginBottom:4 }}>{hoveredPoint.dateLabel}</div>
                <div style={{ display:"flex", alignItems:"center", gap:7, fontWeight:700 }}>
                  <span style={{ width:8, height:8, borderRadius:"50%", background:hoveredPoint.color }} />
                  {hoveredPoint.label}: {valueFormat(hoveredPoint.value)}
                </div>
              </div>
            )}
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"10px 20px", justifyContent:"center", marginTop:6 }}>
            {series.map(({ key, label, color }) => (
              <div key={key} style={{ display:"flex", alignItems:"center", gap:7, color:"#496a82", fontSize:12, fontWeight:600 }}>
                <span aria-hidden="true" style={{ width:9, height:9, borderRadius:"50%", background:color }} />
                {label}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
