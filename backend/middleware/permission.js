// backend/middleware/permission.js

const checkRole = (allowedRoles) => (req, res, next) => {
    // 🚨 1. Verificar se o usuário está autenticado
    if (!req.user || !req.user.role) {
        // Isso não deve acontecer se o middleware 'auth' rodar primeiro, mas é um bom failsafe.
        return res.status(401).json({ error: 'Não autorizado. Faça login.' });
    }

    // 🚨 2. Verificar se a role do usuário está na lista de roles permitidas
    if (allowedRoles.includes(req.user.role)) {
        // Se a role for permitida, continua para o Controller
        next();
    } else {
        // Acesso negado por falta de permissão
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
    }
};

module.exports = checkRole;