// backend/routes/products.js

const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');
const protect = require('../middleware/auth');
const checkRole = require('../middleware/permission');

const allowedProductRoles = ['ADMIN', 'VENDEDOR'];

router.get('/', protect, ProductController.getAllProducts);

router.post('/', protect, checkRole(allowedProductRoles), ProductController.createProduct);
router.put('/:id', protect, checkRole(allowedProductRoles), ProductController.updateProduct);
router.delete('/:id', protect, checkRole(allowedProductRoles), ProductController.deleteProduct);

module.exports = router;