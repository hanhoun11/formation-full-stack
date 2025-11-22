// 📁 controllers/todoController.js
// had fichier fih les fonctions li kayt3amlu m3a les requêtes HTTP

const todoService = require('../services/todoService');

// ✅ GET /api/todos
exports.getAllTodos = async (req, res, next) => {
  try {
    const todos = await todoService.getAllTodos(req.query);
    res.json(todos);
  } catch (err) {
    next(err);
  }
};

// ✅ GET /api/todos/:id
exports.getTodoById = async (req, res, next) => {
  try {
    const todo = await todoService.getTodoById(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Todo makaynash' });
    res.json(todo);
  } catch (err) {
    next(err);
  }
};

// ✅ POST /api/todos
exports.createTodo = async (req, res, next) => {
  try {
    const newTodo = await todoService.createTodo(req.body);
    res.status(201).json(newTodo);
  } catch (err) {
    next(err);
  }
};

// ✅ PATCH /api/todos/:id
exports.updateTodo = async (req, res, next) => {
  try {
    const updated = await todoService.updateTodo(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Todo makaynash' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// ✅ DELETE /api/todos/:id
exports.deleteTodo = async (req, res, next) => {
  try {
    const deleted = await todoService.deleteTodo(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Todo makaynash' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// ✅ PATCH /api/todos/:id/toggle
exports.toggleTodo = async (req, res, next) => {
  try {
    const toggled = await todoService.toggleTodo(req.params.id);
    if (!toggled) return res.status(404).json({ message: 'Todo makaynash' });
    res.json(toggled);
  } catch (err) {
    next(err);
  }
};
