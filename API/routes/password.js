// routes/password.js
const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../models/db");
const { enviarEmailRecuperacao } = require("../utils/email");
const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;

// Endpoint para solicitar redefinição de senha
router.post("/forgot", (req, res) => {
  const { email } = req.body;

  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err || !user) return res.status(404).send("Usuário não encontrado.");

    // Gere um token de recuperação com validade (ex: 1 hora)
    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: "1h" });

    // Envie o email de recuperação (certifique-se de que as variáveis de ambiente EMAIL_USER e EMAIL_PASS estejam definidas)
    enviarEmailRecuperacao(email, token);
    res.send("Email de recuperação enviado.");
  });
});

// Endpoint para redefinir a senha usando o token recebido
router.post("/reset", async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const hashedPassword = await require("bcrypt").hash(newPassword, 10);

    db.run(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, decoded.id],
      (err) => {
        if (err) return res.status(500).send("Erro ao redefinir a senha.");
        res.send("Senha redefinida com sucesso!");
      }
    );
  } catch (error) {
    res.status(400).send("Token inválido ou expirado.");
  }
});

module.exports = router;
