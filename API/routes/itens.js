const express = require("express");
const authenticateToken = require("../middlewares/auth");
const db = require("../models/db");
const router = express.Router();

// Importa multer e configura armazenamento
const multer = require("multer");
const path = require("path");

// Configuração do multer – os arquivos serão salvos na pasta "uploads"
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Define um nome único para o arquivo
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

/**
 * @swagger
 * /pets/{id}:
 *   get:
 *     summary: Retorna os dados de um pet específico
 *     tags: [Pets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do pet
 *     responses:
 *       200:
 *         description: Dados do pet retornado com sucesso
 *       404:
 *         description: Pet não encontrado
 */

// Rota para listar todos os pets (acessível sem autenticação)
router.get("/", (req, res) => {
  const sql = `
    SELECT pets.*, users.username AS owner_username
    FROM pets
    JOIN users ON pets.user_id = users.id
  `;
  db.all(sql, (err, rows) => {
    if (err) {
      console.error("Erro no SELECT da tabela pets:", err);
      return res.status(500).json({ error: "Erro ao buscar a lista de pets" });
    }
    res.json(rows);
  });
});

// Rota para retornar os detalhes de um pet específico (acessível sem autenticação)
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM pets WHERE id = ?", [id], (err, row) => {
    if (err) {
      console.error("Erro ao buscar pet:", err);
      return res.status(500).json({ error: "Erro ao buscar pet" });
    }
    if (!row) return res.status(404).json({ error: "Pet não encontrado" });
    res.json(row);
  });
});

// A partir deste ponto, as rotas exigem autenticação
router.use(authenticateToken);

/**
 * @swagger
 * /pets:
 *   post:
 *     summary: Adiciona um novo pet à lista de adoção
 *     tags: [Pets]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               age:
 *                 type: integer
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               category:
 *                 type: string
 *               location:
 *                 type: string
 *               featured:
 *                 type: integer
 *               new:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Pet adicionado com sucesso
 *       500:
 *         description: Erro ao adicionar pet
 */
router.post("/", upload.single("image"), (req, res) => {
  const {
    name,
    age,
    description,
    category,
    location,
    featured,
    new: isNew,
  } = req.body;
  const userId = req.user.id;
  // Se houver arquivo, armazena o nome
  const image = req.file ? req.file.filename : null;

  db.run(
    `INSERT INTO pets (name, age, description, image, category, location, featured, new, user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      age,
      description,
      image,
      category || null,
      location || null,
      featured || 0,
      isNew || 0,
      userId,
    ],
    (err) => {
      if (err) return res.status(500).json({ error: "Erro ao adicionar pet" });
      res.status(201).send("Pet adicionado");
    }
  );
});

/**
 * @swagger
 * /pets/{id}:
 *   put:
 *     summary: Atualiza os dados de um pet
 *     tags: [Pets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do pet a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               age:
 *                 type: integer
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pet atualizado com sucesso
 *       500:
 *         description: Erro ao atualizar pet
 */
router.put("/:id", upload.single("image"), (req, res) => {
  const { id } = req.params;
  const {
    name,
    age,
    description,
    category,
    location,
    featured,
    new: isNew,
  } = req.body;

  // Se tiver arquivo novo, pega o nome do arquivo:
  const newImageFile = req.file ? req.file.filename : null;

  // Buscar o pet existente para descobrir qual era a imagem antiga:
  db.get("SELECT * FROM pets WHERE id = ?", [id], (err, pet) => {
    if (err) {
      return res.status(500).json({ error: "Erro ao buscar pet" });
    }
    if (!pet) {
      return res.status(404).json({ error: "Pet não encontrado" });
    }

    // Verifica permissões (dono ou admin):
    if (req.user.id === pet.user_id || req.user.is_admin) {
      // Se tiver enviado uma nova imagem, usa ela; se não, mantém a antiga
      const finalImage = newImageFile ? newImageFile : pet.image;

      // Atualiza no banco
      db.run(
        `UPDATE pets
         SET name = ?, age = ?, description = ?, image = ?,
             category = ?, location = ?, featured = ?, new = ?
         WHERE id = ?`,
        [
          name,
          age,
          description,
          finalImage,
          category,
          location,
          featured || 0,
          isNew || 0,
          id,
        ],
        (err2) => {
          if (err2) {
            return res.status(500).json({ error: "Erro ao atualizar pet" });
          }
          res.status(200).send("Pet atualizado");
        }
      );
    } else {
      return res
        .status(403)
        .json({ error: "Acesso negado: você não pode editar este pet." });
    }
  });
});
/**
 * @swagger
 * /pets/{id}:
 *   delete:
 *     summary: Remove um pet da lista de adoção
 *     tags: [Pets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do pet a ser removido
 *     responses:
 *       200:
 *         description: Pet removido com sucesso
 *       500:
 *         description: Erro ao remover pet
 */
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.get("SELECT user_id FROM pets WHERE id = ?", [id], (err, pet) => {
    if (err) return res.status(500).json({ error: "Erro ao buscar pet" });
    if (!pet) return res.status(404).json({ error: "Pet não encontrado" });

    if (req.user.id === pet.user_id || req.user.is_admin) {
      db.run("DELETE FROM pets WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ error: "Erro ao remover pet" });
        res.status(200).send("Pet removido");
      });
    } else {
      return res
        .status(403)
        .json({ error: "Acesso negado: você não pode remover este pet." });
    }
  });
});

module.exports = router;
