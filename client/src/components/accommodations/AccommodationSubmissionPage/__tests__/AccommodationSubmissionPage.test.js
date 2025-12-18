import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import AccommodationSubmissionPage from '../index';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>
  }
}));

describe('AccommodationSubmissionPage Component', () => {
  const mockDestinations = ['Utah', 'Colorado', 'California'];
  const mockAccommodations = [
    {
      id: 'acc1',
      name: 'Luxury Condo',
      type: 'Airbnb',
      pricePerNight: 400,
      beds: 4,
      bathrooms: 3,
      distanceToMountain: 0.2,
      rating: 4.9,
      amenities: ['hot_tub', 'ski_storage', 'kitchen'],
      image: 'https://example.com/image1.jpg',
      rankingScore: 250,
      pricePerPerson: 100
    },
    {
      id: 'acc2',
      name: 'Cozy Chalet',
      type: 'Airbnb', 
      pricePerNight: 280,
      beds: 3,
      bathrooms: 2,
      distanceToMountain: 0.8,
      rating: 4.8,
      amenities: ['fireplace', 'kitchen', 'wifi'],
      image: 'https://example.com/image2.jpg',
      rankingScore: 230,
      pricePerPerson: 70
    }
  ];

  beforeEach(() => {
    mockedAxios.get.mockImplementation((url) => {
      if (url === '/api/destinations') {
        return Promise.resolve({ data: { destinations: mockDestinations } });
      }
      if (url === '/api/accommodations') {
        return Promise.resolve({ data: { accommodations: mockAccommodations } });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    mockedAxios.post.mockResolvedValue({
      data: { success: true, submissionId: 'test_submission' }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders accommodation submission page', async () => {
    render(<AccommodationSubmissionPage />);

    await waitFor(() => {
      expect(screen.getByText('🏆 Tournament Submissions')).toBeInTheDocument();
    });

    expect(screen.getByText('Select exactly 3 accommodations for the tournament')).toBeInTheDocument();
    expect(screen.getByText('0/3 selected')).toBeInTheDocument();
  });

  test('loads and displays accommodations', async () => {
    render(<AccommodationSubmissionPage />);

    await waitFor(() => {
      expect(screen.getByText('Luxury Condo')).toBeInTheDocument();
      expect(screen.getByText('Cozy Chalet')).toBeInTheDocument();
    });

    expect(screen.getByText('$400/night')).toBeInTheDocument();
    expect(screen.getByText('⭐⭐⭐⭐ 4.9')).toBeInTheDocument();
  });

  test('allows selecting accommodations', async () => {
    render(<AccommodationSubmissionPage />);

    await waitFor(() => {
      expect(screen.getByText('Luxury Condo')).toBeInTheDocument();
    });

    const luxuryCondoCard = screen.getByText('Luxury Condo').closest('.accommodation-card');
    fireEvent.click(luxuryCondoCard);

    expect(screen.getByText('1/3 selected')).toBeInTheDocument();
    expect(luxuryCondoCard).toHaveClass('selected');
  });

  test('prevents selecting more than 3 accommodations', async () => {
    // Add a third accommodation to the mock
    const threeAccommodations = [
      ...mockAccommodations,
      {
        id: 'acc3',
        name: 'Mountain Lodge',
        type: 'Custom',
        pricePerNight: 320,
        beds: 3,
        bathrooms: 2,
        distanceToMountain: 1.5,
        rating: 4.7,
        amenities: ['fireplace', 'kitchen'],
        image: 'https://example.com/image3.jpg',
        rankingScore: 200,
        pricePerPerson: 80
      }
    ];

    mockedAxios.get.mockImplementation((url) => {
      if (url === '/api/destinations') {
        return Promise.resolve({ data: { destinations: mockDestinations } });
      }
      if (url === '/api/accommodations') {
        return Promise.resolve({ data: { accommodations: threeAccommodations } });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<AccommodationSubmissionPage />);

    await waitFor(() => {
      expect(screen.getByText('Luxury Condo')).toBeInTheDocument();
    });

    // Select all three accommodations
    const cards = screen.getAllByText(/Luxury Condo|Cozy Chalet|Mountain Lodge/);
    cards.forEach(card => {
      const accommodationCard = card.closest('.accommodation-card');
      if (!accommodationCard.classList.contains('selected')) {
        fireEvent.click(accommodationCard);
      }
    });

    expect(screen.getByText('3/3 selected')).toBeInTheDocument();

    // All unselected cards should be disabled
    const allCards = screen.getAllByText(/\$\d+\/night/).map(el => 
      el.closest('.accommodation-card')
    );
    
    const unselectedCards = allCards.filter(card => 
      !card.classList.contains('selected')
    );
    
    unselectedCards.forEach(card => {
      expect(card).toHaveClass('disabled');
    });
  });

  test('allows deselecting accommodations', async () => {
    render(<AccommodationSubmissionPage />);

    await waitFor(() => {
      expect(screen.getByText('Luxury Condo')).toBeInTheDocument();
    });

    const luxuryCondoCard = screen.getByText('Luxury Condo').closest('.accommodation-card');
    
    // Select
    fireEvent.click(luxuryCondoCard);
    expect(screen.getByText('1/3 selected')).toBeInTheDocument();
    
    // Deselect
    fireEvent.click(luxuryCondoCard);
    expect(screen.getByText('0/3 selected')).toBeInTheDocument();
    expect(luxuryCondoCard).not.toHaveClass('selected');
  });

  test('shows custom accommodation form when button clicked', async () => {
    render(<AccommodationSubmissionPage />);

    await waitFor(() => {
      expect(screen.getByText('+ Add Custom Accommodation')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('+ Add Custom Accommodation'));

    expect(screen.getByText('Add Custom Accommodation')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Paste Airbnb/Booking.com URL')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Optional: Custom name')).toBeInTheDocument();
  });

  test('adds custom accommodation when form submitted', async () => {
    render(<AccommodationSubmissionPage />);

    await waitFor(() => {
      expect(screen.getByText('+ Add Custom Accommodation')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('+ Add Custom Accommodation'));

    const urlInput = screen.getByPlaceholderText('Paste Airbnb/Booking.com URL');
    const nameInput = screen.getByPlaceholderText('Optional: Custom name');

    fireEvent.change(urlInput, { target: { value: 'https://airbnb.com/rooms/123' } });
    fireEvent.change(nameInput, { target: { value: 'My Custom Place' } });

    fireEvent.click(screen.getByText('Add to Selection'));

    expect(screen.getByText('1/3 selected')).toBeInTheDocument();
    expect(screen.getByText('My Custom Place')).toBeInTheDocument();
  });

  test('enables submit button only when 3 accommodations selected', async () => {
    render(<AccommodationSubmissionPage />);

    await waitFor(() => {
      expect(screen.getByText('Submit 3 Accommodations to Tournament')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Submit 3 Accommodations to Tournament');
    expect(submitButton).toBeDisabled();

    // Add custom accommodations to reach 3
    fireEvent.click(screen.getByText('+ Add Custom Accommodation'));
    
    const urlInput = screen.getByPlaceholderText('Paste Airbnb/Booking.com URL');
    fireEvent.change(urlInput, { target: { value: 'https://airbnb.com/rooms/1' } });
    fireEvent.click(screen.getByText('Add to Selection'));

    fireEvent.click(screen.getByText('+ Add Custom Accommodation'));
    const urlInput2 = screen.getByPlaceholderText('Paste Airbnb/Booking.com URL');
    fireEvent.change(urlInput2, { target: { value: 'https://airbnb.com/rooms/2' } });
    fireEvent.click(screen.getByText('Add to Selection'));

    fireEvent.click(screen.getByText('+ Add Custom Accommodation'));
    const urlInput3 = screen.getByPlaceholderText('Paste Airbnb/Booking.com URL');
    fireEvent.change(urlInput3, { target: { value: 'https://airbnb.com/rooms/3' } });
    fireEvent.click(screen.getByText('Add to Selection'));

    expect(screen.getByText('3/3 selected')).toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();
  });

  test('shows confirmation page when submit clicked', async () => {
    render(<AccommodationSubmissionPage />);

    // Select 3 accommodations (using custom ones for simplicity)
    await waitFor(() => {
      expect(screen.getByText('+ Add Custom Accommodation')).toBeInTheDocument();
    });

    // Add 3 custom accommodations
    for (let i = 1; i <= 3; i++) {
      fireEvent.click(screen.getByText('+ Add Custom Accommodation'));
      const urlInput = screen.getByPlaceholderText('Paste Airbnb/Booking.com URL');
      fireEvent.change(urlInput, { target: { value: `https://airbnb.com/rooms/${i}` } });
      fireEvent.click(screen.getByText('Add to Selection'));
    }

    const submitButton = screen.getByText('Submit 3 Accommodations to Tournament');
    fireEvent.click(submitButton);

    expect(screen.getByText('🏆 Confirm Your Tournament Submissions')).toBeInTheDocument();
    expect(screen.getByText('You\'ve selected these 3 accommodations for the tournament:')).toBeInTheDocument();
  });

  test('handles destination and group size changes', async () => {
    render(<AccommodationSubmissionPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Utah')).toBeInTheDocument();
    });

    const destinationSelect = screen.getByDisplayValue('Utah');
    fireEvent.change(destinationSelect, { target: { value: 'Colorado' } });

    const groupSizeInput = screen.getByDisplayValue('4');
    fireEvent.change(groupSizeInput, { target: { value: '6' } });

    // Should trigger new API call
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/accommodations', {
        params: { destination: 'Colorado', groupSize: 6 }
      });
    });
  });
});