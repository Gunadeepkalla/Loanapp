import express from "express";
import pool from "../config/db.js";
import verifyToken from "../middleware/auth.js";   // This checks token & sets req.user
import adminAuth from "../middleware/adminAuth.js"; // This checks if req.user.role === "admin"

const router = express.Router();
console.log("✅ adminRoutes.js loaded");

router.get("/test", verifyToken,adminAuth, (req,res)=>{
  res.send("Admin route working ✅");
})
// ✅ Get all loan applications (Admin only)
router.get("/loans", verifyToken, adminAuth, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM loans ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching loans:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Approve or Reject a loan (Admin only)
router.put("/loan/:id", verifyToken, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status value ❌" });
    }

    const result = await pool.query(
      "UPDATE loans SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ msg: "Loan not found ❌" });
    }

    res.json({
      msg: `Loan ${status} ✅`,
      loan: result.rows[0],
    });
  } catch (err) {
    console.error("Error updating loan:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
