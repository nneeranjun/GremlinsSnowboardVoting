import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import './SwipePage.css';

const SwipePage = () => {
  const [destinations, setDestinations] = useState([]);
  const [maps, setMaps] = useState({});
  const [descriptions, setDescriptions] = useState({});
  const [difficulty, setDifficulty] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState(null);

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      const response = await axios.get('/api/destinations');
      const { destinations, maps, descriptions, difficulty } = response.data;
      
      setDestinations(destinations);
      setMaps(maps);
      setDescriptions(descriptions);
      setDifficulty(difficulty);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching destinations:', error);
      setLoading(false);
    }
  };

  const handleSwipe = async (direction) => {
    if (currentIndex >= destinations.length) return;

    const destination = destinations[currentIndex];
    const action = direction === 'right' ? 'like' : 'dislike';

    setSwipeDirection(direction);

    try {
      await axios.post('/api/swipe', {
        destination,
        action
      });
    } catch (error) {
      console.error('Error recording swipe:', error);
    }

    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setSwipeDirection(null);
    }, 300);
  };

  const getAverageDifficulty = (destination) => {
    const resorts = Object.keys(difficulty[destination] || {});
    if (resorts.length === 0) return 0;
    
    const total = resorts.reduce((sum, resort) => 
      sum + (difficulty[destination][resort] || 0), 0);
    return Math.round(total / resorts.length);
  };

  const getRegion = (destination) => {
    if (['Switzerland', 'France', 'Italy'].includes(destination)) return 'Europe';
    if (destination === 'Western Canada') return 'Canada';
    return 'US';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading destinations...</p>
      </div>
    );
  }

  const currentDestination = destinations[currentIndex];
  const isComplete = currentIndex >= destinations.length;

  return (
    <div className="swipe-page">
      <div className="swipe-container">
        <div className="header">
          <h1>🏔️ Mountain Matcher</h1>
          <p>Swipe right to like, left to pass</p>
        </div>

        {!isComplete ? (
          <div className="card-stack">
            <AnimatePresence>
              {currentDestination && (
                <motion.div
                  key={currentIndex}
                  className="mountain-card"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{
                    x: swipeDirection === 'right' ? 300 : -300,
                    rotate: swipeDirection === 'right' ? 30 : -30,
                    opacity: 0
                  }}
                  transition={{ duration: 0.3 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(event, info) => {
                    if (Math.abs(info.offset.x) > 100) {
                      handleSwipe(info.offset.x > 0 ? 'right' : 'left');
                    }
                  }}
                >
                  <div className="swipe-indicators">
                    <div className="swipe-indicator like">❤️</div>
                    <div className="swipe-indicator dislike">✖️</div>
                  </div>

                  {/* Card Image */}
                  <div className="card-image">
                    {maps[currentDestination] && (
                      <img
                        src={Object.values(maps[currentDestination])[0]}
                        alt={`${currentDestination} Trail Map`}
                      />
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="card-content">
                    <div className="destination-name">{currentDestination}</div>
                    
                    <div className="resort-list">
                      <strong>Resorts:</strong> {Object.keys(maps[currentDestination] || {}).join(', ')}
                    </div>

                    <div className="description">
                      {Object.entries(descriptions[currentDestination] || {}).map(([resort, features]) => (
                        <div key={resort} className="resort-description">
                          <strong>{resort}:</strong>
                          <ul>
                            {features.slice(0, 2).map((feature, index) => (
                              <li key={index}>{feature}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    <div className="stats-grid">
                      <div className="stat-item">
                        <span className="stat-value">{Object.keys(maps[currentDestination] || {}).length}</span>
                        <span className="stat-label">Resorts</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value difficulty-stars">
                          {'★'.repeat(getAverageDifficulty(currentDestination))}
                          {'☆'.repeat(5 - getAverageDifficulty(currentDestination))}
                        </span>
                        <span className="stat-label">Difficulty</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">Ikon Pass</span>
                        <span className="stat-label">Access</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">{getRegion(currentDestination)}</span>
                        <span className="stat-label">Region</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="completion-message">
            <h2>🎿 All Done!</h2>
            <p>You've swiped through all destinations.</p>
            <button 
              onClick={() => {
                setCurrentIndex(0);
                setSwipeDirection(null);
              }}
              className="restart-button"
            >
              Start Over
            </button>
          </div>
        )}

        {!isComplete && (
          <div className="action-buttons">
            <button 
              className="action-btn dislike-btn"
              onClick={() => handleSwipe('left')}
            >
              ✖️
            </button>
            <button 
              className="action-btn like-btn"
              onClick={() => handleSwipe('right')}
            >
              ❤️
            </button>
          </div>
        )}

        <div className="progress-indicator">
          {currentIndex + 1} / {destinations.length}
        </div>
      </div>
    </div>
  );
};

export default SwipePage;