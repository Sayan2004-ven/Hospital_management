import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import styles from "./Login.module.css";

export default function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [popup, setPopup] = useState("");
  const navigate  = useNavigate();
  const { loginAdmin } = useAuth(); // ✅ FIX 7: grab setter from context

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(" https://hospital-backend-tpge.onrender.com/admin-login", form);
      setPopup(res.data.message);

      if (res.data.success) {
        // ✅ FIX 7: Mark the session as admin so AdminDashboard can guard itself
        loginAdmin();
        navigate("/admin-dashboard");
      }
    } catch (error) {
      setPopup("Error: " + error.message);
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.formCard}>

        <h2>Admin Login</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email" name="email" placeholder="Admin Email"
            onChange={handleChange} required
          />
          <input
            type="password" name="password" placeholder="Admin Password"
            onChange={handleChange} required
          />
          <button type="submit" className={styles.btnSubmit}>Login</button>
        </form>

        {popup && <p className={styles.vbtnSubmit}>{popup}</p>}
      </div>
    </div>
  );
}