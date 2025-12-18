const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const TOURNAMENT_DATA_FILE = path.join(__dirname, '../../tournament_data.json');

// Utility functions
async function ensureTournamentDataFile() {
  try {
    await fs.access(TOURNAMENT_DATA_FILE);
  } catch {
    await fs.writeFile(TOURNAMENT_DATA_FILE, JSON.stringify({
      submissions: [],
      tournaments: [],
      tournamentSettings: []
    }, null, 2));
  }
}

async function loadTournamentData() {
  try {
    await ensureTournamentDataFile();
    const data = await fs.readFile(TOURNAMENT_DATA_FILE, 'utf8');
    const parsed = JSON.parse(data);
    
    // Ensure all required arrays exist
    return {
      submissions: parsed.submissions || [],
      tournaments: parsed.tournaments || [],
      tournamentSettings: parsed.tournamentSettings || []
    };
  } catch {
    return { submissions: [], tournaments: [], tournamentSettings: [] };
  }
}

async function saveTournamentData(data) {
  await fs.writeFile(TOURNAMENT_DATA_FILE, JSON.stringify(data, null, 2));
}

function generateTournamentBracket(accommodations) {
  // Create unique accommodations with submission counts
  const accommodationMap = new Map();
  
  accommodations.forEach(acc => {
    if (accommodationMap.has(acc.id)) {
      accommodationMap.get(acc.id).submissionCount++;
    } else {
      accommodationMap.set(acc.id, {
        ...acc,
        submissionCount: 1
      });
    }
  });

  const uniqueAccommodations = Array.from(accommodationMap.values());
  
  // Smart bye allocation: Higher submission counts get bye priority
  // Within same submission counts, order is random for fairness
  uniqueAccommodations.sort((a, b) => {
    if (b.submissionCount !== a.submissionCount) {
      return b.submissionCount - a.submissionCount; // Higher submission count first
    }
    return Math.random() - 0.5; // Random within same submission count
  });

  // Generate bracket structure
  const rounds = [];
  let currentRound = uniqueAccommodations.map((acc, index) => ({
    id: `match_${Date.now()}_${index}`,
    accommodation: acc,
    votes: acc.submissionCount, // Initial votes from submissions
    round: 1
  }));

  let roundNumber = 1;
  
  while (currentRound.length > 1) {
    rounds.push([...currentRound]);
    
    const nextRound = [];
    for (let i = 0; i < currentRound.length; i += 2) {
      if (i + 1 < currentRound.length) {
        // Create matchup between two accommodations
        nextRound.push({
          id: `match_${Date.now()}_${roundNumber}_${i}`,
          matchup: {
            accommodation1: currentRound[i],
            accommodation2: currentRound[i + 1],
            votes1: 0,
            votes2: 0,
            winner: null
          },
          round: roundNumber + 1
        });
      } else {
        // Bye - automatically advance
        nextRound.push({
          ...currentRound[i],
          round: roundNumber + 1
        });
      }
    }
    
    currentRound = nextRound;
    roundNumber++;
  }

  if (currentRound.length === 1) {
    rounds.push(currentRound);
  }

  return {
    rounds,
    totalRounds: rounds.length,
    status: 'ready'
  };
}

// POST /api/tournament/submissions - Submit accommodations for tournament
router.post('/submissions', async (req, res) => {
  try {
    const { destination, groupSize, accommodations } = req.body;
    
    if (!destination || !groupSize || !accommodations || accommodations.length !== 3) {
      return res.status(400).json({ 
        error: 'Must provide destination, groupSize, and exactly 3 accommodations' 
      });
    }

    const tournamentData = await loadTournamentData();
    
    // Add submission
    const submission = {
      id: `submission_${Date.now()}`,
      destination,
      groupSize,
      accommodations,
      submittedAt: new Date().toISOString(),
      userId: req.body.userId || `user_${Date.now()}` // In real app, get from auth
    };

    tournamentData.submissions.push(submission);
    await saveTournamentData(tournamentData);

    res.json({ 
      success: true,
      submissionId: submission.id,
      totalSubmissions: tournamentData.submissions.length
    });
  } catch (error) {
    console.error('Error saving tournament submission:', error);
    res.status(500).json({ error: 'Failed to save tournament submission' });
  }
});

