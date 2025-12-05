import pool from "../config/db.js";

export const applyLoan = async (req, res) => {
  try {
    const {
      user_id,
      loan_type,
      full_name,
      phone,
      address,
      salary
    } = req.body;

    const aadhaar = req.files.aadhaar?.[0]?.filename || null;
    const pan = req.files.pan?.[0]?.filename || null;
    const salarySlip = req.files.salarySlip?.[0]?.filename || null;

    // Documents stored in JSONB column
    const documents = {
      aadhaar,
      pan,
      salarySlip
    };

    const query = `
      INSERT INTO loan_applications 
      (user_id, loan_type, full_name, phone, address, salary, pan, aadhaar, status, documents)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'Under Review',$9)
      RETURNING *;
    `;

    const values = [
      user_id,
      loan_type,
      full_name,
      phone,
      address,
      salary,
      pan,
      aadhaar,
      JSON.stringify(documents)
    ];

    const result = await pool.query(query, values);

    res.status(200).json({
      success: true,
      message: "Loan application submitted successfully!",
      loan: result.rows[0]
    });

  } catch (error) {
    console.error("Loan Apply Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getUserLoans = async (req, res) => {
  try {
    const { user_id } = req.params;

    const result = await pool.query(
      "SELECT * FROM loan_applications WHERE user_id = $1 ORDER BY id DESC",
      [user_id]
    );

    res.json({
      success: true,
      applications: result.rows
    });

  } catch (error) {
    console.error("Fetch Loans Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
