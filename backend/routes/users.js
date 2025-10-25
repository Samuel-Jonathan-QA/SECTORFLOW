const express = require('express');
const User = require('../models/User');
const Sector = require('../models/Sector');
const { protect } = require('../middleware/auth'); // Importa o middleware de proteção
const router = express.Router();

// ----------------------------------------------------------------------
// ROTAS DE GERENCIAMENTO (EXIGEM LOGIN)
// ----------------------------------------------------------------------

// Listar todos os usuários (Protegida)
// Idealmente, esta rota seria apenas para Admin.
router.get('/', protect, async (req, res) => {
  const users = await User.findAll({
    attributes: ['id', 'name', 'email', 'sectorId'], // Boa prática: não retornar a senha
    include: Sector
  });
  res.json(users);
});

// Criar usuário (Protegida)
router.post('/', protect, async (req, res) => {
  try {
    const user = await User.create(req.body);
    // Remove a senha do objeto de resposta antes de enviar ao frontend
    const { password, ...userWithoutPassword } = user.toJSON();
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao criar usuário.', error: error.message });
  }
});

// Deletar usuário (Protegida)
router.delete('/:id', protect, async (req, res) => {
  try {
    const deleted = await User.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: 'Usuário não encontrado' });
    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar usuário', error });
  }
});

// ----------------------------------------------------------------------
// ROTA CRÍTICA: FILTRAGEM DE PRODUTOS (AGORA TOTALMENTE SEGURA)
// ----------------------------------------------------------------------

// Listar produtos de um usuário - ROTA SEGURA AGORA!
router.get('/:id/products', protect, async (req, res) => {
  // 1. **VERIFICAÇÃO DE AUTORIZAÇÃO**
  // Garante que o ID na URL (:id) é o mesmo ID do usuário logado (req.user.id, vindo do token)
  if (req.user.id != req.params.id) {
    // Bloqueia a requisição se o ID for diferente
    return res.status(403).json({ error: 'Não autorizado a acessar produtos de outro usuário/setor.' });
  }

  // 2. Se autorizado, continua a lógica de filtragem
  const user = await User.findByPk(req.params.id);
  if (!user) {
    // O token é válido, mas o usuário foi deletado no BD (caso raro)
    return res.status(404).json({ error: 'Usuário não encontrado.' });
  }

  // Acessa o ID do setor do usuário (que é o mesmo que está no token)
  const products = await require('../models/Product').findAll({ where: { sectorId: user.sectorId } });
  res.json(products);
});

module.exports = router;