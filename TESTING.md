# 🧪 Testing Guide

Comprehensive testing suite for the Ski Vote Tournament App.

## 📋 Test Coverage

### Backend Tests (`server/__tests__/`)
- **Unit Tests** (`tournament.test.js`)
  - Tournament bracket generation
  - Smart bye allocation algorithm
  - Weighted voting system
  - Submission validation
  - Tournament settings
  
- **Integration Tests** (`tournament.integration.test.js`)
  - Complete tournament lifecycle
  - Multi-user submission flow
  - Voting and advancement
  - Auto-start functionality

### Frontend Tests (`client/src/components/`)
- **Component Tests**
  - `ThemeToggle` - Dark mode functionality
  - `CountdownTimer` - Real-time countdown logic
  - `TournamentManager` - Tournament orchestration
  - `AccommodationSubmissionPage` - Submission flow

## 🚀 Running Tests

### Run All Tests
```bash
npm run test:all
```

### Backend Tests Only
```bash
npm run test:server
```

### Frontend Tests Only
```bash
npm run test:client
```

### Watch Mode (Development)
```bash
# Backend
npm test -- --watch

# Frontend
cd client && npm test
```

### Coverage Report
```bash
# Backend coverage
npm test -- --coverage

# Frontend coverage
cd client && npm test -- --coverage
```

## 📊 Test Structure

### Backend Unit Tests
```javascript
describe('Tournament Logic Tests', () => {
  test('should handle odd number of accommodations with smart bye allocation', () => {
    // Test bye allocation logic
  });
  
  test('should prioritize accommodations with more submissions for byes', () => {
    // Test weighted bye system
  });
});
```

### Frontend Component Tests
```javascript
describe('CountdownTimer Component', () => {
  test('renders countdown timer with future date', () => {
    // Test timer rendering
  });
  
  test('calls onExpire when timer reaches zero', () => {
    // Test expiration callback
  });
});
```

## 🎯 What's Tested

### Tournament Logic
- ✅ Bracket generation with odd/even numbers
- ✅ Smart bye allocation (popular choices get priority)
- ✅ Weighted voting (submission counts as initial votes)
- ✅ Tournament advancement
- ✅ Winner determination
- ✅ Tie-breaking logic

### API Endpoints
- ✅ POST `/api/tournament/submissions` - Submit accommodations
- ✅ GET `/api/tournament/submissions` - Get all submissions
- ✅ POST `/api/tournament/generate` - Create tournament
- ✅ GET `/api/tournament/:id` - Get tournament details
- ✅ POST `/api/tournament/:id/vote` - Vote in matchup
- ✅ POST `/api/tournament/:id/advance` - Advance round
- ✅ POST `/api/tournament/settings` - Save settings
- ✅ GET `/api/tournament/settings/:destination` - Get settings
- ✅ POST `/api/tournament/check-auto-start` - Check auto-start

### UI Components
- ✅ Theme toggle functionality
- ✅ Countdown timer accuracy
- ✅ Tournament navigation
- ✅ Accommodation selection (max 3)
- ✅ Custom accommodation addition
- ✅ Form validation
- ✅ Error handling

### User Flows
- ✅ Complete submission process
- ✅ Tournament generation
- ✅ Voting in matches
- ✅ Round advancement
- ✅ Settings configuration
- ✅ Auto-start triggers

## 🔧 Test Configuration

### Backend (Jest)
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/server'],
  collectCoverageFrom: ['server/**/*.js'],
  setupFilesAfterEnv: ['<rootDir>/server/__tests__/setup.js']
};
```

### Frontend (React Testing Library)
```javascript
// client/src/setupTests.js
import '@testing-library/jest-dom';
```

## 📝 Writing New Tests

### Backend Test Template
```javascript
describe('Feature Name', () => {
  beforeEach(async () => {
    // Setup test data
  });

  afterEach(async () => {
    // Cleanup
  });

  test('should do something', async () => {
    const response = await request(app)
      .post('/api/endpoint')
      .send(testData)
      .expect(200);

    expect(response.body).toMatchObject({
      success: true
    });
  });
});
```

### Frontend Test Template
```javascript
describe('ComponentName', () => {
  test('renders correctly', () => {
    render(<ComponentName />);
    
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  test('handles user interaction', () => {
    render(<ComponentName />);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(mockFunction).toHaveBeenCalled();
  });
});
```

## 🐛 Debugging Tests

### Run Single Test File
```bash
# Backend
npm test -- tournament.test.js

# Frontend
cd client && npm test -- CountdownTimer.test.js
```

### Run Single Test
```bash
npm test -- -t "test name pattern"
```

### Verbose Output
```bash
npm test -- --verbose
```

## 📈 Coverage Goals

- **Backend**: > 80% coverage
- **Frontend**: > 70% coverage
- **Critical paths**: 100% coverage
  - Tournament generation
  - Voting logic
  - Bye allocation
  - Weighted voting

## 🔍 Test Data

Test data is automatically cleaned up after each test run. Test files are stored in:
- Backend: `server/test_tournament_data.json` (auto-deleted)
- Frontend: In-memory mocks

## 🚨 Common Issues

### Issue: Tests timeout
**Solution**: Increase timeout in test file
```javascript
jest.setTimeout(10000);
```

### Issue: Mock data not working
**Solution**: Clear mocks between tests
```javascript
afterEach(() => {
  jest.clearAllMocks();
});
```

### Issue: Async tests failing
**Solution**: Use `waitFor` for async operations
```javascript
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

## 📚 Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Supertest Documentation](https://github.com/visionmedia/supertest)

## ✅ Pre-commit Checklist

Before committing code:
- [ ] All tests pass
- [ ] New features have tests
- [ ] Coverage hasn't decreased
- [ ] No console errors in tests
- [ ] Test data is cleaned up

## 🎉 Happy Testing!

Well-tested code is reliable code. Keep those tests green! 🟢