import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const PCT_COLOR = (pct) => {
  if (pct >= 90) return { bar: "#E24B4A", badge: { bg: "#200808", color: "#E24B4A", border: "#3d1010" } };
  if (pct >= 70) return { bar: "#EF9F27", badge: { bg: "#1f1500", color: "#EF9F27", border: "#3d2a00" } };
  return         { bar: "#1D9E75", badge: { bg: "#071f15", color: "#1D9E75", border: "#0f3d26" } };
};

/* ─── Injected keyframes ─────────────────────────────────────────── */
const KEYFRAMES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

  @keyframes dropdownIn {
    0%   { opacity: 0; transform: translateY(-10px) scale(0.94); filter: blur(4px); }
    100% { opacity: 1; transform: translateY(0px)  scale(1);    filter: blur(0px); }
  }
  @keyframes dropdownOut {
    0%   { opacity: 1; transform: translateY(0px)  scale(1);    filter: blur(0px); }
    100% { opacity: 0; transform: translateY(-10px) scale(0.94); filter: blur(4px); }
  }
  @keyframes itemSlideIn {
    from { opacity: 0; transform: translateX(-6px); }
    to   { opacity: 1; transform: translateX(0);    }
  }
  @keyframes overlayIn {
    from { opacity: 0; backdrop-filter: blur(0px); }
    to   { opacity: 1; backdrop-filter: blur(6px); }
  }
  @keyframes livePulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(29,158,117,0.5); }
    50%       { box-shadow: 0 0 0 5px rgba(29,158,117,0);  }
  }
