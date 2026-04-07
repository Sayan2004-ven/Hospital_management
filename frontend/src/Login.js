import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import styles from "./Login.module.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [popup, setPopup] = useState("");
  const navigate = useNavigate();
  const { loginUser } = useAuth(); // ✅ FIX 6: grab the setter from context

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8081/login", form);
      setPopup(res.data.message);

      if (res.data.success) {
        // ✅ FIX 6: Save the user so HospitalDashboard (and any guard) can read it
        loginUser(res.data.user);
        navigate("/hospitals");
      }
    } catch (error) {
      setPopup("Error: " + error.message);
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.formCard}>

        <div className={styles.logoRow}>
          <div className={styles.logoMark}>
            <svg viewBox="0 0 16 16" fill="none">
              <path d="M8 1.5L13 4.5V10.5L8 13.5L3 10.5V4.5L8 1.5Z"
                stroke="white" strokeWidth="1.4" strokeLinejoin="round"/>
              <circle cx="8" cy="7.5" r="1.8" fill="white"/>
            </svg>
          </div>
          <span className={styles.logoName}>Nexus</span>
        </div>

        <h2>Welcome back</h2>
        <p className={styles.subtitle}>Sign in to view hospital availability</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email" name="email" placeholder="Email address"
            value={form.email} onChange={handleChange} required
          />
          <input
            type="password" name="password" placeholder="Password"
            value={form.password} onChange={handleChange} required
          />
          <button type="submit" className={styles.btnSubmit}>Sign In →</button>
        </form>

        {popup && <p className={styles.vbtnSubmit}>{popup}</p>}
      </div>
    </div>
  );
}