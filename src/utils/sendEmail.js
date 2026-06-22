import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "rishicoding56@gmail.com",
    pass: process.env.APP_PASSWORD,
  },
});

transporter.verify((err, success) => {
  console.log("ERR =", err);
  console.log("SUCCESS =", success);
});

export async function sendEmail(email) {
  try {
    const otp = Math.floor(100000 + Math.random() * 90000);
    const info = await transporter.sendMail({
      from: "rishicoding56@gmail.com",
      to: email,
      subject: "Requested otp for RSK chat app",
      html: `<div
    style="
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: auto;
      padding: 20px;
      border: 1px solid #e5e5e5;
      border-radius: 10px;
    "
  >
    <h2 style="color: #333">Verify Your Email</h2>
    <p>Hello,</p>
    <p>Use the following OTP to verify your account:</p>
    <div
      style="
        background: #f4f4f4;
        padding: 15px;
        text-align: center;
        font-size: 32px;
        font-weight: bold;
        letter-spacing: 5px;
        border-radius: 8px;
        margin: 20px 0;"
        >
      ${otp}
    </div>
</div>`,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// import { Resend } from "resend";
// export const resend = new Resend("re_gdHBKeKu_ikwwZhM1hfK5ToFZnqtMHsqe");

// export async function sendEmail(email) {
//   try {
//     const otp = Math.floor(100000 + Math.random() * 90000);

//     const response = await resend.emails.send({
//       from: "onboarding@resend.dev",
//       to: "rishicoding56@gmail.com",
//       subject: "Requested otp for RSK chat app",
//       html: `
//
//       `,
//     });

//     // Check if email was sent successfully
//     if (response.error) {
//       console.error("Email send error:", response.error);
//       return { success: false, error: response.error, otp: null };
//     }

//     console.log("Email sent successfully:", response);
//     return { success: true, otp, emailId: response.id };
//   } catch (error) {
//     console.error("Email send exception:", error.message);
//     return { success: false, error: error.message, otp: null };
//   }
// }
