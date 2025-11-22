// Unit tests for Todo Controller
const todoController = require('../../../src/controllers/todoController');
const todoService = require('../../../src/services/todoService');
const Todo = require('../../../src/models/todo');
const { createTestUser, createTestAdmin, createTestTodo } = require('../../helpers/testHelpers');

// Mock todoService
jest.mock('../../../src/services/todoService');

// Mock response object
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

// Mock request object
const mockRequest = (body = {}, params = {}, user = null) => ({
  body,
  params,
  user
});

// Mock next function
const mockNext = jest.fn();

describe('Todo Controller', () => {
  let testUser, testAdmin;

  beforeEach(async () => {
    jest.clearAllMocks();
    testUser = await createTestUser();
    testAdmin = await createTestAdmin();
  });

  describe('getAllTodos', () => {
    it('should return all todos for admin', async () => {
      const mockTodos = [
        { _id: '1', title: 'Todo 1', user: testUser._id },
        { _id: '2', title: 'Todo 2', user: testUser._id }
      ];

      // Mock Todo.find to return todos
      jest.spyOn(Todo, 'find').mockResolvedValue(mockTodos);

      const req = mockRequest({}, {}, { id: testAdmin._id, role: 'admin' });
      const res = mockResponse();

      await todoController.getAllTodos(req, res, mockNext);

      expect(Todo.find).toHaveBeenCalledWith({});
      expect(res.json).toHaveBeenCalledWith(mockTodos);
    });

    it('should return user-specific todos for regular user', async () => {
      const mockTodos = [
        { _id: '1', title: 'User Todo', user: testUser._id }
      ];

      jest.spyOn(Todo, 'find').mockResolvedValue(mockTodos);

      const req = mockRequest({}, {}, { id: testUser._id, role: 'user' });
      const res = mockResponse();

      await todoController.getAllTodos(req, res, mockNext);

      expect(Todo.find).toHaveBeenCalledWith({ user: testUser._id });
      expect(res.json).toHaveBeenCalledWith(mockTodos);
    });

    it('should call next with error on database error', async () => {
      jest.spyOn(Todo, 'find').mockRejectedValue(new Error('Database error'));

      const req = mockRequest({}, {}, { id: testUser._id, role: 'user' });
      const res = mockResponse();

      await todoController.getAllTodos(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getTodoById', () => {
    let testTodo;

    beforeEach(async () => {
      testTodo = await createTestTodo(testUser._id);
    });

    it('should return todo for owner', async () => {
      jest.spyOn(Todo, 'findById').mockResolvedValue(testTodo);

      const req = mockRequest({}, { id: testTodo._id }, { id: testUser._id, role: 'user' });
      const res = mockResponse();

      await todoController.getTodoById(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith(testTodo);
    });

    it('should return todo for admin', async () => {
      jest.spyOn(Todo, 'findById').mockResolvedValue(testTodo);

      const req = mockRequest({}, { id: testTodo._id }, { id: testAdmin._id, role: 'admin' });
      const res = mockResponse();

      await todoController.getTodoById(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith(testTodo);
    });

    it('should return 404 for non-existent todo', async () => {
      jest.spyOn(Todo, 'findById').mockResolvedValue(null);

      const req = mockRequest({}, { id: 'nonexistent' }, { id: testUser._id, role: 'user' });
      const res = mockResponse();

      await todoController.getTodoById(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Todo makaynash' });
    });

    it('should return 403 for unauthorized access', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      jest.spyOn(Todo, 'findById').mockResolvedValue(testTodo);

      const req = mockRequest({}, { id: testTodo._id }, { id: otherUser._id, role: 'user' });
      const res = mockResponse();

      await todoController.getTodoById(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Accès refusé' });
    });
  });

  describe('createTodo', () => {
    it('should create todo with valid data', async () => {
      const todoData = {
        title: 'New Todo',
        priority: 'high'
      };

      const mockCreatedTodo = {
        _id: 'new-id',
        ...todoData,
        user: testUser._id,
        completed: false
      };

      jest.spyOn(Todo, 'exists').mockResolvedValue(null);
      todoService.createTodo.mockResolvedValue(mockCreatedTodo);

      const req = mockRequest(todoData, {}, { id: testUser._id, role: 'user' });
      const res = mockResponse();

      await todoController.createTodo(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockCreatedTodo);
    });

    it('should return validation error for invalid data', async () => {
      const todoData = {
        title: 'ab', // too short
        priority: 'invalid'
      };

      const req = mockRequest(todoData, {}, { id: testUser._id, role: 'user' });
      const res = mockResponse();

      await todoController.createTodo(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: expect.any(String)
      });
    });

    it('should return conflict error for duplicate title', async () => {
      const todoData = {
        title: 'Duplicate Todo',
        priority: 'medium'
      };

      jest.spyOn(Todo, 'exists').mockResolvedValue({ _id: 'existing-id' });

      const req = mockRequest(todoData, {}, { id: testUser._id, role: 'user' });
      const res = mockResponse();

      await todoController.createTodo(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'Title déjà utilisé' });
    });
  });

  describe('updateTodo', () => {
    let testTodo;

    beforeEach(async () => {
      testTodo = await createTestTodo(testUser._id);
    });

    it('should update todo with valid data', async () => {
      const updateData = {
        title: 'Updated Todo',
        priority: 'high'
      };

      const mockUpdatedTodo = { ...testTodo.toObject(), ...updateData };

      jest.spyOn(Todo, 'findById').mockResolvedValue(testTodo);
      todoService.updateTodo.mockResolvedValue(mockUpdatedTodo);

      const req = mockRequest(updateData, { id: testTodo._id }, { id: testUser._id, role: 'user' });
      const res = mockResponse();

      await todoController.updateTodo(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith(mockUpdatedTodo);
    });

    it('should return 404 for non-existent todo', async () => {
      jest.spyOn(Todo, 'findById').mockResolvedValue(null);

      const req = mockRequest({}, { id: 'nonexistent' }, { id: testUser._id, role: 'user' });
      const res = mockResponse();

      await todoController.updateTodo(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Todo makaynash' });
    });
  });

  describe('deleteTodo', () => {
    let testTodo;

    beforeEach(async () => {
      testTodo = await createTestTodo(testUser._id);
    });

    it('should delete todo for owner', async () => {
      jest.spyOn(Todo, 'findById').mockResolvedValue(testTodo);
      todoService.deleteTodo.mockResolvedValue(true);

      const req = mockRequest({}, { id: testTodo._id }, { id: testUser._id, role: 'user' });
      const res = mockResponse();

      await todoController.deleteTodo(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('should delete todo for admin', async () => {
      jest.spyOn(Todo, 'findById').mockResolvedValue(testTodo);
      todoService.deleteTodo.mockResolvedValue(true);

      const req = mockRequest({}, { id: testTodo._id }, { id: testAdmin._id, role: 'admin' });
      const res = mockResponse();

      await todoController.deleteTodo(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe('toggleTodo', () => {
    let testTodo;

    beforeEach(async () => {
      testTodo = await createTestTodo(testUser._id);
    });

    it('should toggle todo completion status', async () => {
      const mockToggledTodo = { ...testTodo.toObject(), completed: !testTodo.completed };

      jest.spyOn(Todo, 'findById').mockResolvedValue(testTodo);
      todoService.toggleTodo.mockResolvedValue(mockToggledTodo);

      const req = mockRequest({}, { id: testTodo._id }, { id: testUser._id, role: 'user' });
      const res = mockResponse();

      await todoController.toggleTodo(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith(mockToggledTodo);
    });

    it('should return 404 for non-existent todo', async () => {
      jest.spyOn(Todo, 'findById').mockResolvedValue(null);

      const req = mockRequest({}, { id: 'nonexistent' }, { id: testUser._id, role: 'user' });
      const res = mockResponse();

      await todoController.toggleTodo(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Todo makaynash' });
    });
  });
});
