import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import './App.css';
import './styles/dark-mode.css';

// Components
import { VotingPage, SwipePage, ResultsPage } from './components/voting';
import { AccommodationsPage } from './components/accommodations';
import { TournamentManager } from './components/tournament';
import { ManagePage } from './components/admin';
import { Navigation } from './components/common';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Navigation />
          <Routes>
            <Route path="/" element={<VotingPage />} />
            <Route path="/swipe" element={<SwipePage />} />
            <Route path="/accommodations" element={<AccommodationsPage />} />
            <Route path="/tournament" element={<TournamentManager />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/manage" element={<ManagePage />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
