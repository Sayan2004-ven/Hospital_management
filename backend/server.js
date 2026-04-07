const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const twilio = require("twilio");
const PDFDocument = require("pdfkit");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// ================= DB CONNECTION (POOL) =================
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10
});

// Test connection
pool.getConnection((err, conn) => {
  if (err) {
    console.error("DB Connection Failed:", err);
  } else {
    console.log("DB Connected ✅");
    conn.release();
  }
});

// ================= TWILIO =================
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

let otpStore = {};
const SALT_ROUNDS = 10;

// ================= HELPERS =================
const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidPhone = (phone) =>
  /^\d{10}$/.test(phone);

// ================= ROOT =================
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ================= CREATE USER =================
app.post("/create", async (req, res) => {
  const { fname, lname, email, phone, password } = req.body;

  if (!fname || !lname || !email || !phone || !password)
    return res.json({ success: false, message: "All fields required" });

  if (!isValidEmail(email))
    return res.json({ success: false, message: "Invalid email" });

  if (!isValidPhone(phone))
    return res.json({ success: false, message: "Invalid phone" });

  try {
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    const sql = `INSERT INTO users (fname, lname, email, phone, password)
                 VALUES (?, ?, ?, ?, ?)`;

    pool.query(sql, [fname, lname, email, phone, hashed], (err, result) => {
      if (err) return res.json({ success: false, message: err.message });

      res.json({
        success: true,
        message: "User created",
        userId: result.insertId
      });
    });

  } catch {
    res.json({ success: false, message: "Server error" });
  }
});

// ================= LOGIN =================
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";
  pool.query(sql, [email], async (err, results) => {
    if (err) return res.json({ success: false, message: err.message });
    if (results.length === 0)
      return res.json({ success: false, message: "User not found" });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match)
      return res.json({ success: false, message: "Wrong password" });

    delete user.password;
    res.json({ success: true, user });
  });
});

// ================= GET USER =================
app.get("/user/:id", (req, res) => {
  pool.query(
    "SELECT id, fname, lname, email, phone FROM users WHERE id = ?",
    [req.params.id],
    (err, result) => {
      if (err) return res.json({ success: false, message: err.message });
      res.json({ success: true, user: result[0] });
    }
  );
});

// ================= UPDATE =================
app.put("/update/:id", (req, res) => {
  const { fname, lname, email } = req.body;

  const sql = `UPDATE users SET fname=?, lname=?, email=? WHERE id=?`;

  pool.query(sql, [fname, lname, email, req.params.id], (err) => {
    if (err) return res.json({ success: false, message: err.message });
    res.json({ success: true, message: "Updated" });
  });
});

// ================= DELETE =================
app.delete("/delete/:id", (req, res) => {
  pool.query("DELETE FROM users WHERE id=?", [req.params.id], (err) => {
    if (err) return res.json({ success: false, message: err.message });
    res.json({ success: true });
  });
});

// ================= ALL USERS =================
app.get("/all-users", (req, res) => {
  pool.query("SELECT * FROM users", (err, result) => {
    if (err) return res.json({ success: false });
    res.json({ success: true, users: result });
  });
});

// ================= SEND OTP =================
app.post("/send-otp", async (req, res) => {
  let { phone } = req.body;

  if (!isValidPhone(phone))
    return res.json({ success: false });

  phone = "+91" + phone;
  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[phone] = otp;

  try {
    await client.messages.create({
      body: `OTP: ${otp}`,
      from: process.env.TWILIO_PHONE,
      to: phone
    });

    res.json({ success: true });
  } catch {
    res.json({ success: false });
  }
});

// ================= VERIFY OTP =================
app.post("/verify-otp", (req, res) => {
  let { phone, otp } = req.body;
  phone = "+91" + phone;

  if (otpStore[phone] == otp) {
    delete otpStore[phone];
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

// ================= HOSPITALS =================
app.get("/hospitals", (req, res) => {
  pool.query("SELECT * FROM hospitals", (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true, data: result });
  });
});
app.get("/test-db", (req, res) => {
  pool.query("SELECT 1", (err, result) => {
    if (err) {
      console.error(err);
      return res.json({ success: false, error: err.message });
    }
    res.json({ success: true, result });
  });
});

// ================= SERVER =================
const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});