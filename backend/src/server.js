import express from "express";
import cors from "cors";
import pool from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import auth from "./middleware/auth.js";
import loanRoutes from "./routes/loanRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminAuth from "./middleware/adminAuth.js";
<<<<<<< HEAD
import cors from "cors";
import path from "path";
=======
>>>>>>> 3aada4d324ff848a4d1f00f4b8327786cf6c4fe9

const app = express();

// ✅ CORS MUST BE HERE (before all routes)
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

<<<<<<< HEAD
// ⭐ Enable CORS for frontend (React at http://localhost:5173)
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ⭐ Serve uploaded files (Aadhaar, PAN, Salary Slip, etc.)
app.use("/uploads", express.static("uploads"));

// ⭐ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/admin", adminRoutes);
app.use("/uploads", express.static("uploads"));


// Test authenticated route
=======
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/admin", adminRoutes);

>>>>>>> 3aada4d324ff848a4d1f00f4b8327786cf6c4fe9
app.get("/protected", auth, (req, res) => {
  res.json({ msg: "Protected route access ✅", user: req.user });
});

<<<<<<< HEAD
// Admin test route
=======
>>>>>>> 3aada4d324ff848a4d1f00f4b8327786cf6c4fe9
app.get("/api/admin/test", (req, res) => {
  res.send("Admin test route working ✅");
});

<<<<<<< HEAD
// Root endpoint
=======
>>>>>>> 3aada4d324ff848a4d1f00f4b8327786cf6c4fe9
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

app.listen(5000, () => {
  console.log("✅ Server running on http://localhost:5000");
});
