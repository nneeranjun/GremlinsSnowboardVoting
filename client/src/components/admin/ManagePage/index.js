import React, { useState } from 'react';
import axios from 'axios';
import './ManagePage.css';

const ManagePage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info');
  const [voteData, setVoteData] = useState(null);

  const showMessage = (text, type = 'info') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(null), 5000);
  };

  const handleCheckVote = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      showMessage('Please enter your email address', 'error');
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.get(`/api/votes/check/${encodeURIComponent(email.trim().toLowerCase())}`);
      
      if (response.data.hasVoted) {
        setVoteData(response.data);
        showMessage(`You voted for: ${response.data.destinations.join(', ')}`, 'success');
      } else {
        setVoteData(null);
        showMessage('No vote found for this email address', 'info');
      }
    } catch (error) {
      showMessage('Error checking vote. Please try again.', 'error');
      setVoteData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVote = async () => {
    if (!email.trim()) {
      showMessage('Please enter your email address', 'error');
      return;
    }

    if (!window.confirm('Are you sure you want to delete your vote? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    
    try {
      await axios.delete(`/api/votes/${encodeURIComponent(email.trim().toLowerCase())}`);
      setVoteData(null);
      showMessage('Your vote has been successfully deleted', 'success');
      setEmail('');
    } catch (error) {
      if (error.response?.status === 404) {
        showMessage('No vote found for this email address', 'error');
      } else {
        showMessage('Error deleting vote. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="manage-page">
      <div className="container">
        <header className="page-header">
          <h1>⚙️ Manage Your Vote</h1>
          <p>Check your current vote or delete it to vote again</p>
        </header>

        {/* Message Display */}
        {message && (
          <div className={`alert alert-${messageType}`}>
            {message}
          </div>
        )}

        {/* Main Form */}
        <div className="manage-card">
          <form onSubmit={handleCheckVote} className="manage-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
              />
            </div>

            <div className="button-group">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Checking...' : '🔍 Check My Vote'}
              </button>
              
              {voteData && (
                <button 
                  type="button"
                  onClick={handleDeleteVote}
                  className="btn btn-danger"
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : '🗑️ Delete My Vote'}
                </button>
              )}
            </div>
          </form>

          {/* Vote Display */}
          {voteData && (
            <div className="vote-display">
              <h3>Your Current Vote</h3>
              <div className="destinations-list">
                {voteData.destinations.map((destination, index) => (
                  <div key={destination} className="destination-item">
                    <span className="destination-number">{index + 1}</span>
                    <span className="destination-name">{destination}</span>
                  </div>
                ))}
              </div>
              <p className="vote-info">
                You selected these 4 destinations. To change your vote, delete your current vote and submit a new one.
              </p>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="help-section">
          <h3>❓ Need Help?</h3>
          <div className="help-grid">
            <div className="help-item">
              <h4>Check Your Vote</h4>
              <p>Enter your email to see which destinations you voted for.</p>
            </div>
            <div className="help-item">
              <h4>Change Your Vote</h4>
              <p>Delete your current vote, then go back to the voting page to submit a new vote.</p>
            </div>
            <div className="help-item">
              <h4>Vote Not Found?</h4>
              <p>Make sure you're using the same email address you used when voting.</p>
            </div>
            <div className="help-item">
              <h4>Technical Issues?</h4>
              <p>Try refreshing the page or contact the trip organizer for assistance.</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="navigation-section">
          <button 
            onClick={() => window.location.href = '/'}
            className="nav-button"
          >
            🗳️ Back to Voting
          </button>
          <button 
            onClick={() => window.location.href = '/results'}
            className="nav-button"
          >
            📊 View Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagePage;