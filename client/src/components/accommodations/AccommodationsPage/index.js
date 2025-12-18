import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import './AccommodationsPage.css';

const AccommodationsPage = () => {
  const [destinations, setDestinations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState('Utah');
  const [groupSize, setGroupSize] = useState(4);
  const [accommodations, setAccommodations] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState(null);

  useEffect(() => {
    fetchDestinations();
  }, []);

  useEffect(() => {
    if (destinations.length > 0) {
      fetchAccommodations();
    }
  }, [selectedDestination, groupSize, destinations]);

  const fetchDestinations = async () => {
    try {
      const response = await axios.get('/api/destinations');
      setDestinations(response.data.destinations);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching destinations:', error);
      setLoading(false);
    }
  };

  const fetchAccommodations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/accommodations', {
        params: {
          destination: selectedDestination,
          groupSize: groupSize
        }
      });
      setAccommodations(response.data.accommodations);
      setCurrentIndex(0);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching accommodations:', error);
      setLoading(false);
    }
  };

  const handleSwipe = async (direction) => {
    if (currentIndex >= accommodations.length) return;

    const accommodation = accommodations[currentIndex];
    const action = direction === 'right' ? 'like' : 'dislike';

    setSwipeDirection(direction);

    try {
      await axios.post('/api/accommodations/swipe', {
        accommodationId: accommodation.id,
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

  const getAmenityIcon = (amenity) => {
    const icons = {
      hot_tub: '🛁',
      ski_storage: '🎿',
      fireplace: '🔥',
      kitchen: '🍳',
      wifi: '📶',
      parking: '🚗',
      washer_dryer: '🧺',
      mountain_view: '🏔️',
      shuttle_service: '🚌'
    };
    return icons[amenity] || '✨';
  };

  const getAmenityLabel = (amenity) => {
    return amenity.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading accommodations...</p>
      </div>
    );
  }

  const currentAccommodation = accommodations[currentIndex];
  const isComplete = currentIndex >= accommodations.length;

  return (
    <div className="accommodations-page">
      <div className="accommodations-container">
        <div className="header">
          <h1>🏠 Stay Finder</h1>
          <p>Find the perfect accommodation for your ski trip</p>
        </div>

        {/* Destination Selector */}
        <div className="destination-selector">
          <div className="selector-row">
            <div className="selector-group">
              <label>Destination</label>
              <select 
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
              >
                {destinations.map(dest => (
                  <option key={dest} value={dest}>{dest}</option>
                ))}
              </select>
            </div>
            <div className="selector-group">
              <label>Group Size</label>
              <input
                type="number"
                min="1"
                max="12"
                value={groupSize}
                onChange={(e) => setGroupSize(parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>

        {!isComplete && accommodations.length > 0 ? (
          <div className="card-stack">
            <AnimatePresence>
              {currentAccommodation && (
                <motion.div
                  key={currentIndex}
                  className="accommodation-card"
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

                  {/* Card Image with Badges */}
                  <div className="card-image">
                    <img
                      src={currentAccommodation.image}
                      alt={currentAccommodation.name}
                    />
                    <div className="price-badge">
                      ${currentAccommodation.pricePerNight}/night
                    </div>
                    <div className="ranking-badge">
                      Score: {currentAccommodation.rankingScore}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="card-content">
                    <div className="accommodation-name">{currentAccommodation.name}</div>
                    <div className="accommodation-type">{currentAccommodation.type}</div>

                    <div className="rating-distance">
                      <div className="rating">
                        {'⭐'.repeat(Math.floor(currentAccommodation.rating))} {currentAccommodation.rating}
                      </div>
                      <div className="distance">
                        {currentAccommodation.distanceToMountain} mi to slopes
                      </div>
                    </div>

                    <div className="description">
                      {currentAccommodation.description}
                    </div>

                    <div className="stats-row">
                      <div className="stat-item">
                        <span className="stat-value">${currentAccommodation.pricePerPerson}</span>
                        <span className="stat-label">per person</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">{currentAccommodation.beds}</span>
                        <span className="stat-label">beds</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">{currentAccommodation.bathrooms}</span>
                        <span className="stat-label">baths</span>
                      </div>
                    </div>

                    <div className="amenities">
                      <div className="amenities-title">Amenities</div>
                      <div className="amenity-tags">
                        {currentAccommodation.amenities?.map(amenity => (
                          <span 
                            key={amenity}
                            className={`amenity-tag ${['hot_tub', 'ski_storage', 'shuttle_service'].includes(amenity) ? 'premium' : ''}`}
                          >
                            {getAmenityIcon(amenity)} {getAmenityLabel(amenity)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="completion-message">
            {accommodations.length === 0 ? (
              <>
                <h2>🏠 No Accommodations</h2>
                <p>No accommodations available for {selectedDestination} yet.</p>
                <button 
                  onClick={() => setSelectedDestination(destinations[0])}
                  className="restart-button"
                >
                  Try Another Destination
                </button>
              </>
            ) : (
              <>
                <h2>🏠 All Done!</h2>
                <p>You've swiped through all accommodations for {selectedDestination}.</p>
                <button 
                  onClick={() => {
                    setCurrentIndex(0);
                    setSwipeDirection(null);
                  }}
                  className="restart-button"
                >
                  Start Over
                </button>
              </>
            )}
          </div>
        )}

        {!isComplete && accommodations.length > 0 && (
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

        {accommodations.length > 0 && (
          <div className="progress-indicator">
            {Math.min(currentIndex + 1, accommodations.length)} / {accommodations.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccommodationsPage;