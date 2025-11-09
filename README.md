<h1>SectorFlow | Sistema de Gestão Setorizada</h1>

<p>
  
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=json-web-tokens&logoColor=white)](https://jwt.io/)
[![Status](https://img.shields.io/badge/Status-Desenvolvimento-blue?style=for-the-badge)](/status)
</p>

<hr>

<h2>🎯 Sobre o Projeto</h2>

<p>
O <strong>SectorFlow</strong> é um sistema full-stack projetado para centralizar e gerenciar recursos (<strong>Usuários</strong>, <strong>Setores</strong> e <strong>Produtos</strong>) com base em segmentação.
O foco principal é a <strong>segurança</strong> e a <strong>separação de responsabilidades</strong> através de uma API REST protegida por <strong>JSON Web Tokens (JWT)</strong> e <strong>Controle de Acesso Baseado em Papéis (Role-Based Access Control - RBAC)</strong>.
</p>

<h3>📋 Fases Atuais</h3>
<ul>
  <li><strong>Fundação e Segurança (JWT, Bcrypt, Roles):</strong> ✅ Completa</li>
  <li><strong>CRUD Usuários:</strong> ✅ Completa (com autenticação e autorização por Role)</li>
  <li><strong>CRUD Setores:</strong> ✅ Completa (com autenticação e autorização por Role)</li>
  <li><strong>CRUD Produtos:</strong> ⚙️ Pendente</li>
</ul>
<hr>
<h2>⚙️ Tecnologias e Arquitetura</h2>

<table border="1" cellpadding="8" cellspacing="0">
  <thead>
    <tr>
      <th>Categoria</th>
      <th>Tecnologia</th>
      <th>Uso Principal</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Servidor</strong></td>
      <td>Node.js (Express)</td>
      <td>Roteamento, API REST</td>
    </tr>
    <tr>
      <td><strong>Banco de Dados</strong></td>
      <td>Sequelize / SQLite</td>
      <td>ORM, persistência de dados</td>
    </tr>
    <tr>
      <td><strong>Segurança</strong></td>
      <td>JWT / Bcrypt.js</td>
      <td>Autenticação sem estado e hashing de senhas</td>
    </tr>
    <tr>
      <td><strong>Cliente</strong></td>
      <td>React</td>
      <td>Single Page Application (SPA), Interface de Usuário</td>
    </tr>
  </tbody>
</table>

<h3>🏛️ Arquitetura do Projeto</h3>
<p>
O projeto segue uma arquitetura <strong>Full-Stack Separada</strong>, onde a comunicação é feita exclusivamente via API REST:
</p>
<ul>
  <li><strong>Backend (API Node.js/Express):</strong> Segue o padrão <strong>MVC (Model-View-Controller)</strong>, com foco na separação da lógica de acesso a dados (Models) e regras de negócio (Controllers). Utiliza um sistema de <strong>Setup de Associações Centralizado</strong> para evitar dependências circulares.</li>
  <li><strong>Frontend (React):</strong> Utiliza uma <strong>Arquitetura Baseada em Componentes</strong> (similar ao MVVM), separando a lógica de estado e comunicação de dados (Pages/View Model) da apresentação da interface (Components/View).</li>
</ul>

<h3>📁 Estrutura do Repositório</h3>

<pre>
projeto/
├── backend/                  # API REST (Node.js/Express)
│   ├── config/               # Configurações de DB e Associações
│   ├── models/               # Esquemas do DB (Sequelize)
│   ├── routes/               # Endpoints (auth.js, users.js, sectors.js, etc.)
│   ├── middleware/           # Middleware de Autenticação e Permissão
│   └── server.js             # Ponto de inicialização
└── frontend/                 # Aplicação Cliente (React)
    ├── src/
    │   ├── components/       # Blocos de UI (UserLogin, Forms, Lists, ProtectedRoute)
    │   ├── pages/            # Telas (Dashboard, SetoresPage, UsuariosPage, etc.)
    │   └── api.js            # Comunicação com o Backend (Axios)
</pre>

<hr>

<h2>🚀 Como Executar o Projeto</h2>

<h3>1️⃣ Backend (API)</h3>

<pre><code># Navega para a pasta da API
cd backend

# Instala as dependências
npm install

# Cria o arquivo de ambiente (.env)
echo "PORT=3001\nJWT_SECRET=sua_chave_secreta_forte" > .env

# 🚨 Setup do Banco de Dados (SQLite) 🚨
# 1. Cria as tabelas
sequelize db:migrate
# 2. Popula as tabelas com usuários/setores iniciais
sequelize db:seed:all

# Inicia o servidor 
npm start
</code></pre>

<h3>2️⃣ Frontend (React)</h3>

<pre><code># Volta para a raiz do projeto e acessa o frontend
cd ..
cd frontend

# Instala as dependências
npm install

# Inicia a aplicação React (geralmente em http://localhost:3000)
npm start
</code></pre>

<hr>

<h2>🛡️ Ponto de Verificação de Segurança (QA)</h2>

<h3>🔐 Credenciais de Teste</h3>

<p>O banco de dados é inicializado com um usuário administrador para testes:</p>

<table border="1" cellpadding="8" cellspacing="0">
  <thead>
    <tr>
      <th>Campo</th>
      <th>Valor</th>
      <th>Observação</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Email</strong></td>
      <td><code>admin@sectorflow.com</code></td>
      <td>Usuário padrão (Role: ADMIN)</td>
    </tr>
    <tr>
      <td><strong>Senha</strong></td>
      <td><code>123</code></td>
      <td>Senha de teste. Armazenada de forma hashada via Bcrypt.</td>
    </tr>
  </tbody>
</table>

<h3>🧠 Teste de Autenticação</h3>

<p>Para acessar qualquer rota protegida (como <code>/api/users</code>), é obrigatório enviar o token no cabeçalho HTTP:</p>

<pre><code>Authorization: Bearer [TOKEN_JWT_GERADO_PELO_LOGIN]</code></pre>

<p>O middleware <code>backend/middleware/auth.js</code> valida o token e o <code>backend/middleware/permission.js</code> verifica a Role antes de conceder acesso à rota.</p>

<hr>

<p align="center">
<strong>💻 Automação, café e paciência — nessa ordem.</strong>
</p>
