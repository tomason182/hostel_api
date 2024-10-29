const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false,
  auth: {
    user: process.env.ACCOUNT_USER,
    pass: process.env.ACCOUNT_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

async function sendConfirmationMail(userData, confirmEmailLink) {
  const info = await transporter.sendMail({
    from: `"Simple Hostel" <${process.env.ACCOUNT_USER}>`,
    to: `${userData.username}`,
    subject: "Confirm Your Email for SimpleHostel",
    text: "Verify your email account",
    html: `<table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; margin: 20px auto; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); font-family: Arial, sans-serif; color: #333;">
    <tr>
      <td align="center" style="padding: 10px 0;">
        <h2 style="color: #007BFF;">Welcome to SimpleHostel!</h2>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px; font-size: 1rem; line-height: 1.6;">
        <p>Hi ${userData.firstName},</p>
        <p>Welcome to SimpleHostel! To complete your account setup, please confirm your email address.</p>
        <p style="text-align: center; margin: 20px 0;">
          <a href=${confirmEmailLink} style="display: inline-block; padding: 12px 24px; color: #ffffff; background-color: #007BFF; border-radius: 4px; text-decoration: none; font-weight: bold;">Verify My Email</a>
        </p>
        <p>If you didn&apos;t create an account with SimpleHostel, you can ignore this email.</p>
        <p>Thank you for joining us!<br>The SimpleHostel Team</p>
      </td>
    </tr>
  </table>
  `,
  });

  console.log("Message sent: %s", info.messageId);
}

module.exports = sendConfirmationMail;
