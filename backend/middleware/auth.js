// backend/middleware/auth.js (VERSÃO FINAL LIMPA)

const jwt = require('jsonwebtoken');
// REMOVIDOS: const dotenv = require('dotenv');
// REMOVIDO: dotenv.config();

// O segredo é lido do ambiente, confiando que foi carregado ANTES (pelo server.js)
const JWT_SECRET = process.env.JWT_SECRET;

// Adicionamos a verificação de segurança aqui também, já que este é um módulo de topo
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET não está definido nas variáveis de ambiente! O middleware falhou.");
}


const protect = (req, res, next) => {
    let token;

    // 1. Verifica se o token está no cabeçalho Authorization (Bearer Token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extrai o token, removendo o prefixo 'Bearer '
            token = req.headers.authorization.split(' ')[1];

            // 2. Verifica e decodifica o token
            const decoded = jwt.verify(token, JWT_SECRET); // Usa o JWT_SECRET limpo

            // 3. Anexa os dados do usuário do token à requisição
            req.user = decoded; 
            
            // Continua para a próxima função da rota
            next();
        } catch (error) {
            // Se o token for inválido, expirado, etc.
            console.error('Erro de Autenticação:', error.message);
            res.status(401).json({ message: 'Não autorizado, token falhou.' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Não autorizado, nenhum token.' });
    }
};

module.exports = { protect };