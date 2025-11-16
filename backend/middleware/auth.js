// backend/middleware/auth.js

const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
const Sector = require('../models/Sector'); 

const JWT_SECRET_DEV = 'uma_chave_secreta_muito_longa_e_unica_para_o_sectorflow';

const protect = async (req, res, next) => {
    let token;

    const secret = process.env.JWT_SECRET || JWT_SECRET_DEV;
            
    if (!secret) {
        return res.status(500).json({ error: 'Erro de configuração: JWT secret não definido.' });
    }

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, secret); 

            const user = await User.findByPk(decoded.id, {
                attributes: ['id', 'name', 'email', 'role', 'profilePicture'], 
                include: [{ 
                    model: Sector,
                    as: 'Sectors',
                    attributes: ['id', 'name'],
                    through: { attributes: [] } 
                }]
            });

            if (!user) {
                return res.status(401).json({ error: 'Não autorizado, usuário não encontrado.' });
            }

            req.user = {
                id: user.id,
                role: user.role,
                profilePicture: user.profilePicture, 
                sectorIds: user.Sectors.map(sector => sector.id) 
            };

            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ error: 'Não autorizado, token falhou.' });
        }
    }

    if (!token) {
        return res.status(401).json({ error: 'Não autorizado, nenhum token.' });
    }
};

module.exports = protect;
