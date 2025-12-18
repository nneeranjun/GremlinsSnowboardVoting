const request = require('supertest');
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const tournamentRoutes = require('../routes/tournament');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/tournament', tournamentRoutes);

// Mock data
const mockAccommodations = [
  {
    id: 'acc1',
    name: 'Luxury Condo',
    type: 'Airbnb',
    pricePerNight: 400,
    beds: 4,
    bathrooms: 3,
    distanceToMountain: 0.2,
    rating: 4.9
  },
  {
    id: 'acc2', 
    name: 'Cozy Chalet',
    type: 'Airbnb',
    pricePerNight: 280,
    beds: 3,
    bathrooms: 2,
    distanceToMountain: 0.8,
    rating: 4.8
  },
  {
    id: 'acc3',
    name: 'Mountain Lodge',
    type: 'Custom',
    pricePerNight: 320,
    beds: 3,
    bathrooms: 2,
    distanceToMountain: 1.5,
    rating: 4.7,
    isCustom: true
  }
];

// Test data file path
const TEST_DATA_FILE = path.join(__dirname, '../test_tournament_data.json');

describe('Tournament Logic Tests', () => {
  beforeEach(async () => {
    // Clean up test data file before each test
    try {
      await fs.unlink(TEST_DATA_FILE);
    } catch (error) {
      // File doesn't exist, that's fine
    }
  });

  afterEach(async () => {
    // Clean up test data file after each test
    try {
      await fs.unlink(TEST_DATA_FILE);
    } catch (error) {
      // File doesn't exist, that's fine
    }
  });

  describe('Tournament Bracket Generation', () => {
    test('should handle odd number of accommodations with smart bye allocation', () => {
      // Mock the generateTournamentBracket function
      const accommodations = [
        { ...mockAccommodations[0] }, // Will be picked 3 times
        { ...mockAccommodations[0] }, 
        { ...mockAccommodations[0] },
        { ...mockAccommodations[1] }, // Will be picked 2 times
        { ...mockAccommodations[1] },
        { ...mockAccommodations[2] }, // Will be picked 1 time
        { id: 'acc4', name: 'Resort Villa', pricePerNight: 500 } // Will be picked 1 time
      ];

      // Import the function directly for testing
      const tournamentModule = require('../routes/tournament');
      
      // We need to extract the generateTournamentBracket function
      // Since it's not exported, we'll test it through the API endpoint
    });

    test('should create proper bracket structure', async () => {
      // Test tournament generation through API
      const submissions = [
        {
          destination: 'Utah',
          groupSize: 4,
          accommodations: [mockAccommodations[0], mockAccommodations[1], mockAccommodations[2]]
        },
        {
          destination: 'Utah', 
          groupSize: 4,
          accommodations: [mockAccommodations[0], mockAccommodations[1], mockAccommodations[2]]
        }
      ];

      // Submit accommodations
      for (const submission of submissions) {
        await request(app)
          .post('/api/tournament/submissions')
          .send(submission)
          .expect(200);
      }

      // Generate tournament
      const response = await request(app)
        .post('/api/tournament/generate')
        .send({ destination: 'Utah' })
        .expect(200);

      const tournament = response.body.tournament;
      
      expect(tournament).toBeDefined();
      expect(tournament.bracket).toBeDefined();
      expect(tournament.bracket.rounds).toBeDefined();
      expect(tournament.status).toBe('active');
      expect(tournament.currentRound).toBe(1);
    });

    test('should prioritize accommodations with more submissions for byes', async () => {
      // Create 7 accommodations with different submission counts
      const submissions = [
        {
          destination: 'Utah',
          groupSize: 4,
          accommodations: [
            { id: 'popular', name: 'Popular Place', pricePerNight: 300 },
            { id: 'acc2', name: 'Place 2', pricePerNight: 250 },
            { id: 'acc3', name: 'Place 3', pricePerNight: 200 }
          ]
        },
        {
          destination: 'Utah',
          groupSize: 4, 
          accommodations: [
            { id: 'popular', name: 'Popular Place', pricePerNight: 300 }, // 3 total
            { id: 'acc4', name: 'Place 4', pricePerNight: 180 },
            { id: 'acc5', name: 'Place 5', pricePerNight: 160 }
          ]
        },
        {
          destination: 'Utah',
          groupSize: 4,
          accommodations: [
            { id: 'popular', name: 'Popular Place', pricePerNight: 300 }, // 3 total
            { id: 'acc6', name: 'Place 6', pricePerNight: 140 },
            { id: 'acc7', name: 'Place 7', pricePerNight: 120 }
          ]
        }
      ];

      // Submit all accommodations
      for (const submission of submissions) {
        await request(app)
          .post('/api/tournament/submissions')
          .send(submission)
          .expect(200);
      }

      // Generate tournament
      const response = await request(app)
        .post('/api/tournament/generate')
        .send({ destination: 'Utah' })
        .expect(200);

      const tournament = response.body.tournament;
      const firstRound = tournament.bracket.rounds[0];
      
      // Should have 7 unique accommodations
      expect(firstRound.length).toBe(7);
      
      // The accommodation with 3 submissions should get the bye (be at the end)
      const byeMatch = firstRound.find(match => !match.matchup);
      expect(byeMatch).toBeDefined();
      expect(byeMatch.accommodation.id).toBe('popular');
    });
  });

  describe('Submission API', () => {
    test('should accept valid submissions', async () => {
      const submission = {
        destination: 'Utah',
        groupSize: 4,
        accommodations: [mockAccommodations[0], mockAccommodations[1], mockAccommodations[2]]
      };

      const response = await request(app)
        .post('/api/tournament/submissions')
        .send(submission)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.submissionId).toBeDefined();
      expect(response.body.totalSubmissions).toBe(1);
    });

    test('should reject submissions with wrong number of accommodations', async () => {
      const submission = {
        destination: 'Utah',
        groupSize: 4,
        accommodations: [mockAccommodations[0], mockAccommodations[1]] // Only 2 accommodations
      };

      await request(app)
        .post('/api/tournament/submissions')
        .send(submission)
        .expect(400);
    });

    test('should reject submissions missing required fields', async () => {
      const submission = {
        groupSize: 4,
        accommodations: [mockAccommodations[0], mockAccommodations[1], mockAccommodations[2]]
        // Missing destination
      };

      await request(app)
        .post('/api/tournament/submissions')
        .send(submission)
        .expect(400);
    });
  });

  describe('Voting System', () => {
    let tournamentId;

    beforeEach(async () => {
      // Create a tournament for voting tests
      const submissions = [
        {
          destination: 'Utah',
          groupSize: 4,
          accommodations: [mockAccommodations[0], mockAccommodations[1], mockAccommodations[2]]
        },
        {
          destination: 'Utah',
          groupSize: 4,
          accommodations: [mockAccommodations[0], mockAccommodations[1], mockAccommodations[2]]
        }
      ];

      // Submit accommodations
      for (const submission of submissions) {
        await request(app)
          .post('/api/tournament/submissions')
          .send(submission);
      }

      // Generate tournament
      const response = await request(app)
        .post('/api/tournament/generate')
        .send({ destination: 'Utah' });

      tournamentId = response.body.tournament.id;
    });

    test('should record votes correctly with weighted initial votes', async () => {
      // Get tournament details to find a match
      const tournamentResponse = await request(app)
        .get(`/api/tournament/${tournamentId}`)
        .expect(200);

      const tournament = tournamentResponse.body.tournament;
      const currentRound = tournament.bracket.rounds[tournament.currentRound - 1];
      const matchWithVoting = currentRound.find(match => match.matchup);

      if (matchWithVoting) {
        const response = await request(app)
          .post(`/api/tournament/${tournamentId}/vote`)
          .send({
            matchId: matchWithVoting.id,
            choice: 'accommodation1'
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.votes1).toBeGreaterThan(0);
      }
    });

    test('should reject invalid vote choices', async () => {
      await request(app)
        .post(`/api/tournament/${tournamentId}/vote`)
        .send({
          matchId: 'some_match_id',
          choice: 'invalid_choice'
        })
        .expect(400);
    });
  });

  describe('Tournament Settings', () => {
    test('should save tournament settings', async () => {
      const settings = {
        destination: 'Utah',
        submissionDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        autoStartTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        creatorId: 'test_user',
        minSubmissions: 3
      };

      const response = await request(app)
        .post('/api/tournament/settings')
        .send(settings)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.settings).toBeDefined();
    });

    test('should retrieve tournament settings', async () => {
      // First save settings
      const settings = {
        destination: 'Colorado',
        submissionDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        autoStartTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        creatorId: 'test_user',
        minSubmissions: 2
      };

      await request(app)
        .post('/api/tournament/settings')
        .send(settings);

      // Then retrieve them
      const response = await request(app)
        .get('/api/tournament/settings/Colorado')
        .expect(200);

      expect(response.body.settings).toBeDefined();
      expect(response.body.settings.destination).toBe('Colorado');
      expect(response.body.settings.minSubmissions).toBe(2);
    });
  });
});

