// backend/middleware/permission.js

const checkRole = (allowedRoles) => (req, res, next) => {
    
    if (!req.user || !req.user.role) {
        return res.status(401).json({ error: 'Não autorizado. Faça login.' });
    }
    
    const userRole = req.user.role.toUpperCase();
    const normalizedAllowedRoles = allowedRoles.map(role => role.toUpperCase());
    
    if (normalizedAllowedRoles.includes(userRole)) {
        next();
    } else {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
    }
};

module.exports = checkRole;