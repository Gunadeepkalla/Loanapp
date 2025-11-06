import express from "express";
import pool from "../config/db.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

// ✅ Admin - Get all loan applications
router.get("/loans", adminAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT loans.id, loans.loan_type, loans.amount, loans.cibil_score, loans.status, loans.application_id,
             users.name, users.email
      FROM loans
      JOIN users ON loans.user_id = users.id
      ORDER BY loans.id DESC
    `);

    res.json({ msg: "All loan applications ✅", data: result.rows });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Error getting loans ❌" });
  }
});

export default router;
