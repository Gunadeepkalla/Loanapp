import express from "express";
import pool from "../config/db.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Apply for loan
router.post("/apply", authMiddleware, async (req, res) => {
  const { loan_type, amount, cibil_score } = req.body;
  const userId = req.user.id;

  // Generate unique application_id
  const application_id = `APP-${Date.now()}`;

  try {
    const result = await pool.query(
      `INSERT INTO loans (user_id, loan_type, amount, cibil_score, status, application_id)
       VALUES ($1, $2, $3, $4, 'pending', $5) RETURNING id, application_id`,
      [userId, loan_type, amount, cibil_score, application_id]
    );

    res.json({
      msg: "Loan application submitted ✅",
      application_id: result.rows[0].application_id,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Loan application failed ❌" });
  }
});

export default router;
