const express = require('express');
const router = express.Router();
// backend/routes/products.js (VERIFICAÇÃO)

const productController = require('../controllers/ProductController');
// 🚨 Importação correta do middleware (desestruturada) 🚨
const { protect: authenticateToken } = require('../middleware/auth'); 

// ...
router.get('/', authenticateToken, productController.getAllProducts);
// ...
// 🚨 Rotas Protegidas pelo JWT 🚨

// [GET] Listar todos os produtos
router.get('/', authenticateToken, productController.getAllProducts);

// [POST] Criar novo produto
router.post('/', authenticateToken, productController.createProduct);

// [PUT] Atualizar produto por ID
router.put('/:id', authenticateToken, productController.updateProduct);

// [DELETE] Excluir produto por ID
router.delete('/:id', authenticateToken, productController.deleteProduct);

module.exports = router;