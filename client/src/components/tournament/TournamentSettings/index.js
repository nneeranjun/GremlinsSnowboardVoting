import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TournamentSettings.css';

const TournamentSettings = ({ destination, onClose, onSettingsSaved }) => {
  const [submissionDeadline, setSubmissionDeadline] = useState('');
  const [autoStartTime, setAutoStartTime] = useState('');
  const [minSubmissions, setMinSubmissions] = useState(3);
  const [loading, setLoading] = useState(false);
  const [existingSettings, setExistingSettings] = useState(null);

  useEffect(() => {
    // Set default times
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(18, 0, 0, 0); // 6 PM tomorrow
    
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);
    dayAfter.setHours(9, 0, 0, 0); // 9 AM day after

    setSubmissionDeadline(tomorrow.toISOString().slice(0, 16));
    setAutoStartTime(dayAfter.toISOString().slice(0, 16));

    // Check for existing settings
    fetchExistingSettings();
  }, [destination]);

  const fetchExistingSettings = async () => {
    try {
      const response = await axios.get(`/api/tournament/settings/${destination}`);
      setExistingSettings(response.data.settings);
      
      // Populate form with existing settings
      const settings = response.data.settings;
      setSubmissionDeadline(new Date(settings.submissionDeadline).toISOString().slice(0, 16));
      setAutoStartTime(new Date(settings.autoStartTime).toISOString().slice(0, 16));
      setMinSubmissions(settings.minSubmissions);
    } catch (error) {
      // No existing settings, use defaults
      setExistingSettings(null);
    }
  };

  const handleSave = async () => {
    if (!submissionDeadline || !autoStartTime) {
      alert('Please set both submission deadline and auto-start time');
      return;
    }

    const deadlineDate = new Date(submissionDeadline);
    const autoStartDate = new Date(autoStartTime);

    if (autoStartDate <= deadlineDate) {
      alert('Auto-start time must be after submission deadline');
      return;
    }

    try {
      setLoading(true);
      await axios.post('/api/tournament/settings', {
        destination,
        submissionDeadline: deadlineDate.toISOString(),
        autoStartTime: autoStartDate.toISOString(),
        minSubmissions,
        creatorId: 'current_user' // In real app, get from auth
      });

      onSettingsSaved();
      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving tournament settings');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleString();
  };

  const getTimeUntil = (dateTimeString) => {
    const target = new Date(dateTimeString);
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    
    if (diff <= 0) return 'Past due';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="tournament-settings-overlay">
      <div className="tournament-settings-modal">
        <div className="settings-header">
          <h2>🏆 Tournament Settings</h2>
          <h3>{destination}</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {existingSettings && (
          <div className="existing-settings">
            <h4>Current Settings</h4>
            <div className="settings-info">
              <div className="setting-item">
                <span className="label">Submission Deadline:</span>
                <span className="value">
                  {formatDateTime(existingSettings.submissionDeadline)}
                  <span className="countdown">({getTimeUntil(existingSettings.submissionDeadline)})</span>
                </span>
              </div>
              <div className="setting-item">
                <span className="label">Auto-Start Time:</span>
                <span className="value">
                  {formatDateTime(existingSettings.autoStartTime)}
                  <span className="countdown">({getTimeUntil(existingSettings.autoStartTime)})</span>
                </span>
              </div>
              <div className="setting-item">
                <span className="label">Min Submissions:</span>
                <span className="value">{existingSettings.minSubmissions}</span>
              </div>
            </div>
          </div>
        )}

        <div className="settings-form">
          <div className="form-group">
            <label>Submission Deadline</label>
            <input
              type="datetime-local"
              value={submissionDeadline}
              onChange={(e) => setSubmissionDeadline(e.target.value)}
            />
            <p className="help-text">When should people stop being able to submit accommodations?</p>
          </div>

          <div className="form-group">
            <label>Tournament Auto-Start</label>
            <input
              type="datetime-local"
              value={autoStartTime}
              onChange={(e) => setAutoStartTime(e.target.value)}
            />
            <p className="help-text">When should the tournament automatically begin if no one starts it manually?</p>
          </div>

          <div className="form-group">
            <label>Minimum Submissions Required</label>
            <select
              value={minSubmissions}
              onChange={(e) => setMinSubmissions(parseInt(e.target.value))}
            >
              <option value={2}>2 people</option>
              <option value={3}>3 people</option>
              <option value={4}>4 people</option>
              <option value={5}>5 people</option>
              <option value={6}>6 people</option>
            </select>
            <p className="help-text">How many people need to submit before tournament can start?</p>
          </div>

          <div className="timeline-preview">
            <h4>Timeline Preview</h4>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <strong>Now</strong>
                  <p>People can submit accommodations</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <strong>{formatDateTime(submissionDeadline)}</strong>
                  <p>Submission deadline - no more submissions allowed</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <strong>{formatDateTime(autoStartTime)}</strong>
                  <p>Tournament auto-starts (if {minSubmissions}+ submissions)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-actions">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="save-btn" 
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Saving...' : existingSettings ? 'Update Settings' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TournamentSettings;