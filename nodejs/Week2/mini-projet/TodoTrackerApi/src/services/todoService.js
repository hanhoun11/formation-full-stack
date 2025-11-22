// 📁 services/todoService.js
// fih la logique (CRUD, filtres, pagination...) w kayt3amal m3a fichier JSON

const fs = require('fs').promises;
const path = require('path');
const filePath = path.join(__dirname, '../data/todos.json');

// helper bach nqraw fichier
async function readTodos() {
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
}

// helper bach nktbou fichier
async function writeTodos(todos) {
  await fs.writeFile(filePath, JSON.stringify(todos, null, 2));
}

exports.getAllTodos = async (query) => {
  let todos = await readTodos();

  // ✅ Filtrage par status
  if (query.status === 'active') todos = todos.filter(t => !t.completed);
  else if (query.status === 'completed') todos = todos.filter(t => t.completed);

  // ✅ Filtrage par priority
  if (query.priority) todos = todos.filter(t => t.priority === query.priority);

  // ✅ Recherche par titre
  if (query.q) {
    const q = query.q.toLowerCase();
    todos = todos.filter(t => t.title.toLowerCase().includes(q));
  }

  // ✅ Pagination
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    total: todos.length,
    page,
    limit,
    data: todos.slice(start, end)
  };
};

exports.getTodoById = async (id) => {
  const todos = await readTodos();
  return todos.find(t => t.id === id);
};

exports.createTodo = async (data) => {
  if (!data.title || data.title.trim() === '') {
    throw { status: 400, message: 'Title khaso maykonch khawi' };
  }

  const todos = await readTodos();
  const newTodo = {
    id: Date.now().toString(),
    title: data.title,
    completed: false,
    priority: data.priority || 'medium',
    dueDate: data.dueDate || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  todos.push(newTodo);
  await writeTodos(todos);
  return newTodo;
};

exports.updateTodo = async (id, updates) => {
  const todos = await readTodos();
  const index = todos.findIndex(t => t.id === id);
  if (index === -1) return null;

  const allowed = ['title', 'completed', 'priority', 'dueDate'];
  for (let key of Object.keys(updates)) {
    if (!allowed.includes(key)) {
      throw { status: 400, message: `Champ "${key}" machi ma3rouf` };
    }
  }

  todos[index] = { ...todos[index], ...updates, updatedAt: new Date().toISOString() };
  await writeTodos(todos);
  return todos[index];
};

exports.deleteTodo = async (id) => {
  const todos = await readTodos();
  const newTodos = todos.filter(t => t.id !== id);
  if (newTodos.length === todos.length) return false;
  await writeTodos(newTodos);
  return true;
};

exports.toggleTodo = async (id) => {
  const todos = await readTodos();
  const todo = todos.find(t => t.id === id);
  if (!todo) return null;

  todo.completed = !todo.completed;
  todo.updatedAt = new Date().toISOString();
  await writeTodos(todos);
  return todo;
};
