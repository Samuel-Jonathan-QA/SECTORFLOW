// backend/routes/auth.js (VERIFIQUE E CORRIJA)

const express = require('express');
const router = express.Router();
// 🚨 Importa o módulo completo 🚨
const authController = require('../controllers/AuthController'); 
const protect = require('../middleware/auth'); // Se houver outras rotas

// Rota de login
router.post('/login', authController.login); // 🚨 Certifique-se de que é '.login' 🚨

// Exemplo de outras rotas (se existirem)
// router.get('/me', protect, authController.getMe); 

module.exports = router;