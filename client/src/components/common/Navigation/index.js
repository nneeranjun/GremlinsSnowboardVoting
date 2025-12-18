import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: '🗳️ Vote', icon: '🗳️' },
    { path: '/swipe', label: '🏔️ Swipe Mountains', icon: '🏔️' },
    { path: '/accommodations', label: '🏠 Find Stays', icon: '🏠' },
    { path: '/tournament', label: '🏆 Tournament', icon: '🏆' },
    { path: '/results', label: '📊 Results', icon: '📊' },
    { path: '/manage', label: '⚙️ Manage', icon: '⚙️' }
  ];

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          🎿 Gremlinz Ski Trip
        </Link>
        
        <div className="nav-links">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.label}</span>
            </Link>
          ))}
        </div>
        
        <div className="nav-theme">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};

export default Navigation;