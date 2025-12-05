import express from "express";
import pool from "../config/db.js";
import verifyToken from "../middleware/auth.js";
import adminAuth from "../middleware/adminAuth.js";
import { sendEmail } from "../config/email.js";

const router = express.Router();

// Debug log to confirm file is loaded
console.log("🔥 adminRoutes.js loaded successfully!");

/* --------------------------------------------------------------
   1️⃣ GET ALL ADVANCED LOAN APPLICATIONS (loan_applications table)
-------------------------------------------------------------- */
router.get("/applications", verifyToken, adminAuth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM loan_applications ORDER BY id DESC"
    );

    res.json({
      success: true,
      applications: result.rows,
    });

  } catch (err) {
    console.error("Error fetching applications:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

/* --------------------------------------------------------------
   2️⃣ GET SINGLE APPLICATION BY ID
-------------------------------------------------------------- */
router.get("/applications/:id", verifyToken, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM loan_applications WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ msg: "Application not found" });
    }

    res.json({
      success: true,
      application: result.rows[0],
    });

  } catch (err) {
    console.error("Error fetching application:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

/* --------------------------------------------------------------
   3️⃣ APPROVE OR REJECT APPLICATION + EMAIL USER
-------------------------------------------------------------- */
router.put("/applications/:id", verifyToken, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status" });
    }

    const result = await pool.query(
      "UPDATE loan_applications SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ msg: "Application not found" });
    }

    const application = result.rows[0];

    // Fetch user email
    const userRes = await pool.query(
      "SELECT email FROM users WHERE id = $1",
      [application.user_id]
    );

    const userEmail = userRes.rows[0].email;

    // Send Approval/Rejection email
    await sendEmail(
      userEmail,
      `Loan Application ${status.toUpperCase()}`,
      `Your loan application (ID: ${id}) has been ${status}.`
    );

    res.json({
      success: true,
      msg: `Application ${status} successfully`,
      application,
    });

  } catch (err) {
    console.error("Error updating application:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

/* --------------------------------------------------------------
   4️⃣ OLD SIMPLE LOANS SYSTEM (kept for compatibility)
-------------------------------------------------------------- */
router.get("/loans", verifyToken, adminAuth, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM loans ORDER BY created_at DESC");

    res.json(result.rows);

  } catch (err) {
    console.error("Error fetching loans:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

router.put("/loans/:id", verifyToken, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status" });
    }

    const result = await pool.query(
      "UPDATE loans SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ msg: "Loan not found" });
    }

    const loan = result.rows[0];

    res.json({
      msg: `Loan ${status} successfully`,
      loan,
    });

  } catch (err) {
    console.error("Error updating loan:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
