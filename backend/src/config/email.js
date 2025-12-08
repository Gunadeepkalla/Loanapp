import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to, subject, text) => {
  try {
    await resend.emails.send({
      from: "Loan Portal <noreply@resend.dev>",
      to,
      subject,
      text,
    });

    console.log("📩 Email sent via Resend!");
  } catch (err) {
    console.error("❌ Email failed:", err);
  }
};
