// Unit tests for Auth Controller
const authController = require('../../../src/controllers/authController');
const User = require('../../../src/models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock response object
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Mock request object
const mockRequest = (body = {}) => ({
  body
});

// Mock next function
const mockNext = jest.fn();

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const req = mockRequest({
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      });
      const res = mockResponse();

      await authController.register(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Utilisateur enregistré avec succès'
      });

      // Verify user was created in database
      const user = await User.findOne({ email: 'test@example.com' });
      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.role).toBe('user');
    });

    it('should return error for duplicate email', async () => {
      // Create user first
      await new User({
        email: 'duplicate@example.com',
        password: 'password123'
      }).save();

      const req = mockRequest({
        email: 'duplicate@example.com',
        password: 'password123'
      });
      const res = mockResponse();

      await authController.register(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Email déjà utilisé'
      });
    });

    it('should call next with error on database error', async () => {
      // Mock User.findOne to throw error
      jest.spyOn(User, 'findOne').mockRejectedValue(new Error('Database error'));

      const req = mockRequest({
        email: 'test@example.com',
        password: 'password123'
      });
      const res = mockResponse();

      await authController.register(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('login', () => {
    let testUser;

    beforeEach(async () => {
      testUser = new User({
        email: 'login@example.com',
        password: 'password123',
        role: 'user'
      });
      await testUser.save();
    });

    it('should login user with valid credentials', async () => {
      const req = mockRequest({
        email: 'login@example.com',
        password: 'password123'
      });
      const res = mockResponse();

      await authController.login(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Connexion réussie',
        token: expect.any(String)
      });

      // Verify token is valid
      const call = res.json.mock.calls[0][0];
      const token = call.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
      expect(decoded.id).toBe(testUser._id.toString());
      expect(decoded.role).toBe(testUser.role);
    });

    it('should return error for non-existent user', async () => {
      const req = mockRequest({
        email: 'nonexistent@example.com',
        password: 'password123'
      });
      const res = mockResponse();

      await authController.login(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Email ou mot de passe invalide'
      });
    });

    it('should return error for invalid password', async () => {
      const req = mockRequest({
        email: 'login@example.com',
        password: 'wrongpassword'
      });
      const res = mockResponse();

      await authController.login(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Email ou mot de passe invalide'
      });
    });

    it('should call next with error on database error', async () => {
      jest.spyOn(User, 'findOne').mockRejectedValue(new Error('Database error'));

      const req = mockRequest({
        email: 'login@example.com',
        password: 'password123'
      });
      const res = mockResponse();

      await authController.login(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should generate token with correct payload', async () => {
      const req = mockRequest({
        email: 'login@example.com',
        password: 'password123'
      });
      const res = mockResponse();

      await authController.login(req, res, mockNext);

      const call = res.json.mock.calls[0][0];
      const token = call.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');

      expect(decoded).toHaveProperty('id');
      expect(decoded).toHaveProperty('role');
      expect(decoded).toHaveProperty('exp');
      expect(decoded.id).toBe(testUser._id.toString());
      expect(decoded.role).toBe(testUser.role);
    });
  });
});
