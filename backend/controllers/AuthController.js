// backend/controllers/AuthController.js

const User = require('../models/User'); 
const Sector = require('../models/Sector');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Função utilitária para gerar o Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '2h', 
    });
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    try {
        const user = await User.scope('withPassword').findOne({
            where: { email },
            include: [{ model: Sector, as: 'Sectors', attributes: ['id'] }]
        });

        if (!user) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            // Senha incorreta
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        const token = generateToken(user.id);

        const userToReturn = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
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