// backend/routes/users.js (AJUSTADO)

const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const protect = require('../middleware/auth'); // Middleware de autenticação
const checkRole = require('../middleware/permission'); // 🚨 NOVO MIDDLEWARE 🚨

// 🚨 Apenas ADMIN pode ver a lista completa de usuários e criar outros usuários 🚨
router.get('/', protect, checkRole(['ADMIN']), UserController.getAllUsers);
router.post('/', protect, checkRole(['ADMIN']), UserController.createUser);

// Rotas de Edição e Deleção de Usuários 
router.put('/:id', protect, checkRole(['ADMIN']), UserController.updateUser);
router.delete('/:id', protect, checkRole(['ADMIN']), UserController.deleteUser);



module.exports = router;