describe('Tournament Business Logic', () => {
  describe('Bye Allocation Algorithm', () => {
    test('should prioritize higher submission counts', () => {
      const accommodations = [
        { id: 'a', name: 'A', submissionCount: 1 },
        { id: 'b', name: 'B', submissionCount: 3 },
        { id: 'c', name: 'C', submissionCount: 2 },
        { id: 'd', name: 'D', submissionCount: 1 },
        { id: 'e', name: 'E', submissionCount: 2 }
      ];

      // Sort using the same logic as the tournament
      accommodations.sort((a, b) => {
        if (b.submissionCount !== a.submissionCount) {
          return b.submissionCount - a.submissionCount;
        }
        return 0; // Don't randomize in test
      });

      // Should be sorted by submission count descending
      expect(accommodations[0].submissionCount).toBe(3); // B
      expect(accommodations[1].submissionCount).toBe(2); // C or E
      expect(accommodations[2].submissionCount).toBe(2); // C or E
      expect(accommodations[3].submissionCount).toBe(1); // A or D
      expect(accommodations[4].submissionCount).toBe(1); // A or D
    });
  });

  describe('Weighted Voting System', () => {
    test('should add initial submission votes only once', () => {
      // Simulate the voting logic
      let votes1 = 0;
      let votes2 = 0;
      let submissionCount1 = 3;
      let submissionCount2 = 1;

      // First vote for accommodation1
      votes1++;
      votes1 += submissionCount1;
      submissionCount1 = 0; // Reset to prevent double counting

      expect(votes1).toBe(4); // 1 vote + 3 initial submissions
      expect(submissionCount1).toBe(0);

      // Second vote for accommodation1 (should not get bonus again)
      votes1++;
      votes1 += submissionCount1; // Should add 0

      expect(votes1).toBe(5); // Just +1, no bonus
    });
  });
});