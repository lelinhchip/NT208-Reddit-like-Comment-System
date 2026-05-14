const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

// Public routes (không cần token)
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes (cần token)
router.get('/:id', authenticate, userController.getUserById);
router.get('/', authenticate, userController.getAllUsers);

module.exports = router;
