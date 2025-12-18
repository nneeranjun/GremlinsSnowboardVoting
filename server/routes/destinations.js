const express = require('express');
const router = express.Router();
const { DESTINATIONS, MAPS, DESCRIPTIONS, DIFFICULTY } = require('../data/destinations');

// GET /api/destinations - Get all destinations with data
router.get('/', (req, res) => {
  try {
    // Shuffle destinations for random order
    const shuffledDestinations = [...DESTINATIONS].sort(() => Math.random() - 0.5);
    
    res.json({
      destinations: shuffledDestinations,
      maps: MAPS,
      descriptions: DESCRIPTIONS,
      difficulty: DIFFICULTY
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch destinations' });
  }
});

// GET /api/destinations/:name - Get specific destination
router.get('/:name', (req, res) => {
  try {
    const { name } = req.params;
    
    if (!DESTINATIONS.includes(name)) {
      return res.status(404).json({ error: 'Destination not found' });
    }
    
    res.json({
      name,
      maps: MAPS[name],
      descriptions: DESCRIPTIONS[name],
      difficulty: DIFFICULTY[name]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch destination' });
  }
});

module.exports = router;