// 📁 services/todoService.js
// Service pour gérer la logique métier des todos (CRUD, toggle, filtres, pagination)

const Todo = require('../models/todo'); // Modèle Mongoose pour la collection "todos"

// 🔹 Récupérer tous les todos avec filtres, recherche et pagination
exports.getAllTodos = async (query = {}) => {
  const filter = {};

  // Filtrage par statut : "active" = non complété, "completed" = complété
  if (query.status === 'active') filter.completed = false;
  else if (query.status === 'completed') filter.completed = true;

  // Filtrage par priorité si présent (low, medium, high)
  if (query.priority) filter.priority = query.priority;

  // Recherche par titre (regex insensible à la casse)
  if (query.q) filter.title = { $regex: query.q, $options: 'i' };

  // Pagination
  const page = parseInt(query.page) || 1;  // page par défaut = 1
  const limit = parseInt(query.limit) || 10; // limit par défaut = 10

  // Récupérer les todos selon le filtre, avec skip & limit pour pagination
  const todos = await Todo.find(filter)
    .skip((page - 1) * limit)
    .limit(limit);

  // Compter le total de todos correspondant au filtre
  const total = await Todo.countDocuments(filter);

  // Retourner les données structurées
  return {
    total,
    page,
    limit,
    data: todos
  };
};

// 🔹 Récupérer un todo par ID
exports.getTodoById = async (id) => {
  return await Todo.findById(id); // retourne le todo ou null si pas trouvé
};

// 🔹 Créer un nouveau todo
exports.createTodo = async (data) => {
  // Vérification basique du titre
  if (!data.title || data.title.trim() === '') {
    throw { status: 400, message: 'Title is required' }; // erreur si titre vide
  }

  // Créer le todo avec les valeurs par défaut si pas fournies
  const newTodo = await Todo.create({
    title: data.title,
    completed: false, // par défaut non complété
    priority: data.priority || 'medium', // priorité par défaut = medium
    dueDate: data.dueDate || null, // date limite optionnelle
    user: data.user // l'utilisateur propriétaire
  });

  return newTodo;
};

// 🔹 Mettre à jour un todo
exports.updateTodo = async (id, updates) => {
  // Vérification des champs autorisés
  const allowed = ['title', 'completed', 'priority', 'dueDate'];
  for (let key of Object.keys(updates)) {
    if (!allowed.includes(key)) {
      throw { status: 400, message: `Field "${key}" is not allowed` };
    }
  }

  // Mettre à jour le todo et retourner le document mis à jour
  const updatedTodo = await Todo.findByIdAndUpdate(
    id,
    { ...updates },
    { new: true } // option pour retourner le document après modification
  );

  return updatedTodo;
};

// 🔹 Supprimer un todo
exports.deleteTodo = async (id) => {
  const result = await Todo.findByIdAndDelete(id);
  return !!result; // retourne true si supprimé, false sinon
};

// 🔹 Toggle du statut "completed"
exports.toggleTodo = async (id) => {
  const todo = await Todo.findById(id);
  if (!todo) return null; // si pas trouvé

  todo.completed = !todo.completed; // inverser le booléen
  await todo.save(); // sauvegarder le changement
  return todo; // retourner le todo mis à jour
};