`;

if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = KEYFRAMES;
  document.head.appendChild(style);
}

/* ─── Dropdown component (self-contained animation state) ─────────── */
function ProfileDropdown({ user, onNavigate, onLogout }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // tiny delay so initial paint has opacity:0, then trigger animation
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      style={{
        ...s.dropdown,
        animation: mounted ? "dropdownIn 0.28s cubic-bezier(0.22,1,0.36,1) forwards" : "none",
        opacity: mounted ? undefined : 0,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Glass shine strip */}
      <div style={s.dropdownShine} />

      {[
        { icon: "👤", text: `${user.fname} ${user.lname}` },
        { icon: "📧", text: user.email },
        { icon: "🆔", text: `ID: ${user.id}` },
      ].map(({ icon, text }, i) => (
        <p
          key={i}
          style={{
            ...s.dropdownItem,
            animation: `itemSlideIn 0.22s ease ${0.05 + i * 0.05}s both`,
          }}
        >
          <span style={s.dropdownIcon}>{icon}</span>
          {text}
        </p>
      ))}

      <div style={s.dropdownDivider} />

      <DropdownBtn
        delay="0.2s"
        onClick={() => onNavigate(`/update/${user.id}`)}
      >
        ✏️ Update Profile
      </DropdownBtn>
      <DropdownBtn delay="0.24s" onClick={onLogout} danger>
        🚪 Logout
      </DropdownBtn>
    </div>
  );
}

function DropdownBtn({ children, onClick, delay = "0s", danger }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      style={{
        ...s.dropdownBtn,
        animation: `itemSlideIn 0.22s ease ${delay} both`,
        background: hovered
          ? danger ? "rgba(226,75,74,0.15)" : "rgba(123,175,212,0.12)"
          : "rgba(255,255,255,0.04)",
        color: danger
          ? hovered ? "#E24B4A" : "#94a3b8"
          : hovered ? "#7bafd4" : "#94a3b8",
        borderColor: hovered
          ? danger ? "rgba(226,75,74,0.3)" : "rgba(123,175,212,0.25)"
          : "rgba(255,255,255,0.07)",
        transform: hovered ? "translateX(3px)" : "translateX(0)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/* ─── Main Dashboard ─────────────────────────────────────────────── */
export default function HospitalDashboard() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState("all");
  const [showProfile, setShowProfile] = useState(false);
  const chipRef = useRef(null);

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => { if (!user) navigate("/login"); }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    axios.get("http://localhost:8081/hospitals")
      .then(res => { if (res.data.success) setHospitals(res.data.hospitals); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (chipRef.current && !chipRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    if (showProfile) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showProfile]);

  const handleLogout = () => { logout(); navigate("/"); };
  if (!user) return null;

  const initials = (name) =>
    name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";

  const filtered = hospitals.filter(h => {
    const pct = h.total_beds > 0 ? h.occupied_beds / h.total_beds : 0;
    if (filter === "low")      return pct < 0.7;
    if (filter === "high")     return pct >= 0.7 && pct < 0.9;
    if (filter === "critical") return pct >= 0.9;
    return true;
  });

  const totalBeds  = hospitals.reduce((a, h) => a + h.total_beds, 0);
  const totalOcc   = hospitals.reduce((a, h) => a + h.occupied_beds, 0);
  const totalAvail = totalBeds - totalOcc;

  return (
    <div style={s.page}>

      {/* Blur overlay when dropdown is open */}
      {showProfile && (
        <div
          style={s.blurOverlay}
          onClick={() => setShowProfile(false)}
        />
      )}

      {/* Nav */}
      <nav style={s.nav}>
        <div style={s.logo}>
          <div style={s.logoMark}>
            <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
              <path d="M8 1.5L13 4.5V10.5L8 13.5L3 10.5V4.5L8 1.5Z" stroke="#7bafd4" strokeWidth="1.3"/>
              <circle cx="8" cy="7.5" r="1.8" fill="#7bafd4"/>
            </svg>
          </div>
          <span style={s.logoName}>Nexus</span>
        </div>

        <div style={s.navRight}>
          {/* User chip + dropdown */}
          <div
            ref={chipRef}
            style={{
              ...s.userChip,
              ...(showProfile ? s.userChipActive : {}),
            }}
            onClick={(e) => {
              e.stopPropagation();
              setShowProfile(v => !v);
            }}
          >
            <div style={s.avatar}>{initials(user.fname)}</div>
            <span style={s.userBadge}>
              👤 {user.fname} <span style={{ opacity: 0.5 }}>(ID: {user.id})</span>
            </span>
            {/* Chevron */}
            <svg
              width="12" height="12" viewBox="0 0 12 12" fill="none"
              style={{
                marginLeft: 2,
                transition: "transform 0.22s ease",
                transform: showProfile ? "rotate(180deg)" : "rotate(0deg)",
                color: "#64748b",
              }}
            >
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>

            {showProfile && (
              <ProfileDropdown
                user={user}
                onNavigate={navigate}
                onLogout={handleLogout}
              />
            )}
          </div>

          <button
            style={s.logoutBtn}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#2a3a5c"; e.currentTarget.style.color = "#94a3b8"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e2c45"; e.currentTarget.style.color = "#64748b"; }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </nav>

      <div style={s.main}>
        <div style={s.topRow}>
          <div>
            <h1 style={s.pageTitle}>Hospital availability</h1>
            <p style={s.pageSub}>Live bed status across the registered network</p>
          </div>
          <div style={s.livePill}>
            <span style={s.liveDot} />
            Live data
          </div>
        </div>

        <div style={s.summaryRow}>
          {[
            { label: "Total beds",  value: totalBeds,  color: "#7bafd4" },
            { label: "Occupied",    value: totalOcc,   color: "#D85A30" },
            { label: "Available",   value: totalAvail, color: "#1D9E75" },
          ].map(({ label, value, color }) => (
            <div key={label} style={s.summaryCard}>
              <p style={s.sumLabel}>{label}</p>
              <p style={{ ...s.sumValue, color }}>{value}</p>
            </div>
          ))}
        </div>

        <div style={s.filterRow}>
          {[
            { key: "all",      label: "All" },
            { key: "low",      label: "Low occupancy" },
            { key: "high",     label: "High occupancy" },
            { key: "critical", label: "Critical" },
          ].map(f => (
            <FilterButton
              key={f.key}
              active={filter === f.key}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </FilterButton>
          ))}
        </div>

        {loading ? (
          <p style={s.empty}>Loading hospitals…</p>
        ) : filtered.length === 0 ? (
          <p style={s.empty}>No hospitals match this filter.</p>
        ) : (
          <div style={s.grid}>
            {filtered.map(h => (
              <HospitalCard
                key={h.id}
                hospital={h}
                onClick={() => navigate(`/hospital/${h.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Hospital Card with hover lift ─────────────────────────────── */
function HospitalCard({ hospital: h, onClick }) {
  const [hovered, setHovered] = useState(false);
  const pct = Math.round((h.occupied_beds / h.total_beds) * 100);
  const { bar, badge } = PCT_COLOR(pct);

  return (
    <div
      style={{
        ...s.card,
        border: hovered ? "0.5px solid #2a4060" : "0.5px solid #1a2540",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 12px 32px rgba(0,0,0,0.35), 0 0 0 0.5px rgba(123,175,212,0.07)"
          : "0 4px 12px rgba(0,0,0,0.2)",
        transition: "all 0.22s cubic-bezier(0.22,1,0.36,1)",
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={s.cardHead}>
        <span style={s.hospName}>{h.name}</span>
        <span style={{ ...s.badge, background: badge.bg, color: badge.color, border: `0.5px solid ${badge.border}` }}>
          {pct}% full
        </span>
      </div>
      <div style={s.barTrack}>
        <div style={{ ...s.barFill, width: `${pct}%`, background: bar }} />
      </div>
      <div style={s.statRow}>
        {[
          { val: h.total_beds,    label: "Total",    color: "#94a3b8" },
          { val: h.occupied_beds, label: "Occupied", color: "#94a3b8" },
          { val: h.available_beds,label: "Available",color: "#1D9E75" },
        ].map(({ val, label, color }, i, arr) => (
          <div key={label} style={{ ...s.stat, ...(i < arr.length - 1 ? s.statDivider : {}) }}>
            <span style={{ ...s.statVal, color }}>{val}</span>
            <span style={s.statLbl}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Filter Button ──────────────────────────────────────────────── */
function FilterButton({ children, active, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      style={{
        ...s.filterBtn,
        ...(active ? s.filterBtnActive : {}),
        transform: hovered && !active ? "translateY(-1px)" : "translateY(0)",
        transition: "all 0.18s ease",
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────── */
const s = {
  /* Layout */
  page:    { minHeight: "100vh", background: "#060a14", fontFamily: "'DM Sans', sans-serif", color: "#e2e8f0", position: "relative" },
  nav:     { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 28px", borderBottom: "0.5px solid #1a2035", position: "relative", zIndex: 20 },
  main:    { padding: "28px" },
  topRow:  { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 },

  /* Blur overlay */
  blurOverlay: {
    position: "fixed", inset: 0, zIndex: 10,
    background: "rgba(6,10,20,0.45)",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    animation: "overlayIn 0.25s ease forwards",
  },

  /* Logo */
  logo:     { display: "flex", alignItems: "center", gap: 10 },
  logoMark: { width: 32, height: 32, background: "#1a2745", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", border: "0.5px solid #2a3a5c" },
  logoName: { fontWeight: 500, fontSize: 16, color: "#e2e8f0", letterSpacing: "0.2px" },

  /* Nav right */
  navRight: { display: "flex", alignItems: "center", gap: 12, position: "relative", zIndex: 20 },

  /* User chip */
  userChip: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "5px 12px", borderRadius: 99,
    border: "0.5px solid #1e2c45",
    background: "#0d1525",
    position: "relative", cursor: "pointer",
    transition: "all 0.2s ease",
    userSelect: "none",
  },
  userChipActive: {
    border: "0.5px solid #2a4060",
    background: "#111e35",
    boxShadow: "0 0 0 3px rgba(123,175,212,0.08)",
  },

  avatar: {
    width: 26, height: 26, borderRadius: "50%",
    background: "linear-gradient(135deg, #1a2e4a, #1e3a5f)",
    border: "0.5px solid #2a4060",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 11, fontWeight: 500, color: "#7bafd4",
    flexShrink: 0,
  },

  userBadge: {
    fontSize: 13, color: "#c4b5fd",
    background: "rgba(99,102,241,0.08)",
    border: "none", padding: "0",
  },

  /* Glass Dropdown */
  dropdown: {
    position: "absolute",
    top: "calc(100% + 10px)",
    right: 0,
    background: "rgba(10,17,32,0.75)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "0.5px solid rgba(255,255,255,0.09)",
    borderRadius: 14,
    padding: "14px",
    width: 220,
    zIndex: 100,
    boxShadow: "0 24px 48px rgba(0,0,0,0.55), 0 0 0 0.5px rgba(255,255,255,0.04) inset",
    overflow: "hidden",
  },

  dropdownShine: {
    position: "absolute", top: 0, left: 0, right: 0, height: 1,
    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
    pointerEvents: "none",
  },

  dropdownItem: {
    display: "flex", alignItems: "center", gap: 8,
    fontSize: 13, color: "#94a3b8",
    marginBottom: 6, padding: "4px 0",
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  },
  dropdownIcon: { fontSize: 14, flexShrink: 0 },

  dropdownDivider: {
    height: "0.5px",
    background: "rgba(255,255,255,0.06)",
    margin: "8px 0",
  },

  dropdownBtn: {
    width: "100%", padding: "8px 10px",
    marginTop: 4,
    background: "rgba(255,255,255,0.04)",
    border: "0.5px solid rgba(255,255,255,0.07)",
    borderRadius: 8,
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: 13,
    textAlign: "left",
    transition: "all 0.18s ease",
    display: "flex", alignItems: "center", gap: 6,
  },

  logoutBtn: {
    background: "transparent",
    border: "0.5px solid #1e2c45",
    color: "#64748b",
    padding: "6px 14px",
    borderRadius: 8,
    fontSize: 13,
    cursor: "pointer",
    transition: "all 0.18s ease",
  },

  /* Page text */
  pageTitle: { fontSize: 22, fontWeight: 500, color: "#f1f5f9", letterSpacing: "-0.2px", marginBottom: 4 },
  pageSub:   { fontSize: 13, color: "#475569" },

  livePill: {
    display: "inline-flex", alignItems: "center", gap: 6,
    fontSize: 12, color: "#1D9E75",
    background: "#071f15", border: "0.5px solid #0f3d26",
    padding: "5px 12px", borderRadius: 99,
  },
  liveDot: {
    display: "inline-block", width: 6, height: 6, borderRadius: "50%",
    background: "#1D9E75",
    animation: "livePulse 2s ease infinite",
  },

  /* Summary */
  summaryRow:  { display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10, marginBottom: 24 },
  summaryCard: { background: "#0d1525", borderRadius: 10, padding: "14px 16px" },
  sumLabel:    { fontSize: 11, color: "#475569", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" },
  sumValue:    { fontSize: 24, fontWeight: 500 },

  /* Filters */
  filterRow:       { display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" },
  filterBtn:       { fontSize: 12, padding: "5px 14px", borderRadius: 99, border: "0.5px solid #1e2c45", background: "transparent", color: "#64748b", cursor: "pointer" },
  filterBtnActive: { background: "#1a2745", color: "#7bafd4", borderColor: "#2a4060" },

  /* Grid & Card */
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 },
  card: { background: "#0d1525", borderRadius: 14, padding: "18px 20px", cursor: "pointer" },

  cardHead: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  hospName:  { fontSize: 14, fontWeight: 500, color: "#cbd5e1", maxWidth: "65%", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" },
  badge:     { fontSize: 11, fontWeight: 500, padding: "3px 9px", borderRadius: 99 },

  barTrack: { height: 5, borderRadius: 3, background: "#111d30", marginBottom: 14, overflow: "hidden" },
  barFill:  { height: "100%", borderRadius: 3, transition: "width 0.6s ease" },

  statRow:     { display: "flex" },
  stat:        { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "0 8px" },
  statDivider: { borderRight: "0.5px solid #1a2540" },
  statVal:     { fontSize: 18, fontWeight: 500, lineHeight: 1 },
  statLbl:     { fontSize: 11, color: "#334155", marginTop: 3 },

  empty: { color: "#334155", fontSize: 14, padding: "40px 0", textAlign: "center" },
};
