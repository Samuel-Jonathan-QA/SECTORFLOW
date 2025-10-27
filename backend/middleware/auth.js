// backend/middleware/auth.js (EXEMPLO DE AJUSTE)

const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Certifique-se de que o Model User está correto
const Sector = require('../models/Sector'); // E o Model Sector

const protect = async (req, res, next) => {
    let token;

    // 1. Verifica se o token está presente no header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Obtém o token do header
            token = req.headers.authorization.split(' ')[1];

            // 2. Decodifica o token para obter o ID
            const decoded = jwt.verify(token, process.env.JWT_SECRET); 

            // 🚨 3. BUSCA O USUÁRIO E INCLUI ROLE E SETORES 🚨
            const user = await User.findByPk(decoded.id, {
                attributes: ['id', 'name', 'email', 'role'], // Seleciona atributos básicos e a ROLE
                include: [{ // Inclui os setores vinculados (relacionamento N:N)
                    model: Sector,
                    as: 'Sectors', // Usa o alias definido nas associações
                    attributes: ['id', 'name'],
                    through: { attributes: [] } // Não inclui os campos da tabela de junção
                }]
            });

            if (!user) {
                return res.status(401).json({ error: 'Não autorizado, usuário não encontrado.' });
            }

            // 4. Anexa o usuário à requisição (apenas as informações que o middleware de permissão precisa)
            req.user = {
                id: user.id,
                role: user.role,
                // Mapeia a lista de IDs de setores para fácil uso
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