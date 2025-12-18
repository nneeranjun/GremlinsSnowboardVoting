const DESTINATIONS = ["Utah", "Colorado", "Northern Rockies", "Western Canada", "California", "Washington", "New Mexico", "Switzerland", "France", "Italy"];

const MAPS = {
  "Utah": {
    "Snowbird": "https://cms.snowbird.com/sites/default/files/2025-11/snowbird_trailmap_winter_2526.jpg?_gl=1*wp6j9e*_gcl_au*MTMzMTQwMjAyLjE3NjU0ODIzNTU.*_ga*MTU0MDE3MzY3My4xNzY1NDgyMzU1*_ga_04V018XZ18*czE3NjU0ODY5ODMkbzIkZzAkdDE3NjU0ODY5ODMkajYwJGwwJGgyNDQ3ODQxMjM.",
    "Snowbasin": "https://www.snowbasin.com/-/media/snowbasin/images/maps/winter-trail-maps/snowbasin-trail-map-2024-25.jpg",
    "Solitude": "https://assets.simpleviewinc.com/simpleview/image/upload/c_limit,h_1200,q_75,w_1200/v1/clients/saltlake/Solitude_Mountain_Resort_Trail_Map_Low_Res__96ac2e62-6582-4b39-acfd-d5adb008fa36.jpg"
  },
  "Colorado": {
    "Arapahoe Basin": "https://www.arapahoebasin.com/-/media/arapahoe-basin/images/maps/winter-trail-maps/arapahoe-basin-trail-map-2024-25.jpg",
    "Copper Mountain": "https://www.coppercolorado.com/-/media/copper/images/maps/winter-trail-maps/copper-mountain-trail-map-2024-25.jpg",
    "Steamboat": "https://www.steamboat.com/-/media/steamboat/images/maps/winter-trail-maps/steamboat-trail-map-2024-25.jpg"
  },
  "Northern Rockies": {
    "Jackson Hole": "https://www.jacksonhole.com/-/media/jackson-hole/images/maps/winter-trail-maps/jackson-hole-trail-map-2024-25.jpg",
    "Big Sky": "https://www.skiresort.info/fileadmin/_processed_/e4/4f/fb/be/a716a55471.jpg",
    "Grand Targhee": "https://www.grandtarghee.com/-/media/grand-targhee/images/maps/winter-trail-maps/grand-targhee-trail-map-2024-25.jpg"
  },
  "Western Canada": {
    "Banff Sunshine Village": "https://www.skibanff.com/wp-content/uploads/2023/11/Sunshine-Village-Trail-Map-2023-24.jpg",
    "Lake Louise": "https://www.skilouise.com/-/media/skilouise/images/maps/winter-trail-maps/lake-louise-trail-map-2024-25.jpg",
    "Revelstoke": "https://www.revelstokemountainresort.com/-/media/revelstoke/images/maps/winter-trail-maps/revelstoke-trail-map-2024-25.jpg"
  },
  "California": {
    "Mammoth": "https://www.mammothsnowman.com/wp-content/uploads/2021/07/trail_map_mammoth_mountain_ski_area.png",
    "Palisades Tahoe": "https://www.skiresort.info/fileadmin/_processed_/ac/cf/f2/2d/5cfa6e12e2.jpg",
    "June Mountain": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSr6wkfnFc5u_PCNVAVcwuRcymtGH-neZIhaw&s"
  },
  "Washington": {
    "Crystal Mountain": "https://www.crystalmountainresort.com/-/media/crystal/images/2425-images/maps/winter-2425-trail-map.jpg?rev=83c9b17778bb478784f25cebe85544de"
  },
  "New Mexico": {
    "Taos Ski Valley": "https://tacky-rare-back.media.strapiapp.com/TSV_Trail_Map_Winter24_4fe0864dee.jpg"
  },
  "Switzerland": {
    "Zermatt Matterhorn": "https://www.snow-forecast.com/pistemaps/Zermatt_pistemap.jpg?1601557093"
  },
  "France": {
    "Chamonix Mont-Blanc": "https://www.chamonix.net/sites/default/files/nodeimages/chamonix-piste-map.jpg"
  },
  "Italy": {
    "Dolomiti Superski": "https://www.dolomitisuperski.com/content/dam/dolomitisuperski/maps/winter/dolomiti-superski-map-winter.jpg",
    "Courmayeur Mont Blanc": "https://www.courmayeur-montblanc.com/sites/default/files/2023-11/courmayeur-piste-map-2023-24.jpg",
    "Cervino Ski Paradise": "https://www.cervinia.it/sites/default/files/2023-11/cervinia-piste-map-2023-24.jpg"
  }
};

