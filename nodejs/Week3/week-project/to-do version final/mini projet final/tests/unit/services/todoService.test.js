// Unit tests for Todo Service
const todoService = require('../../../src/services/todoService');
const Todo = require('../../../src/models/todo');
const { createTestUser, createTestTodo, createMultipleTodos } = require('../../helpers/testHelpers');

describe('Todo Service', () => {
  let testUser;

  beforeEach(async () => {
    testUser = await createTestUser();
  });

  describe('getAllTodos', () => {
    beforeEach(async () => {
      await createMultipleTodos(testUser._id, 5);
    });

    it('should return all todos without filters', async () => {
      const result = await todoService.getAllTodos();

      expect(result.data).toHaveLength(5);
      expect(result.total).toBe(5);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should filter todos by status (active)', async () => {
      const result = await todoService.getAllTodos({ status: 'active' });

      expect(result.data.every(todo => !todo.completed)).toBe(true);
    });

    it('should filter todos by status (completed)', async () => {
      const result = await todoService.getAllTodos({ status: 'completed' });

      expect(result.data.every(todo => todo.completed)).toBe(true);
    });

    it('should filter todos by priority', async () => {
      const result = await todoService.getAllTodos({ priority: 'high' });

      expect(result.data.every(todo => todo.priority === 'high')).toBe(true);
    });

    it('should search todos by title', async () => {
      await createTestTodo(testUser._id, { title: 'Special Search Todo' });

      const result = await todoService.getAllTodos({ q: 'Special' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toContain('Special');
    });

    it('should handle pagination correctly', async () => {
      const result = await todoService.getAllTodos({ page: 1, limit: 2 });

      expect(result.data).toHaveLength(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(2);
      expect(result.total).toBe(5);
    });

    it('should handle case-insensitive search', async () => {
      await createTestTodo(testUser._id, { title: 'CaseSensitive Todo' });

      const result = await todoService.getAllTodos({ q: 'casesensitive' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe('CaseSensitive Todo');
    });
  });

  describe('getTodoById', () => {
    it('should return todo by valid ID', async () => {
      const createdTodo = await createTestTodo(testUser._id);

      const foundTodo = await todoService.getTodoById(createdTodo._id);

      expect(foundTodo).toBeDefined();
      expect(foundTodo._id.toString()).toBe(createdTodo._id.toString());
      expect(foundTodo.title).toBe(createdTodo.title);
    });

    it('should return null for non-existent ID', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';

      const foundTodo = await todoService.getTodoById(nonExistentId);

      expect(foundTodo).toBeNull();
    });
  });

  describe('createTodo', () => {
    it('should create todo with valid data', async () => {
      const todoData = {
        title: 'New Todo',
        priority: 'high',
        dueDate: new Date('2024-12-31'),
        user: testUser._id
      };

      const createdTodo = await todoService.createTodo(todoData);

      expect(createdTodo).toBeDefined();
      expect(createdTodo.title).toBe(todoData.title);
      expect(createdTodo.priority).toBe(todoData.priority);
      expect(createdTodo.completed).toBe(false);
      expect(createdTodo.user.toString()).toBe(testUser._id.toString());
    });

    it('should create todo with default values', async () => {
      const todoData = {
        title: 'Simple Todo',
        user: testUser._id
      };

      const createdTodo = await todoService.createTodo(todoData);

      expect(createdTodo.priority).toBe('medium');
      expect(createdTodo.completed).toBe(false);
      expect(createdTodo.dueDate).toBeNull();
    });

    it('should throw error for empty title', async () => {
      const todoData = {
        title: '',
        user: testUser._id
      };

      await expect(todoService.createTodo(todoData)).rejects.toEqual({
        status: 400,
        message: 'Title is required'
      });
    });

    it('should throw error for whitespace-only title', async () => {
      const todoData = {
        title: '   ',
        user: testUser._id
      };

      await expect(todoService.createTodo(todoData)).rejects.toEqual({
        status: 400,
        message: 'Title is required'
      });
    });
  });

  describe('updateTodo', () => {
    let existingTodo;

    beforeEach(async () => {
      existingTodo = await createTestTodo(testUser._id);
    });

    it('should update todo with valid data', async () => {
      const updates = {
        title: 'Updated Title',
        priority: 'high',
        completed: true
      };

      const updatedTodo = await todoService.updateTodo(existingTodo._id, updates);

      expect(updatedTodo.title).toBe(updates.title);
      expect(updatedTodo.priority).toBe(updates.priority);
      expect(updatedTodo.completed).toBe(updates.completed);
    });

    it('should only update allowed fields', async () => {
      const updates = {
        title: 'Updated Title',
        invalidField: 'should not be updated'
      };

      await expect(todoService.updateTodo(existingTodo._id, updates))
        .rejects.toEqual({
          status: 400,
          message: 'Field "invalidField" is not allowed'
        });
    });

    it('should allow partial updates', async () => {
      const updates = { title: 'Only Title Updated' };

      const updatedTodo = await todoService.updateTodo(existingTodo._id, updates);

      expect(updatedTodo.title).toBe(updates.title);
      expect(updatedTodo.priority).toBe(existingTodo.priority);
      expect(updatedTodo.completed).toBe(existingTodo.completed);
    });
  });

  describe('deleteTodo', () => {
    it('should delete existing todo', async () => {
      const todo = await createTestTodo(testUser._id);

      const result = await todoService.deleteTodo(todo._id);

      expect(result).toBe(true);

      const deletedTodo = await Todo.findById(todo._id);
      expect(deletedTodo).toBeNull();
    });

    it('should return false for non-existent todo', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';

      const result = await todoService.deleteTodo(nonExistentId);

      expect(result).toBe(false);
    });
  });

  describe('toggleTodo', () => {
    it('should toggle completed status from false to true', async () => {
      const todo = await createTestTodo(testUser._id, { completed: false });

      const toggledTodo = await todoService.toggleTodo(todo._id);

      expect(toggledTodo.completed).toBe(true);
    });

    it('should toggle completed status from true to false', async () => {
      const todo = await createTestTodo(testUser._id, { completed: true });

      const toggledTodo = await todoService.toggleTodo(todo._id);

      expect(toggledTodo.completed).toBe(false);
    });

    it('should return null for non-existent todo', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';

      const result = await todoService.toggleTodo(nonExistentId);

      expect(result).toBeNull();
    });
  });
});
