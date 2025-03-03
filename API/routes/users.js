const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../models/db");
const SECRET_KEY = process.env.SECRET_KEY;

const { validarCPF } = require("../utils/validators");

if (!SECRET_KEY) {
  console.error("Falta a variável de ambiente SECRET_KEY");
  process.exit(1); // Encerra a aplicação se a chave secreta não estiver definida
}

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gerenciamento de usuários
 */

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "usuario123"
 *               password:
 *                 type: string
 *                 example: "senhaSegura123"
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *       500:
 *         description: Erro ao registrar o usuário
 */

// routes/users.js
router.post("/register", async (req, res) => {
  try {
    // Recebe os dados enviados
    const {
      username,
      password,
      address,
      cep,
      phone,
      city,
      birthDate,
      email, // <-- agora também recebemos email
    } = req.body;

    // Valida os campos obrigatórios
    if (!username) {
      return res
        .status(400)
        .json({ error: "Você deixou o campo 'username' em branco." });
    }
    if (!email) {
      return res
        .status(400)
        .json({ error: "Você deixou o campo 'email' em branco." });
    }
    if (!password) {
      return res
        .status(400)
        .json({ error: "Você deixou o campo 'password' em branco." });
    }
    if (!address) {
      return res
        .status(400)
        .json({ error: "Você deixou o campo 'address' em branco." });
    }
    if (!cep) {
      return res
        .status(400)
        .json({ error: "Você deixou o campo 'cep' em branco." });
    }
    if (!phone) {
      return res
        .status(400)
        .json({ error: "Você deixou o campo 'phone' em branco." });
    }
    if (!city) {
      return res
        .status(400)
        .json({ error: "Você deixou o campo 'city' em branco." });
    }
    if (!birthDate) {
      return res
        .status(400)
        .json({ error: "Você deixou o campo 'birthDate' em branco." });
    }

    // Verifica se o usuário tem pelo menos 18 anos
    const dataNascimento = new Date(birthDate);
    const hoje = new Date();
    let idade = hoje.getFullYear() - dataNascimento.getFullYear();
    const mes = hoje.getMonth() - dataNascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < dataNascimento.getDate())) {
      idade--;
    }

    if (idade < 18) {
      return res.status(400).json({
        error: "Você precisa ter pelo menos 18 anos para se cadastrar.",
      });
    }

    // Gera o hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insere o novo usuário no banco, incluindo o email
    db.run(
      "INSERT INTO users (username, password, email, address, cep, phone, city, birth_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [username, hashedPassword, email, address, cep, phone, city, birthDate],
      (err) => {
        if (err) {
          if (err.code === "SQLITE_CONSTRAINT") {
            return res
              .status(400)
              .json({ error: "Este nome de usuário ou email já está em uso." });
          }
          return res
            .status(500)
            .json({ error: "Erro ao registrar usuário no banco de dados." });
        }
        return res
          .status(201)
          .json({ message: "Usuário registrado com sucesso!" });
      }
    );
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Ocorreu um erro no servidor ao registrar o usuário." });
  }
});

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Autentica um usuário existente
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "usuario123"
 *               password:
 *                 type: string
 *                 example: "senhaSegura123"
 *     responses:
 *       200:
 *         description: Login bem-sucedido, retorna um token JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR..."
 *       401:
 *         description: Usuário não encontrado ou senha incorreta
 *       500:
 *         description: Erro interno no servidor
 */

// Login
router.post("/login", (req, res) => {
  // Agora esperamos que o frontend mande email e password
  const { email, password } = req.body;

  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (err || !user) return res.status(401).send("Usuário não encontrado.");
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) return res.status(401).send("Senha incorreta.");

    // Defina o tempo de expiração do token, por exemplo, 2 horas.
    const token = jwt.sign(
      { id: user.id, is_admin: user.is_admin },
      SECRET_KEY,
      { expiresIn: "2h" }
    );
    res.json({ token });
  });
});

module.exports = router;
