import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ResultsPage.css';

const ResultsPage = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await axios.get('/api/votes/results');
      setResults(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching results:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading results...</p>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="error-container">
        <h2>Error loading results</h2>
        <button onClick={fetchResults} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  const { labels, counts, winners, tieInfo, totalVotes } = results;

  return (
    <div className="results-page">
      <div className="container">
        <header className="page-header">
          <h1>📊 Voting Results</h1>
          <p>Total votes: {totalVotes}</p>
        </header>

        {/* Winners Section */}
        <div className="winners-section">
          <h2>🏆 Top 4 Destinations</h2>
          <div className="winners-grid">
            {winners.slice(0, 4).map((destination, index) => {
              const voteCount = counts[labels.indexOf(destination)];
              const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
              
              return (
                <div key={destination} className={`winner-card rank-${index + 1}`}>
                  <div className="rank-badge">#{index + 1}</div>
                  <div className="destination-name">{destination}</div>
                  <div className="vote-count">{voteCount} votes</div>
                  <div className="percentage">{percentage}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tie Information */}
        {tieInfo && (
          <div className="tie-alert">
            <h3>⚠️ Tie Alert!</h3>
            <p>
              There's a tie for 4th place with {tieInfo.fourthPlaceVotes} votes. 
              The following destinations are tied: {tieInfo.tiedDestinations.join(', ')}
            </p>
            {tieInfo.tiedOutside.length > 0 && (
              <p>
                <strong>Tied outside top 4:</strong> {tieInfo.tiedOutside.join(', ')}
              </p>
            )}
          </div>
        )}

        {/* Full Results Chart */}
        <div className="chart-section">
          <h2>📈 All Results</h2>
          <div className="chart-container">
            {labels.map((destination, index) => {
              const voteCount = counts[index];
              const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
              const isWinner = winners.includes(destination);
              
              return (
                <div key={destination} className="chart-bar-container">
                  <div className="destination-label">
                    <span className={`destination-text ${isWinner ? 'winner' : ''}`}>
                      {destination}
                    </span>
                    <span className="vote-info">
                      {voteCount} votes ({Math.round(percentage)}%)
                    </span>
                  </div>
                  <div className="chart-bar">
                    <div 
                      className={`bar-fill ${isWinner ? 'winner-bar' : ''}`}
                      style={{ width: `${Math.max(percentage, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-section">
          <button 
            onClick={() => window.location.href = '/'}
            className="action-button primary"
          >
            🗳️ Vote Again
          </button>
          <button 
            onClick={() => window.location.href = '/manage'}
            className="action-button secondary"
          >
            ⚙️ Manage Vote
          </button>
          <button 
            onClick={fetchResults}
            className="action-button secondary"
          >
            🔄 Refresh Results
          </button>
        </div>

        {/* Summary Stats */}
        <div className="stats-section">
          <h3>📋 Summary</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{totalVotes}</div>
              <div className="stat-label">Total Votes</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{labels.length}</div>
              <div className="stat-label">Destinations</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {winners[0] || 'TBD'}
              </div>
              <div className="stat-label">Leading Destination</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {counts[0] || 0}
              </div>
              <div className="stat-label">Leading Votes</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;