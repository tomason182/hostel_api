const nodemailer = require("nodemailer");
const logger = require("../utils/logger");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host:
    process.env.NODE_ENV === "production"
      ? "support@simplehostel.net"
      : "smtp.ethereal.email",
  port: process.env.NODE_ENV === "production" ? 465 : 587,
  secure: process.env.NODE_ENV === "production" ? true : false,
  auth: {
    user: process.env.ACCOUNT_USER,
    pass: process.env.ACCOUNT_PASS,
  },
  tls: {
    rejectUnauthorized: process.env.NODE_ENV === "production" ? true : false,
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
          <a href=${confirmEmailLink} target="_blank" style="display: inline-block; padding: 12px 24px; color: #ffffff; background-color: #007BFF; border-radius: 4px; text-decoration: none; font-weight: bold;">Verify My Email</a>
        </p>
        <p>If you didn&apos;t create an account with SimpleHostel, you can ignore this email.</p>
        <p>Thank you for joining us!<br>The SimpleHostel Team</p>
      </td>
    </tr>
  </table>
  `,
  });

  logger.info(
    `Message sent to ${userData.username}, messageId: ${info.messageId}`
  );
}

async function sendResetPasswordMail(userData, resetPassLink) {
  const info = await transporter.sendMail({
    from: `"Simple Hostel" <${process.env.ACCOUNT_USER}>`,
    to: `${userData.username}`,
    subject: "Reset Your Password for SimpleHostel",
    text: "Reset your password",
    html: `<table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; margin: 20px auto; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); font-family: Arial, sans-serif; color: #333;">
    <tbody>
      <tr>
        <td colspan="3" height="60" style="text-align: center; background-color: #007bff; color: #ffffff; border-radius: 8px 8px 0 0;">
          <h1 style="font-size: 1.8rem; font-weight: bold;">Simple Hostel</h1>
        </td>
      </tr>      
      <tr>
        <td colspan="3" height="20"></td>
      </tr>
      <tr>
        <td colspan="3">
          <h4 style="color: #222; font-size: 0.75rem; margin-bottom: 10px; font-weight: bold">Reset Password</h4>
          <p style="font-size: 0.75rem; line-height: 1.5;">
            A password reset link was requested for this email. This link is limited for 15 minutes
            <br /><br />
            If you do not reset your password withing 15 minutes, you will need to request a new link.
            <br /><br />
            To complete the password reset process, please visit the following link:
            <br /><br />
            <a href=${resetPassLink} target="_blank" style="color: #007bff; text-decoration: none;">Reset your password</a>
          </p>
        </td>
      </tr>
      <tr>
        <td colspan="3 height="20"></td>
      </tr>  
    </tbody>
  </table>
  `,
  });

  logger.info(
    `Message sent to ${userData.username}, messageId: ${info.messageId}`
  );
}

module.exports = { sendConfirmationMail, sendResetPasswordMail };
