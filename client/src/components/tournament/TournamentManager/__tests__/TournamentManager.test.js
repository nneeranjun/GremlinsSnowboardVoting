import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import TournamentManager from '../index';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock child components
jest.mock('../../AccommodationSubmissionPage', () => {
  return function MockAccommodationSubmissionPage() {
    return <div data-testid="accommodation-submission-page">Accommodation Submission Page</div>;
  };
});

jest.mock('../TournamentPage', () => {
  return function MockTournamentPage({ tournamentId }) {
    return <div data-testid="tournament-page">Tournament Page: {tournamentId}</div>;
  };
});

jest.mock('../TournamentSettings', () => {
  return function MockTournamentSettings({ destination, onClose, onSettingsSaved }) {
    return (
      <div data-testid="tournament-settings">
        <div>Settings for {destination}</div>
        <button onClick={onClose}>Close</button>
        <button onClick={onSettingsSaved}>Save</button>
      </div>
    );
  };
});

jest.mock('../CountdownTimer', () => {
  return function MockCountdownTimer({ targetDate, label, onExpire }) {
    return (
      <div data-testid="countdown-timer">
        <div>{label}</div>
        <div>{targetDate}</div>
        <button onClick={onExpire}>Expire</button>
      </div>
    );
  };
});

describe('TournamentManager Component', () => {
  const mockTournaments = [
    {
      id: 'tournament1',
      destination: 'Utah',
      status: 'active',
      currentRound: 2
    }
  ];

  const mockSubmissions = [
    {
      id: 'sub1',
      destination: 'Utah',
      accommodations: [
        { id: 'acc1', name: 'Luxury Condo' },
        { id: 'acc2', name: 'Cozy Chalet' },
        { id: 'acc3', name: 'Mountain Lodge' }
      ]
    },
    {
      id: 'sub2', 
      destination: 'Utah',
      accommodations: [
        { id: 'acc1', name: 'Luxury Condo' },
        { id: 'acc4', name: 'Ski Resort' },
        { id: 'acc5', name: 'Alpine Retreat' }
      ]
    }
  ];

  beforeEach(() => {
    mockedAxios.get.mockImplementation((url) => {
      if (url === '/api/tournament') {
        return Promise.resolve({ data: { tournaments: mockTournaments } });
      }
      if (url === '/api/tournament/submissions') {
        return Promise.resolve({ data: { submissions: mockSubmissions } });
      }
      if (url === '/api/destinations') {
        return Promise.resolve({ data: { destinations: ['Utah', 'Colorado'] } });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    mockedAxios.post.mockResolvedValue({ data: { autoStartedTournaments: [] } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders tournament home page by default', async () => {
    render(<TournamentManager />);

    await waitFor(() => {
      expect(screen.getByText('🏆 Accommodation Tournament')).toBeInTheDocument();
    });

    expect(screen.getByText('Submit your accommodation picks and compete in tournaments')).toBeInTheDocument();
    expect(screen.getByText('Submit Picks')).toBeInTheDocument();
  });

  test('displays active tournaments', async () => {
    render(<TournamentManager />);

    await waitFor(() => {
      expect(screen.getByText('Utah - Round 2')).toBeInTheDocument();
    });
  });

  test('shows submissions grouped by destination', async () => {
    render(<TournamentManager />);

    await waitFor(() => {
      expect(screen.getByText('Utah')).toBeInTheDocument();
      expect(screen.getByText('2 submissions')).toBeInTheDocument();
    });
  });

  test('navigates to submission page when Submit Picks clicked', async () => {
    render(<TournamentManager />);

    await waitFor(() => {
      expect(screen.getByText('Submit Picks')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Submit Picks'));

    expect(screen.getByTestId('accommodation-submission-page')).toBeInTheDocument();
  });

  test('navigates to tournament page when active tournament clicked', async () => {
    render(<TournamentManager />);

    await waitFor(() => {
      expect(screen.getByText('Utah - Round 2')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Utah - Round 2'));

    expect(screen.getByTestId('tournament-page')).toBeInTheDocument();
    expect(screen.getByText('Tournament Page: tournament1')).toBeInTheDocument();
  });

  test('opens tournament settings when settings button clicked', async () => {
    render(<TournamentManager />);

    await waitFor(() => {
      expect(screen.getByText('⚙️ Settings')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('⚙️ Settings'));

    expect(screen.getByTestId('tournament-settings')).toBeInTheDocument();
    expect(screen.getByText('Settings for Utah')).toBeInTheDocument();
  });

  test('closes tournament settings when close button clicked', async () => {
    render(<TournamentManager />);

    await waitFor(() => {
      expect(screen.getByText('⚙️ Settings')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('⚙️ Settings'));
    expect(screen.getByTestId('tournament-settings')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByTestId('tournament-settings')).not.toBeInTheDocument();
  });

  test('generates tournament when Start Tournament clicked', async () => {
    mockedAxios.post.mockImplementation((url, data) => {
      if (url === '/api/tournament/generate') {
        return Promise.resolve({
          data: {
            success: true,
            tournament: { id: 'new_tournament', destination: data.destination }
          }
        });
      }
      return Promise.resolve({ data: { autoStartedTournaments: [] } });
    });

    render(<TournamentManager />);

    await waitFor(() => {
      expect(screen.getByText('Start Tournament')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Start Tournament'));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/tournament/generate', {
        destination: 'Utah'
      });
    });
  });

  test('shows minimum submissions message when not enough submissions', async () => {
    const singleSubmission = [mockSubmissions[0]]; // Only 1 submission
    
    mockedAxios.get.mockImplementation((url) => {
      if (url === '/api/tournament/submissions') {
        return Promise.resolve({ data: { submissions: singleSubmission } });
      }
      if (url === '/api/tournament') {
        return Promise.resolve({ data: { tournaments: [] } });
      }
      return Promise.resolve({ data: { destinations: ['Utah'] } });
    });

    render(<TournamentManager />);

    await waitFor(() => {
      expect(screen.getByText('Need at least 2 submissions to start tournament')).toBeInTheDocument();
    });

    expect(screen.queryByText('Start Tournament')).not.toBeInTheDocument();
  });

  test('handles API errors gracefully', async () => {
    mockedAxios.get.mockRejectedValue(new Error('API Error'));
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<TournamentManager />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });
});