import express from "express";
import pool from "../config/db.js";
import verifyToken from "../middleware/auth.js";
import adminAuth from "../middleware/adminAuth.js";
import { sendEmail } from "../config/email.js";

const router = express.Router();

// Debug log
console.log("🔥 adminRoutes.js loaded successfully!");

// BASE URL for generating full document links
const BASE_URL = process.env.BASE_URL || "https://loanapp-lu02.onrender.com";

// Helper to convert file names → full URLs
// Helper to convert file names → full URLs (SAFE: Prevents double URLs)
const buildDocumentURLs = (documents, aadhaar, pan) => {
  const finalDocs = {};

  if (documents) {
    const parsedDocs =
      typeof documents === "string" ? JSON.parse(documents) : documents;

    for (let key in parsedDocs) {
      const val = parsedDocs[key];

      if (!val) {
        finalDocs[key] = null;
        continue;
      }

      // 🔥 FIX: If value is already a full URL, DON'T add BASE_URL again
      if (val.startsWith("http")) {
        finalDocs[key] = val;
      } else {
        finalDocs[key] = `${BASE_URL}/uploads/${val}`;
      }
    }
  }

  // Aadhaar safe fix
  if (aadhaar) {
    finalDocs.aadhaar = aadhaar.startsWith("http")
      ? aadhaar
      : `${BASE_URL}/uploads/${aadhaar}`;
  }

  // PAN safe fix
  if (pan) {
    finalDocs.pan = pan.startsWith("http")
      ? pan
      : `${BASE_URL}/uploads/${pan}`;
  }

  return finalDocs;
};

/* --------------------------------------------------------------
   1️⃣ GET ALL ADVANCED LOAN APPLICATIONS
-------------------------------------------------------------- */
router.get("/applications", verifyToken, adminAuth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM loan_applications ORDER BY id DESC"
    );

    // Add full URLs to every application
    const updatedRows = result.rows.map((app) => ({
      ...app,
      documents: buildDocumentURLs(app.documents, app.aadhaar, app.pan),
    }));

    res.json({
      success: true,
      applications: updatedRows,
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

    const app = result.rows[0];

    app.documents = buildDocumentURLs(app.documents, app.aadhaar, app.pan);

    res.json({
      success: true,
      application: app,
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

    // Send email
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
   4️⃣ OLD SIMPLE LOANS SYSTEM
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
