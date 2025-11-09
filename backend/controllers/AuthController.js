// backend/controllers/AuthController.js (FINALIZADO)

const User = require('../models/User'); // Importa o modelo User (já corrigido internamente)
const Sector = require('../models/Sector'); // Importa o modelo Sector (já corrigido internamente)
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Função utilitária para gerar o Token
const generateToken = (id) => {
    // Certifique-se de que process.env.JWT_SECRET esteja definido no seu arquivo .env
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h', // Token expira em 1 hora
    });
};

// EXPORTAÇÃO CORRETA do login (usa exports.login para funcionar com authController.login)
exports.login = async (req, res) => {
    const { email, password } = req.body;

    // 1. Validação básica
    if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    try {
        // 2. Encontrar o usuário e buscar seus setores
        // 🚨 USANDO O SCOPE: Garante que a senha venha no resultado 🚨
        const user = await User.scope('withPassword').findOne({
            where: { email },
            // Inclui os setores associados (N:N)
            include: [{ model: Sector, as: 'Sectors', attributes: ['id'] }]
        });

        if (!user) {
            // Usuário não encontrado
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        // 3. Comparar a senha (usando bcrypt, pois o hash está em user.password)
        const isMatch = await bcrypt.compare(password, user.password);
        // OU, se você tivesse adicionado o método no modelo: 
        // const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            // Senha incorreta
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        // 4. Sucesso: Gera o Token JWT e monta o objeto do usuário
        const token = generateToken(user.id);

        // Monta o objeto de resposta, excluindo a senha
        const userToReturn = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            // Mapeia os IDs dos setores
            sectorIds: user.Sectors ? user.Sectors.map(s => s.id) : []
        };

        res.status(200).json({
            token,
            user: userToReturn
        });

    } catch (error) {
        console.error('Erro no login:', error.message);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};