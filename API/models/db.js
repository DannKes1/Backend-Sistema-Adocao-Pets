// models/db.js
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./banco_de_dados.sqlite", (err) => {
  if (err) {
    console.error("Erro ao abrir o banco de dados:", err.message);
  } else {
    console.log("Conectado ao banco de dados SQLite.");
    db.run("PRAGMA foreign_keys = ON");

    // Cria a tabela users
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         username TEXT NOT NULL UNIQUE,
         password TEXT NOT NULL,
         email TEXT NOT NULL UNIQUE, 
         is_admin INTEGER DEFAULT 0,
         address TEXT,
         cep TEXT,
         phone TEXT,
         city TEXT,
         birth_date TEXT
       )`,
      (err) => {
        if (err) {
          console.error("Erro ao criar a tabela 'users':", err.message);
        } else {
          console.log("Tabela 'users' pronta para uso.");
        }
      }
    );

    // Cria a tabela pets
    db.run(
      `CREATE TABLE IF NOT EXISTS pets (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         name TEXT,
         age INTEGER,
         description TEXT,
         image TEXT,
         category TEXT,
         location TEXT,
         featured INTEGER DEFAULT 0,
         new INTEGER DEFAULT 0,
         user_id INTEGER,
         FOREIGN KEY(user_id) REFERENCES users(id)
       )`,
      (err) => {
        if (err) {
          console.error("Erro ao criar a tabela 'pets':", err.message);
        } else {
          console.log("Tabela 'pets' pronta para uso.");
        }
      }
    );
  }
});

module.exports = db;
