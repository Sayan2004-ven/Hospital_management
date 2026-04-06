import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

/* ── Icons ── */
const IconBed = () => (
  <svg viewBox="0 0 15 15" fill="none">
    <rect x="1.5" y="5.5" width="12" height="7" rx="1.5" stroke="#4f8ef7" strokeWidth="1.2"/>
    <path d="M1.5 9h12" stroke="#4f8ef7" strokeWidth="1.2"/>
    <path d="M4 5.5V4a1.5 1.5 0 0 1 1.5-1.5h4A1.5 1.5 0 0 1 11 4v1.5" stroke="#4f8ef7" strokeWidth="1.2"/>
  </svg>
);

const IconAmbulance = () => (
  <svg viewBox="0 0 15 15" fill="none">
    <rect x="1" y="5" width="10" height="6" rx="1.2" stroke="#4f8ef7" strokeWidth="1.2"/>
    <path d="M11 7.5h2.5" stroke="#4f8ef7" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M11 6.5l1.5-1.5" stroke="#4f8ef7" strokeWidth="1.2" strokeLinecap="round"/>
    <circle cx="4" cy="11.5" r="1" fill="#4f8ef7"/>
    <circle cx="9" cy="11.5" r="1" fill="#4f8ef7"/>
    <path d="M5 7.5H7M6 6.5V8.5" stroke="#4f8ef7" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const IconHospital = () => (
  <svg viewBox="0 0 15 15" fill="none">
    <rect x="2" y="3" width="11" height="10" rx="1.2" stroke="#1dd9a0" strokeWidth="1.2"/>
    <path d="M5.5 13V10h4v3" stroke="#1dd9a0" strokeWidth="1.2" strokeLinejoin="round"/>
    <path d="M6.5 6.5H8.5M7.5 5.5V7.5" stroke="#1dd9a0" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M2 6.5h11" stroke="#1dd9a0" strokeWidth="1.2"/>
  </svg>
);

const NexusLogo = () => (
  <svg viewBox="0 0 16 16" fill="none">
    <path d="M8 1.5L13 4.5V10.5L8 13.5L3 10.5V4.5L8 1.5Z"
      stroke="#4f8ef7" strokeWidth="1.2" strokeLinejoin="round"/>
    <circle cx="8" cy="7.5" r="1.8" fill="#4f8ef7"/>
  </svg>
);

export default function Home() {
  return (
    <div className="split-container">

      {/* ════════ LEFT PANEL ════════ */}
      <div className="left-panel">
        <div className="card-box">

          <div className="logo-row">
            <div className="logo-mark"><NexusLogo /></div>
            <span className="logo-name">Nexus Health</span>
          </div>

          <h2>Find care,<br />fast.</h2>
          <p>Check real-time bed availability, book a hospital bed, or request an ambulance — all from one place.</p>

          <div className="button-group">
            <Link to="/login" style={{ textDecoration: "none" }}>
              <button className="btn btn-login">
                <span>Sign In</span>
                <span className="btn-arrow">→</span>
              </button>
            </Link>
            <Link to="/create" style={{ textDecoration: "none" }}>
              <button className="btn btn-create">
                <span>Create Account</span>
                <span className="btn-arrow">→</span>
              </button>
            </Link>
            <Link to="/admin-login" style={{ textDecoration: "none" }}>
              <button className="btn btn-admin">
                <span>Hospital Admin</span>
                <span className="btn-arrow" style={{ opacity: 0.4 }}>→</span>
              </button>
            </Link>
          </div>

          <div className="stats-row">
            <div className="stat">
              <span className="stat-val">48<span>+</span></span>
              <span className="stat-label">Hospitals</span>
            </div>
            <div className="stat">
              <span className="stat-val">1.2<span>k</span></span>
              <span className="stat-label">Beds live</span>
            </div>
            <div className="stat">
              <span className="stat-val">&lt;4<span>m</span></span>
              <span className="stat-label">Avg dispatch</span>
            </div>
          </div>

        </div>
      </div>

      {/* ════════ RIGHT PANEL ════════ */}
      <div className="right-panel">
        <div className="grid-bg" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        {/* Ring graphic */}
        <div className="node-graphic">
          <div className="node-ring ring-1"><div className="ring-dot" /></div>
          <div className="node-ring ring-2"><div className="ring-dot ring-dot-teal" /></div>
          <div className="node-ring ring-3"><div className="ring-dot" /></div>
          <div className="node-ring ring-4" />
          <div className="node-center"><NexusLogo /></div>
        </div>

        {/* Floating — beds */}
        <div className="float-card float-card-tl">
          <div className="float-card-label">Beds available now</div>
          <div className="float-metric"><span>347</span> / 1,200</div>
          <div className="float-bar">
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`float-bar-seg ${i < 3 ? "active" : ""}`} />
            ))}
          </div>
        </div>

        {/* Floating — ambulance */}
        <div className="float-card float-card-br">
          <div className="float-card-label">Ambulance dispatch</div>
          <div className="float-status">
            <div className="float-dot-green" />
            12 units on standby
          </div>
          <div className="float-bar" style={{ marginTop: 10 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="float-bar-seg active-teal" />
            ))}
          </div>
        </div>

        {/* Hero */}
        <div className="welcome-text">
          <div className="live-badge">
            <div className="live-dot" />
            Live bed data · Updated every 60 s
          </div>

          <h1>
            Real-time beds.<br />
            <span className="grad">Instant booking.</span>
          </h1>

          <p>
            Search available beds across 48+ hospitals,<br />
            book instantly, and track ambulances live.
          </p>

          <div className="features-list">
            <div className="feat-item">
              <div className="feat-icon"><IconBed /></div>
              <div className="feat-text">
                <strong>Live bed availability</strong>
                <span>ICU, general &amp; emergency wards updated in real time</span>
              </div>
            </div>
            <div className="feat-item">
              <div className="feat-icon"><IconAmbulance /></div>
              <div className="feat-text">
                <strong>Ambulance booking</strong>
                <span>Request dispatch instantly with live ETA tracking</span>
              </div>
            </div>
            <div className="feat-item">
              <div className="feat-icon"><IconHospital /></div>
              <div className="feat-text">
                <strong>Multi-hospital dashboard</strong>
                <span>Compare hospitals by distance, beds &amp; speciality</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}