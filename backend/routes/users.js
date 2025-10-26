// backend/routes/users.js (DEVE ESTAR ASSIM)

const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');

// 🚨 CORREÇÃO ESSENCIAL: Desestrutura a função 'protect' e a renomeia
const { protect: authenticateToken } = require('../middleware/auth'); 

// ======================
// 🚀 Rotas de Usuários
// ======================

// 1. [GET] Listar todos os usuários (Linha 15, que estava falhando)
router.get('/', authenticateToken, userController.getAllUsers);

// 2. [POST] Criar um novo usuário
router.post('/', authenticateToken, userController.createUser);

// 3. [PUT] Atualizar um usuário por ID
router.put('/:id', authenticateToken, userController.updateUser);

// 4. [DELETE] Excluir um usuário por ID
router.delete('/:id', authenticateToken, userController.deleteUser);


module.exports = router;