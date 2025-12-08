import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./src/config/db.js";

import authRoutes from "./src/routes/authRoutes.js";
import auth from "./src/middleware/auth.js";
import loanRoutes from "./src/routes/loanRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import adminAuth from "./src/middleware/adminAuth.js";

const app = express();

/* ------------------------------
   ⭐ FIX: Absolute path required for Render
--------------------------------*/
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ------------------------------
   ⭐ FIX: CORS for local + deployed frontend
--------------------------------*/
app.use(
  cors({
    origin: "*", // safe for deployment + testing
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

/* ------------------------------
   ⭐ FIX: JSON + form size limit (important for image uploads)
--------------------------------*/
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

/* ------------------------------
   ⭐ FIX: Serve uploaded files using absolute path
   (Relative path breaks on Render)
--------------------------------*/
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ------------------------------
   ⭐ API ROUTES
--------------------------------*/
app.use("/api/auth", authRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/admin", adminRoutes);

/* ------------------------------
   ⭐ Test protected route
--------------------------------*/
app.get("/protected", auth, (req, res) => {
  res.json({ msg: "Protected route access ✅", user: req.user });
});

/* ------------------------------
   ⭐ Admin test route
--------------------------------*/
app.get("/api/admin/test", (req, res) => {
  res.send("Admin test route working ✅");
});

/* ------------------------------
   ⭐ Root endpoint
--------------------------------*/
app.get("/", (req, res) => {
  res.send("Loan API working 🟢");
});

/* ------------------------------
   ⭐ DB test route
--------------------------------*/
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      msg: "DB Connected 🟢",
      time: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "DB Connection Failed ❌" });
  }
});

/* ------------------------------
   ⭐ FIX: Correct port handling for Render
--------------------------------*/
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on PORT: ${PORT}`);
});
