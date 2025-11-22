// Test helper functions
const jwt = require('jsonwebtoken');
const User = require('../../src/models/user');
const Todo = require('../../src/models/todo');

// Create a test user
const createTestUser = async (userData = {}) => {
  const defaultUser = {
    email: 'test@example.com',
    password: 'password123',
    role: 'user'
  };
  
  const user = new User({ ...defaultUser, ...userData });
  await user.save();
  return user;
};

// Create a test admin user
const createTestAdmin = async (userData = {}) => {
  const defaultAdmin = {
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  };
  
  const admin = new User({ ...defaultAdmin, ...userData });
  await admin.save();
  return admin;
};

// Generate JWT token for user
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'test-secret-key',
    { expiresIn: '1h' }
  );
};

// Create a test todo
const createTestTodo = async (userId, todoData = {}) => {
  const defaultTodo = {
    title: 'Test Todo',
    priority: 'medium',
    completed: false,
    user: userId
  };
  
  const todo = new Todo({ ...defaultTodo, ...todoData });
  await todo.save();
  return todo;
};

// Create multiple test todos
const createMultipleTodos = async (userId, count = 3) => {
  const todos = [];
  for (let i = 0; i < count; i++) {
    const todo = await createTestTodo(userId, {
      title: `Test Todo ${i + 1}`,
      priority: i % 2 === 0 ? 'high' : 'low',
      completed: i % 3 === 0
    });
    todos.push(todo);
  }
  return todos;
};

module.exports = {
  createTestUser,
  createTestAdmin,
  generateToken,
  createTestTodo,
  createMultipleTodos
};
