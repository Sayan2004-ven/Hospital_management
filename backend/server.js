const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const twilio = require("twilio");
const PDFDocument = require("pdfkit");
const bcrypt = require("bcrypt");
require("dotenv").config();

// ✅ FIX 1: Use environment variables — never hardcode secrets.
// Create a .env file in the same folder with:
//   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
//   TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxx
//   TWILIO_PHONE=+16562695494
//   ADMIN_EMAIL=admin@gmail.com
//   ADMIN_PASSWORD=admin123
//   DB_HOST=localhost
//   DB_USER=root
//   DB_PASS=
//   DB_NAME=users
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken  = process.env.TWILIO_AUTH_TOKEN;
const client     = new twilio(accountSid, authToken);

const SALT_ROUNDS = 10;
let otpStore = {};

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host:     process.env.DB_HOST || "localhost",
  user:     process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "users"
});

db.connect(err => {
  if (err) console.error("DB connection failed:", err);
  else console.log("MySQL connected!");
});

// ─── Helpers ───────────────────────────────
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isValidPhone(phone) {
  return /^\d{10}$/.test(phone);
}

// ─── CREATE USER ───────────────────────────
app.post("/create", async (req, res) => {
  const { fname, lname, email, phone, password } = req.body;

  // ✅ FIX: remove id completely
  if (!fname || !lname || !email || !phone || !password)
    return res.json({ success: false, message: "All fields are required" });

  if (!isValidEmail(email))
    return res.json({ success: false, message: "Invalid email format" });

  if (!isValidPhone(phone))
    return res.json({ success: false, message: "Phone must be exactly 10 digits" });

  try {
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    const sql = "INSERT INTO users (fname, lname, email, phone, password) VALUES (?, ?, ?, ?, ?)";

    db.query(sql, [fname, lname, email, phone, hashed], (err, result) => {
      if (err) {
        console.error("DB ERROR:", err);
        return res.json({ success: false, message: err.message });
      }

      res.json({
        success: true,
        message: "User created successfully!",
        userId: result.insertId // 🔥 auto ID
      });
    });

  } catch {
    res.json({ success: false, message: "Server error during registration" });
  }
});

// ─── LOGIN USER ────────────────────────────
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.json({ success: false, message: "Email and password required" });

  const sql = "SELECT id, fname, lname, email, phone, password FROM users WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) return res.json({ success: false, message: err.message });
    if (results.length === 0) return res.json({ success: false, message: "User not found" });

    const user = results[0];
    // ✅ FIX 2: Compare with bcrypt
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      const { password: _pw, ...userDetails } = user;
      res.json({ success: true, message: "Login successful", user: userDetails });
    } else {
      res.json({ success: false, message: "Invalid password" });
    }
  });
});

// ─── GET USER BY ID ────────────────────────
app.get("/user/:id", (req, res) => {
  // ✅ FIX 8: Include phone in the SELECT
  const sql = "SELECT id, fname, lname, email, phone FROM users WHERE id = ?";
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.json({ success: false, message: err.message });
    if (results.length === 0) return res.json({ success: false, message: "User not found" });
    res.json({ success: true, user: results[0] });
  });
});

// ─── UPDATE USER ───────────────────────────
app.put("/update/:id", (req, res) => {
  const { fname, lname, email } = req.body;
  if (!fname || !lname || !email)
    return res.json({ success: false, message: "All fields are required" });
  if (!isValidEmail(email))
    return res.json({ success: false, message: "Invalid email format" });

  const sql = "UPDATE users SET fname = ?, lname = ?, email = ? WHERE id = ?";
  db.query(sql, [fname, lname, email, req.params.id], (err, result) => {
    if (err) return res.json({ success: false, message: err.message });
    if (result.affectedRows === 0)
      return res.json({ success: false, message: "No user found with this ID" });
    res.json({ success: true, message: "User updated successfully!" });
  });
});

