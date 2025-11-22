// Unit tests for Authorization middleware
const authorizeMiddleware = require('../../../src/middlewares/authorize');

// Mock response object
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Mock next function
const mockNext = jest.fn();

describe('Authorization Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Single Role Authorization', () => {
    it('should allow access for authorized role', () => {
      const authorize = authorizeMiddleware('admin');
      
      const req = {
        user: { id: 'user123', role: 'admin' }
      };
      const res = mockResponse();

      authorize(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should deny access for unauthorized role', () => {
      const authorize = authorizeMiddleware('admin');
      
      const req = {
        user: { id: 'user123', role: 'user' }
      };
      const res = mockResponse();

      authorize(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Access denied'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Multiple Roles Authorization', () => {
    it('should allow access for any authorized role', () => {
      const authorize = authorizeMiddleware('admin', 'moderator');
      
      const req = {
        user: { id: 'user123', role: 'moderator' }
      };
      const res = mockResponse();

      authorize(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should allow access for admin role in multiple roles', () => {
      const authorize = authorizeMiddleware('admin', 'moderator', 'user');
      
      const req = {
        user: { id: 'user123', role: 'admin' }
      };
      const res = mockResponse();

      authorize(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should deny access for unauthorized role in multiple roles', () => {
      const authorize = authorizeMiddleware('admin', 'moderator');
      
      const req = {
        user: { id: 'user123', role: 'user' }
      };
      const res = mockResponse();

      authorize(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Access denied'
      });
    });
  });

  describe('Edge Cases', () => {
    it('should deny access when user has no role', () => {
      const authorize = authorizeMiddleware('admin');
      
      const req = {
        user: { id: 'user123' }
      };
      const res = mockResponse();

      authorize(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Access denied'
      });
    });

    it('should deny access when user role is null', () => {
      const authorize = authorizeMiddleware('admin');
      
      const req = {
        user: { id: 'user123', role: null }
      };
      const res = mockResponse();

      authorize(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Access denied'
      });
    });

    it('should deny access when user role is undefined', () => {
      const authorize = authorizeMiddleware('admin');
      
      const req = {
        user: { id: 'user123', role: undefined }
      };
      const res = mockResponse();

      authorize(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Access denied'
      });
    });

    it('should work with empty roles array', () => {
      const authorize = authorizeMiddleware();
      
      const req = {
        user: { id: 'user123', role: 'admin' }
      };
      const res = mockResponse();

      authorize(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Access denied'
      });
    });
  });

  describe('Case Sensitivity', () => {
    it('should be case sensitive for roles', () => {
      const authorize = authorizeMiddleware('admin');
      
      const req = {
        user: { id: 'user123', role: 'Admin' }
      };
      const res = mockResponse();

      authorize(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Access denied'
      });
    });

    it('should match exact role string', () => {
      const authorize = authorizeMiddleware('admin');
      
      const req = {
        user: { id: 'user123', role: 'admin' }
      };
      const res = mockResponse();

      authorize(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('Middleware Factory', () => {
    it('should return a middleware function', () => {
      const authorize = authorizeMiddleware('admin');
      
      expect(typeof authorize).toBe('function');
      expect(authorize.length).toBe(3); // req, res, next
    });

    it('should create different middleware instances', () => {
      const adminAuth = authorizeMiddleware('admin');
      const userAuth = authorizeMiddleware('user');
      
      expect(adminAuth).not.toBe(userAuth);
    });
  });
});
