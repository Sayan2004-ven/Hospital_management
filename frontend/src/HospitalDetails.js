import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

export default function HospitalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);

  // ✅ FIXED API + ID MATCH
  useEffect(() => {
    axios
      .get("https://hospital-management-89cv.onrender.com/hospitals")
      .then((res) => {
        if (res.data.success) {
          const found = res.data.data.find(
            (h) => h.id === Number(id)
          );
          setHospital(found);
        }
      })
      .catch((err) => {
        console.error("Error fetching hospital:", err);
      });
  }, [id]);

  // Loading state
  if (!hospital) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h2>Loading hospital data...</h2>
      </div>
    );
  }

  const total = hospital.total_beds || 0;
  const occupied = hospital.occupied_beds || 0;
  const available = hospital.available_beds || total - occupied;

  return (
    <div style={{ padding: "30px", color: "#fff", background: "#0a0f1c", minHeight: "100vh" }}>
      
      {/* Back Button */}
      <button onClick={() => navigate(-1)} style={{ marginBottom: "20px" }}>
        ← Back
      </button>

      {/* Hospital Info */}
      <h1>{hospital.name}</h1>

      <div style={{ marginTop: "20px" }}>
        <p><strong>Total Beds:</strong> {total}</p>
        <p><strong>Occupied Beds:</strong> {occupied}</p>
        <p><strong>Available Beds:</strong> {available}</p>
      </div>

      {/* Costs */}
      <div style={{ marginTop: "30px" }}>
        <h2>Costs (per day)</h2>
        <p>General Ward: ₹{hospital.general_cost}</p>
        <p>ICU: ₹{hospital.icu_cost}</p>
        <p>Private Room: ₹{hospital.private_cost}</p>
      </div>

      {/* Status */}
      <div style={{ marginTop: "20px" }}>
        <h3>Status:</h3>
        {available > 0 ? (
          <span style={{ color: "lightgreen" }}>Beds Available ✅</span>
        ) : (
          <span style={{ color: "red" }}>Full ❌</span>
        )}
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