const DESCRIPTIONS = {
  "Utah": {
    "Snowbird": [
      "Steep big-mountain freeride with massive bowls and fall-line terrain",
      "Deep Utah powder and extremely playful natural features",
      "Tram access to high alpine zones ideal for technical riders"
    ],
    "Snowbasin": [
      "Wide-open bowls and perfectly groomed runs",
      "Incredible views and less crowded than other Utah resorts",
      "Great mix of terrain from beginner to expert"
    ],
    "Solitude": [
      "Underrated powder gem with incredible tree riding",
      "Tons of playful natural hits and low crowds",
      "Relaxed, peaceful apres vibe"
    ]
  },
  "Colorado": {
    "Arapahoe Basin": [
      "Legendary high-alpine terrain above treeline",
      "Steep bowls and chutes with incredible snow quality",
      "Longest season in Colorado, skiing into July"
    ],
    "Copper Mountain": [
      "Naturally divided terrain perfect for all skill levels",
      "Consistent snowfall and varied terrain features",
      "Great terrain parks and family-friendly atmosphere"
    ],
    "Steamboat": [
      "Famous Champagne Powder and tree skiing",
      "Authentic western town with cowboy culture",
      "Consistent snowfall and varied terrain for all levels"
    ]
  },
  "Northern Rockies": {
    "Jackson Hole": [
      "Legendary steep terrain including Corbet's Couloir",
      "Deep Jackson Hole powder and massive vertical",
      "Wild West town with authentic mountain culture"
    ],
    "Big Sky": [
      "Massive freeride terrain with bowls, couloirs, and huge vertical",
      "Lone Peak Tram gives access to extreme terrain",
      "Tons of natural features and minimal crowds"
    ],
    "Grand Targhee": [
      "Legendary powder skiing with 500+ inches annually",
      "Incredible tree skiing and natural features",
      "Laid-back vibe with focus on pure skiing"
    ]
  },
  "Western Canada": {
    "Banff Sunshine Village": [
      "High-alpine terrain above treeline with incredible views",
      "Champagne powder and natural halfpipes", 
      "Delirium Dive offers extreme inbounds terrain",
      "Part of SkiBig3 with Lake Louise access"
    ],
    "Lake Louise": [
      "Massive front-side bowls with endless fall-line skiing", 
      "Back bowls offer deep powder and natural features",
      "Breathtaking Canadian Rockies scenery and wildlife",
      "Part of SkiBig3 with Sunshine Village access"
    ],
    "Revelstoke": [
      "Legendary deep powder with 40+ feet annual snowfall",
      "Massive 5,620 ft vertical - one of North America's biggest",
      "Cat skiing and heli-skiing access from the resort",
      "Epic tree skiing and natural features in the Selkirk Mountains"
    ]
  },
  "California": {
    "Mammoth": [
      "Huge volcanic terrain with natural halfpipes and long faces",
      "World-class terrain parks and long season",
      "Great spring riding and vibrant nightlife"
    ],
    "Palisades Tahoe": [
      "Iconic steeps, chutes, cliffs, and freeride terrain",
      "Deep Sierra storms and playful natural features",
      "Lake Tahoe setting with lively apres scene"
    ],
    "June Mountain": [
      "Quiet, scenic, and uncrowded complement to Mammoth",
      "Great storm-day laps and smooth cruisers",
      "Family-friendly with stunning Eastern Sierra views"
    ]
  },
  "Washington": {
    "Crystal Mountain": [
      "Deep PNW storm cycles with playful freeride zones",
      "Natural halfpipes, cliffs, bowls, and rolling terrain",
      "Incredible Mt. Rainier views on bluebird days",
      "Apres is mellow — storm chasing is the focus"
    ]
  },
  "New Mexico": {
    "Taos Ski Valley": [
      "Steep, technical terrain with ridge hikes and spicy chutes",
      "Tons of natural features and creative freeride lines",
      "Unique southwestern culture and relaxed nightlife",
      "One of the most advanced rider-focused mountains in North America"
    ]
  },
  "Switzerland": {
    "Zermatt Matterhorn": [
      "High-alpine glacier skiing with iconic Matterhorn views",
      "Year-round skiing on Theodul Glacier",
      "Connected to Cervinia, Italy for massive ski area",
      "Luxury alpine village with world-class dining"
    ]
  },
  "France": {
    "Chamonix Mont-Blanc": [
      "Birthplace of extreme skiing with legendary off-piste",
      "Vallée Blanche glacier runs and Aiguille du Midi access",
      "Historic alpine town with vibrant après-ski culture",
      "Multiple ski areas including Grands Montets and Brévent"
    ]
  },
  "Italy": {
    "Dolomiti Superski": [
      "World's largest ski area with 1,200km of pistes",
      "Stunning UNESCO World Heritage Dolomites scenery",
      "Incredible Italian cuisine and mountain huts",
      "12 interconnected ski areas in one pass"
    ],
    "Courmayeur Mont Blanc": [
      "Authentic Italian alpine charm at base of Mont Blanc",
      "Incredible off-piste skiing and mountain cuisine",
      "Connected to Chamonix via Vallée Blanche",
      "Traditional mountain village atmosphere"
    ],
    "Cervino Ski Paradise": [
      "Connected to Zermatt for massive international ski area",
      "High-altitude glacier skiing with reliable snow",
      "Italian Matterhorn views and excellent cuisine",
      "Summer glacier skiing available"
    ]
  }
};

const DIFFICULTY = {
  "Utah": {
    "Snowbird": 5,
    "Snowbasin": 4,
    "Solitude": 4
  },
  "Colorado": {
    "Arapahoe Basin": 5,
    "Copper Mountain": 3,
    "Steamboat": 4
  },
  "Northern Rockies": {
    "Jackson Hole": 5,
    "Big Sky": 5,
    "Grand Targhee": 4
  },
  "Western Canada": {
    "Banff Sunshine Village": 4,
    "Lake Louise": 3,
    "Revelstoke": 5
  },
  "California": {
    "Mammoth": 3,
    "Palisades Tahoe": 5,
    "June Mountain": 2
  },
  "Washington": {
    "Crystal Mountain": 4
  },
  "New Mexico": {
    "Taos Ski Valley": 5
  },
  "Switzerland": {
    "Zermatt Matterhorn": 4
  },
  "France": {
    "Chamonix Mont-Blanc": 5
  },
  "Italy": {
    "Dolomiti Superski": 3,
    "Courmayeur Mont Blanc": 4,
    "Cervino Ski Paradise": 4
  }
};

module.exports = {
  DESTINATIONS,
  MAPS,
  DESCRIPTIONS,
  DIFFICULTY
};