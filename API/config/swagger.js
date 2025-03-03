const swaggerJSDoc = require("swagger-jsdoc");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Sistema de Adoção de Animais 🐾 API",
      version: "1.0.0",
      description: "API para gerenciar o sistema de adoção de animais.",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }], // Definindo segurança global para as rotas
  },
  apis: ["./routes/*.js"], // Caminho para os arquivos de rotas
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

module.exports = swaggerDocs;
