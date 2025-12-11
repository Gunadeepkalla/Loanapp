import express from "express";
import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
console.log("✅ authRoutes.js loaded");

// REGISTER (Sign Up)
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  console.log("📩 Register request:", req.body);

  try {
    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, role",
      [name, email, hashed, "user"]   // ⭐ default role added for safety
    );

    console.log("✅ User Registered:", result.rows[0]);
    res.json({ msg: "User registered ✅", userId: result.rows[0].id });
  } catch (err) {
    console.log("❌ Registration Error:", err);
    res.status(400).json({ msg: "Registration failed ❌. Email might already exist." });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("📩 Login Request:", email);

  try {
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    console.log("🔍 DB Query Result:", result.rows);

    if (result.rows.length === 0) {
      console.log("❌ User not found");
      return res.status(401).json({ msg: "User not found ❌" });
    }

    const user = result.rows[0];
    console.log("👤 Found User:", user);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔐 Password match:", isMatch);

    if (!isMatch) {
      console.log("❌ Wrong password");
      return res.status(401).json({ msg: "Wrong password ❌" });
    }

    // ⭐ FIX VERIFIED: email included in token (important for email sending)
    const token = jwt.sign(
      { 
        id: Number(user.id),
        email: user.email, 
        role: user.role || "user"  // ⭐ prevents null/undefined 
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("✅ Login Successful, Token generated");
    res.json({
      msg: "Login successful ✅",
      token,
    });
  } catch (err) {
    console.log("🔥 Login Error:", err);
    res.status(500).json({ msg: "Server error ❌" });
  }
});

// VERIFY TOKEN MIDDLEWARE
const verifyToken = (req, res, next) => {
  const header = req.headers["authorization"];
  if (!header) return res.status(401).json({ msg: "No token provided ❌" });

  const token = header.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ msg: "Invalid token ❌" });

    req.user = decoded;
    next();
  });
};

// GET LOGGED-IN USER INFO
router.get("/me", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ msg: "User not found ❌" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("🔥 /me Error:", err);
    res.status(500).json({ msg: "Server error ❌" });
  }
});

// PROTECTED ROUTE
router.get("/protected", verifyToken, (req, res) => {
  res.json({ msg: "Authorized ✅", user: req.user });
});

// TEST ROUTE
router.get("/test", (req, res) => {
  res.send("Auth route working ✅");
});

// FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const result = await pool.query("SELECT id FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ msg: "Email not found ❌" });
    }

    const userId = result.rows[0].id;

    const resetToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    await pool.query(
      "UPDATE users SET reset_token = $1 WHERE id = $2",
      [resetToken, userId]
    );

    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

    res.json({
      msg: "Reset link generated",
      resetLink,
    });
  } catch (err) {
    console.error("🔥 Forgot Password Error:", err);
    res.status(500).json({ msg: "Server error ❌" });
  }
});

// RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hashed = await bcrypt.hash(newPassword, 10);

    const result = await pool.query(
      "UPDATE users SET password = $1, reset_token = NULL WHERE id = $2 AND reset_token = $3",
      [hashed, decoded.id, token]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ msg: "Invalid or expired token ❌" });
    }

    res.json({ msg: "Password reset successful ✅" });
  } catch (err) {
    console.error("🔥 Reset Password Error:", err);
    res.status(500).json({ msg: "Invalid or expired token ❌" });
  }
});

export default router;
