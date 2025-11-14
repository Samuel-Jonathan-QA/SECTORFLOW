// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController'); 
const protect = require('../middleware/auth'); 

router.post('/login', authController.login);

module.exports = router;