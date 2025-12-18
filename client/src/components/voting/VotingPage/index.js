import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './VotingPage.css';

const VotingPage = () => {
  const [destinations, setDestinations] = useState([]);
  const [maps, setMaps] = useState({});
  const [descriptions, setDescriptions] = useState({});
  const [difficulty, setDifficulty] = useState({});
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showOverview, setShowOverview] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const navigate = useNavigate();

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

  const handleDestinationToggle = (destination) => {
    setSelectedDestinations(prev => {
      if (prev.includes(destination)) {
        return prev.filter(d => d !== destination);
      } else if (prev.length < 4) {
        return [...prev, destination];
      }
      return prev;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || selectedDestinations.length !== 4) {
      alert('Please provide email and select exactly 4 destinations');
      return;
    }

    setSubmitting(true);
    
    try {
      await axios.post('/api/votes', {
        email,
        destinations: selectedDestinations
      });
      
      navigate('/results');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to submit vote');
      setSubmitting(false);
    }
  };

  const getStarRating = (destination, resort) => {
    const rating = difficulty[destination]?.[resort] || 0;
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const handleSort = (columnKey) => {
    let direction = 'asc';
    if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: columnKey, direction });
  };

  const getSortedDestinations = () => {
    if (!sortConfig.key) return destinations;

    const destinationStats = {
      'Utah': {
        maxElevation: 11000, verticalDrop: 3240, totalRuns: 169,
        greenRuns: 27, blueRuns: 38, blackRuns: 35, terrainParks: 8,
        skiableAcres: 4700, annualSnowfall: 500, flightCost: 325
      },
      'Colorado': {
        maxElevation: 11053, verticalDrop: 3500, totalRuns: 215,
        greenRuns: 25, blueRuns: 40, blackRuns: 35, terrainParks: 12,
        skiableAcres: 6200, annualSnowfall: 400, flightCost: 400
      },
      'Northern Rockies': {
        maxElevation: 11166, verticalDrop: 4350, totalRuns: 300,
        greenRuns: 15, blueRuns: 25, blackRuns: 60, terrainParks: 6,
        skiableAcres: 5800, annualSnowfall: 400, flightCost: 375
      },
      'Western Canada': {
        maxElevation: 8743, verticalDrop: 4200, totalRuns: 193,
        greenRuns: 18, blueRuns: 52, blackRuns: 30, terrainParks: 4,
        skiableAcres: 4200, annualSnowfall: 450, flightCost: 500
      },
      'California': {
        maxElevation: 11053, verticalDrop: 3500, totalRuns: 215,
        greenRuns: 25, blueRuns: 40, blackRuns: 35, terrainParks: 12,
        skiableAcres: 6200, annualSnowfall: 400, flightCost: 400
      },
      'Washington': {
        maxElevation: 7012, verticalDrop: 3100, totalRuns: 57,
        greenRuns: 13, blueRuns: 57, blackRuns: 30, terrainParks: 3,
        skiableAcres: 2600, annualSnowfall: 368, flightCost: 325
      },
      'New Mexico': {
        maxElevation: 12481, verticalDrop: 2612, totalRuns: 110,
        greenRuns: 24, blueRuns: 25, blackRuns: 51, terrainParks: 4,
        skiableAcres: 1294, annualSnowfall: 305, flightCost: 325
      },
      'Switzerland': {
        maxElevation: 12739, verticalDrop: 7220, totalRuns: 200,
        greenRuns: 28, blueRuns: 40, blackRuns: 32, terrainParks: 7,
        skiableAcres: 8300, annualSnowfall: 250, flightCost: 800
      },
      'France': {
        maxElevation: 12605, verticalDrop: 9209, totalRuns: 115,
        greenRuns: 20, blueRuns: 30, blackRuns: 50, terrainParks: 5,
        skiableAcres: 6800, annualSnowfall: 310, flightCost: 700
      },
      'Italy': {
        maxElevation: 9222, verticalDrop: 4921, totalRuns: 340,
        greenRuns: 30, blueRuns: 40, blackRuns: 30, terrainParks: 9,
        skiableAcres: 7500, annualSnowfall: 350, flightCost: 700
      }
    };

    return [...destinations].sort((a, b) => {
      let aValue, bValue;

      if (sortConfig.key === 'name') {
        aValue = a;
        bValue = b;
      } else if (sortConfig.key === 'region') {
        aValue = ['Switzerland', 'France', 'Italy'].includes(a) ? 'Europe' : 
                 a === 'Western Canada' ? 'North America' : 'US';
        bValue = ['Switzerland', 'France', 'Italy'].includes(b) ? 'Europe' : 
                 b === 'Western Canada' ? 'North America' : 'US';
      } else if (sortConfig.key === 'difficulty') {
        const resorts = Object.keys(maps[a] || {});
        aValue = resorts.length > 0 
          ? resorts.reduce((sum, resort) => sum + (difficulty[a]?.[resort] || 0), 0) / resorts.length
          : 0;
        const resortsB = Object.keys(maps[b] || {});
        bValue = resortsB.length > 0 
          ? resortsB.reduce((sum, resort) => sum + (difficulty[b]?.[resort] || 0), 0) / resortsB.length
          : 0;
      } else {
        aValue = destinationStats[a]?.[sortConfig.key] || 0;
        bValue = destinationStats[b]?.[sortConfig.key] || 0;
      }

      if (typeof aValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortConfig.direction === 'asc' 
          ? aValue - bValue 
          : bValue - aValue;
      }
    });
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return '';
    return sortConfig.direction === 'asc' ? ' 🔼' : ' 🔽';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading destinations...</p>
      </div>
    );
  }

  return (
    <div className="voting-page">
      <div className="container">
        <header className="page-header">
          <h1>🏔️ Gremlinz Snowboard Trip Voting</h1>
          <p>Select exactly 4 destinations. One vote per email. Click trail maps to enlarge.</p>
        </header>

        <div className="alert alert-info">
          <strong>Already voted and want to change your vote?</strong>{' '}
          <button 
            onClick={() => navigate('/manage')} 
            className="link-button"
          >
            Click here
          </button> to manage your existing vote.
        </div>

        <div className="selection-counter">
          Selected: {selectedDestinations.length}/4
        </div>

        <form onSubmit={handleSubmit} className="voting-form">
          <div className="email-input">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your.email@example.com"
            />
          </div>

          {/* Overview Table */}
          <div className="overview-card">
            <div className="card-header">
              <button
                type="button"
                className="collapse-button"
                onClick={() => setShowOverview(!showOverview)}
              >
                📊 Destination Overview Table {showOverview ? '(Click to collapse)' : '(Click to expand)'}
              </button>
            </div>
            
            {showOverview && (
              <div className="table-container">
                <div className="table-responsive">
                  <table className="overview-table">
                    <thead>
                      <tr>
                        <th onClick={() => handleSort('name')} className="sortable">
                          Name{getSortIcon('name')}
                        </th>
                        <th onClick={() => handleSort('region')} className="sortable">
                          Region{getSortIcon('region')}
                        </th>
                        <th onClick={() => handleSort('maxElevation')} className="sortable">
                          Max Elevation (ft){getSortIcon('maxElevation')}
                        </th>
                        <th onClick={() => handleSort('verticalDrop')} className="sortable">
                          Vertical Drop (ft){getSortIcon('verticalDrop')}
                        </th>
                        <th onClick={() => handleSort('totalRuns')} className="sortable">
                          Total Runs{getSortIcon('totalRuns')}
                        </th>
                        <th onClick={() => handleSort('greenRuns')} className="sortable">
                          Green Runs{getSortIcon('greenRuns')}
                        </th>
                        <th onClick={() => handleSort('blueRuns')} className="sortable">
                          Blue Runs{getSortIcon('blueRuns')}
                        </th>
                        <th onClick={() => handleSort('blackRuns')} className="sortable">
                          Black Runs{getSortIcon('blackRuns')}
                        </th>
                        <th onClick={() => handleSort('terrainParks')} className="sortable">
                          Terrain Parks{getSortIcon('terrainParks')}
                        </th>
                        <th onClick={() => handleSort('skiableAcres')} className="sortable">
                          Skiable Acres{getSortIcon('skiableAcres')}
                        </th>
                        <th onClick={() => handleSort('annualSnowfall')} className="sortable">
                          Annual Snowfall (in){getSortIcon('annualSnowfall')}
                        </th>
                        <th onClick={() => handleSort('difficulty')} className="sortable">
                          Avg Difficulty{getSortIcon('difficulty')}
                        </th>
                        <th onClick={() => handleSort('flightCost')} className="sortable">
                          Flight Cost{getSortIcon('flightCost')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {getSortedDestinations().map(destination => {
                        const resorts = Object.keys(maps[destination] || {});
                        const avgDifficulty = resorts.length > 0 
                          ? Math.round(resorts.reduce((sum, resort) => 
                              sum + (difficulty[destination]?.[resort] || 0), 0) / resorts.length)
                          : 0;
                        
                        const region = ['Switzerland', 'France', 'Italy'].includes(destination) 
                          ? 'Europe' 
                          : destination === 'Western Canada' 
                            ? 'North America' 
                            : 'US';
                        
                        // Destination stats (aggregated from original Flask data)
                        const destinationStats = {
                          'Utah': {
                            maxElevation: '11,000',
                            verticalDrop: '3,240', 
                            totalRuns: '169',
                            greenRuns: '27%',
                            blueRuns: '38%',
                            blackRuns: '35%',
                            terrainParks: '8',
                            skiableAcres: '4,700',
                            annualSnowfall: '500',
                            flightCost: '$250–$400'
                          },
                          'Colorado': {
                            maxElevation: '11,053',
                            verticalDrop: '3,500',
                            totalRuns: '215', 
                            greenRuns: '25%',
                            blueRuns: '40%',
                            blackRuns: '35%',
                            terrainParks: '12',
                            skiableAcres: '6,200',
                            annualSnowfall: '400',
                            flightCost: '$300–$500'
                          },
                          'Northern Rockies': {
                            maxElevation: '11,166',
                            verticalDrop: '4,350',
                            totalRuns: '300',
                            greenRuns: '15%', 
                            blueRuns: '25%',
                            blackRuns: '60%',
                            terrainParks: '6',
                            skiableAcres: '5,800',
                            annualSnowfall: '400',
                            flightCost: '$300–$450'
                          },
                          'Western Canada': {
                            maxElevation: '8,743',
                            verticalDrop: '4,200',
                            totalRuns: '193',
                            greenRuns: '18%',
                            blueRuns: '52%', 
                            blackRuns: '30%',
                            terrainParks: '4',
                            skiableAcres: '4,200',
                            annualSnowfall: '450',
                            flightCost: '$400–$600'
                          },
                          'California': {
                            maxElevation: '11,053',
                            verticalDrop: '3,500',
                            totalRuns: '215',
                            greenRuns: '25%',
                            blueRuns: '40%',
                            blackRuns: '35%',
                            terrainParks: '12',
                            skiableAcres: '6,200', 
                            annualSnowfall: '400',
                            flightCost: '$300–$500'
                          },
                          'Washington': {
                            maxElevation: '7,012',
                            verticalDrop: '3,100',
                            totalRuns: '57',
                            greenRuns: '13%',
                            blueRuns: '57%',
                            blackRuns: '30%',
                            terrainParks: '3',
                            skiableAcres: '2,600',
                            annualSnowfall: '368',
                            flightCost: '$250–$400'
                          },
                          'New Mexico': {
                            maxElevation: '12,481',
                            verticalDrop: '2,612',
                            totalRuns: '110',
                            greenRuns: '24%',
                            blueRuns: '25%',
                            blackRuns: '51%',
                            terrainParks: '4',
                            skiableAcres: '1,294',
                            annualSnowfall: '305',
                            flightCost: '$250–$400'
                          },
                          'Switzerland': {
                            maxElevation: '12,739',
                            verticalDrop: '7,220',
                            totalRuns: '200',
                            greenRuns: '28%',
                            blueRuns: '40%',
                            blackRuns: '32%',
                            terrainParks: '7',
                            skiableAcres: '8,300',
                            annualSnowfall: '250',
                            flightCost: '$600–$1,000'
                          },
                          'France': {
                            maxElevation: '12,605',
                            verticalDrop: '9,209',
                            totalRuns: '115',
                            greenRuns: '20%',
                            blueRuns: '30%',
                            blackRuns: '50%',
                            terrainParks: '5',
                            skiableAcres: '6,800',
                            annualSnowfall: '310',
                            flightCost: '$500–$900'
                          },
                          'Italy': {
                            maxElevation: '9,222',
                            verticalDrop: '4,921',
                            totalRuns: '340',
                            greenRuns: '30%',
                            blueRuns: '40%',
                            blackRuns: '30%',
                            terrainParks: '9',
                            skiableAcres: '7,500',
                            annualSnowfall: '350',
                            flightCost: '$500–$900'
                          }
                        };

                        const stats = destinationStats[destination] || {};

                        return (
                          <tr key={destination}>
                            <td><strong>{destination}</strong></td>
                            <td>{region}</td>
                            <td>{stats.maxElevation || 'N/A'}</td>
                            <td>{stats.verticalDrop || 'N/A'}</td>
                            <td>{stats.totalRuns || 'N/A'}</td>
                            <td>{stats.greenRuns || 'N/A'}</td>
                            <td>{stats.blueRuns || 'N/A'}</td>
                            <td>{stats.blackRuns || 'N/A'}</td>
                            <td>{stats.terrainParks || 'N/A'}</td>
                            <td>{stats.skiableAcres || 'N/A'}</td>
                            <td>{stats.annualSnowfall || 'N/A'}</td>
                            <td>{'★'.repeat(avgDifficulty)}{'☆'.repeat(5 - avgDifficulty)}</td>
                            <td>{stats.flightCost || 'N/A'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Destination Cards */}
          <div className="destinations-grid">
            {destinations.map(destination => (
              <div 
                key={destination}
                className={`destination-card ${selectedDestinations.includes(destination) ? 'selected' : ''}`}
              >
                <div className="card-header-section">
                  <label className="destination-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedDestinations.includes(destination)}
                      onChange={() => handleDestinationToggle(destination)}
                      disabled={!selectedDestinations.includes(destination) && selectedDestinations.length >= 4}
                    />
                    <h3>{destination}</h3>
                  </label>
                </div>

                <div className="destination-content">
                  {Object.entries(descriptions[destination] || {}).map(([resort, features]) => (
                    <div key={resort} className="resort-section">
                      <div className="resort-header">
                        <h5>{resort}</h5>
                        <div className="difficulty-rating">
                          <small>Terrain Difficulty:</small>
                          <span className="stars">
                            {getStarRating(destination, resort)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="resort-details">
                        <ul className="features-list">
                          {features.map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                        
                        {maps[destination]?.[resort] && (
                          <div className="trail-map">
                            <img
                              src={maps[destination][resort]}
                              alt={`${resort} Trail Map`}
                              onClick={() => window.open(maps[destination][resort], '_blank')}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={selectedDestinations.length !== 4 || submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Vote'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VotingPage;