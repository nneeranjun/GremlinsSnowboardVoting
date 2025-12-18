const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const SWIPES_FILE = path.join(__dirname, '../../swipes.json');

// Utility functions
async function ensureSwipesFile() {
  try {
    await fs.access(SWIPES_FILE);
  } catch {
    await fs.writeFile(SWIPES_FILE, '{}');
  }
}

async function loadSwipes() {
  try {
    await ensureSwipesFile();
    const data = await fs.readFile(SWIPES_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function saveSwipes(swipes) {
  await fs.writeFile(SWIPES_FILE, JSON.stringify(swipes, null, 2));
}

// POST /api/swipe - Record a swipe action
router.post('/', async (req, res) => {
  try {
    const { destination, action } = req.body;
    
    if (!destination || !action || !['like', 'dislike'].includes(action)) {
      return res.status(400).json({ 
        error: 'Must provide destination and action (like/dislike)' 
      });
    }
    
    const swipes = await loadSwipes();
    
    if (!swipes[destination]) {
      swipes[destination] = { likes: 0, dislikes: 0 };
    }
    
    swipes[destination][action + 's']++;
    await saveSwipes(swipes);
    
    res.json({ 
      success: true,
      destination,
      action,
      totals: swipes[destination]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record swipe' });
  }
});

// GET /api/swipe/stats - Get swipe statistics
router.get('/stats', async (req, res) => {
  try {
    const swipes = await loadSwipes();
    
    // Calculate totals and percentages
    const stats = Object.entries(swipes).map(([destination, data]) => {
      const total = data.likes + data.dislikes;
      const likePercentage = total > 0 ? Math.round((data.likes / total) * 100) : 0;
      
      return {
        destination,
        likes: data.likes,
        dislikes: data.dislikes,
        total,
        likePercentage
      };
    });
    
    // Sort by like percentage
    stats.sort((a, b) => b.likePercentage - a.likePercentage);
    
    res.json({ stats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get swipe stats' });
  }
});

module.exports = router;