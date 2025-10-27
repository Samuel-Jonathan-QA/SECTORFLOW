// backend/routes/sectors.js (CORRIGIDO)

const express = require('express');
const router = express.Router();
const SectorController = require('../controllers/SectorController');
const protect = require('../middleware/auth');
const checkRole = require('../middleware/permission');

// 🚨 Apenas ADMIN pode gerenciar setores 🚨

// Lista de Setores (CORRIGIDO para getAllSectors)
router.get('/', SectorController.getAllSectors); // <-- CORRIGIDO AQUI!

// Rotas de Criação, Edição e Deleção de Setores
router.post('/', protect, checkRole(['ADMIN']), SectorController.createSector);
router.put('/:id', protect, checkRole(['ADMIN']), SectorController.updateSector);
router.delete('/:id', protect, checkRole(['ADMIN']), SectorController.deleteSector);

module.exports = router;