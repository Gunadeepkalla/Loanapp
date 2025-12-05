import express from "express";
import pool from "../config/db.js";
import authMiddleware from "../middleware/auth.js";
import { sendEmail } from "../config/email.js";
import multer from "multer";

const router = express.Router();

/* -----------------------------
     FILE UPLOAD CONFIG
------------------------------ */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

/* --------------------------------------------------------------
    1️⃣ SIMPLE LOAN APPLY (Old system - UNCHANGED)
-------------------------------------------------------------- */
router.post("/apply", authMiddleware, async (req, res) => {
  const { loan_type, amount, cibil_score } = req.body;
  const userId = req.user.id;

  const application_id = `APP-${Date.now()}`;

  try {
    const result = await pool.query(
      `INSERT INTO loans (user_id, loan_type, amount, cibil_score, status, application_id)
       VALUES ($1, $2, $3, $4, 'pending', $5)
       RETURNING id, application_id`,
      [userId, loan_type, amount, cibil_score, application_id]
    );

    const userResult = await pool.query(
      "SELECT email FROM users WHERE id = $1",
      [userId]
    );
    const userEmail = userResult.rows[0].email;

    await sendEmail(
      userEmail,
      "Loan Application Submitted ✅",
      `Your loan application (ID: ${application_id}) has been submitted successfully.`
    );

    res.json({
      msg: "Loan application submitted ✅ Email sent",
      application_id: application_id,
    });
  } catch (err) {
    console.log("Loan apply error:", err);
    res.status(500).json({ msg: "Loan application failed ❌", error: err.toString() });
  }
});

/* --------------------------------------------------------------
   2️⃣ SIMPLE LOANS FETCH (Old UI - UNCHANGED)
-------------------------------------------------------------- */
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      "SELECT * FROM loans WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching user loans:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

/* --------------------------------------------------------------
   3️⃣ ADVANCED LOAN APPLICATION (NEW — dynamic documents)
-------------------------------------------------------------- */
router.post(
  "/apply-loan",
  authMiddleware,
  upload.fields([
    { name: "aadhaar", maxCount: 1 },
    { name: "pan", maxCount: 1 },
    { name: "salarySlip", maxCount: 1 },
    { name: "rc", maxCount: 1 },  // vehicle loan
    { name: "property_doc", maxCount: 1 }, // house loan
    { name: "fee_structure", maxCount: 1 }, // education loan
    { name: "bank_statement", maxCount: 1 }, // all loans
    { name: "admission_letter", maxCount: 1 }, // education loan
  ]),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { loan_type, full_name, phone, address, salary } = req.body;

      // Files (FINAL FIX)
      const documents = {
        aadhaar: req.files.aadhaar?.[0]?.filename || null,
        pan: req.files.pan?.[0]?.filename || null,
        salarySlip: req.files.salarySlip?.[0]?.filename || null,
        rc: req.files.rc?.[0]?.filename || null,
        property_doc: req.files.property_doc?.[0]?.filename || null,
        fee_structure: req.files.fee_structure?.[0]?.filename || null,
        bank_statement: req.files.bank_statement?.[0]?.filename || null,
        admission_letter: req.files.admission_letter?.[0]?.filename || null,
      };

      const query = `
        INSERT INTO loan_applications 
        (user_id, loan_type, full_name, phone, address, salary, pan, aadhaar, status, documents)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'Under Review',$9)
        RETURNING *;
      `;

      const values = [
        userId,
        loan_type,
        full_name,
        phone,
        address,
        salary,
        documents.pan,
        documents.aadhaar,
        JSON.stringify(documents),
      ];

      const result = await pool.query(query, values);

      /* ⭐ EMAIL SEND AFTER LOAN SUBMISSION */
      const userEmailResult = await pool.query(
        "SELECT email FROM users WHERE id = $1",
        [userId]
      );
      const userEmail = userEmailResult.rows[0].email;

      await sendEmail(
        userEmail,
        "Loan Application Submitted Successfully 📩",
        `
        Hello ${full_name},

        Your ${loan_type} loan application has been submitted.

        Status: Under Review
        Application ID: ${result.rows[0].id}

        Our team will verify your documents and update you shortly.

        Regards,
        Loan Management Team
        `
      );

      res.json({
        success: true,
        msg: "Loan application submitted successfully & email sent 📩",
        application: result.rows[0],
      });

    } catch (err) {
      console.error("Loan Application Error:", err);
      res.status(500).json({ msg: "Server Error", error: err.toString() });
    }
  }
);

/* --------------------------------------------------------------
   4️⃣ GET LOGGED-IN USER'S ADVANCED LOAN APPLICATIONS
-------------------------------------------------------------- */
router.get("/my-applications", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      "SELECT * FROM loan_applications WHERE user_id = $1 ORDER BY id DESC",
      [userId]
    );

    res.json({ success: true, applications: result.rows });
  } catch (err) {
    console.error("Fetch Loan Applications Error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

export default router;
