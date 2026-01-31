import pool from "../config/db.js";

export const applyLoan = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ from auth middleware

    const {
      loan_type,
      full_name,
      phone,
      address,
      salary,
    } = req.body;

    // ✅ Cloudinary URLs (NOT filenames)
    const documents = {
      aadhaar: req.files?.aadhaar?.[0]?.path || null,
      pan: req.files?.pan?.[0]?.path || null,
      salarySlip: req.files?.salarySlip?.[0]?.path || null,
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

    res.status(200).json({
      success: true,
      message: "Loan application submitted successfully!",
      loan: result.rows[0],
    });

  } catch (error) {
    console.error("Loan Apply Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getUserLoans = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ secure

    const result = await pool.query(
      "SELECT * FROM loan_applications WHERE user_id = $1 ORDER BY id DESC",
      [userId]
    );

    res.json({
      success: true,
      applications: result.rows,
    });

  } catch (error) {
  console.error("Loan Apply Error:", error);

  res.status(500).json({
    success: false,
    message: error.message || "Server error",
    error: error, // optional (for debugging)
  });
}
};
