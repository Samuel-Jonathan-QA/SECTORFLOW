// backend/controllers/AuthController.js (COMPLETO E FINALIZADO)

const User = require('../models/User');
const Sector = require('../models/Sector');
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

// EXPORTAÇÃO CORRETA do login
exports.login = async (req, res) => {
    const { email, password } = req.body;

    // 1. Validação básica
    if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    try {
        // 2. Encontrar o usuário e buscar seus setores
        const user = await User.findOne({
            where: { email },
            // 🚨 CORREÇÃO CRÍTICA: FORÇA A INCLUSÃO DO ATRIBUTO 'password' 🚨
            attributes: { include: ['password'] },
            // Inclui os setores associados
            include: [{ model: Sector, as: 'Sectors', attributes: ['id'] }]
        });

        if (!user) {
            // Usuário não encontrado
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        // 3. Comparar a senha
        // O user.password agora deve conter o hash Bcrypt completo
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            // Senha incorreta
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        // 4. Sucesso: Gera o Token JWT e monta o objeto do usuário
        const token = generateToken(user.id);

        const userToReturn = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            // Mapeia os IDs dos setores (garante que não quebra se não houver)
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