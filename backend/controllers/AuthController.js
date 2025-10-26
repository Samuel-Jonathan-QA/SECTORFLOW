const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config(); // Garante o carregamento do JWT_SECRET

// Função utilitária para gerar o Token (pode ser útil)
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h', // Token expira em 1 hora
    });
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    // 1. Validação básica
    if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    try {
        // 2. Encontrar o usuário
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        // 3. Comparar a senha
        // Assumindo que seu modelo User tem um método comparePassword, ou usamos bcrypt aqui
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        // 4. Sucesso: Gera o Token JWT
        const token = generateToken(user.id);

        res.status(200).json({
            token,
            user: { id: user.id, email: user.email /* adicione outros campos */ }
        });

    } catch (error) {
        console.error('Erro no login:', error.message);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};