import React, { useState, useCallback } from "react";
import axios from "axios";
import styles from "./Create.module.css";

/* ── Password strength helper ─────────────────────────────── */
function getStrength(pwd) {
  if (!pwd) return { score: 0, label: "", color: "transparent", width: "0%" };
  let score = 0;
  if (pwd.length >= 8)              score++;
  if (/[A-Z]/.test(pwd))           score++;
  if (/[0-9]/.test(pwd))           score++;
  if (/[^A-Za-z0-9]/.test(pwd))    score++;

  const map = [
    { label: "Weak",      color: "#e24b4a", width: "25%" },
    { label: "Fair",      color: "#e2924b", width: "50%" },
    { label: "Good",      color: "#e2d24b", width: "75%" },
    { label: "Strong",    color: "#1dd9a0", width: "100%" },
  ];
  return { score, ...map[Math.max(0, score - 1)] };
}

/* ── Input field sub-component ────────────────────────────── */
function Field({ label, children }) {
  return (
    <div className={styles.field}>
      {label && <span className={styles.label}>{label}</span>}
      {children}
    </div>
  );
}

/* ── Main component ───────────────────────────────────────── */
export default function Create() {
  const [form, setForm] = useState({
    fname: "", lname: "", email: "",
    phone: "", password: "", confirmPassword: "",
  });
  const [otp,          setOtp]          = useState("");
  const [otpSent,      setOtpSent]      = useState(false);
  const [otpLoading,   setOtpLoading]   = useState(false);
  const [popup,        setPopup]        = useState({ msg: "", isError: false });
  const [submitting,   setSubmitting]   = useState(false);

  const strength = getStrength(form.password);

  const handleChange = useCallback((e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value })),
  []);

  const showPopup = (msg, isError = false) => setPopup({ msg, isError });

  /* ── Send OTP ──────────────────────────────────────────── */
  const sendOTP = async () => {
    if (form.phone.length !== 10) {
      showPopup("Please enter a valid 10-digit phone number", true);
      return;
    }
    setOtpLoading(true);
    try {
      const res = await axios.post("https://hospital-management-89cv.onrender.com/send-otp", { phone: form.phone });
      showPopup(res.data.message, !res.data.success);
      if (res.data.success) setOtpSent(true);
    } catch {
      showPopup("OTP sending failed. Please try again.", true);
    } finally {
      setOtpLoading(false);
    }
  };

  /* ── Submit ────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      showPopup("Passwords do not match", true);
      return;
    }
    if (form.password.length < 8) {
      showPopup("Password must be at least 8 characters", true);
      return;
    }
    if (!otpSent) {
      showPopup("Please verify your phone number first", true);
      return;
    }

    setSubmitting(true);
    try {
      const verify = await axios.post("https://hospital-management-89cv.onrender.com/verify-otp", {
        phone: form.phone, otp,
      });
      if (!verify.data.success) {
        showPopup("Invalid OTP. Please check and retry.", true);
        return;
      }
      const res = await axios.post("https://hospital-management-89cv.onrender.com/create", form);
      if (res.data.success) {
        showPopup(`✅ ${res.data.message} · User ID: ${res.data.userId}`);
      } else {
        showPopup(res.data.message, true);
      }
    } catch (error) {
      showPopup("Something went wrong: " + error.message, true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.formContainer}>

      {/* Grid texture overlay */}
      <div className={styles.gridOverlay} />

      <div className={styles.formCard}>

        {/* ── Brand ── */}
        <div className={styles.logoRow}>
          <div className={styles.logoMark}>
            <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M8 1.5L13 4.5V10.5L8 13.5L3 10.5V4.5L8 1.5Z"
                stroke="#4f8ef7" strokeWidth="1.2" strokeLinejoin="round"
              />
              <circle cx="8" cy="7.5" r="1.8" fill="#4f8ef7" />
            </svg>
          </div>
          <span className={styles.logoName}>Nexus</span>
        </div>

        {/* ── Heading ── */}
        <h2 className={styles.heading}>Create account</h2>
        <p className={styles.subtitle}>Join thousands of teams on Nexus</p>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} noValidate>

          {/* Row 1: First + Last */}
          <div className={styles.fieldGrid}>
            <Field label="First Name">
              <input
                className={styles.input}
                type="text" name="fname" placeholder="John"
                value={form.fname} onChange={handleChange} required
              />
            </Field>
            <Field label="Last Name">
              <input
                className={styles.input}
                type="text" name="lname" placeholder="Doe"
                value={form.lname} onChange={handleChange} required
              />
            </Field>
          </div>

          {/* Email */}
          <Field label="Email Address">
            <input
              className={styles.input}
              type="email" name="email" placeholder="you@example.com"
              value={form.email} onChange={handleChange} required
            />
          </Field>

          {/* Phone + Send OTP */}
          <Field label="Phone Number">
            <div className={styles.phoneRow}>
              <input
                className={styles.input}
                type="tel" name="phone" placeholder="10-digit number"
                value={form.phone} onChange={handleChange}
                maxLength={10} required
              />
              <button
                type="button"
                className={styles.otpButton}
                onClick={sendOTP}
                disabled={otpLoading || otpSent}
              >
                {otpLoading ? "Sending…" : otpSent ? "✓ Sent" : "Send OTP"}
              </button>
            </div>
          </Field>

          {/* OTP input (revealed after send) */}
          {otpSent && (
            <div className={styles.otpField}>
              <Field label="Verification Code">
                <input
                  className={`${styles.input} ${styles.inputMono}`}
                  type="text" placeholder="· · · · · ·"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6} required
                />
              </Field>
            </div>
          )}

          {/* Password */}
          <Field label="Password">
            <input
              className={styles.input}
              type="password" name="password" placeholder="Min. 8 characters"
              value={form.password} onChange={handleChange} required
            />
            {/* Strength bar */}
            {form.password && (
              <div className={styles.strengthBar}>
                <div
                  className={styles.strengthFill}
                  style={{ width: strength.width, background: strength.color }}
                />
              </div>
            )}
          </Field>

          {/* Confirm Password */}
          <Field label="Confirm Password">
            <input
              className={styles.input}
              type="password" name="confirmPassword" placeholder="Repeat password"
              value={form.confirmPassword} onChange={handleChange} required
            />
          </Field>

          <div className={styles.divider} />

          {/* Submit */}
          <button
            type="submit"
            className={styles.btnSubmit}
            disabled={submitting}
          >
            {submitting ? "Creating account…" : (
              <>Create Account <span className={styles.btnArrow}>→</span></>
            )}
          </button>
        </form>

        {/* ── Status popup ── */}
        {popup.msg && (
          <p className={`${styles.popup} ${popup.isError ? styles.popupError : ""}`}>
            <span className={styles.popupIcon}>{popup.isError ? "⚠" : "✦"}</span>
            {popup.msg}
          </p>
        )}

        {/* ── Sign-in link ── */}
        <p className={styles.signInRow}>
          Already have an account? <a href="/login">Sign in</a>
        </p>

      </div>
    </div>
  );
}
