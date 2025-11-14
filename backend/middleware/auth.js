// backend/middleware/auth.js

const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
const Sector = require('../models/Sector'); 

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET); 

            const user = await User.findByPk(decoded.id, {
                attributes: ['id', 'name', 'email', 'role'], 
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