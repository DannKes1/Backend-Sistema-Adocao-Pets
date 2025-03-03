# Sistema de Adoção de Animais 🐾

Este é um projeto acadêmico simples que oferece um CRUD de animais para adoção (pets), autenticação de usuários via JWT e documentação da API via Swagger.

> **Importante:** as funcionalidades de recuperação de senha e de busca/filtro não estão funcionando corretamente neste momento.

---

## Sumário
1. [Requisitos](#requisitos)
2. [Instalação](#instalação)
3. [Configuração de Variáveis de Ambiente](#configuração-de-variáveis-de-ambiente)
4. [Execução do Projeto](#execução-do-projeto)
5. [Estrutura de Pastas](#estrutura-de-pastas)
6. [Funcionalidades Principais](#funcionalidades-principais)
7. [Endpoints Principais](#endpoints-principais)
8. [Utilização do Swagger (Documentação da API)](#utilização-do-swagger-documentação-da-api)
9. [Observações sobre o Banco de Dados (SQLite)](#observações-sobre-o-banco-de-dados-sqlite)
10. [Licença](#licença)

---

## 1. Requisitos
- **Node.js** (versão 14 ou superior)
- **NPM** (geralmente instalado junto com Node.js) ou **Yarn**

---

## 2. Instalação
Clone ou baixe este repositório.  
Na raiz do projeto, abra um terminal e rode:

npm install


## 3. Configuração de Variáveis de Ambiente
Crie um arquivo .env na raiz do projeto (ou use outro método de configuração de variáveis) com as seguintes variáveis:
### Chave secreta utilizada para assinar tokens JWT
SECRET_KEY=SUA_CHAVE_SECRETA

### Credenciais para envio de email (Nodemailer, Gmail, etc.)
EMAIL_USER=seu.email@gmail.com
EMAIL_PASS=sua_senha_ou_app_password

## 4. Execução do Projeto
Após instalar as dependências e configurar o .env, inicie o servidor:
npm start
Ou, se preferir, execute:
node app.js
A aplicação estará disponível localmente em: http://localhost:3000

## 5. Estrutura de Pastas
.
├── config
│   └── swagger.js        # Configurações de Swagger
├── middlewares
│   └── auth.js           # Middleware de autenticação JWT
├── models
│   └── db.js             # Conexão e criação de tabelas do SQLite
├── routes
│   ├── itens.js          # Rotas relacionadas a Pets
│   ├── password.js       # Rotas relacionadas à recuperação de senha
│   └── users.js          # Rotas de cadastro/login de usuários
├── utils
│   ├── email.js          # Funções de envio de email (Nodemailer)
│   └── validators.js     # Função de validação de CPF (exemplo)
├── uploads               # Pasta onde são salvas as imagens dos Pets
├── .env                  # (criar) variáveis de ambiente
├── app.js                # Configuração principal e inicialização do servidor
├── package.json
└── ...

## 6. Funcionalidades Principais
Cadastro de Usuários
Armazena username, email, senha (com hash bcrypt), endereço, CEP, telefone, cidade e data de nascimento.
Verifica se o usuário é maior de 18 anos antes de efetuar o cadastro.
Verifica a unicidade de username e email.
Login e Autenticação via JWT
Retorna token válido por 2 horas.
O middleware auth.js protege rotas que exigem autenticação.
A rota /users/login aceita (email, password).
CRUD de Pets
Listar Pets: rota aberta, não exige token.
Obter detalhes de um Pet: rota aberta.
Criar, Editar e Excluir Pets: exige token JWT.
Upload de imagem via multer, salvando na pasta uploads/.
Somente o dono do pet ou um usuário admin podem editar/excluir o pet.
Recuperação de Senha
POST em /password/forgot: envia email ao usuário com link de recuperação.
POST em /password/reset: define nova senha, recebendo token de recuperação.
Documentação via Swagger
A rota /api-docs exibe os endpoints documentados.

## 7. Endpoints Principais
Usuários
POST /users/register
Cadastra um novo usuário.
Campos obrigatórios: username, email, password, address, cep, phone, city, birthDate.

POST /users/login
Faz login com email e password, retornando um token JWT.

Pets
GET /pets
Retorna todos os pets (rota aberta, sem token).

GET /pets/:id
Retorna dados de um pet específico (rota aberta).

POST /pets
Cria um pet (exige token). Envia campos + imagem (multipart/form-data).

PUT /pets/:id
Edita um pet (exige token). Somente o dono ou admin podem editar.

DELETE /pets/:id
Remove um pet (exige token). Somente o dono ou admin podem remover.

Recuperação de Senha
POST /password/forgot
Envia um email para redefinir a senha com token JWT de 1 hora.

POST /password/reset
Redefine a senha recebendo o token de recuperação + nova senha.

## 8. Utilização do Swagger (Documentação da API)
A documentação da API está disponível em:
http://localhost:3000/api-docs
Lá você poderá testar todas as rotas da aplicação, verificar parâmetros, respostas, códigos de status, etc.

## 9. Observações sobre o Banco de Dados (SQLite)
O projeto utiliza SQLite para fins didáticos.
Ao iniciar a aplicação pela primeira vez, será gerado um arquivo local banco_de_dados.sqlite na raiz do projeto.
As tabelas users e pets são criadas automaticamente, caso não existam, através do arquivo models/db.js.
O comando db.run("PRAGMA foreign_keys = ON"); habilita o uso de FOREIGN KEY no SQLite.

## 10. Licença
Este projeto é para fins educacionais.
