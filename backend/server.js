import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import pool from "./src/config/db.js";

// Routes
import authRoutes from "./src/routes/authRoutes.js";
import loanRoutes from "./src/routes/loanRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";

// Middleware
import auth from "./src/middleware/auth.js";

// ✅ Initialize Cloudinary ONCE
import "./src/config/cloudinary.js";
import multer from "multer";

const app = express();

/* ------------------------------
   Absolute path setup (ESM)
--------------------------------*/
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ------------------------------
   CORS configuration
--------------------------------*/
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

/* ------------------------------
   Body parsers
--------------------------------*/
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

/* ------------------------------
   API Routes
--------------------------------*/
app.use("/api/auth", authRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/admin", adminRoutes);
app.use((err, req, res, next) => {
  // Multer-specific errors
  if (err instanceof multer.MulterError) {
    console.error("MULTER ERROR:", err);

    return res.status(400).json({
      success: false,
      type: "MULTER_ERROR",
      message: err.message,
      field: err.field,
    });
  }

  // Other errors
  if (err) {
    console.error("SERVER ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }

  next();
});
/* ------------------------------
   Protected test route
--------------------------------*/
app.get("/protected", auth, (req, res) => {
  res.json({
    message: "Protected route access ✅",
    user: req.user,
  });
});

/* ------------------------------
   Root route
--------------------------------*/
app.get("/", (req, res) => {
  res.send("Loan API running with Cloudinary 🟢");
});

/* ------------------------------
   Database health check
--------------------------------*/
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      status: "DB Connected 🟢",
      time: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "DB Connection Failed ❌",
    });
  }
});

/* ------------------------------
   Server start (Render safe)
--------------------------------*/
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on PORT ${PORT}`);
});