// GET /api/tournament/submissions - Get all submissions
router.get('/submissions', async (req, res) => {
  try {
    const tournamentData = await loadTournamentData();
    res.json({ submissions: tournamentData.submissions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get tournament submissions' });
  }
});

// POST /api/tournament/generate - Generate tournament bracket
router.post('/generate', async (req, res) => {
  try {
    const { destination } = req.body;
    const tournamentData = await loadTournamentData();
    
    // Get all accommodations from submissions for this destination
    const relevantSubmissions = tournamentData.submissions.filter(
      sub => sub.destination === destination
    );

    if (relevantSubmissions.length === 0) {
      return res.status(400).json({ error: 'No submissions found for this destination' });
    }

    const allAccommodations = relevantSubmissions.flatMap(sub => sub.accommodations);
    const bracket = generateTournamentBracket(allAccommodations);

    // Save tournament
    const tournament = {
      id: `tournament_${Date.now()}`,
      destination,
      bracket,
      createdAt: new Date().toISOString(),
      status: 'active',
      currentRound: 1
    };

    tournamentData.tournaments.push(tournament);
    await saveTournamentData(tournamentData);

    res.json({ 
      success: true,
      tournament
    });
  } catch (error) {
    console.error('Error generating tournament:', error);
    res.status(500).json({ error: 'Failed to generate tournament' });
  }
});

// GET /api/tournament/:tournamentId - Get tournament details
router.get('/:tournamentId', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const tournamentData = await loadTournamentData();
    
    const tournament = tournamentData.tournaments.find(t => t.id === tournamentId);
    
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    res.json({ tournament });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get tournament' });
  }
});

// POST /api/tournament/:tournamentId/vote - Vote in tournament matchup
router.post('/:tournamentId/vote', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { matchId, choice } = req.body; // choice: 'accommodation1' or 'accommodation2'
    
    if (!matchId || !choice || !['accommodation1', 'accommodation2'].includes(choice)) {
      return res.status(400).json({ 
        error: 'Must provide matchId and choice (accommodation1 or accommodation2)' 
      });
    }

    const tournamentData = await loadTournamentData();
    const tournament = tournamentData.tournaments.find(t => t.id === tournamentId);
    
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    // Find the match in current round
    const currentRoundMatches = tournament.bracket.rounds[tournament.currentRound - 1];
    const match = currentRoundMatches?.find(m => m.id === matchId);
    
    if (!match || !match.matchup) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Add vote
    if (choice === 'accommodation1') {
      match.matchup.votes1++;
      // Add initial submission votes
      match.matchup.votes1 += match.matchup.accommodation1.submissionCount || 0;
      match.matchup.accommodation1.submissionCount = 0; // Only count once
    } else {
      match.matchup.votes2++;
      // Add initial submission votes  
      match.matchup.votes2 += match.matchup.accommodation2.submissionCount || 0;
      match.matchup.accommodation2.submissionCount = 0; // Only count once
    }

    await saveTournamentData(tournamentData);

    res.json({ 
      success: true,
      match: match.matchup,
      votes1: match.matchup.votes1,
      votes2: match.matchup.votes2
    });
  } catch (error) {
    console.error('Error recording tournament vote:', error);
    res.status(500).json({ error: 'Failed to record tournament vote' });
  }
});

// POST /api/tournament/:tournamentId/advance - Advance tournament to next round
router.post('/:tournamentId/advance', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const tournamentData = await loadTournamentData();
    const tournament = tournamentData.tournaments.find(t => t.id === tournamentId);
    
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    const currentRoundMatches = tournament.bracket.rounds[tournament.currentRound - 1];
    
    // Check if all matches in current round are complete
    const incompleteMatches = currentRoundMatches.filter(match => {
      if (!match.matchup) return false; // Bye matches are automatically complete
      return !match.matchup.winner;
    });

    if (incompleteMatches.length > 0) {
      return res.status(400).json({ 
        error: 'Not all matches in current round are complete',
        incompleteMatches: incompleteMatches.length
      });
    }

    // Determine winners and advance
    const winners = currentRoundMatches.map(match => {
      if (!match.matchup) {
        // Bye match - accommodation automatically advances
        return match.accommodation;
      }
      
      const totalVotes1 = match.matchup.votes1;
      const totalVotes2 = match.matchup.votes2;
      
      if (totalVotes1 > totalVotes2) {
        match.matchup.winner = 'accommodation1';
        return match.matchup.accommodation1.accommodation || match.matchup.accommodation1;
      } else if (totalVotes2 > totalVotes1) {
        match.matchup.winner = 'accommodation2';
        return match.matchup.accommodation2.accommodation || match.matchup.accommodation2;
      } else {
        // Tie - use submission count as tiebreaker
        const sub1 = match.matchup.accommodation1.submissionCount || 0;
        const sub2 = match.matchup.accommodation2.submissionCount || 0;
        
        if (sub1 > sub2) {
          match.matchup.winner = 'accommodation1';
          return match.matchup.accommodation1.accommodation || match.matchup.accommodation1;
        } else {
          match.matchup.winner = 'accommodation2';
          return match.matchup.accommodation2.accommodation || match.matchup.accommodation2;
        }
      }
    });

    // Check if tournament is complete
    if (winners.length === 1) {
      tournament.status = 'complete';
      tournament.winner = winners[0];
    } else {
      tournament.currentRound++;
    }

    await saveTournamentData(tournamentData);

    res.json({ 
      success: true,
      winners,
      currentRound: tournament.currentRound,
      status: tournament.status,
      winner: tournament.winner
    });
  } catch (error) {
    console.error('Error advancing tournament:', error);
    res.status(500).json({ error: 'Failed to advance tournament' });
  }
});

