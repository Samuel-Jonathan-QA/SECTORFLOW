// backend/middleware/permission.js

const checkRole = (allowedRoles) => (req, res, next) => {
    
    if (!req.user || !req.user.role) {
        // Isso deve ser pego pelo 'protect' antes, mas é um bom failsafe
        return res.status(401).json({ error: 'Não autorizado. Faça login.' });
    }
    
    // Normaliza a role do usuário e as roles permitidas
    const userRole = req.user.role.toUpperCase();
    const normalizedAllowedRoles = allowedRoles.map(role => role.toUpperCase());
    
    // 🚨 DEBUG: Veja o que está sendo comparado 🚨
    console.log('--- VERIFICAÇÃO DE PERMISSÃO ---');
    console.log('Role do usuário (normalizada):', userRole); 
    console.log('Roles permitidas (normalizadas):', normalizedAllowedRoles); 
    console.log('---------------------------------');

    // 2. Verificar se a role normalizada do usuário está na lista de roles permitidas
    if (normalizedAllowedRoles.includes(userRole)) {
        next();
    } else {
        // Acesso negado por falta de permissão
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
    }
};

module.exports = checkRole;