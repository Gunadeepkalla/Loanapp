import express from "express";
import cors from "cors";
import pool from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import auth from "./middleware/auth.js";
import loanRoutes from "./routes/loanRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminAuth from "./middleware/adminAuth.js";

const app = express();

// ✅ CORS MUST BE HERE (before all routes)
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/admin", adminRoutes);

app.get("/protected", auth, (req, res) => {
  res.json({ msg: "Protected route access ✅", user: req.user });
});

app.get("/api/admin/test", (req, res) => {
  res.send("Admin test route working ✅");
});

app.get("/", (req, res) => {
  res.send("Loan API working ✅");
});

// DB test route
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
