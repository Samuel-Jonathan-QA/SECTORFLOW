// backend/routes/auth.js (Versão Final Limpa e Funcional)
const bcrypt = require('bcryptjs'); 
const express = require('express');
const jwt = require('jsonwebtoken'); 
// REMOVIDOS: const dotenv = require('dotenv'); e dotenv.config();
const User = require('../models/User');
const router = express.Router();

// Chave Secreta para assinar o JWT. DEVE vir do ENV, sem fallback.
const JWT_SECRET = process.env.JWT_SECRET; 

if (!JWT_SECRET) {
    // Melhor falhar explicitamente se o segredo não estiver configurado
    // (A variável de ambiente deve ser carregada no server.js)
    throw new Error("JWT_SECRET não está definido nas variáveis de ambiente! Verifique seu arquivo .env.");
}

// Rota de Login (POST /api/login)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Busca o usuário pelo email
        const user = await User.findOne({ 
            where: { email },
            // Inclui o setor para que o token tenha a informação
            include: [{ association: 'Sector', attributes: ['id', 'name'] }]
        });

        // 2. Verifica se o usuário existe
        if (!user) {
            return res.status(401).json({ message: 'Email ou senha inválidos.' });
        }

        // 3. Verifica a senha criptografada usando o método que definimos no modelo
        const isPasswordValid = user.validPassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Email ou senha inválidos.' });
        }

        // 4. Geração do Token JWT (Payload)
        const tokenPayload = {
            id: user.id,
            email: user.email,
            sectorId: user.sectorId,
            // ATENÇÃO: Adicione aqui uma role (função) se o usuário for Admin
            // Exemplo: role: user.role // Se você adicionar o campo 'role' no modelo User
        };

        const token = jwt.sign(tokenPayload, JWT_SECRET, {
            expiresIn: '1h' // O token expira em 1 hora
        });

        // 5. Retorna o token e os dados do usuário (exceto a senha)
        res.status(200).json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                sectorId: user.sectorId,
                Sector: user.Sector
            }
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

module.exports = router;