const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { DESTINATIONS } = require('../data/destinations');

const VOTES_FILE = path.join(__dirname, '../../votes.json');

// Utility functions
async function ensureVotesFile() {
  try {
    await fs.access(VOTES_FILE);
  } catch {
    await fs.writeFile(VOTES_FILE, '{}');
  }
}

async function loadVotes() {
  try {
    await ensureVotesFile();
    const data = await fs.readFile(VOTES_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function saveVotes(votes) {
  await fs.writeFile(VOTES_FILE, JSON.stringify(votes, null, 2));
}

function getVoteCounts(votes) {
  const counts = {};
  DESTINATIONS.forEach(dest => counts[dest] = 0);
  
  Object.values(votes).forEach(destinations => {
    destinations.forEach(dest => {
      if (counts.hasOwnProperty(dest)) {
        counts[dest]++;
      }
    });
  });
  
  return counts;
}

// POST /api/votes - Submit a vote
router.post('/', async (req, res) => {
  try {
    const { email, destinations } = req.body;
    
    if (!email || !destinations || destinations.length !== 4) {
      return res.status(400).json({ 
        error: 'Must provide email and exactly 4 destinations' 
      });
    }
    
    // Validate destinations
    for (const dest of destinations) {
      if (!DESTINATIONS.includes(dest)) {
        return res.status(400).json({ 
          error: `Invalid destination: ${dest}` 
        });
      }
    }
    
    const votes = await loadVotes();
    const emailKey = email.toLowerCase().trim();
    
    if (votes[emailKey]) {
      return res.status(400).json({ 
        error: 'Email has already voted' 
      });
    }
    
    votes[emailKey] = destinations;
    await saveVotes(votes);
    
    res.json({ 
      success: true, 
      message: 'Vote submitted successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit vote' });
  }
});

// GET /api/votes/results - Get voting results
router.get('/results', async (req, res) => {
  try {
    const votes = await loadVotes();
    const counts = getVoteCounts(votes);
    
    // Sort by vote count (descending) then alphabetically
    const sortedVotes = Object.entries(counts)
      .sort(([a, countA], [b, countB]) => {
        if (countB !== countA) return countB - countA;
        return a.localeCompare(b);
      });
    
    const labels = sortedVotes.map(([dest]) => dest);
    const voteCounts = sortedVotes.map(([, count]) => count);
    
    // Identify top 4 winners and ties
    const top4 = sortedVotes.slice(0, 4);
    const winners = top4.map(([dest]) => dest);
    
    // Check for ties at 4th position
    const fourthPlaceVotes = top4[3] ? top4[3][1] : 0;
    const tiedDestinations = sortedVotes
      .filter(([, count]) => count === fourthPlaceVotes && count > 0)
      .map(([dest]) => dest);
    
    let tieInfo = null;
    if (tiedDestinations.length > 1 && fourthPlaceVotes > 0) {
      const tiedOutside = tiedDestinations.filter(dest => !winners.includes(dest));
      if (tiedOutside.length > 0) {
        tieInfo = {
          fourthPlaceVotes,
          tiedDestinations,
          winners,
          tiedOutside
        };
      }
    }
    
    res.json({
      labels,
      counts: voteCounts,
      winners,
      tieInfo,
      totalVotes: Object.keys(votes).length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get results' });
  }
});

// GET /api/votes/check/:email - Check if email has voted
router.get('/check/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const votes = await loadVotes();
    const emailKey = email.toLowerCase().trim();
    
    if (votes[emailKey]) {
      res.json({
        hasVoted: true,
        destinations: votes[emailKey]
      });
    } else {
      res.json({
        hasVoted: false
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to check vote' });
  }
});

// DELETE /api/votes/:email - Delete a vote
router.delete('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const votes = await loadVotes();
    const emailKey = email.toLowerCase().trim();
    
    if (!votes[emailKey]) {
      return res.status(404).json({ 
        error: 'No vote found for this email' 
      });
    }
    
    delete votes[emailKey];
    await saveVotes(votes);
    
    res.json({ 
      success: true, 
      message: 'Vote deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete vote' });
  }
});

module.exports = router;