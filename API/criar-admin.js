// criar-admin.js
const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./banco_de_dados.sqlite");

async function criarAdmin() {
  const username = "dcristian"; // Nome de usuário desejado
  const senhaAdmin = "shy27c07"; // Senha conhecida para o admin
  const hashedPassword = await bcrypt.hash(senhaAdmin, 10);

  db.run(
    "INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)",
    [username, hashedPassword, 1],
    (err) => {
      if (err) {
        console.error("Erro ao criar admin:", err.message);
      } else {
        console.log("Usuário admin criado com sucesso!");
      }
      db.close();
    }
  );
}

criarAdmin();
