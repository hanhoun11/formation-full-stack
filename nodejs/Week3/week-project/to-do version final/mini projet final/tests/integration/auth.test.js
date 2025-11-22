// Integration tests for Authentication endpoints
const request = require('supertest');
const express = require('express');
const authRoutes = require('../../src/routes/auth.routes');
const { errorHandler } = require('../../src/middlewares/errorHandler');
const User = require('../../src/models/user');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use(errorHandler);

describe('Authentication Integration Tests', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'integration@example.com',
        password: 'password123',
        role: 'user'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toEqual({
        message: 'Utilisateur enregistré avec succès'
      });

      // Verify user was created in database
      const user = await User.findOne({ email: userData.email });
      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.role).toBe(userData.role);
    });

    it('should return 409 for duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'password123'
      };

      // Create user first
      await new User(userData).save();

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body).toEqual({
        message: 'Email déjà utilisé'
      });
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({})
        .expect(500); // Mongoose validation error

      expect(response.body.success).toBe(false);
    });

    it('should handle invalid role', async () => {
      const userData = {
        email: 'invalid-role@example.com',
        password: 'password123',
        role: 'invalidRole'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(500); // Mongoose validation error

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser;

    beforeEach(async () => {
      testUser = new User({
        email: 'login-test@example.com',
        password: 'password123',
        role: 'user'
      });
      await testUser.save();
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'login-test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Connexion réussie');
      expect(response.body).toHaveProperty('token');
      expect(typeof response.body.token).toBe('string');
    });

    it('should return 401 for invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toEqual({
        message: 'Email ou mot de passe invalide'
      });
    });

    it('should return 401 for invalid password', async () => {
      const loginData = {
        email: 'login-test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toEqual({
        message: 'Email ou mot de passe invalide'
      });
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(401);

      expect(response.body.message).toBe('Email ou mot de passe invalide');
    });

    it('should return valid JWT token', async () => {
      const loginData = {
        email: 'login-test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      const token = response.body.token;
      expect(token).toBeDefined();

      // Verify token structure (JWT has 3 parts separated by dots)
      const tokenParts = token.split('.');
      expect(tokenParts).toHaveLength(3);
    });
  });

  describe('Authentication Flow', () => {
    it('should complete full registration and login flow', async () => {
      const userData = {
        email: 'flow-test@example.com',
        password: 'password123',
        role: 'user'
      };

      // Register
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('token');
      expect(loginResponse.body.message).toBe('Connexion réussie');
    });
  });
});
