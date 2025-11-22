// 📁 routes/todoRoutes.js
const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

// 🔹 Tous les endpoints nécessitent un token valide
router.get('/', auth, todoController.getAllTodos);
router.get('/:id', auth, todoController.getTodoById);

// 🔹 Création accessible à tous les utilisateurs connectés
router.post('/', auth, todoController.createTodo);

// 🔹 Modification accessible à tous les utilisateurs connectés (leurs propres tâches)
router.patch('/:id', auth, todoController.updateTodo);

// 🔹 Suppression réservée aux admins
router.delete('/:id', auth, authorize('admin'), todoController.deleteTodo);

// 🔹 Toggle accessible à tous les utilisateurs connectés
router.patch('/:id/toggle', auth, todoController.toggleTodo);

module.exports = router;
 



