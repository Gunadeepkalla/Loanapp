import express from "express";
import pool from "../config/db.js";
import authMiddleware from "../middleware/auth.js";
import { sendEmail } from "../config/email.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const router = express.Router();

/* --------------------------------------------------------------
   ⭐ FIX: Ensure absolute uploads path (Render compatible)
-------------------------------------------------------------- */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "../../uploads");

// Create uploads folder if missing
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📁 uploads folder created");
}

/* --------------------------------------------------------------
   ⭐ MULTER STORAGE CONFIG
-------------------------------------------------------------- */

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });


/* --------------------------------------------------------------
   1️⃣ SIMPLE LOAN APPLY
-------------------------------------------------------------- */
router.post("/apply", authMiddleware, async (req, res) => {
  const { loan_type, amount, cibil_score } = req.body;
  const userId = req.user.id;

  const application_id = `APP-${Date.now()}`;

  try {
    await pool.query(
      `INSERT INTO loans (user_id, loan_type, amount, cibil_score, status, application_id)
       VALUES ($1, $2, $3, $4, 'pending', $5)`,
      [userId, loan_type, amount, cibil_score, application_id]
    );

    const userEmailResult = await pool.query(
      "SELECT email FROM users WHERE id = $1",
      [userId]
    );

    const userEmail = userEmailResult.rows[0].email;

    await sendEmail(
      userEmail,
      "Loan Application Submitted Successfully",
      `Your loan application (ID: ${application_id}) has been submitted successfully.`
    );

    return res.json({
      msg: "Loan application submitted & email sent",
      application_id,
    });

  } catch (err) {
    console.log("Loan apply error:", err);
    return res.status(500).json({ msg: "Loan application failed ❌" });
  }
});


/* --------------------------------------------------------------
   2️⃣ GET LOGGED-IN USER SIMPLE LOANS
-------------------------------------------------------------- */
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      "SELECT * FROM loans WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    return res.json(result.rows);
  } catch (err) {
    console.error("Error fetching user loans:", err.message);
    return res.status(500).json({ msg: "Server error" });
  }
});


/* --------------------------------------------------------------
   3️⃣ ADVANCED LOAN APPLICATION (WITH MULTIPLE DOCUMENT UPLOADS)
-------------------------------------------------------------- */
router.post(
  "/apply-loan",
  authMiddleware,
  upload.fields([
    { name: "aadhaar", maxCount: 1 },
    { name: "pan", maxCount: 1 },
    { name: "salarySlip", maxCount: 1 },
    { name: "rc", maxCount: 1 },
    { name: "property_doc", maxCount: 1 },
    { name: "fee_structure", maxCount: 1 },
    { name: "bank_statement", maxCount: 1 },
    { name: "admission_letter", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { loan_type, full_name, phone, address, salary } = req.body;

      // Extract uploaded files safely
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
        JSON.stringify(documents), // important
      ];

      const result = await pool.query(query, values);

      // Fetch user email
      const userEmailResult = await pool.query(
        "SELECT email FROM users WHERE id = $1",
        [userId]
      );
      const userEmail = userEmailResult.rows[0].email;

      // Send confirmation email
      await sendEmail(
        userEmail,
        "Loan Application Submitted Successfully 📩",
        `
        Hello ${full_name},

        Your ${loan_type} loan application has been submitted.
        Status: Under Review
        Application ID: ${result.rows[0].id}

        Regards,
        Loan Management Team
        `
      );

      return res.json({
        success: true,
        msg: "Loan application submitted successfully & email sent 📩",
        application: result.rows[0],
      });

    } catch (err) {
      console.error("Loan Application Error:", err);
      return res.status(500).json({ msg: "Server Error", error: err.toString() });
    }
  }
);


/* --------------------------------------------------------------
   4️⃣ GET LOGGED-IN USER ADVANCED LOAN APPLICATIONS
-------------------------------------------------------------- */
router.get("/my-applications", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      "SELECT * FROM loan_applications WHERE user_id = $1 ORDER BY id DESC",
      [userId]
    );

    const apps = result.rows.map(app => ({
      ...app,
      documents: app.documents ? JSON.parse(app.documents) : {}
    }));

    return res.json({ success: true, applications: apps });
  } catch (err) {
    console.error("Fetch Loan Applications Error:", err);
    return res.status(500).json({ msg: "Server Error" });
  }
});

export default router;
