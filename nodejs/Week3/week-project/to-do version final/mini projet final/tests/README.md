# 🧪 Testing Documentation

This document describes the comprehensive testing setup for the Todo API project.

## 📋 Testing Overview

The project includes a complete testing suite with:
- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test API endpoints with real HTTP requests
- **Test Coverage**: Measure code coverage across the application

## 🛠️ Testing Stack

- **Jest**: JavaScript testing framework
- **Supertest**: HTTP assertion library for API testing
- **MongoDB Memory Server**: In-memory MongoDB for testing
- **bcryptjs**: For password hashing in tests

## 📁 Test Structure

```
tests/
├── setup.js                     # Global test configuration
├── helpers/
│   └── testHelpers.js           # Utility functions for tests
├── unit/
│   ├── models/
│   │   ├── user.test.js         # User model tests
│   │   └── todo.test.js         # Todo model tests
│   ├── services/
│   │   └── todoService.test.js  # Todo service tests
│   ├── controllers/
│   │   ├── authController.test.js # Auth controller tests
│   │   └── todoController.test.js # Todo controller tests
│   └── middlewares/
│       ├── auth.test.js         # Auth middleware tests
│       └── authorize.test.js    # Authorization middleware tests
└── integration/
    ├── auth.test.js             # Authentication API tests
    └── todos.test.js            # Todo API tests
```

## 🚀 Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Generate Coverage Report
```bash
npm run test:coverage
```

## 📊 Test Categories

### Unit Tests

#### Model Tests
- **User Model**: Validation, password hashing, unique constraints
- **Todo Model**: Schema validation, relationships, default values

#### Service Tests
- **Todo Service**: CRUD operations, filtering, pagination, business logic

#### Controller Tests
- **Auth Controller**: Registration, login, error handling
- **Todo Controller**: All CRUD endpoints, authorization, validation

#### Middleware Tests
- **Auth Middleware**: Token validation, user extraction
- **Authorization Middleware**: Role-based access control

### Integration Tests

#### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

#### Todo Endpoints
- `GET /api/todos` - List todos with filtering
- `GET /api/todos/:id` - Get specific todo
- `POST /api/todos` - Create new todo
- `PATCH /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo (admin only)
- `PATCH /api/todos/:id/toggle` - Toggle completion status

## 🔧 Test Configuration

### Jest Configuration (package.json)
```json
{
  "jest": {
    "testEnvironment": "node",
    "setupFilesAfterEnv": ["<rootDir>/tests/setup.js"],
    "testMatch": ["<rootDir>/tests/**/*.test.js"],
    "collectCoverageFrom": [
      "src/**/*.js",
      "!src/server.js",
      "!src/config/db.js"
    ]
  }
}
```

### Test Database
- Uses MongoDB Memory Server for isolated testing
- Each test gets a fresh database instance
- No external database dependencies

## 📝 Test Helpers

### `testHelpers.js` provides:
- `createTestUser()` - Create test user
- `createTestAdmin()` - Create test admin user
- `generateToken()` - Generate JWT tokens
- `createTestTodo()` - Create test todos
- `createMultipleTodos()` - Create multiple test todos

## 🎯 Coverage Goals

The test suite aims for:
- **90%+ Line Coverage**
- **85%+ Branch Coverage**
- **90%+ Function Coverage**

## 🔍 Test Examples

### Unit Test Example
```javascript
describe('User Model', () => {
  it('should hash password before saving', async () => {
    const user = new User({
      email: 'test@example.com',
      password: 'plainPassword'
    });
    await user.save();

    const isMatch = await bcrypt.compare('plainPassword', user.password);
    expect(isMatch).toBe(true);
  });
});
```

### Integration Test Example
```javascript
describe('POST /api/todos', () => {
  it('should create todo with valid data', async () => {
    const response = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'New Todo', priority: 'high' })
      .expect(201);

    expect(response.body.title).toBe('New Todo');
  });
});
```

## 🚨 Common Issues

### MongoDB Connection
If tests fail with MongoDB connection errors:
1. Ensure no other MongoDB instances are running
2. Check if port 27017 is available
3. Restart the test suite

### Token Issues
If authentication tests fail:
1. Verify JWT_SECRET is set in test environment
2. Check token expiration times
3. Ensure proper Bearer token format

## 📈 Continuous Integration

The test suite is designed to work with CI/CD pipelines:
- No external dependencies
- Fast execution with in-memory database
- Comprehensive error reporting
- Coverage reporting integration

## 🔄 Test Maintenance

### Adding New Tests
1. Follow existing naming conventions
2. Use appropriate test helpers
3. Include both positive and negative test cases
4. Update coverage expectations if needed

### Best Practices
- Keep tests isolated and independent
- Use descriptive test names
- Test edge cases and error conditions
- Mock external dependencies
- Clean up test data between tests
