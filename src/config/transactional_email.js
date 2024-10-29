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
    from: `"Hostel Api" <${process.env.ACCOUNT_USER}>`,
    to: `${userData.username}`,
    subject: `${userData.firstName} Bienvenido/a a Hostel Api. Gracias por registrarse`,
    text: "Valide su cuenta de correo electrónico",
    html: `<h1><b>PARA VALIDAR SU CUENTA DE CORREO ELECTRONICO<br>HAGA CLICK EN EL SIGUIENTE ENLACE</b></h1><p style='color:red;font-size:18px'>El enlace que sigue solo tendrá validez durante los próximos 13 minutos</p><br><a href="${confirmEmailLink}"><b>Haz click aquí</b></a>`,
  });

  console.log("Message sent: %s", info.messageId);
}

module.exports = sendConfirmationMail;
