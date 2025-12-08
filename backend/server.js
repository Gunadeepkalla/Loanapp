import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import path from "path";
import pool from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import auth from "./src/middleware/auth.js";
import loanRoutes from "./src/routes/loanRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import adminAuth from "./src/middleware/adminAuth.js";

const app = express();

/* ⭐ UPDATED CORS for Render + Local */
app.use(
  cors({
    origin: [
      "http://localhost:5173", 
      "https://your-frontend-url.vercel.app"   // <-- Replace after deployment
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

/* ⭐ Serve uploaded files */
app.use("/uploads", express.static("uploads"));

/* ⭐ API Routes */
app.use("/api/auth", authRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/admin", adminRoutes);

/* ⭐ Protected route test */
app.get("/protected", auth, (req, res) => {
  res.json({ msg: "Protected route access ✅", user: req.user });
});

/* ⭐ Admin test route */
app.get("/api/admin/test", (req, res) => {
  res.send("Admin test route working ✅");
});

/* ⭐ Root endpoint */
app.get("/", (req, res) => {
  res.send("Loan API working ✅");
});

/* ⭐ Database test route */
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ msg: "DB Connected ✅", time: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "DB Connection Failed ❌" });
  }
});

/* ⭐ UPDATED: Start server (important for Render deployment) */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
