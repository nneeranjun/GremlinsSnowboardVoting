const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

const ACCOMMODATION_SWIPES_FILE = path.join(__dirname, '../../accommodation_swipes.json');

// Sample accommodation data (fallback)
const SAMPLE_ACCOMMODATIONS = {
  "Utah": [
    {
      id: "utah_1",
      name: "Cozy Ski Chalet near Snowbird",
      type: "Airbnb",
      pricePerNight: 280,
      beds: 3,
      bathrooms: 2,
      distanceToMountain: 0.8,
      rating: 4.8,
      amenities: ["hot_tub", "ski_storage", "fireplace", "kitchen", "wifi", "parking"],
      image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=500",
      description: "Beautiful mountain chalet with stunning views, perfect for ski groups."
    },
    {
      id: "utah_2",
      name: "Luxury Condo - Solitude Village",
      type: "Airbnb",
      pricePerNight: 450,
      beds: 4,
      bathrooms: 3,
      distanceToMountain: 0.2,
      rating: 4.9,
      amenities: ["hot_tub", "ski_storage", "kitchen", "wifi", "parking", "mountain_view"],
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500",
      description: "Ski-in/ski-out luxury condo with premium amenities and mountain views."
    }
  ],
  "Colorado": [
    {
      id: "colorado_1",
      name: "Steamboat Springs Townhouse",
      type: "Airbnb",
      pricePerNight: 380,
      beds: 4,
      bathrooms: 3,
      distanceToMountain: 1.2,
      rating: 4.7,
      amenities: ["hot_tub", "ski_storage", "fireplace", "kitchen", "wifi", "parking", "washer_dryer"],
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
      description: "Spacious townhouse with hot tub, perfect for groups visiting Steamboat."
    }
  ]
};

// Destination coordinates for API calls
const DESTINATION_COORDINATES = {
  "Utah": { lat: 40.5621, lng: -111.6413, city: "Salt Lake City" },
  "Colorado": { lat: 39.6403, lng: -106.3742, city: "Vail" },
  "Northern Rockies": { lat: 43.5816, lng: -110.8281, city: "Jackson" },
  "Western Canada": { lat: 51.1784, lng: -115.5708, city: "Banff" },
  "California": { lat: 37.6308, lng: -118.9717, city: "Mammoth Lakes" },
  "Washington": { lat: 47.0379, lng: -121.5131, city: "Crystal Mountain" },
  "New Mexico": { lat: 36.5945, lng: -105.4467, city: "Taos" },
  "Switzerland": { lat: 46.0207, lng: 7.7491, city: "Zermatt" },
  "France": { lat: 45.9237, lng: 6.8694, city: "Chamonix" },
  "Italy": { lat: 46.5197, lng: 11.2568, city: "Bolzano" }
};

// Utility functions
async function ensureAccommodationSwipesFile() {
  try {
    await fs.access(ACCOMMODATION_SWIPES_FILE);
  } catch {
    await fs.writeFile(ACCOMMODATION_SWIPES_FILE, '{}');
  }
}

