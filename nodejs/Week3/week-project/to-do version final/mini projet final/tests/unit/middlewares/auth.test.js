// Unit tests for Auth middleware
const authMiddleware = require('../../../src/middlewares/auth');
const jwt = require('jsonwebtoken');

// Mock response object
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Mock next function
const mockNext = jest.fn();

describe('Auth Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Token Validation', () => {
    it('should authenticate user with valid token', () => {
      const payload = { id: 'user123', role: 'user' };
      const token = jwt.sign(payload, process.env.JWT_SECRET || 'secretkey');

      const req = {
        headers: {
          authorization: `Bearer ${token}`
        }
      };
      const res = mockResponse();

      authMiddleware(req, res, mockNext);

      expect(req.user).toEqual({
        id: payload.id,
        role: payload.role
      });
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle token with _id field', () => {
      const payload = { _id: 'user123', role: 'admin' };
      const token = jwt.sign(payload, process.env.JWT_SECRET || 'secretkey');

      const req = {
        headers: {
          authorization: `Bearer ${token}`
        }
      };
      const res = mockResponse();

      authMiddleware(req, res, mockNext);

      expect(req.user).toEqual({
        id: payload._id,
        role: payload.role
      });
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should return 401 for missing token', () => {
      const req = {
        headers: {}
      };
      const res = mockResponse();

      authMiddleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Token manquant'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 for empty authorization header', () => {
      const req = {
        headers: {
          authorization: ''
        }
      };
      const res = mockResponse();

      authMiddleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Token manquant'
      });
    });

    it('should return 401 for malformed authorization header', () => {
      const req = {
        headers: {
          authorization: 'InvalidFormat token123'
        }
      };
      const res = mockResponse();

      authMiddleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Token manquant'
      });
    });

    it('should return 403 for invalid token', () => {
      const req = {
        headers: {
          authorization: 'Bearer invalid-token'
        }
      };
      const res = mockResponse();

      authMiddleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Token invalide'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 for expired token', () => {
      const payload = { id: 'user123', role: 'user' };
      const token = jwt.sign(payload, process.env.JWT_SECRET || 'secretkey', { expiresIn: '-1h' });

      const req = {
        headers: {
          authorization: `Bearer ${token}`
        }
      };
      const res = mockResponse();

      authMiddleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Token invalide'
      });
    });

    it('should handle token without Bearer prefix', () => {
      const req = {
        headers: {
          authorization: 'token123'
        }
      };
      const res = mockResponse();

      authMiddleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Token manquant'
      });
    });
  });

  describe('Token Extraction', () => {
    it('should extract token from Bearer authorization header', () => {
      const payload = { id: 'user123', role: 'user' };
      const token = jwt.sign(payload, process.env.JWT_SECRET || 'secretkey');

      const req = {
        headers: {
          authorization: `Bearer ${token}`
        }
      };
      const res = mockResponse();

      authMiddleware(req, res, mockNext);

      expect(req.user.id).toBe(payload.id);
      expect(req.user.role).toBe(payload.role);
    });

    it('should handle authorization header with extra spaces', () => {
      const payload = { id: 'user123', role: 'user' };
      const token = jwt.sign(payload, process.env.JWT_SECRET || 'secretkey');

      const req = {
        headers: {
          authorization: `  Bearer   ${token}  `
        }
      };
      const res = mockResponse();

      authMiddleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Token manquant'
      });
    });
  });

  describe('User Object Creation', () => {
    it('should create user object with id and role', () => {
      const payload = { id: 'user123', role: 'admin' };
      const token = jwt.sign(payload, process.env.JWT_SECRET || 'secretkey');

      const req = {
        headers: {
          authorization: `Bearer ${token}`
        }
      };
      const res = mockResponse();

      authMiddleware(req, res, mockNext);

      expect(req.user).toEqual({
        id: 'user123',
        role: 'admin'
      });
    });

    it('should prefer id over _id in token payload', () => {
      const payload = { id: 'user123', _id: 'user456', role: 'user' };
      const token = jwt.sign(payload, process.env.JWT_SECRET || 'secretkey');

      const req = {
        headers: {
          authorization: `Bearer ${token}`
        }
      };
      const res = mockResponse();

      authMiddleware(req, res, mockNext);

      expect(req.user.id).toBe('user123');
    });
  });
});