// GET /api/tournament - Get all tournaments
router.get('/', async (req, res) => {
  try {
    const tournamentData = await loadTournamentData();
    res.json({ tournaments: tournamentData.tournaments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get tournaments' });
  }
});

// POST /api/tournament/settings - Set tournament settings for a destination
router.post('/settings', async (req, res) => {
  try {
    const { 
      destination, 
      submissionDeadline, 
      autoStartTime, 
      creatorId, 
      minSubmissions = 3 
    } = req.body;
    
    if (!destination || !submissionDeadline || !autoStartTime || !creatorId) {
      return res.status(400).json({ 
        error: 'Must provide destination, submissionDeadline, autoStartTime, and creatorId' 
      });
    }

    const tournamentData = await loadTournamentData();
    
    // Ensure tournamentSettings array exists
    if (!tournamentData.tournamentSettings) {
      tournamentData.tournamentSettings = [];
    }
    
    // Remove existing settings for this destination
    tournamentData.tournamentSettings = tournamentData.tournamentSettings.filter(
      setting => setting.destination !== destination
    );

    // Add new settings
    const settings = {
      id: `settings_${Date.now()}`,
      destination,
      submissionDeadline: new Date(submissionDeadline).toISOString(),
      autoStartTime: new Date(autoStartTime).toISOString(),
      creatorId,
      minSubmissions,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    tournamentData.tournamentSettings.push(settings);
    await saveTournamentData(tournamentData);

    res.json({ 
      success: true,
      settings
    });
  } catch (error) {
    console.error('Error saving tournament settings:', error);
    res.status(500).json({ error: 'Failed to save tournament settings' });
  }
});

// GET /api/tournament/settings/:destination - Get tournament settings for destination
router.get('/settings/:destination', async (req, res) => {
  try {
    const { destination } = req.params;
    const tournamentData = await loadTournamentData();
    
    const settings = tournamentData.tournamentSettings.find(
      s => s.destination === destination && s.status === 'active'
    );

    if (!settings) {
      return res.status(404).json({ error: 'No settings found for this destination' });
    }

    // Check if auto-start time has passed
    const now = new Date();
    const autoStartTime = new Date(settings.autoStartTime);
    const shouldAutoStart = now >= autoStartTime;

    res.json({ 
      settings: {
        ...settings,
        shouldAutoStart,
        timeUntilAutoStart: shouldAutoStart ? 0 : autoStartTime.getTime() - now.getTime()
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get tournament settings' });
  }
});

// POST /api/tournament/check-auto-start - Check and auto-start tournaments if needed
router.post('/check-auto-start', async (req, res) => {
  try {
    const tournamentData = await loadTournamentData();
    const now = new Date();
    const autoStartedTournaments = [];

    for (const settings of tournamentData.tournamentSettings) {
      if (settings.status !== 'active') continue;

      const autoStartTime = new Date(settings.autoStartTime);
      if (now >= autoStartTime) {
        // Check if we have enough submissions
        const relevantSubmissions = tournamentData.submissions.filter(
          sub => sub.destination === settings.destination
        );

        if (relevantSubmissions.length >= settings.minSubmissions) {
          // Auto-start tournament
          const allAccommodations = relevantSubmissions.flatMap(sub => sub.accommodations);
          const bracket = generateTournamentBracket(allAccommodations);

          const tournament = {
            id: `tournament_${Date.now()}`,
            destination: settings.destination,
            bracket,
            createdAt: new Date().toISOString(),
            status: 'active',
            currentRound: 1,
            autoStarted: true,
            settingsId: settings.id
          };

          tournamentData.tournaments.push(tournament);
          
          // Mark settings as used
          settings.status = 'completed';
          
          autoStartedTournaments.push(tournament);
        }
      }
    }

    await saveTournamentData(tournamentData);

    res.json({ 
      success: true,
      autoStartedTournaments
    });
  } catch (error) {
    console.error('Error checking auto-start:', error);
    res.status(500).json({ error: 'Failed to check auto-start' });
  }
});

module.exports = router;