async function loadAccommodationSwipes() {
  try {
    await ensureAccommodationSwipesFile();
    const data = await fs.readFile(ACCOMMODATION_SWIPES_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function saveAccommodationSwipes(swipes) {
  await fs.writeFile(ACCOMMODATION_SWIPES_FILE, JSON.stringify(swipes, null, 2));
}

function calculateAccommodationScore(accommodation, groupSize) {
  let score = 100;
  
  // Distance factor
  const distance = accommodation.distanceToMountain;
  if (distance <= 1) score += 30;
  else if (distance <= 3) score += 20;
  else if (distance <= 5) score += 10;
  else if (distance <= 10) score += 5;
  else score -= 10;
  
  // Price per person factor
  const pricePerPerson = accommodation.pricePerNight / groupSize;
  if (pricePerPerson <= 50) score += 25;
  else if (pricePerPerson <= 100) score += 15;
  else if (pricePerPerson <= 150) score += 5;
  else if (pricePerPerson <= 200) score -= 5;
  else score -= 15;
  
  // Bed capacity factor
  const beds = accommodation.beds;
  if (beds >= groupSize) score += 20;
  else if (beds >= groupSize - 1) score += 10;
  else if (beds >= groupSize - 2) score += 5;
  else score -= 10;
  
  // Amenities bonus
  const amenityBonus = {
    hot_tub: 15, ski_storage: 10, fireplace: 8, kitchen: 12,
    wifi: 5, parking: 8, washer_dryer: 6, mountain_view: 10, shuttle_service: 12
  };
  
  accommodation.amenities?.forEach(amenity => {
    score += amenityBonus[amenity] || 0;
  });
  
  // Rating bonus
  score += (accommodation.rating || 0) * 5;
  
  return Math.round(score * 10) / 10;
}

async function fetchLiveAccommodations(destination, groupSize) {
  const coordinates = DESTINATION_COORDINATES[destination];
  if (!coordinates || !process.env.RAPIDAPI_KEY) {
    return null;
  }
  
  try {
    // This would call real APIs like Booking.com
    // For now, return sample data with some variation
    const sampleData = SAMPLE_ACCOMMODATIONS[destination] || [];
    return sampleData.map(acc => ({
      ...acc,
      pricePerNight: acc.pricePerNight + Math.floor(Math.random() * 100) - 50 // Add some price variation
    }));
  } catch (error) {
    console.error('Error fetching live accommodations:', error);
    return null;
  }
}

// GET /api/accommodations - Get accommodations for destination
router.get('/', async (req, res) => {
  try {
    const { destination = 'Utah', groupSize = 4 } = req.query;
    const groupSizeNum = parseInt(groupSize);
    
    // Try to get live data first, fallback to sample data
    let accommodations = await fetchLiveAccommodations(destination, groupSizeNum);
    
    if (!accommodations) {
      accommodations = SAMPLE_ACCOMMODATIONS[destination] || [];
    }
    
    // Calculate ranking scores
    accommodations = accommodations.map(acc => ({
      ...acc,
      rankingScore: calculateAccommodationScore(acc, groupSizeNum),
      pricePerPerson: Math.round(acc.pricePerNight / groupSizeNum)
    }));
    
    // Sort by ranking score
    accommodations.sort((a, b) => b.rankingScore - a.rankingScore);
    
    res.json({
      destination,
      groupSize: groupSizeNum,
      accommodations
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch accommodations' });
  }
});

// POST /api/accommodations/swipe - Record accommodation swipe
router.post('/swipe', async (req, res) => {
  try {
    const { accommodationId, action } = req.body;
    
    if (!accommodationId || !action || !['like', 'dislike'].includes(action)) {
      return res.status(400).json({ 
        error: 'Must provide accommodationId and action (like/dislike)' 
      });
    }
    
    const swipes = await loadAccommodationSwipes();
    
    if (!swipes[accommodationId]) {
      swipes[accommodationId] = { likes: 0, dislikes: 0 };
    }
    
    swipes[accommodationId][action + 's']++;
    await saveAccommodationSwipes(swipes);
    
    res.json({ 
      success: true,
      accommodationId,
      action,
      totals: swipes[accommodationId]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record accommodation swipe' });
  }
});

// GET /api/accommodations/swipe/stats - Get accommodation swipe stats
router.get('/swipe/stats', async (req, res) => {
  try {
    const swipes = await loadAccommodationSwipes();
    
    const stats = Object.entries(swipes).map(([accommodationId, data]) => {
      const total = data.likes + data.dislikes;
      const likePercentage = total > 0 ? Math.round((data.likes / total) * 100) : 0;
      
      return {
        accommodationId,
        likes: data.likes,
        dislikes: data.dislikes,
        total,
        likePercentage
      };
    });
    
    stats.sort((a, b) => b.likePercentage - a.likePercentage);
    
    res.json({ stats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get accommodation swipe stats' });
  }
});

module.exports = router;