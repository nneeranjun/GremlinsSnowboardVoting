import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider } from '../../../../contexts/ThemeContext';
import ThemeToggle from '../index';

// Mock the ThemeContext
const mockToggleDarkMode = jest.fn();

const MockThemeProvider = ({ children, isDarkMode = false }) => {
  return (
    <div data-testid="theme-provider">
      {children}
    </div>
  );
};

// Mock the useTheme hook
jest.mock('../../../../contexts/ThemeContext', () => ({
  useTheme: () => ({
    isDarkMode: false,
    toggleDarkMode: mockToggleDarkMode
  }),
  ThemeProvider: MockThemeProvider
}));

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    mockToggleDarkMode.mockClear();
  });

  test('renders theme toggle button', () => {
    render(<ThemeToggle />);
    
    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveAttribute('aria-label', 'Switch to dark mode');
  });

  test('displays sun icon in light mode', () => {
    render(<ThemeToggle />);
    
    const sunIcon = screen.getByText('☀️');
    expect(sunIcon).toBeInTheDocument();
  });

  test('calls toggleDarkMode when clicked', () => {
    render(<ThemeToggle />);
    
    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);
    
    expect(mockToggleDarkMode).toHaveBeenCalledTimes(1);
  });

  test('has correct CSS classes', () => {
    render(<ThemeToggle />);
    
    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toHaveClass('theme-toggle');
    
    const track = screen.getByText('☀️').closest('.toggle-track');
    expect(track).toBeInTheDocument();
  });
});