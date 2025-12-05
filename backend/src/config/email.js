import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,  // your gmail
        pass: process.env.EMAIL_PASS,  // app password
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });

    console.log("📩 Email sent successfully!");
  } catch (err) {
    console.log("❌ Email sending failed:", err);
  }
};
