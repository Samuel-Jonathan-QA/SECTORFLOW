const User = require('../models/User'); 
const Sector = require('../models/Sector');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const JWT_SECRET_DEV = 'uma_chave_secreta_muito_longa_e_unica_para_o_sectorflow';

const generateToken = (id) => {
    const secret = process.env.JWT_SECRET || JWT_SECRET_DEV;

    if (!secret) {
        throw new Error('JWT secret not defined.');
    }

    return jwt.sign({ id }, secret, {
        expiresIn: '2h', 
    });
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    
    const lowerCaseEmail = email ? email.trim().toLowerCase() : email; 
    
    if (!lowerCaseEmail || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    try {
        const user = await User.scope('withPassword').findOne({
            where: { email: lowerCaseEmail }, 
            include: [{ model: Sector, as: 'Sectors', attributes: ['id'] }]
        });

        if (!user) {
            return res.status(400).json({ error: 'E-mail ou senha incorretos! \n Verifique suas credenciais.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            // Usa 400 (Bad Request) para falha de login (senha incorreta)
            return res.status(400).json({ error: 'E-mail ou senha incorretos! \n Verifique suas credenciais.' });
        }

        const token = generateToken(user.id);

        // Remove a senha do objeto de retorno por segurança
        const userToReturn = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture,
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