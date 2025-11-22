// Integration tests for Todo endpoints
const request = require('supertest');
const express = require('express');
const todoRoutes = require('../../src/routes/todoRoutes');
const authRoutes = require('../../src/routes/auth.routes');
const { errorHandler } = require('../../src/middlewares/errorHandler');
const { createTestUser, createTestAdmin, generateToken, createTestTodo } = require('../helpers/testHelpers');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);
app.use(errorHandler);

describe('Todo Integration Tests', () => {
  let testUser, testAdmin, userToken, adminToken;

  beforeEach(async () => {
    testUser = await createTestUser();
    testAdmin = await createTestAdmin();
    userToken = generateToken(testUser);
    adminToken = generateToken(testAdmin);
  });

  describe('GET /api/todos', () => {
    beforeEach(async () => {
      // Create some test todos
      await createTestTodo(testUser._id, { title: 'User Todo 1' });
      await createTestTodo(testUser._id, { title: 'User Todo 2' });
      await createTestTodo(testAdmin._id, { title: 'Admin Todo 1' });
    });

    it('should return user todos for regular user', async () => {
      const response = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body.every(todo => todo.user === testUser._id.toString())).toBe(true);
    });

    it('should return all todos for admin', async () => {
      const response = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveLength(3);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/todos')
        .expect(401);

      expect(response.body.message).toBe('Token manquant');
    });

    it('should return 403 with invalid token', async () => {
      const response = await request(app)
        .get('/api/todos')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);

      expect(response.body.message).toBe('Token invalide');
    });
  });

  describe('GET /api/todos/:id', () => {
    let testTodo;

    beforeEach(async () => {
      testTodo = await createTestTodo(testUser._id);
    });

    it('should return todo for owner', async () => {
      const response = await request(app)
        .get(`/api/todos/${testTodo._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body._id).toBe(testTodo._id.toString());
      expect(response.body.title).toBe(testTodo.title);
    });

    it('should return todo for admin', async () => {
      const response = await request(app)
        .get(`/api/todos/${testTodo._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body._id).toBe(testTodo._id.toString());
    });

    it('should return 403 for unauthorized user', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const otherToken = generateToken(otherUser);

      const response = await request(app)
        .get(`/api/todos/${testTodo._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);

      expect(response.body.message).toBe('Accès refusé');
    });

    it('should return 404 for non-existent todo', async () => {
      const response = await request(app)
        .get('/api/todos/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.message).toBe('Todo makaynash');
    });
  });

  describe('POST /api/todos', () => {
    it('should create todo with valid data', async () => {
      const todoData = {
        title: 'New Integration Todo',
        priority: 'high',
        dueDate: '2024-12-31'
      };

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${userToken}`)
        .send(todoData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.title).toBe(todoData.title);
      expect(response.body.priority).toBe(todoData.priority);
      expect(response.body.user).toBe(testUser._id.toString());
      expect(response.body.completed).toBe(false);
    });

    it('should return validation error for invalid data', async () => {
      const todoData = {
        title: 'ab', // too short
        priority: 'invalid'
      };

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${userToken}`)
        .send(todoData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return conflict for duplicate title', async () => {
      const todoData = {
        title: 'Duplicate Todo',
        priority: 'medium'
      };

      // Create first todo
      await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${userToken}`)
        .send(todoData)
        .expect(201);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${userToken}`)
        .send(todoData)
        .expect(409);

      expect(response.body.message).toBe('Title déjà utilisé');
    });

    it('should require authentication', async () => {
      const todoData = {
        title: 'Unauthorized Todo',
        priority: 'medium'
      };

      const response = await request(app)
        .post('/api/todos')
        .send(todoData)
        .expect(401);

      expect(response.body.message).toBe('Token manquant');
    });
  });

  describe('PATCH /api/todos/:id', () => {
    let testTodo;

    beforeEach(async () => {
      testTodo = await createTestTodo(testUser._id);
    });

    it('should update todo with valid data', async () => {
      const updateData = {
        title: 'Updated Todo Title',
        priority: 'high',
        completed: true
      };

      const response = await request(app)
        .patch(`/api/todos/${testTodo._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe(updateData.title);
      expect(response.body.priority).toBe(updateData.priority);
      expect(response.body.completed).toBe(updateData.completed);
    });

    it('should return 403 for unauthorized user', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const otherToken = generateToken(otherUser);

      const response = await request(app)
        .patch(`/api/todos/${testTodo._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: 'Unauthorized Update' })
        .expect(403);

      expect(response.body.message).toBe('Accès refusé');
    });

    it('should allow admin to update any todo', async () => {
      const updateData = { title: 'Admin Updated Todo' };

      const response = await request(app)
        .patch(`/api/todos/${testTodo._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe(updateData.title);
    });
  });

  describe('DELETE /api/todos/:id', () => {
    let testTodo;

    beforeEach(async () => {
      testTodo = await createTestTodo(testUser._id);
    });

    it('should delete todo for admin', async () => {
      await request(app)
        .delete(`/api/todos/${testTodo._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);
    });

    it('should return 403 for regular user', async () => {
      const response = await request(app)
        .delete(`/api/todos/${testTodo._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.message).toBe('Access denied');
    });

    it('should return 404 for non-existent todo', async () => {
      const response = await request(app)
        .delete('/api/todos/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.message).toBe('Todo makaynash');
    });
  });

  describe('PATCH /api/todos/:id/toggle', () => {
    let testTodo;

    beforeEach(async () => {
      testTodo = await createTestTodo(testUser._id, { completed: false });
    });

    it('should toggle todo completion status', async () => {
      const response = await request(app)
        .patch(`/api/todos/${testTodo._id}/toggle`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.completed).toBe(true);
    });

    it('should toggle back to false', async () => {
      // First toggle to true
      await request(app)
        .patch(`/api/todos/${testTodo._id}/toggle`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Then toggle back to false
      const response = await request(app)
        .patch(`/api/todos/${testTodo._id}/toggle`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.completed).toBe(false);
    });

    it('should return 403 for unauthorized user', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const otherToken = generateToken(otherUser);

      const response = await request(app)
        .patch(`/api/todos/${testTodo._id}/toggle`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);

      expect(response.body.message).toBe('Accès refusé');
    });

    it('should allow admin to toggle any todo', async () => {
      const response = await request(app)
        .patch(`/api/todos/${testTodo._id}/toggle`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.completed).toBe(true);
    });
  });
});
