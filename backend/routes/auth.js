const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');

// Rota para Login, sem autenticação (ela GERA o token)
router.post('/login', authController.login);

module.exports = router;