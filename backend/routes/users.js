// backend/routes/users.js

const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const protect = require('../middleware/auth'); 
const checkRole = require('../middleware/permission'); 

router.get('/', protect, checkRole(['ADMIN']), UserController.getAllUsers);
router.post('/', protect, checkRole(['ADMIN']), UserController.createUser);

router.put('/:id', protect, checkRole(['ADMIN']), UserController.updateUser);
router.delete('/:id', protect, checkRole(['ADMIN']), UserController.deleteUser);



module.exports = router;