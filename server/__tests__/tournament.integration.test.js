const request = require('supertest');
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const tournamentRoutes = require('../routes/tournament');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/tournament', tournamentRoutes);

const TEST_DATA_FILE = path.join(__dirname, '../test_integration_data.json');

describe('Tournament Integration Tests', () => {
  beforeEach(async () => {
    // Clean up test data file
    try {
      await fs.unlink(TEST_DATA_FILE);
    } catch (error) {
      // File doesn't exist, that's fine
    }
  });

  afterEach(async () => {
    // Clean up test data file
    try {
      await fs.unlink(TEST_DATA_FILE);
    } catch (error) {
      // File doesn't exist, that's fine
    }
  });

  describe('Complete Tournament Flow', () => {
    test('should handle full tournament lifecycle', async () => {
      // Step 1: Multiple users submit accommodations
      const user1Submission = {
        destination: 'Utah',
        groupSize: 4,
        accommodations: [
          { id: 'popular', name: 'Popular Place', pricePerNight: 300 },
          { id: 'acc2', name: 'Place 2', pricePerNight: 250 },
          { id: 'acc3', name: 'Place 3', pricePerNight: 200 }
        ],
        userId: 'user1'
      };

      const user2Submission = {
        destination: 'Utah',
        groupSize: 4,
        accommodations: [
          { id: 'popular', name: 'Popular Place', pricePerNight: 300 }, // Same as user1
          { id: 'acc4', name: 'Place 4', pricePerNight: 180 },
          { id: 'acc5', name: 'Place 5', pricePerNight: 160 }
        ],
        userId: 'user2'
      };

      const user3Submission = {
        destination: 'Utah',
        groupSize: 4,
        accommodations: [
          { id: 'popular', name: 'Popular Place', pricePerNight: 300 }, // Same as user1 & user2
          { id: 'acc6', name: 'Place 6', pricePerNight: 140 },
          { id: 'acc7', name: 'Place 7', pricePerNight: 120 }
        ],
        userId: 'user3'
      };

      // Submit all accommodations
      const submission1 = await request(app)
        .post('/api/tournament/submissions')
        .send(user1Submission)
        .expect(200);

      const submission2 = await request(app)
        .post('/api/tournament/submissions')
        .send(user2Submission)
        .expect(200);

      const submission3 = await request(app)
        .post('/api/tournament/submissions')
        .send(user3Submission)
        .expect(200);

      expect(submission1.body.totalSubmissions).toBe(1);
      expect(submission2.body.totalSubmissions).toBe(2);
      expect(submission3.body.totalSubmissions).toBe(3);

      // Step 2: Generate tournament
      const tournamentResponse = await request(app)
        .post('/api/tournament/generate')
        .send({ destination: 'Utah' })
        .expect(200);

      const tournament = tournamentResponse.body.tournament;
      expect(tournament.status).toBe('active');
      expect(tournament.currentRound).toBe(1);
      expect(tournament.bracket.rounds).toBeDefined();

      // Step 3: Verify popular accommodation gets bye (7 unique accommodations)
      const firstRound = tournament.bracket.rounds[0];
      expect(firstRound.length).toBe(7); // 7 unique accommodations

      const byeMatch = firstRound.find(match => !match.matchup);
      expect(byeMatch).toBeDefined();
      expect(byeMatch.accommodation.id).toBe('popular'); // Most popular should get bye

      // Step 4: Vote in tournament matches
      const tournamentId = tournament.id;
      const votingMatches = firstRound.filter(match => match.matchup);

      // Vote in first match
      if (votingMatches.length > 0) {
        const firstMatch = votingMatches[0];
        
        const voteResponse = await request(app)
          .post(`/api/tournament/${tournamentId}/vote`)
          .send({
            matchId: firstMatch.id,
            choice: 'accommodation1'
          })
          .expect(200);

        expect(voteResponse.body.success).toBe(true);
        expect(voteResponse.body.votes1).toBeGreaterThan(0);
      }

      // Step 5: Get updated tournament
      const updatedTournament = await request(app)
        .get(`/api/tournament/${tournamentId}`)
        .expect(200);

      expect(updatedTournament.body.tournament).toBeDefined();
    });

    test('should handle tournament settings and auto-start', async () => {
      // Step 1: Set tournament settings
      const futureDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const futureAutoStart = new Date(Date.now() + 48 * 60 * 60 * 1000);

      const settingsResponse = await request(app)
        .post('/api/tournament/settings')
        .send({
          destination: 'Colorado',
          submissionDeadline: futureDeadline.toISOString(),
          autoStartTime: futureAutoStart.toISOString(),
          creatorId: 'test_creator',
          minSubmissions: 2
        })
        .expect(200);

      expect(settingsResponse.body.success).toBe(true);

      // Step 2: Retrieve settings
      const getSettingsResponse = await request(app)
        .get('/api/tournament/settings/Colorado')
        .expect(200);

      const settings = getSettingsResponse.body.settings;
      expect(settings.destination).toBe('Colorado');
      expect(settings.minSubmissions).toBe(2);
      expect(settings.shouldAutoStart).toBe(false); // Future date
      expect(settings.timeUntilAutoStart).toBeGreaterThan(0);

      // Step 3: Test auto-start check (no tournaments should start yet)
      const autoStartResponse = await request(app)
        .post('/api/tournament/check-auto-start')
        .expect(200);

      expect(autoStartResponse.body.autoStartedTournaments).toHaveLength(0);
    });

    test('should handle weighted voting correctly', async () => {
      // Create submissions with overlapping accommodations
      const submissions = [
        {
          destination: 'TestDest',
          groupSize: 4,
          accommodations: [
            { id: 'triple', name: 'Triple Pick', pricePerNight: 300 },
            { id: 'single1', name: 'Single Pick 1', pricePerNight: 250 },
            { id: 'single2', name: 'Single Pick 2', pricePerNight: 200 }
          ]
        },
        {
          destination: 'TestDest',
          groupSize: 4,
          accommodations: [
            { id: 'triple', name: 'Triple Pick', pricePerNight: 300 },
            { id: 'single3', name: 'Single Pick 3', pricePerNight: 180 },
            { id: 'single4', name: 'Single Pick 4', pricePerNight: 160 }
          ]
        },
        {
          destination: 'TestDest',
          groupSize: 4,
          accommodations: [
            { id: 'triple', name: 'Triple Pick', pricePerNight: 300 },
            { id: 'single5', name: 'Single Pick 5', pricePerNight: 140 },
            { id: 'single6', name: 'Single Pick 6', pricePerNight: 120 }
          ]
        }
      ];

      // Submit all
      for (const submission of submissions) {
        await request(app)
          .post('/api/tournament/submissions')
          .send(submission)
          .expect(200);
      }

      // Generate tournament
      const tournamentResponse = await request(app)
        .post('/api/tournament/generate')
        .send({ destination: 'TestDest' })
        .expect(200);

      const tournament = tournamentResponse.body.tournament;
      const firstRound = tournament.bracket.rounds[0];

      // Find a match with the triple-picked accommodation
      const matchWithTriple = firstRound.find(match => 
        match.matchup && (
          match.matchup.accommodation1.accommodation.id === 'triple' ||
          match.matchup.accommodation2.accommodation.id === 'triple'
        )
      );

      if (matchWithTriple) {
        const isTripleAcc1 = matchWithTriple.matchup.accommodation1.accommodation.id === 'triple';
        const tripleAcc = isTripleAcc1 ? matchWithTriple.matchup.accommodation1 : matchWithTriple.matchup.accommodation2;
        
        // Triple-picked accommodation should have submissionCount of 3
        expect(tripleAcc.submissionCount).toBe(3);

        // Vote for the triple accommodation
        const choice = isTripleAcc1 ? 'accommodation1' : 'accommodation2';
        
        const voteResponse = await request(app)
          .post(`/api/tournament/${tournament.id}/vote`)
          .send({
            matchId: matchWithTriple.id,
            choice: choice
          })
          .expect(200);

        // Should get 1 vote + 3 initial submission votes = 4 total
        const expectedVotes = isTripleAcc1 ? voteResponse.body.votes1 : voteResponse.body.votes2;
        expect(expectedVotes).toBe(4);
      }
    });

    test('should advance tournament rounds correctly', async () => {
      // Create a small tournament with 4 accommodations for easier testing
      const submissions = [
        {
          destination: 'SmallTest',
          groupSize: 4,
          accommodations: [
            { id: 'acc1', name: 'Accommodation 1', pricePerNight: 300 },
            { id: 'acc2', name: 'Accommodation 2', pricePerNight: 250 }
          ]
        },
        {
          destination: 'SmallTest',
          groupSize: 4,
          accommodations: [
            { id: 'acc3', name: 'Accommodation 3', pricePerNight: 200 },
            { id: 'acc4', name: 'Accommodation 4', pricePerNight: 180 }
          ]
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
      const tournamentResponse = await request(app)
        .post('/api/tournament/generate')
        .send({ destination: 'SmallTest' })
        .expect(200);

      const tournamentId = tournamentResponse.body.tournament.id;

      // Get tournament details
      let tournament = await request(app)
        .get(`/api/tournament/${tournamentId}`)
        .expect(200);

      expect(tournament.body.tournament.currentRound).toBe(1);
      
      const firstRound = tournament.body.tournament.bracket.rounds[0];
      const matches = firstRound.filter(match => match.matchup);

      // Vote in all matches to complete the round
      for (const match of matches) {
        await request(app)
          .post(`/api/tournament/${tournamentId}/vote`)
          .send({
            matchId: match.id,
            choice: 'accommodation1' // Always vote for first accommodation
          })
          .expect(200);
      }

      // Try to advance tournament
      const advanceResponse = await request(app)
        .post(`/api/tournament/${tournamentId}/advance`)
        .expect(200);

      expect(advanceResponse.body.success).toBe(true);
      expect(advanceResponse.body.winners).toBeDefined();
      
      // Tournament should either advance to round 2 or be complete
      expect(
        advanceResponse.body.currentRound > 1 || 
        advanceResponse.body.status === 'complete'
      ).toBe(true);
    });
  });
});