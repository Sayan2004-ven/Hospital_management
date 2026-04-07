import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

/* ─── Global styles ──────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(29,158,117,0.5); }
    50%       { box-shadow: 0 0 0 6px rgba(29,158,117,0); }
  }
  @keyframes rotateSlow {
    from { transform: rotate(0deg); } to { transform: rotate(360deg); }
  }

  .hd-page  { font-family: 'DM Sans', sans-serif; }
  .hd-title { font-family: 'Syne', sans-serif; }

  .reveal { animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
  .r1 { animation-delay: 0.04s; } .r2 { animation-delay: 0.10s; }
  .r3 { animation-delay: 0.16s; } .r4 { animation-delay: 0.22s; }
  .r5 { animation-delay: 0.28s; } .r6 { animation-delay: 0.34s; }

  .cost-row  { transition: background 0.18s ease, transform 0.18s ease; cursor: default; }
  .cost-row:hover { background: rgba(123,175,212,0.05) !important; transform: translateX(3px); }

  .metric-card { transition: border-color 0.18s ease, box-shadow 0.18s ease; }
  .metric-card:hover { border-color: #2a3a5c !important; box-shadow: 0 6px 20px rgba(0,0,0,0.3); }

  .btn-primary   { transition: all 0.18s ease; }
  .btn-primary:hover  { background: #e2e8f0 !important; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(255,255,255,0.1); }
  .btn-secondary { transition: all 0.18s ease; }
  .btn-secondary:hover { background: rgba(123,175,212,0.08) !important; border-color: #2a4060 !important; color: #7bafd4 !important; }
  .back-btn { transition: all 0.18s ease; }
  .back-btn:hover { background: rgba(255,255,255,0.06) !important; color: #e2e8f0 !important; }
  .tab-btn  { transition: color 0.15s ease; }
  .tab-btn:hover { color: #cbd5e1 !important; }
  .sidebar-card { transition: border-color 0.18s ease; }
  .sidebar-card:hover { border-color: #2a3a5c !important; }
`;

if (typeof document !== "undefined" && !document.getElementById("hd-styles")) {
  const el = document.createElement("style");
  el.id = "hd-styles";
  el.textContent = GLOBAL_CSS;
  document.head.appendChild(el);
}

/* ─── Donut Chart ────────────────────────────────────────────────── */
function DonutChart({ pct, color }) {
  const size = 140, stroke = 11;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const [anim, setAnim] = useState(0);

  useEffect(() => {
    let start = null;
    const ease = t => 1 - Math.pow(1 - t, 3);
    const run = ts => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 900, 1);
      setAnim(ease(p) * pct);
      if (p < 1) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  }, [pct]);

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1a2540" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={circ - (anim / 100) * circ}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${color}66)` }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 700, color, lineHeight: 1 }}>{pct}%</span>
        <span style={{ fontSize: 10, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 3 }}>occupancy</span>
      </div>
    </div>
  );
}

/* ─── Metric Card ────────────────────────────────────────────────── */
function MetricCard({ label, value, color, icon, cls }) {
  return (
    <div className={`reveal metric-card ${cls}`} style={s.metricCard}>
      <div style={s.metricIcon}><span style={{ fontSize: 15 }}>{icon}</span></div>
      <span style={{ ...s.metricVal, color }}>{value}</span>
      <span style={s.metricLbl}>{label}</span>
    </div>
  );
}

/* ─── Cost Row ───────────────────────────────────────────────────── */
function CostRow({ label, sub, cost, accent, icon, last }) {
  const fmt = n => Number(n).toLocaleString("en-IN");
  return (
    <div className="cost-row" style={{ ...s.costRow, borderBottom: last ? "none" : "0.5px solid #141f35" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ ...s.costIcon, background: `${accent}14`, border: `0.5px solid ${accent}28` }}>
          <span style={{ fontSize: 15 }}>{icon}</span>
        </div>
        <div>
          <div style={s.costName}>{label}</div>
          <div style={s.costSub}>{sub}</div>
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ ...s.costAmt, color: accent }}>₹{fmt(cost)}</div>
        <div style={s.costPer}>per day</div>
      </div>
    </div>
  );
}

