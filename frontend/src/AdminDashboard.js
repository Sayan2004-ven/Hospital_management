import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./AdminDashboard.module.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { isAdmin, logout } = useAuth();

  // ✅ FIX 7: Guard — redirect anyone who isn't an admin
  useEffect(() => {
    if (!isAdmin) {
      navigate("/admin-login");
    }
  }, [isAdmin, navigate]);

  // Fetch users
  useEffect(() => {
    if (!isAdmin) return;
    axios.get(" https://hospital-backend-tpge.onrender.com/all-users")
      .then(res => {
        if (res.data.success) setUsers(res.data.users);
      })
      .catch(err => console.error("Failed to fetch users:", err));
  }, [isAdmin]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // ✅ FIX 10: Added .catch() so errors aren't swallowed silently
  const deleteUser = (id) => {
    if (window.confirm("Delete this customer?")) {
      axios.delete(` https://hospital-backend-tpge.onrender.com/delete/${id}`)
        .then(() => setUsers(users.filter(u => u.id !== id)))
        .catch(err => alert("Delete failed: " + err.message));
    }
  };

  const printUser = (user) => {
    const w = window.open("", "", "width=600,height=400");
    w.document.write(`
      <h2>Customer Details</h2>
      <p><b>ID:</b> ${user.id}</p>
      <p><b>First Name:</b> ${user.fname}</p>
      <p><b>Last Name:</b> ${user.lname}</p>
      <p><b>Email:</b> ${user.email}</p>
      <p><b>Phone:</b> ${user.phone}</p>
    `);
    w.document.close();
    w.print();
  };

  const printAll = () => {
    const w = window.open("", "", "width=900,height=600");
    let table = `
      <h2>Customer List</h2>
      <table border="1" cellpadding="10">
      <tr><th>ID</th><th>First Name</th><th>Last Name</th><th>Email</th><th>Phone</th></tr>
    `;
    users.forEach(u => {
      table += `<tr>
        <td>${u.id}</td><td>${u.fname}</td><td>${u.lname}</td>
        <td>${u.email}</td><td>${u.phone}</td>
      </tr>`;
    });
    table += "</table>";
    w.document.write(table);
    w.document.close();
    w.print();
  };

  const filteredUsers = users.filter(u =>
    u.fname.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  // Don't render while redirecting
  if (!isAdmin) return null;

  return (
    <div className={styles.dashboardContainer}>

      {/* TOP NAV */}
      <div className={styles.topNav}>
        <div className={styles.logoRow}>
          <div className={styles.logoMark}>
            <svg viewBox="0 0 16 16" fill="none">
              <path d="M8 1.5L13 4.5V10.5L8 13.5L3 10.5V4.5L8 1.5Z"
                stroke="white" strokeWidth="1.4"/>
              <circle cx="8" cy="7.5" r="1.8" fill="white"/>
            </svg>
          </div>
          <span className={styles.logoName}>Nexus</span>
        </div>

        <div className={styles.navRight}>
          <div className={styles.adminBadge}>
            <div className={styles.adminDot}></div>
            Admin Panel
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Customers</div>
          <div className={styles.statValue}>{users.length}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Search Results</div>
          <div className={styles.statValue}>{filteredUsers.length}</div>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className={styles.dashboardCard}>
        <div className={styles.tableHeader}>
          <span className={styles.tableTitle}>All Customers</span>
          <input
            type="text"
            placeholder="Search by name or email..."
            className={styles.search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className={styles.deleteBtn}
            onClick={() => window.open(" https://hospital-backend-tpge.onrender.com/download-all")}
          >
            ⬇ Download All
          </button>
          <button onClick={printAll} className={styles.deleteBtn}>Print All</button>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th><th>First Name</th><th>Last Name</th>
                <th>Email</th><th>Phone</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <tr key={index}>
                    <td><span className={styles.idPill}>{user.id}</span></td>
                    <td className={styles.nameCell}>{user.fname}</td>
                    <td>{user.lname}</td>
                    <td className={styles.emailCell}>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>
                      <button
                        className={`${styles.actionBtn} ${styles.downloadBtn}`}
                        onClick={() => window.open(` https://hospital-backend-tpge.onrender.com/download-user/${user.id}`)}
                      >⬇</button>
                      <button
                        className={`${styles.actionBtn} ${styles.printBtn}`}
                        style={{ marginLeft: "6px" }}
                        onClick={() => printUser(user)}
                      >🖨</button>
                      <button
                        className={`${styles.actionBtn} ${styles.deleteSmallBtn}`}
                        style={{ marginLeft: "6px" }}
                        onClick={() => deleteUser(user.id)}
                      >🗑</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">
                    <div className={styles.emptyState}>No customers found</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}