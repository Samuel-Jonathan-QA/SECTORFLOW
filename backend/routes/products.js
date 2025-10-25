const express = require('express');
const Product = require('../models/Product');
const Sector = require('../models/Sector');
const router = express.Router();

// Listar todos os produtos
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({ include: Sector });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar produtos', error });
  }
});

// Criar produto
router.post('/', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar produto', error });
  }
});

// Deletar produto
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Product.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: 'Produto não encontrado' });
    res.json({ message: 'Produto deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar produto', error });
  }
});

module.exports = router;