/* ─── Sidebar stat row ───────────────────────────────────────────── */
function SideStatRow({ label, value, color }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "0.5px solid #111d30" }}>
      <span style={{ fontSize: 12, color: "#475569" }}>{label}</span>
      <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 600, color: color || "#cbd5e1" }}>{value}</span>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────── */
export default function HospitalDetails() {
  const { id } = useParams();
  const [hospital, setHospital] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:8081/hospitals").then(res => {
      if (res.data.success) setHospital(res.data.hospitals.find(h => h.id == id));
    });
  }, [id]);

  if (!hospital) return (
    <div className="hd-page" style={s.page}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 14 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", border: "2.5px solid #1a2540", borderTopColor: "#1D9E75", animation: "rotateSlow 0.8s linear infinite" }} />
        <span style={{ color: "#475569", fontSize: 13 }}>Loading hospital data…</span>
      </div>
    </div>
  );

  const total     = hospital.total_beds    || 0;
  const occupied  = hospital.occupied_beds || 0;
  const available = hospital.available_beds || (total - occupied);
  const pct       = total > 0 ? Math.round((occupied / total) * 100) : 0;
  const statusColor = pct >= 90 ? "#E24B4A" : pct >= 70 ? "#EF9F27" : "#1D9E75";
  const statusLabel = pct >= 90 ? "Near Capacity" : pct >= 70 ? "High Occupancy" : "Accepting Patients";
  const fmt = n => Number(n).toLocaleString("en-IN");

  return (
    <div className="hd-page" style={s.page}>
      {/* Ambient glow */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `radial-gradient(ellipse 55% 35% at 80% 0%, ${statusColor}12 0%, transparent 70%)` }} />
      {/* Grid texture */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.013) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.013) 1px,transparent 1px)",
        backgroundSize: "40px 40px",
        maskImage: "radial-gradient(ellipse 80% 50% at 50% 0%,black 30%,transparent 100%)" }} />

      {/* ── Hero ── */}
      <div style={s.hero}>
        <button className="back-btn" onClick={() => navigate(-1)} style={s.backBtn}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>

        <div style={{ marginTop: 18, animation: "fadeUp 0.4s ease both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ ...s.statusPill, background: `${statusColor}18`, color: statusColor, borderColor: `${statusColor}35` }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor, flexShrink: 0, animation: "pulse 2s infinite" }} />
              {statusLabel}
            </span>
            <span style={s.idPill}>ID #{hospital.id}</span>
          </div>
          <h1 className="hd-title" style={s.title}>{hospital.name}</h1>
          <p style={s.subtitle}>Hospital details · Bed availability · Pricing</p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", marginTop: 22 }}>
          {["overview", "costs", "contact"].map(tab => (
            <button key={tab} className="tab-btn" onClick={() => setActiveTab(tab)} style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "10px 16px", fontSize: 13, fontWeight: 500, letterSpacing: "0.02em",
              color: activeTab === tab ? "#e2e8f0" : "#475569",
              borderBottom: activeTab === tab ? `2px solid ${statusColor}` : "2px solid transparent",
            }}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Two-column body ── */}
      <div style={s.twoCol}>

        {/* LEFT — main content */}
        <div style={s.leftCol}>

          {/* Metrics */}
          <div style={s.metricsRow}>
            <MetricCard label="Total Beds" value={total}     color="#7bafd4" icon="🏥" cls="r1" />
            <MetricCard label="Occupied"   value={occupied}  color="#E24B4A" icon="🩺" cls="r2" />
            <MetricCard label="Available"  value={available} color="#1D9E75" icon="✅" cls="r3" />
            <MetricCard label="Occupancy"  value={`${pct}%`} color={statusColor} icon="📊" cls="r4" />
          </div>

          {/* Occupancy bar */}
          <div className="reveal r3" style={s.barCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={s.secLabel}>Occupancy breakdown</span>
              <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 99,
                background: `${statusColor}18`, color: statusColor, border: `0.5px solid ${statusColor}30` }}>
                {pct}% full
              </span>
            </div>
            <div style={{ height: 10, borderRadius: 6, background: "#111d30", overflow: "hidden", marginBottom: 10 }}>
              <div style={{
                height: "100%", borderRadius: 6, width: `${pct}%`,
                background: `linear-gradient(90deg, ${statusColor}bb, ${statusColor})`,
                boxShadow: `0 0 10px ${statusColor}44`,
                transition: "width 1.2s cubic-bezier(0.22,1,0.36,1)",
              }} />
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              {[{ c: statusColor, label: `Occupied — ${occupied}` }, { c: "#1D9E75", label: `Available — ${available}` }].map(({ c, label }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#475569" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: c, flexShrink: 0 }} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Costs */}
          <div className="reveal r4">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <p style={s.secLabel}>Bed costs per day</p>
              <span style={{ fontSize: 11, color: "#334155", background: "#0d1525", border: "0.5px solid #1e2540", padding: "3px 8px", borderRadius: 6 }}>
                Prices may vary
              </span>
            </div>
            <div style={{ background: "linear-gradient(145deg,#0d1525,#0a1020)", border: "0.5px solid #1a2540", borderRadius: 14, overflow: "hidden" }}>
              <CostRow label="General Ward" sub="Shared room · Basic care"         cost={hospital.general_cost} accent="#7bafd4" icon="🛏" />
              <CostRow label="ICU"          sub="Intensive monitoring · 24/7 care"  cost={hospital.icu_cost}     accent="#E24B4A" icon="❤️‍🔥" />
              <CostRow label="Private Room" sub="Single occupancy · Premium care"   cost={hospital.private_cost} accent="#c4b5fd" icon="⭐" last />
            </div>
          </div>

          {/* CTAs */}
          <div className="reveal r5" style={{ display: "flex", gap: 10 }}>
            <button className="btn-secondary" style={s.ctaSec}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ marginRight: 6 }}>
                <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Save hospital
            </button>
            <button className="btn-primary" style={s.ctaPri}>
              Book a bed
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ marginLeft: 8 }}>
                <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* RIGHT — sidebar */}
        <div style={s.rightCol}>

          {/* Donut + stats */}
          <div className="reveal r1 sidebar-card" style={s.sideCard}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <DonutChart pct={pct} color={statusColor} />
              <div style={{ width: "100%" }}>
                <SideStatRow label="Total beds" value={total} />
                <SideStatRow label="Occupied"   value={occupied}  color="#E24B4A" />
                <SideStatRow label="Available"  value={available} color="#1D9E75" />
                <div style={{ paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#475569" }}>Status</span>
                  <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 9px", borderRadius: 99,
                    background: `${statusColor}18`, color: statusColor, border: `0.5px solid ${statusColor}35` }}>
                    {statusLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick info */}
          <div className="reveal r2 sidebar-card" style={s.sideCard}>
            <p style={{ ...s.secLabel, marginBottom: 14 }}>Quick info</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { icon: "🕐", label: "Open 24/7",   sub: "Emergency services available" },
                { icon: "🚑", label: "Ambulance",    sub: "On-call response team" },
                { icon: "🌐", label: "Nexus Network", sub: "Registered & verified" },
              ].map(({ icon, label, sub }) => (
                <div key={label} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.04)",
                    border: "0.5px solid #1a2540", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, flexShrink: 0 }}>
                    {icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: "#cbd5e1", fontWeight: 500 }}>{label}</div>
                    <div style={{ fontSize: 11, color: "#334155", marginTop: 2 }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cost mini-bars */}
          <div className="reveal r3 sidebar-card" style={s.sideCard}>
            <p style={{ ...s.secLabel, marginBottom: 14 }}>Cost comparison</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "General", value: hospital.general_cost, color: "#7bafd4" },
                { label: "ICU",     value: hospital.icu_cost,     color: "#E24B4A" },
                { label: "Private", value: hospital.private_cost, color: "#c4b5fd" },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: "#475569" }}>{label}</span>
                    <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 12, fontWeight: 600, color }}>₹{fmt(value)}</span>
                  </div>
                  <div style={{ height: 3, borderRadius: 99, background: "#111d30", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 99,
                      width: `${Math.min(100, (value / (hospital.private_cost || 1)) * 100)}%`,
                      background: color, opacity: 0.75,
                      transition: "width 1s ease",
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="reveal r4" style={{ fontSize: 11, color: "#1e2c45", textAlign: "center" }}>
            Updated just now · Nexus HMS
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────── */
const s = {
  page:  { minHeight: "100vh", background: "#060a14", color: "#e2e8f0", position: "relative", overflowX: "hidden" },

  hero: {
    position: "relative", zIndex: 1,
    background: "linear-gradient(180deg, rgba(13,17,32,0.98) 0%, rgba(6,10,20,0.85) 100%)",
    borderBottom: "0.5px solid #1a2035",
    padding: "20px 32px 0",
    backdropFilter: "blur(12px)",
  },
  backBtn: {
    display: "inline-flex", alignItems: "center", gap: 6,
    background: "rgba(255,255,255,0.03)", border: "0.5px solid #1e2c45",
    borderRadius: 8, color: "#64748b", padding: "6px 12px", cursor: "pointer", fontSize: 13,
  },
  statusPill: {
    display: "inline-flex", alignItems: "center", gap: 6,
    fontSize: 11, fontWeight: 500, padding: "4px 10px", borderRadius: 99, border: "0.5px solid",
  },
  idPill: { fontSize: 11, color: "#334155", background: "#0d1525", border: "0.5px solid #1e2540", padding: "4px 10px", borderRadius: 99 },
  title:    { fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.4px", lineHeight: 1.2 },
  subtitle: { fontSize: 12, color: "#334155", marginTop: 6, letterSpacing: "0.03em" },

  twoCol: {
    position: "relative", zIndex: 1,
    display: "grid",
    gridTemplateColumns: "1fr 300px",
    gap: 20,
    padding: "24px 32px",
    alignItems: "start",
  },
  leftCol:  { display: "flex", flexDirection: "column", gap: 20 },
  rightCol: { display: "flex", flexDirection: "column", gap: 16 },

  metricsRow: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 },
  metricCard: {
    background: "linear-gradient(145deg,#0d1525,#0a1020)",
    border: "0.5px solid #1a2540", borderRadius: 12,
    padding: "16px 14px",
    display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6,
  },
  metricIcon: {
    width: 30, height: 30, borderRadius: 8,
    background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.06)",
    display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4,
  },
  metricVal: { fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 700, lineHeight: 1 },
  metricLbl: { fontSize: 11, color: "#475569", letterSpacing: "0.04em", textTransform: "uppercase" },

  barCard: {
    background: "linear-gradient(145deg,#0d1525,#0a1020)",
    border: "0.5px solid #1a2540", borderRadius: 14, padding: "18px 20px",
  },
  secLabel: { fontSize: 11, fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", color: "#475569" },

  costRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px" },
  costIcon: { width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  costName: { fontSize: 14, color: "#cbd5e1", fontWeight: 500 },
  costSub:  { fontSize: 11, color: "#334155", marginTop: 2 },
  costAmt:  { fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 600 },
  costPer:  { fontSize: 11, color: "#334155", marginTop: 2 },

  ctaPri: {
    flex: 2, padding: "12px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600,
    cursor: "pointer", background: "#f1f5f9", color: "#060a14", border: "none",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'DM Sans',sans-serif",
  },
  ctaSec: {
    flex: 1, padding: "12px 20px", borderRadius: 10, fontSize: 14, fontWeight: 500,
    cursor: "pointer", background: "rgba(255,255,255,0.03)", color: "#94a3b8",
    border: "0.5px solid #1e2c45",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'DM Sans',sans-serif",
  },

  sideCard: {
    background: "linear-gradient(145deg,#0d1525,#0a1020)",
    border: "0.5px solid #1a2540", borderRadius: 14, padding: "18px",
  },
};
