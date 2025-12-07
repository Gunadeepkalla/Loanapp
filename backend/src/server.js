import express from "express";
import cors from "cors";
import path from "path";
import pool from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import auth from "./middleware/auth.js";
import loanRoutes from "./routes/loanRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminAuth from "./middleware/adminAuth.js";

const app = express();

// ⭐ Global CORS middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// ⭐ Serve uploaded files (Aadhaar, PAN, Salary Slip, etc.)
app.use("/uploads", express.static("uploads"));

// ⭐ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/admin", adminRoutes);

// Protected route test
app.get("/protected", auth, (req, res) => {
  res.json({ msg: "Protected route access ✅", user: req.user });
});

// Admin test route
app.get("/api/admin/test", (req, res) => {
  res.send("Admin test route working ✅");
});

// Root endpoint
app.get("/", (req, res) => {
  res.send("Loan API working ✅");
});

// ⭐ Database test route
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ msg: "DB Connected ✅", time: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "DB Connection Failed ❌" });
  }
});

// Start server
app.listen(5000, () => {
  console.log("✅ Server running on http://localhost:5000");
});
