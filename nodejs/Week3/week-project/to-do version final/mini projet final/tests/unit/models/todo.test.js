// Unit tests for Todo model
const Todo = require('../../../src/models/todo');
const User = require('../../../src/models/user');
const { createTestUser } = require('../../helpers/testHelpers');

describe('Todo Model', () => {
  let testUser;

  beforeEach(async () => {
    testUser = await createTestUser();
  });

  describe('Todo Creation', () => {
    it('should create a todo with valid data', async () => {
      const todoData = {
        title: 'Test Todo',
        priority: 'high',
        dueDate: new Date('2024-12-31'),
        completed: false,
        user: testUser._id
      };

      const todo = new Todo(todoData);
      const savedTodo = await todo.save();

      expect(savedTodo._id).toBeDefined();
      expect(savedTodo.title).toBe(todoData.title);
      expect(savedTodo.priority).toBe(todoData.priority);
      expect(savedTodo.completed).toBe(todoData.completed);
      expect(savedTodo.user.toString()).toBe(testUser._id.toString());
    });

    it('should set default values correctly', async () => {
      const todoData = {
        title: 'Simple Todo',
        user: testUser._id
      };

      const todo = new Todo(todoData);
      const savedTodo = await todo.save();

      expect(savedTodo.priority).toBe('medium'); // default priority
      expect(savedTodo.completed).toBe(false); // default completed
      expect(savedTodo.dueDate).toBeUndefined(); // no default due date
    });
  });

  describe('Todo Validation', () => {
    it('should require title', async () => {
      const todo = new Todo({
        user: testUser._id
      });

      let error;
      try {
        await todo.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.title).toBeDefined();
    });

    it('should require user', async () => {
      const todo = new Todo({
        title: 'Test Todo'
      });

      let error;
      try {
        await todo.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.user).toBeDefined();
    });

    it('should only allow valid priority values', async () => {
      const todo = new Todo({
        title: 'Test Todo',
        priority: 'invalid',
        user: testUser._id
      });

      let error;
      try {
        await todo.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.priority).toBeDefined();
    });

    it('should allow valid priority values', async () => {
      const priorities = ['low', 'medium', 'high'];
      
      for (const priority of priorities) {
        const todo = new Todo({
          title: `Test Todo ${priority}`,
          priority: priority,
          user: testUser._id
        });

        const savedTodo = await todo.save();
        expect(savedTodo.priority).toBe(priority);
      }
    });
  });

  describe('Todo Schema Fields', () => {
    it('should handle boolean completed field correctly', async () => {
      const todo1 = new Todo({
        title: 'Completed Todo',
        completed: true,
        user: testUser._id
      });

      const todo2 = new Todo({
        title: 'Incomplete Todo',
        completed: false,
        user: testUser._id
      });

      const savedTodo1 = await todo1.save();
      const savedTodo2 = await todo2.save();

      expect(savedTodo1.completed).toBe(true);
      expect(savedTodo2.completed).toBe(false);
    });

    it('should handle date fields correctly', async () => {
      const dueDate = new Date('2024-12-31T23:59:59.000Z');
      const todo = new Todo({
        title: 'Todo with due date',
        dueDate: dueDate,
        user: testUser._id
      });

      const savedTodo = await todo.save();
      expect(savedTodo.dueDate).toEqual(dueDate);
    });

    it('should reference user correctly', async () => {
      const todo = new Todo({
        title: 'User Reference Test',
        user: testUser._id
      });

      const savedTodo = await todo.save();
      const populatedTodo = await Todo.findById(savedTodo._id).populate('user');

      expect(populatedTodo.user.email).toBe(testUser.email);
      expect(populatedTodo.user.role).toBe(testUser.role);
    });
  });
});
