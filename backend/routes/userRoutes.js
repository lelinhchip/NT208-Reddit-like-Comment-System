const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

// Public routes (không cần token)
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes (cần token)
router.get('/:id', authenticateToken, userController.getUserById);
router.get('/', authenticateToken, userController.getAllUsers);

module.exports = router;
