import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendEmail = async (to, subject, text) => {
  try {
    const info = await transporter.sendMail({
    from: `"Loan Portal" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text
  });

    console.log("📩 Email sent:", info.response);
  } catch (err) {
    console.error("❌ Email error:", err);
  }
};
