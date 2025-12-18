import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AccommodationSubmissionPage } from '../../accommodations';
import { TournamentPage, TournamentSettings, CountdownTimer } from '../';
import './TournamentManager.css';

const TournamentManager = () => {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'submit', 'tournament'
  const [tournaments, setTournaments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsDestination, setSettingsDestination] = useState(null);
  const [tournamentSettings, setTournamentSettings] = useState({});

  useEffect(() => {
    fetchTournaments();
    fetchSubmissions();
    fetchTournamentSettings();
    
    // Check for auto-start tournaments periodically
    const interval = setInterval(checkAutoStart, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const fetchTournaments = async () => {
    try {
      const response = await axios.get('/api/tournament');
      setTournaments(response.data.tournaments);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await axios.get('/api/tournament/submissions');
      setSubmissions(response.data.submissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const fetchTournamentSettings = async () => {
    try {
      const submissionsByDestination = getSubmissionsByDestination();
      const settingsMap = {};
      
      // Fetch settings for each destination that has submissions
      for (const destination of Object.keys(submissionsByDestination)) {
        try {
          const response = await axios.get(`/api/tournament/settings/${destination}`);
          settingsMap[destination] = response.data.settings;
        } catch (error) {
          // No settings for this destination yet
          settingsMap[destination] = null;
        }
      }
      
      setTournamentSettings(settingsMap);
    } catch (error) {
      console.error('Error fetching tournament settings:', error);
    }
  };

  const checkAutoStart = async () => {
    try {
      const response = await axios.post('/api/tournament/check-auto-start');
      if (response.data.autoStartedTournaments.length > 0) {
        // Refresh tournaments if any were auto-started
        await fetchTournaments();
      }
    } catch (error) {
      console.error('Error checking auto-start:', error);
    }
  };

  const generateTournament = async (destination) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/tournament/generate', {
        destination
      });
      
      setSelectedTournament(response.data.tournament.id);
      setCurrentView('tournament');
      await fetchTournaments();
      setLoading(false);
    } catch (error) {
      console.error('Error generating tournament:', error);
      alert('Error generating tournament. Make sure there are submissions for this destination.');
      setLoading(false);
    }
  };

  const getSubmissionsByDestination = () => {
    const byDestination = {};
    submissions.forEach(sub => {
      if (!byDestination[sub.destination]) {
        byDestination[sub.destination] = [];
      }
      byDestination[sub.destination].push(sub);
    });
    return byDestination;
  };

  const renderHome = () => {
    const submissionsByDestination = getSubmissionsByDestination();

    return (
      <div className="tournament-home">
        <div className="home-container">
          <div className="home-header">
            <h1>🏆 Accommodation Tournament</h1>
            <p>Submit your accommodation picks and compete in tournaments</p>
          </div>

          <div className="action-cards">
            <div className="action-card">
              <h2>📝 Submit Accommodations</h2>
              <p>Choose 3 accommodations for the tournament</p>
              <button 
                className="action-btn primary"
                onClick={() => setCurrentView('submit')}
              >
                Submit Picks
              </button>
            </div>

            <div className="action-card">
              <h2>🎯 Active Tournaments</h2>
              <p>Join ongoing tournaments and vote</p>
              {tournaments.filter(t => t.status === 'active').length > 0 ? (
                <div className="tournament-list">
                  {tournaments.filter(t => t.status === 'active').map(tournament => (
                    <button
                      key={tournament.id}
                      className="tournament-item"
                      onClick={() => {
                        setSelectedTournament(tournament.id);
                        setCurrentView('tournament');
                      }}
                    >
                      {tournament.destination} - Round {tournament.currentRound}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="no-tournaments">No active tournaments</p>
              )}
            </div>
          </div>

          {/* Global Tournament Timers */}
          {Object.keys(tournamentSettings).length > 0 && (
            <div className="global-timers-section">
              <h2>⏰ Active Tournament Timers</h2>
              <div className="global-timers-grid">
                {Object.entries(tournamentSettings).map(([destination, settings]) => {
                  if (!settings) return null;
                  
                  return (
                    <div key={destination} className="global-timer-card">
                      <h3>{destination}</h3>
                      <div className="timer-row">
                        <CountdownTimer
                          targetDate={settings.submissionDeadline}
                          label="Submissions Close"
                          onExpire={() => fetchTournamentSettings()}
                        />
                        <CountdownTimer
                          targetDate={settings.autoStartTime}
                          label="Auto-Start"
                          onExpire={() => {
                            fetchTournaments();
                            fetchTournamentSettings();
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="submissions-section">
            <h2>📊 Current Submissions</h2>
            {Object.keys(submissionsByDestination).length > 0 ? (
              <div className="submissions-grid">
                {Object.entries(submissionsByDestination).map(([destination, subs]) => {
                  const settings = tournamentSettings[destination];
                  
                  return (
                    <div key={destination} className="submission-card">
                      <h3>{destination}</h3>
                      <p>{subs.length} submissions</p>
                      
                      {/* Countdown Timers */}
                      {settings && (
                        <div className="countdown-section">
                          <CountdownTimer
                            targetDate={settings.submissionDeadline}
                            label="Submissions Close"
                            onExpire={() => fetchTournamentSettings()}
                          />
                          <CountdownTimer
                            targetDate={settings.autoStartTime}
                            label="Tournament Auto-Start"
                            onExpire={() => {
                              fetchTournaments();
                              fetchTournamentSettings();
                            }}
                          />
                        </div>
                      )}
                      
                      <div className="submission-actions">
                      <button
                        className="settings-btn"
                        onClick={() => {
                          setSettingsDestination(destination);
                          setShowSettings(true);
                        }}
                      >
                        ⚙️ Settings
                      </button>
                      <button
                        className="view-submissions-btn"
                        onClick={() => {
                          // Could show detailed submissions view
                          console.log('Submissions for', destination, subs);
                        }}
                      >
                        View Details
                      </button>
                      {subs.length >= 2 && (
                        <button
                          className="generate-tournament-btn"
                          onClick={() => generateTournament(destination)}
                          disabled={loading}
                        >
                          {loading ? 'Generating...' : 'Start Tournament'}
                        </button>
                      )}
                    </div>
                      {subs.length < 2 && (
                        <p className="min-submissions">Need at least 2 submissions to start tournament</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-submissions">
                <p>No submissions yet. Be the first to submit accommodations!</p>
                <button 
                  className="action-btn primary"
                  onClick={() => setCurrentView('submit')}
                >
                  Submit First Picks
                </button>
              </div>
            )}
          </div>

          <div className="completed-tournaments">
            <h2>🏅 Completed Tournaments</h2>
            {tournaments.filter(t => t.status === 'complete').length > 0 ? (
              <div className="completed-list">
                {tournaments.filter(t => t.status === 'complete').map(tournament => (
                  <div key={tournament.id} className="completed-item">
                    <div className="completed-info">
                      <h3>{tournament.destination}</h3>
                      <p>Winner: {tournament.winner?.name}</p>
                      <p className="completed-date">
                        {new Date(tournament.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      className="view-results-btn"
                      onClick={() => {
                        setSelectedTournament(tournament.id);
                        setCurrentView('tournament');
                      }}
                    >
                      View Results
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-completed">No completed tournaments yet</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (currentView === 'submit') {
    return (
      <div>
        <div className="back-nav">
          <button 
            className="back-btn"
            onClick={() => setCurrentView('home')}
          >
            ← Back to Home
          </button>
        </div>
        <AccommodationSubmissionPage />
      </div>
    );
  }

  if (currentView === 'tournament' && selectedTournament) {
    return (
      <div>
        <div className="back-nav">
          <button 
            className="back-btn"
            onClick={() => setCurrentView('home')}
          >
            ← Back to Home
          </button>
        </div>
        <TournamentPage tournamentId={selectedTournament} />
      </div>
    );
  }

  return (
    <>
      {renderHome()}
      
      {showSettings && (
        <TournamentSettings
          destination={settingsDestination}
          onClose={() => {
            setShowSettings(false);
            setSettingsDestination(null);
          }}
          onSettingsSaved={() => {
            // Refresh data after settings are saved
            fetchTournaments();
            fetchSubmissions();
            fetchTournamentSettings();
          }}
        />
      )}
    </>
  );
};

export default TournamentManager;