// Test setup file
const path = require('path');

// Set test environment variables
process.env.NODE_ENV = 'test';

// Mock the tournament data file path for tests
const originalTournamentDataFile = path.join(__dirname, '../test_tournament_data.json');

// Global test timeout
jest.setTimeout(10000);

// Clean up after all tests
afterAll(async () => {
  // Clean up any test files
  const fs = require('fs').promises;
  try {
    await fs.unlink(originalTournamentDataFile);
  } catch (error) {
    // File doesn't exist, that's fine
  }
});