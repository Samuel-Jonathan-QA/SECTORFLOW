// backend/routes/sectors.js

const express = require('express');
const router = express.Router();
const SectorController = require('../controllers/SectorController');
const protect = require('../middleware/auth'); 
const checkRole = require('../middleware/permission');

router.get('/', protect, SectorController.getAllSectors);

router.post('/', protect, checkRole(['ADMIN']), SectorController.createSector);
router.put('/:id', protect, checkRole(['ADMIN']), SectorController.updateSector);
router.delete('/:id', protect, checkRole(['ADMIN']), SectorController.deleteSector);

module.exports = router;