// backend/routes/products.js (AJUSTADO)

const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');
const protect = require('../middleware/auth');
const checkRole = require('../middleware/permission');

// 🚨 Permite ADMIN e VENDEDOR 🚨
const allowedProductRoles = ['ADMIN', 'VENDEDOR'];

// A função GET (lista de produtos) será a mais crítica (filtragem por setor)
router.get('/', protect, ProductController.getAllProducts); // Vamos tratar a permissão no Controller

// Criação, Edição e Deleção de Produtos
router.post('/', protect, checkRole(allowedProductRoles), ProductController.createProduct);
router.put('/:id', protect, checkRole(allowedProductRoles), ProductController.updateProduct);
router.delete('/:id', protect, checkRole(allowedProductRoles), ProductController.deleteProduct);

module.exports = router;