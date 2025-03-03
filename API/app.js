require("dotenv").config();

const express = require("express");
const swaggerUi = require("swagger-ui-express");
const cors = require("cors");

const app = express(); // Definindo a instância do Express

// Serve a pasta "uploads" estática
app.use("/uploads", express.static("uploads"));

const swaggerDocs = require("./config/swagger");
const userRoutes = require("./routes/users");
const itemRoutes = require("./routes/itens");
const passwordRoutes = require("./routes/password");

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Rotas
app.use("/users", userRoutes);
app.use("/pets", itemRoutes);
app.use("/password", passwordRoutes);

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
