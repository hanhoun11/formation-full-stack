// Unit tests for User model
const User = require('../../../src/models/user');
const bcrypt = require('bcryptjs');

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.role).toBe(userData.role);
      expect(savedUser.password).not.toBe(userData.password); // Should be hashed
    });

    it('should hash password before saving', async () => {
      const userData = {
        email: 'test2@example.com',
        password: 'plainPassword'
      };

      const user = new User(userData);
      await user.save();

      const isMatch = await bcrypt.compare('plainPassword', user.password);
      expect(isMatch).toBe(true);
    });

    it('should set default role to user', async () => {
      const userData = {
        email: 'test3@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.role).toBe('user');
    });
  });

  describe('User Validation', () => {
    it('should require email', async () => {
      const user = new User({
        password: 'password123'
      });

      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.email).toBeDefined();
    });

    it('should require password', async () => {
      const user = new User({
        email: 'test@example.com'
      });

      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.password).toBeDefined();
    });

    it('should enforce unique email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'password123'
      };

      const user1 = new User(userData);
      await user1.save();

      const user2 = new User(userData);
      
      let error;
      try {
        await user2.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.code).toBe(11000); // MongoDB duplicate key error
    });

    it('should only allow valid roles', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'password123',
        role: 'invalidRole'
      });

      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.role).toBeDefined();
    });
  });

  describe('Password Hashing', () => {
    it('should not hash password if not modified', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'password123'
      });
      await user.save();

      const originalPassword = user.password;
      user.email = 'updated@example.com';
      await user.save();

      expect(user.password).toBe(originalPassword);
    });

    it('should hash password when modified', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'password123'
      });
      await user.save();

      const originalPassword = user.password;
      user.password = 'newPassword123';
      await user.save();

      expect(user.password).not.toBe(originalPassword);
      expect(user.password).not.toBe('newPassword123');
    });
  });
});
