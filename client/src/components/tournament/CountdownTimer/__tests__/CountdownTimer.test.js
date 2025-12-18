import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import CountdownTimer from '../index';

// Mock timers
jest.useFakeTimers();

describe('CountdownTimer Component', () => {
  const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days from now
  const pastDate = new Date(Date.now() - 60 * 1000); // 1 minute ago

  afterEach(() => {
    jest.clearAllTimers();
  });

  test('renders countdown timer with future date', () => {
    render(
      <CountdownTimer 
        targetDate={futureDate.toISOString()} 
        label="Test Timer"
      />
    );

    expect(screen.getByText('Test Timer')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Days
    expect(screen.getByText('days')).toBeInTheDocument();
  });

  test('shows expired state for past date', () => {
    render(
      <CountdownTimer 
        targetDate={pastDate.toISOString()} 
        label="Expired Timer"
      />
    );

    expect(screen.getByText('Expired Timer')).toBeInTheDocument();
    expect(screen.getByText('Expired')).toBeInTheDocument();
  });

  test('updates countdown every second', () => {
    const nearFuture = new Date(Date.now() + 65 * 1000); // 1 minute 5 seconds
    
    render(
      <CountdownTimer 
        targetDate={nearFuture.toISOString()} 
        label="Updating Timer"
      />
    );

    // Should show 01:05 initially
    expect(screen.getByText('01')).toBeInTheDocument(); // Minutes
    expect(screen.getByText('05')).toBeInTheDocument(); // Seconds

    // Advance timer by 1 second
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Should now show 01:04
    expect(screen.getByText('01')).toBeInTheDocument(); // Minutes
    expect(screen.getByText('04')).toBeInTheDocument(); // Seconds
  });

  test('calls onExpire when timer reaches zero', () => {
    const onExpire = jest.fn();
    const soonExpiring = new Date(Date.now() + 1000); // 1 second from now

    render(
      <CountdownTimer 
        targetDate={soonExpiring.toISOString()} 
        label="Expiring Timer"
        onExpire={onExpire}
      />
    );

    // Advance timer past expiration
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  test('displays correct time units', () => {
    const complexDate = new Date(Date.now() + 
      2 * 24 * 60 * 60 * 1000 + // 2 days
      3 * 60 * 60 * 1000 +      // 3 hours  
      45 * 60 * 1000 +          // 45 minutes
      30 * 1000                 // 30 seconds
    );

    render(
      <CountdownTimer 
        targetDate={complexDate.toISOString()} 
        label="Complex Timer"
      />
    );

    expect(screen.getByText('2')).toBeInTheDocument(); // Days
    expect(screen.getByText('days')).toBeInTheDocument();
    expect(screen.getByText('03')).toBeInTheDocument(); // Hours
    expect(screen.getByText('45')).toBeInTheDocument(); // Minutes
    expect(screen.getByText('30')).toBeInTheDocument(); // Seconds
  });

  test('handles single day correctly', () => {
    const oneDayFuture = new Date(Date.now() + 24 * 60 * 60 * 1000 + 1000);

    render(
      <CountdownTimer 
        targetDate={oneDayFuture.toISOString()} 
        label="One Day Timer"
      />
    );

    expect(screen.getByText('1')).toBeInTheDocument(); // Days
    expect(screen.getByText('day')).toBeInTheDocument(); // Singular
  });

  test('hides days when less than 24 hours remain', () => {
    const hoursOnly = new Date(Date.now() + 5 * 60 * 60 * 1000); // 5 hours

    render(
      <CountdownTimer 
        targetDate={hoursOnly.toISOString()} 
        label="Hours Only Timer"
      />
    );

    expect(screen.queryByText('days')).not.toBeInTheDocument();
    expect(screen.getByText('05')).toBeInTheDocument(); // Hours
    expect(screen.getByText('hrs')).toBeInTheDocument();
  });
});