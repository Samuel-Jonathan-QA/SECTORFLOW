const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const protect = require('../middleware/auth'); 
const checkRole = require('../middleware/permission'); 
const multer = require('multer'); 
const path = require('path'); 
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.resolve(__dirname, '..', 'uploads', 'profile_pictures');
        
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Formato de arquivo não suportado. Use apenas imagens.'), false);
    }
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 },
    fileFilter: fileFilter
});

router.get('/', protect, checkRole(['ADMIN']), UserController.getAllUsers);
router.post('/', protect, checkRole(['ADMIN']), upload.single('profilePicture'), UserController.createUser);
router.put('/:id', protect, upload.single('profilePicture'), UserController.updateUser); 
router.delete('/:id', protect, checkRole(['ADMIN']), UserController.deleteUser);

module.exports = router;