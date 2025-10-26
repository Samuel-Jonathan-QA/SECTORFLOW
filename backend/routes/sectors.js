// backend/routes/sectors.js (VERSÃO FINAL E CORRIGIDA)

const express = require('express');
const router = express.Router();

// Importa o controller de Setores
const sectorController = require('../controllers/SectorController');

// 🚨 CORREÇÃO AQUI: Importa o objeto do middleware e desestrutura a função 'protect'
// renomeando-a para 'authenticateToken'.
const { protect: authenticateToken } = require('../middleware/auth');

// ======================
// 🚀 Rotas de Setores
// ======================

// [GET] Listar todos os setores
router.get('/', authenticateToken, sectorController.getAllSectors);

// [POST] Criar um novo setor
router.post('/', authenticateToken, sectorController.createSector);

// [PUT] Atualizar um setor existente por ID
router.put('/:id', authenticateToken, sectorController.updateSector);

// [DELETE] Excluir um setor por ID
router.delete('/:id', authenticateToken, sectorController.deleteSector);

// Exporta o roteador para ser usado no app principal
module.exports = router;