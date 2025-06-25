const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const { validateRegister, validateLogin, validateUserUpdate } = require('../middlewares/validationMiddleware');

const router = express.Router();

// Public routes
router.post('/register', validateRegister, userController.register);
router.post('/login', validateLogin, userController.login);

// Protected routes
router.get('/', authMiddleware, userController.getAllUsers);
router.get('/:id', authMiddleware, userController.getUserById);
router.put('/:id', authMiddleware, validateUserUpdate, userController.updateUser);
router.delete('/:id', authMiddleware, userController.deleteUser);

module.exports = router; 