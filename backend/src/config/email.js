import nodemailer from "nodemailer";

const EMAIL_SERVICE = process.env.EMAIL_SERVICE;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

let transporter = null;

if (EMAIL_SERVICE && EMAIL_USER && EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: EMAIL_SERVICE, // gmail
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS, // app password
    },
  });

  console.log("📧 Email service initialized (Gmail)");
} else {
  console.warn("⚠️ Email credentials missing. Emails disabled.");
}

export const sendEmail = async (to, subject, text) => {
  if (!transporter) {
    console.log("📧 Email skipped (email not configured)");
    return;
  }

  try {
    await transporter.sendMail({
      from: `Loan Portal <${EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log("📩 Email sent successfully");
  } catch (err) {
    console.error("❌ Email failed:", err.message);
  }
};
