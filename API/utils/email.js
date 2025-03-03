// utils/email.js
const nodemailer = require("nodemailer");

// Configure seu transporte (exemplo com Gmail – use variáveis de ambiente para dados reais)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // seu email
    pass: process.env.EMAIL_PASS, // sua senha (ou app password)
  },
});

function enviarEmailRecuperacao(destinatario, token) {
  const link = `http://seusite.com/reset-password?token=${token}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: destinatario,
    subject: "Redefinição de Senha",
    text: `Para redefinir sua senha, clique no link: ${link}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Erro ao enviar email:", error);
    } else {
      console.log("Email enviado:", info.response);
    }
  });
}

module.exports = { enviarEmailRecuperacao };