// ─── DELETE USER ───────────────────────────
app.delete("/delete/:id", (req, res) => {
  db.query("DELETE FROM users WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: "Deleted Successfully" });
  });
});

// ─── ADMIN LOGIN ───────────────────────────
app.post("/admin-login", (req, res) => {
  const { email, password } = req.body;
  // ✅ FIX 1: Credentials come from .env
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true, message: "Admin Login Successful" });
  } else {
    res.json({ success: false, message: "Invalid Admin Credentials" });
  }
});

// ─── GET ALL USERS (Admin) ─────────────────
app.get("/all-users", (req, res) => {
  db.query("SELECT id, fname, lname, email, phone FROM users", (err, results) => {
    if (err) return res.json({ success: false, message: err.message });
    res.json({ success: true, users: results });
  });
});

// ─── SEND OTP ──────────────────────────────
app.post("/send-otp", async (req, res) => {
  // ✅ FIX 4: Frontend sends raw 10-digit number; server adds +91 once
  let { phone } = req.body;
  if (!isValidPhone(phone))
    return res.json({ success: false, message: "Phone must be 10 digits" });

  phone = "+91" + phone;
  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[phone] = otp;

  try {
    await client.messages.create({
      body: `Your OTP is ${otp}`,
      from: process.env.TWILIO_PHONE,
      to:   phone
    });
    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "OTP sending failed" });
  }
});

// ─── VERIFY OTP ────────────────────────────
app.post("/verify-otp", (req, res) => {
  let { phone, otp } = req.body;
  if (!phone.startsWith("+91")) phone = "+91" + phone;

  if (otpStore[phone] && otpStore[phone] == otp) {
    delete otpStore[phone];
    res.json({ success: true });
  } else {
    res.json({ success: false, message: "Invalid or expired OTP" });
  }
});

// ─── DOWNLOAD ALL PDF ──────────────────────
app.get("/download-all", (req, res) => {
  db.query("SELECT id, fname, lname, email, phone FROM users", (err, users) => {
    if (err) return res.status(500).json(err);
    const doc = new PDFDocument({ margin: 40 });
    res.setHeader("Content-Disposition", "attachment; filename=customers_report.pdf");
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);
    doc.fontSize(20).text("Customer Report", { align: "center" }).moveDown();
    users.forEach(u => {
      doc.fontSize(12)
        .text(`ID: ${u.id}`).text(`First Name: ${u.fname}`)
        .text(`Last Name: ${u.lname}`).text(`Email: ${u.email}`)
        .text(`Phone: ${u.phone}`).moveDown();
    });
    doc.end();
  });
});

// ─── DOWNLOAD SINGLE USER PDF ──────────────
app.get("/download-user/:id", (req, res) => {
  db.query("SELECT id, fname, lname, email, phone FROM users WHERE id = ?",
    [req.params.id], (err, data) => {
      if (err) return res.status(500).json(err);
      if (!data[0]) return res.status(404).json({ message: "User not found" });
      const u   = data[0];
      const doc = new PDFDocument();
      res.setHeader("Content-Disposition", `attachment; filename=customer_${req.params.id}.pdf`);
      res.setHeader("Content-Type", "application/pdf");
      doc.pipe(res);
      doc.fontSize(20).text("Customer Details", { align: "center" }).moveDown();
      doc.fontSize(12)
        .text(`ID: ${u.id}`).text(`First Name: ${u.fname}`)
        .text(`Last Name: ${u.lname}`).text(`Email: ${u.email}`)
        .text(`Phone: ${u.phone}`);
      doc.end();
    });
});

// ─── HOSPITALS ─────────────────────────────
app.get("/hospitals", (req, res) => {
  db.query("SELECT * FROM hospitals", (err, results) => {
    if (err) return res.json({ success: false, message: err.message });
    const updated = results.map(h => ({
      ...h,
      available_beds: h.total_beds - h.occupied_beds
    }));
    res.json({ success: true, hospitals: updated });
  });
});

app.listen(8081, () => console.log("Server running on http://localhost:8081"));