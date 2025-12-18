import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import './AccommodationSubmissionPage.css';

const AccommodationSubmissionPage = () => {
  const [destinations, setDestinations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState('Utah');
  const [groupSize, setGroupSize] = useState(4);
  const [accommodations, setAccommodations] = useState([]);
  const [selectedAccommodations, setSelectedAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [customName, setCustomName] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

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
      setSelectedAccommodations([]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching accommodations:', error);
      setLoading(false);
    }
  };

  const handleAccommodationSelect = (accommodation) => {
    if (selectedAccommodations.find(acc => acc.id === accommodation.id)) {
      // Deselect
      setSelectedAccommodations(prev => 
        prev.filter(acc => acc.id !== accommodation.id)
      );
    } else if (selectedAccommodations.length < 3) {
      // Select
      setSelectedAccommodations(prev => [...prev, accommodation]);
    }
  };

  const handleCustomSubmit = () => {
    if (!customUrl.trim()) return;
    
    const customAccommodation = {
      id: `custom_${Date.now()}`,
      name: customName.trim() || 'Custom Accommodation',
      type: 'Custom',
      url: customUrl.trim(),
      pricePerNight: 0,
      beds: 0,
      bathrooms: 0,
      distanceToMountain: 0,
      rating: 0,
      amenities: [],
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500',
      description: 'Custom accommodation added by user',
      rankingScore: 0,
      pricePerPerson: 0,
      isCustom: true
    };

    if (selectedAccommodations.length < 3) {
      setSelectedAccommodations(prev => [...prev, customAccommodation]);
      setCustomUrl('');
      setCustomName('');
      setShowCustomForm(false);
    }
  };

  const handleSubmit = () => {
    if (selectedAccommodations.length === 3) {
      setShowConfirmation(true);
    }
  };

  const confirmSubmission = async () => {
    try {
      await axios.post('/api/tournament/submissions', {
        destination: selectedDestination,
        groupSize,
        accommodations: selectedAccommodations
      });
      
      // Navigate to tournament page or show success
      alert('Submissions successful! Tournament will begin once everyone submits.');
      setShowConfirmation(false);
      setSelectedAccommodations([]);
    } catch (error) {
      console.error('Error submitting accommodations:', error);
      alert('Error submitting accommodations. Please try again.');
    }
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

  if (showConfirmation) {
    return (
      <div className="submission-page">
        <div className="confirmation-container">
          <h1>🏆 Confirm Your Tournament Submissions</h1>
          <p>You've selected these 3 accommodations for the tournament:</p>
          
          <div className="confirmation-cards">
            {selectedAccommodations.map((acc, index) => (
              <div key={acc.id} className="confirmation-card">
                <div className="confirmation-number">#{index + 1}</div>
                <img src={acc.image} alt={acc.name} />
                <div className="confirmation-details">
                  <h3>{acc.name}</h3>
                  <p className="confirmation-type">{acc.type}</p>
                  {!acc.isCustom && (
                    <>
                      <p className="confirmation-price">${acc.pricePerNight}/night (${acc.pricePerPerson}/person)</p>
                      <p className="confirmation-rating">⭐ {acc.rating} • {acc.distanceToMountain} mi to slopes</p>
                    </>
                  )}
                  {acc.isCustom && (
                    <p className="confirmation-custom">Custom URL: {acc.url}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="confirmation-actions">
            <button 
              className="back-button"
              onClick={() => setShowConfirmation(false)}
            >
              ← Edit Selections
            </button>
            <button 
              className="confirm-button"
              onClick={confirmSubmission}
            >
              Confirm & Submit to Tournament
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="submission-page">
      <div className="submission-container">
        <div className="header">
          <h1>🏆 Tournament Submissions</h1>
          <p>Select exactly 3 accommodations for the tournament</p>
          <div className="selection-counter">
            {selectedAccommodations.length}/3 selected
          </div>
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

        {/* Accommodations Grid */}
        <div className="accommodations-grid">
          {/* Regular accommodations */}
          {accommodations.map((accommodation) => {
            const isSelected = selectedAccommodations.find(acc => acc.id === accommodation.id);
            const canSelect = selectedAccommodations.length < 3 || isSelected;
            
            return (
              <motion.div
                key={accommodation.id}
                className={`accommodation-card ${isSelected ? 'selected' : ''} ${!canSelect ? 'disabled' : ''}`}
                whileHover={canSelect ? { scale: 1.02 } : {}}
                whileTap={canSelect ? { scale: 0.98 } : {}}
                onClick={() => canSelect && handleAccommodationSelect(accommodation)}
              >
                {isSelected && <div className="selection-badge">✓</div>}
                
                <div className="card-image">
                  <img src={accommodation.image} alt={accommodation.name} />
                  <div className="price-badge">
                    ${accommodation.pricePerNight}/night
                  </div>
                  <div className="ranking-badge">
                    Score: {accommodation.rankingScore}
                  </div>
                </div>

                <div className="card-content">
                  <h3 className="accommodation-name">{accommodation.name}</h3>
                  <p className="accommodation-type">{accommodation.type}</p>

                  <div className="rating-distance">
                    <div className="rating">
                      {'⭐'.repeat(Math.floor(accommodation.rating))} {accommodation.rating}
                    </div>
                    <div className="distance">
                      {accommodation.distanceToMountain} mi to slopes
                    </div>
                  </div>

                  <div className="stats-row">
                    <div className="stat-item">
                      <span className="stat-value">${accommodation.pricePerPerson}</span>
                      <span className="stat-label">per person</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{accommodation.beds}</span>
                      <span className="stat-label">beds</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{accommodation.bathrooms}</span>
                      <span className="stat-label">baths</span>
                    </div>
                  </div>

                  <div className="amenities">
                    {accommodation.amenities?.slice(0, 4).map(amenity => (
                      <span key={amenity} className="amenity-tag">
                        {getAmenityIcon(amenity)} {getAmenityLabel(amenity)}
                      </span>
                    ))}
                    {accommodation.amenities?.length > 4 && (
                      <span className="amenity-more">+{accommodation.amenities.length - 4} more</span>
                    )}
                  </div>

                  <button 
                    className="external-link-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      // This would open the actual booking URL
                      window.open(`https://airbnb.com/rooms/${accommodation.id}`, '_blank');
                    }}
                  >
                    View Details →
                  </button>
                </div>
              </motion.div>
            );
          })}
          
          {/* Custom accommodations that have been added */}
          {selectedAccommodations.filter(acc => acc.isCustom).map((accommodation) => {
            const isSelected = true; // Custom accommodations are always selected when shown
            
            return (
              <motion.div
                key={accommodation.id}
                className="accommodation-card selected custom-accommodation"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAccommodationSelect(accommodation)}
              >
                <div className="selection-badge">✓</div>
                
                <div className="card-image">
                  <img src={accommodation.image} alt={accommodation.name} />
                  <div className="custom-badge">Custom</div>
                </div>

                <div className="card-content">
                  <h3 className="accommodation-name">{accommodation.name}</h3>
                  <p className="accommodation-type">{accommodation.type}</p>

                  <div className="custom-url">
                    <p>Custom URL provided</p>
                  </div>

                  <button 
                    className="external-link-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(accommodation.url, '_blank');
                    }}
                  >
                    View Details →
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Custom Accommodation */}
        <div className="custom-section">
          {!showCustomForm ? (
            <button 
              className="add-custom-btn"
              onClick={() => setShowCustomForm(true)}
              disabled={selectedAccommodations.length >= 3}
            >
              + Add Custom Accommodation
            </button>
          ) : (
            <div className="custom-form">
              <h3>Add Custom Accommodation</h3>
              <input
                type="url"
                placeholder="Paste Airbnb/Booking.com URL"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
              />
              <input
                type="text"
                placeholder="Optional: Custom name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
              />
              <div className="custom-form-actions">
                <button onClick={() => setShowCustomForm(false)}>Cancel</button>
                <button onClick={handleCustomSubmit} disabled={!customUrl.trim()}>
                  Add to Selection
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="submit-section">
          <button 
            className="submit-btn"
            onClick={handleSubmit}
            disabled={selectedAccommodations.length !== 3}
          >
            Submit 3 Accommodations to Tournament
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccommodationSubmissionPage;