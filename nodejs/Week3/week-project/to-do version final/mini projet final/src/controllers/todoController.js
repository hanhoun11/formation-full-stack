// 📁 controllers/todoController.js
// Contrôleur pour gérer les todos (tâches) : création, lecture, mise à jour, suppression, toggle

const todoService = require('../services/todoService'); // Service qui contient la logique métier pour les todos
const Joi = require('joi'); // Librairie pour valider les données
const Todo = require('../models/todo'); // Modèle Mongoose pour la collection "todos"

// 🧩 Schéma de validation des todos avec Joi
const todoValidationSchema = Joi.object({
  title: Joi.string().min(3).required(), // titre obligatoire, minimum 3 caractères
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'), // priorité par défaut = medium
  dueDate: Joi.date().optional(), // date limite optionnelle
  completed: Joi.boolean().optional() // statut complété optionnel
});

// ✅ GET /api/todos → Récupérer tous les todos
exports.getAllTodos = async (req, res, next) => {
  try {
    // 🔹 Filtrage selon le rôle de l'utilisateur
    const filter = req.user.role === 'admin'
      ? {} // admin voit toutes les tâches
      : { user: req.user.id }; // utilisateur normal voit seulement ses tâches

    const todos = await Todo.find(filter); // récupérer tous les todos filtrés
    res.json(todos); // renvoyer la liste
  } catch (err) {
    next(err); // passer l'erreur au middleware global 
  }
};

// ✅ GET /api/todos/:id → Récupérer un todo par ID
exports.getTodoById = async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id); // chercher par ID

    if (!todo) return res.status(404).json({ message: 'Todo makaynash' }); // si non trouvé
    if (req.user.role !== 'admin' && todo.user.toString() !== req.user.id)
      return res.status(403).json({ message: 'Accès refusé' }); // vérifier que l'utilisateur possède la tâche ou est admin

    res.json(todo); // renvoyer le todo
  } catch (err) {
    next(err);
  }
};

// ✅ POST /api/todos → Créer un nouveau todo
exports.createTodo = async (req, res, next) => {
  try {
    // 🧩 Validation des données envoyées
    const { error, value } = todoValidationSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message }); // 400 = mauvaise requête

    // 🔹 Vérifier unicité du titre pour cet utilisateur
    const exists = await Todo.exists({ title: value.title, user: req.user.id });
    if (exists)
      return res.status(409).json({ message: 'Title déjà utilisé' }); // 409 = conflit

    // ✅ Créer le todo avec l'utilisateur connecté
    const todoData = { ...value, user: req.user.id };
    const newTodo = await todoService.createTodo(todoData); // créer via le service
    res.status(201).json(newTodo); // 201 = créé
  } catch (err) {
    next(err);
  }
};

// ✅ PATCH /api/todos/:id → Mettre à jour un todo
exports.updateTodo = async (req, res, next) => {
  try {
    // 🧩 Validation des données
    const { error, value } = todoValidationSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const todo = await Todo.findById(req.params.id); // chercher le todo
    if (!todo) return res.status(404).json({ message: 'Todo makaynash' }); // non trouvé
    if (req.user.role !== 'admin' && todo.user.toString() !== req.user.id)
      return res.status(403).json({ message: 'Accès refusé' }); // vérifier permission

    const updated = await todoService.updateTodo(req.params.id, value); // mettre à jour via service
    res.json(updated); // renvoyer le todo mis à jour
  } catch (err) {
    next(err);
  }
};

// ✅ DELETE /api/todos/:id → Supprimer un todo
exports.deleteTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Todo makaynash' });
    if (req.user.role !== 'admin' && todo.user.toString() !== req.user.id)
      return res.status(403).json({ message: 'Accès refusé' });

    await todoService.deleteTodo(req.params.id); // supprimer via service
    res.status(204).send(); // 204 = pas de contenu
  } catch (err) {
    next(err);
  }
};

// ✅ PATCH /api/todos/:id/toggle → Changer le statut complété
exports.toggleTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Todo makaynash' });
    if (req.user.role !== 'admin' && todo.user.toString() !== req.user.id)
      return res.status(403).json({ message: 'Accès refusé' });

    const toggled = await todoService.toggleTodo(req.params.id); // inverser le champ completed
    res.json(toggled);
  } catch (err) {
    next(err);
  }
};
