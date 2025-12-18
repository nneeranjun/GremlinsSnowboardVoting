import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import './TournamentPage.css';

const TournamentPage = ({ tournamentId }) => {
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [voting, setVoting] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (tournamentId) {
      fetchTournament();
    }
  }, [tournamentId]);

  const fetchTournament = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/tournament/${tournamentId}`);
      setTournament(response.data.tournament);
      
      // Find current match to vote on
      if (response.data.tournament.status === 'active') {
        const currentRoundMatches = response.data.tournament.bracket.rounds[response.data.tournament.currentRound - 1];
        const nextMatch = currentRoundMatches?.find(match => 
          match.matchup && !match.matchup.winner
        );
        setCurrentMatch(nextMatch);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tournament:', error);
      setLoading(false);
    }
  };

  const handleVote = async (choice) => {
    if (!currentMatch || voting) return;

    try {
      setVoting(true);
      await axios.post(`/api/tournament/${tournamentId}/vote`, {
        matchId: currentMatch.id,
        choice
      });

      // Refresh tournament data
      await fetchTournament();
      setVoting(false);
    } catch (error) {
      console.error('Error voting:', error);
      setVoting(false);
    }
  };

  const advanceTournament = async () => {
    try {
      await axios.post(`/api/tournament/${tournamentId}/advance`);
      await fetchTournament();
    } catch (error) {
      console.error('Error advancing tournament:', error);
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

  const renderAccommodationCard = (accommodation, votes, isLeft = true) => (
    <motion.div
      className={`tournament-card ${isLeft ? 'left' : 'right'}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => handleVote(isLeft ? 'accommodation1' : 'accommodation2')}
    >
      <div className="card-image">
        <img src={accommodation.image} alt={accommodation.name} />
        <div className="vote-count">
          {votes} votes
        </div>
        {accommodation.submissionCount > 0 && (
          <div className="submission-badge">
            {accommodation.submissionCount} picks
          </div>
        )}
      </div>

      <div className="card-content">
        <h3 className="accommodation-name">{accommodation.name}</h3>
        <p className="accommodation-type">{accommodation.type}</p>

        {!accommodation.isCustom && (
          <>
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
              {accommodation.amenities?.slice(0, 3).map(amenity => (
                <span key={amenity} className="amenity-tag">
                  {getAmenityIcon(amenity)} {getAmenityLabel(amenity)}
                </span>
              ))}
              {accommodation.amenities?.length > 3 && (
                <span className="amenity-more">+{accommodation.amenities.length - 3}</span>
              )}
            </div>
          </>
        )}

        {accommodation.isCustom && (
          <div className="custom-info">
            <p>Custom submission</p>
            <a href={accommodation.url} target="_blank" rel="noopener noreferrer">
              View Details →
            </a>
          </div>
        )}
      </div>
    </motion.div>
  );

  const renderBracket = () => {
    if (!tournament || !tournament.bracket) return null;

    return (
      <div className="bracket-container">
        <h2>Tournament Bracket</h2>
        <div className="bracket-rounds">
          {tournament.bracket.rounds.map((round, roundIndex) => (
            <div key={roundIndex} className="bracket-round">
              <h3>Round {roundIndex + 1}</h3>
              <div className="bracket-matches">
                {round.map((match, matchIndex) => (
                  <div key={match.id} className="bracket-match">
                    {match.matchup ? (
                      <div className="bracket-matchup">
                        <div className={`bracket-competitor ${match.matchup.winner === 'accommodation1' ? 'winner' : ''}`}>
                          <span className="competitor-name">
                            {match.matchup.accommodation1.accommodation?.name || match.matchup.accommodation1.name}
                          </span>
                          <span className="competitor-votes">
                            {match.matchup.votes1}
                          </span>
                        </div>
                        <div className="vs">VS</div>
                        <div className={`bracket-competitor ${match.matchup.winner === 'accommodation2' ? 'winner' : ''}`}>
                          <span className="competitor-name">
                            {match.matchup.accommodation2.accommodation?.name || match.matchup.accommodation2.name}
                          </span>
                          <span className="competitor-votes">
                            {match.matchup.votes2}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bracket-bye">
                        <span>{match.accommodation.name}</span>
                        <span className="bye-label">BYE</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading tournament...</p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="tournament-page">
        <div className="error-container">
          <h2>Tournament Not Found</h2>
          <p>The tournament you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  if (tournament.status === 'complete') {
    return (
      <div className="tournament-page">
        <div className="winner-container">
          <h1>🏆 Tournament Complete!</h1>
          <div className="winner-card">
            <img src={tournament.winner.image} alt={tournament.winner.name} />
            <div className="winner-details">
              <h2>{tournament.winner.name}</h2>
              <p>{tournament.winner.type}</p>
              {!tournament.winner.isCustom && (
                <>
                  <p className="winner-price">${tournament.winner.pricePerNight}/night</p>
                  <p className="winner-rating">⭐ {tournament.winner.rating} • {tournament.winner.distanceToMountain} mi to slopes</p>
                </>
              )}
            </div>
          </div>
          
          <button 
            className="view-bracket-btn"
            onClick={() => setShowResults(true)}
          >
            View Full Bracket
          </button>

          {showResults && (
            <div className="results-overlay">
              <div className="results-content">
                <button 
                  className="close-results"
                  onClick={() => setShowResults(false)}
                >
                  ✕
                </button>
                {renderBracket()}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!currentMatch) {
    return (
      <div className="tournament-page">
        <div className="waiting-container">
          <h1>🏆 Tournament Round {tournament.currentRound}</h1>
          <p>All matches in this round are complete!</p>
          <button 
            className="advance-btn"
            onClick={advanceTournament}
          >
            Advance to Next Round
          </button>
          
          <div className="current-bracket">
            {renderBracket()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tournament-page">
      <div className="tournament-container">
        <div className="tournament-header">
          <h1>🏆 Tournament Round {tournament.currentRound}</h1>
          <p>Vote for your preferred accommodation</p>
        </div>

        <div className="matchup-container">
          <AnimatePresence>
            <div className="tournament-matchup">
              {renderAccommodationCard(
                currentMatch.matchup.accommodation1.accommodation || currentMatch.matchup.accommodation1,
                currentMatch.matchup.votes1 + (currentMatch.matchup.accommodation1.submissionCount || 0),
                true
              )}
              
              <div className="vs-divider">
                <div className="vs-text">VS</div>
                <div className="match-info">
                  <p>Click on a card to vote</p>
                  {voting && <div className="voting-spinner">Voting...</div>}
                </div>
              </div>

              {renderAccommodationCard(
                currentMatch.matchup.accommodation2.accommodation || currentMatch.matchup.accommodation2,
                currentMatch.matchup.votes2 + (currentMatch.matchup.accommodation2.submissionCount || 0),
                false
              )}
            </div>
          </AnimatePresence>
        </div>

        <div className="tournament-progress">
          <p>Round {tournament.currentRound} of {tournament.bracket.totalRounds}</p>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${(tournament.currentRound / tournament.bracket.totalRounds) * 100}%` }}
            />
          </div>
        </div>

        <button 
          className="view-bracket-btn"
          onClick={() => setShowResults(!showResults)}
        >
          {showResults ? 'Hide Bracket' : 'View Bracket'}
        </button>

        {showResults && (
          <div className="bracket-section">
            {renderBracket()}
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentPage;