const express = require('express');
const Sector = require('../models/Sector');
const router = express.Router();

// Listar todos os produtos
router.get('/', async (req, res) => {
  const sectors = await Sector.findAll();
  res.json(sectors);
});

// Cria setor
router.post('/', async (req, res) => {
  const sector = await Sector.create(req.body);
  res.json(sector);
});

// Deletar setor
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Sector.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: 'Setor não encontrado' });
    res.json({ message: 'Setor deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar setor', error });
  }
});


module.exports = router;