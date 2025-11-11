<h1 align="center">🚀 SectorFlow | Sistema de Gestão Setorizada e Segura</h1>

<p align="center">
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white"/></a>
  <a href="https://expressjs.com/"><img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white"/></a>
  <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black"/></a>
  <a href="https://jwt.io/"><img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=json-web-tokens&logoColor=white"/></a>
  <img src="https://img.shields.io/badge/Status-Desenvolvimento-blue?style=for-the-badge"/>
</p>

---

## 🎯 Sobre o Projeto: Gestão Segmentada por Permissão

O **SectorFlow** é uma solução full-stack desenvolvida para gerenciar recursos (Usuários, Setores e Produtos) em um ambiente com **controle de acesso estrito**.

O sistema implementa **Role-Based Access Control (RBAC)** em cada rota da API REST, garantindo que usuários (ADMIN, VENDEDOR, USER) tenham visibilidade e permissões estritamente alinhadas às suas funções e setores associados. O objetivo é a máxima **segurança** e **separação de responsabilidades** no acesso aos dados.

### 🖼️ Tela de Login e Autenticação
<img width="800" height="450" alt="image" src="https://github.com/user-attachments/assets/f1f54978-bb8d-409d-812c-531c46fea3c2" />


---

## 🔑 Controle de Acesso e Papéis (RBAC)

| Role | Permissões Chave | Visibilidade no Dashboard |
| :--- | :--- | :--- |
| **ADMIN** | Acesso irrestrito a todos os CRUDs (Usuários, Setores, Produtos). | Visualiza todas as métricas e listas (Usuários e Setores). |
| **VENDEDOR** | CRUD em Produtos (limitado aos seus setores). Acesso a Setores (apenas leitura). | Focado apenas em **Produtos** e métricas de estoque. |

### 🖼️ Tela do Dashboard (Visão do ADMIN)
<img width="800" height="450" alt="image" src="https://github.com/user-attachments/assets/6e9336e0-d6ae-40f6-b120-5376a461d38c" />

### 🖼️ Tela do Dashboard (Visão do VENDEDOR)
<img width="800" height="450" alt="image" src="https://github.com/user-attachments/assets/974651a6-0b0a-4bb8-a650-4a8186556401" />

---

## 📋 Módulos e Funcionalidades

### 1. Gerenciamento de Usuários
Permite ao ADMIN criar, editar e excluir usuários, além de atribuir-lhes **Roles** e associá-los a **Setores** específicos.
- **Status:** ✅ Completo (com autorização por Role)
<img width="800" height="450" alt="image" src="https://github.com/user-attachments/assets/f14567c5-5e9a-4a7e-9ac5-0eb4ec4667a8" />


### 2. Gerenciamento de Setores
Permite ao ADMIN a criação e gestão dos setores da empresa, servindo como a principal forma de segmentação do sistema.
- **Status:** ✅ Completo (com autorização por Role)
<img width="800" height="450" alt="image" src="https://github.com/user-attachments/assets/12f3d0ec-13eb-4f27-8b5f-c48c0df46094" />


### 3. Gerenciamento de Produtos
Módulo central para o fluxo de trabalho. Os produtos são associados a um setor e podem ter acesso limitado baseado na Role do usuário.
- **Status:** ✅ Completo (com autorização e filtros por Role/Setor)
<img width="800" height="450" alt="image" src="https://github.com/user-attachments/assets/4ab37a70-f844-4b70-afb1-c8835fa962bc" />


---

## ⚙️ Tecnologias Principais

| Categoria | Tecnologia | Uso Principal |
| :--- | :--- | :--- |
| **Backend** | **Node.js (Express)** | API REST, Roteamento e Lógica de Negócios. |
| **Frontend** | **React** | SPA com Material-UI. |
| **Banco de Dados** | **Sequelize / SQLite** | ORM e persistência de dados. |
| **Segurança** | **JWT / Bcrypt.js** | Autenticação e hashing de senhas. |

---

## 🧩 Arquitetura do Projeto

Arquitetura **Full-Stack Separada** com padrão **MVC** no backend, separando lógica de dados (`models/`) e controle (`controllers/`). Comunicação via **API REST**.

---

## 🚀 Guia de Execução Local

### 🧩 1️⃣ Backend (API Node.js)

```bash
cd backend
npm install
echo "PORT=3001
JWT_SECRET=sua_chave_secreta_forte" > .env
npm start
```

### 💻 2️⃣ Frontend (React)

```bash
cd ..
cd frontend
npm install
npm start
```

---

### 🛡️ Credenciais de Teste

| Campo | Valor | Observação |
| :---- | :---- | :---------- |
| **Email** | admin@sectorflow.com | Usuário Padrão (Role: ADMIN) |
| **Senha** | 123 | Senha de teste |

---

<p align="center">💻 Automação, café e paciência — nessa ordem.</p>
