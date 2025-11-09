// backend/routes/sectors.js (CORRIGIDO)

const express = require('express');
const router = express.Router();
const SectorController = require('../controllers/SectorController');
const protect = require('../middleware/auth'); // Middleware de Autenticação
const checkRole = require('../middleware/permission'); // Middleware de Permissão

// 🚨 Apenas ADMIN pode gerenciar setores 🚨

// Lista de Setores
router.get('/', protect, SectorController.getAllSectors); // <-- CORREÇÃO APLICADA AQUI

// Rotas de Criação, Edição e Deleção de Setores (Restrito ao ADMIN)
router.post('/', protect, checkRole(['ADMIN']), SectorController.createSector);
router.put('/:id', protect, checkRole(['ADMIN']), SectorController.updateSector);
router.delete('/:id', protect, checkRole(['ADMIN']), SectorController.deleteSector);

module.exports = router;