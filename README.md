# 🎿 Gremlinz Ski Trip Planner

A comprehensive ski trip planning application with democratic destination voting, accommodation tournaments, and group decision-making tools.

## ✨ Features

### 🗳️ **Destination Voting**
- Vote on ski destinations with detailed mountain information
- Swipe through destinations Tinder-style
- View comprehensive results with statistics
- Real-time vote tracking

### 🏠 **Accommodation System**
- Browse accommodations with smart ranking algorithm
- Swipe through stays with detailed information
- Live hotel API integration with fallback data
- Price, distance, and amenity-based scoring

### 🏆 **Tournament System**
- **Democratic Selection**: Submit 3 accommodation picks per person
- **Smart Bracket Generation**: Weighted tournaments with bye priority for popular choices
- **Fair Voting**: Head-to-head matchups with initial submission bonuses
- **Automated Scheduling**: Customizable deadlines and auto-start timers
- **Real-time Tournaments**: Live voting with bracket visualization

### 🌙 **Modern UI/UX**
- **Dark Mode**: System-aware theme with manual toggle
- **Responsive Design**: Mobile-first approach with touch gestures
- **Smooth Animations**: Framer Motion powered interactions
- **Clean Architecture**: Organized component structure

### ⏰ **Smart Scheduling**
- **Countdown Timers**: Real-time deadlines for submissions and tournaments
- **Auto-start Logic**: Tournaments begin automatically at set times
- **Flexible Settings**: Trip creators control all timing parameters

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd ski-vote-app

# Install all dependencies
npm run install-all

# Start development servers
npm run dev
```

This will start:
- Backend server on `http://localhost:5001`
- Frontend React app on `http://localhost:3000`

## 📁 Project Structure

```
ski-vote-app/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Shared components (Navigation, ThemeToggle)
│   │   │   ├── voting/         # Destination voting (VotingPage, SwipePage, ResultsPage)
│   │   │   ├── accommodations/ # Accommodation browsing and submission
│   │   │   ├── tournament/     # Tournament system (Manager, Voting, Settings)
│   │   │   └── admin/          # Management tools
│   │   ├── contexts/           # React contexts (Theme)
│   │   └── styles/             # Global styles and dark mode
│   └── public/
├── server/                     # Node.js backend
│   ├── routes/                 # API endpoints
│   │   ├── destinations.js     # Destination voting APIs
│   │   ├── accommodations.js   # Accommodation APIs with ranking
│   │   ├── tournament.js       # Tournament system APIs
│   │   └── votes.js           # Voting APIs
│   ├── data/                   # Static data files
│   └── __tests__/             # Backend tests
├── tournament_data.json        # Tournament submissions and results
├── votes.json                 # Voting data storage
└── accommodation_swipes.json  # Swipe tracking data
```

## 🎯 How It Works

### 1. **Destination Selection**
- Group votes on ski destinations
- Each destination has detailed mountain info (elevation, trails, weather)
- Results show democratic consensus

### 2. **Accommodation Tournament**
- **Submission Phase**: Each person submits 3 accommodation picks
- **Tournament Generation**: System creates weighted bracket
  - Popular accommodations (picked by multiple people) get bye priority
  - Smart seeding ensures fair matchups
- **Voting Phase**: Head-to-head voting with submission bonuses
- **Winner Selection**: Democratic tournament determines final accommodation

### 3. **Smart Scheduling**
- Trip creators set submission deadlines and auto-start times
- Real-time countdown timers keep everyone informed
- Tournaments start automatically if no one triggers them manually
- Flexible settings accommodate different group dynamics

## 🛠️ Available Scripts

### Development
```bash
npm run dev          # Start both frontend and backend
npm run server       # Backend only
npm run client       # Frontend only
```

### Testing
```bash
npm run test:all     # Run all tests
npm run test:server  # Backend tests only
npm run test:client  # Frontend tests only
node run-tests.js    # Full test suite with setup
```

### Production
```bash
npm run build        # Build for production
npm start           # Start production server
```

## 🧪 Testing

Comprehensive test suite covering:
- **Backend**: Tournament logic, API endpoints, integration tests
- **Frontend**: Component tests, user interactions, UI flows
- **Coverage**: >80% backend, >70% frontend

See [TESTING.md](TESTING.md) for detailed testing documentation.

## 🎨 Key Technologies

### Frontend
- **React 18** - Modern React with hooks
- **React Router** - Client-side routing
- **Framer Motion** - Smooth animations
- **Axios** - API communication
- **CSS Custom Properties** - Theme system

### Backend
- **Node.js + Express** - RESTful API server
- **File-based Storage** - JSON data persistence
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Environment configuration

### Testing
- **Jest** - Test framework
- **React Testing Library** - Component testing
- **Supertest** - API testing
- **Coverage Reports** - Code coverage tracking

## 🏆 Tournament Algorithm

### Smart Bye Allocation
```javascript
// Popular accommodations get bye priority
accommodations.sort((a, b) => {
  if (b.submissionCount !== a.submissionCount) {
    return b.submissionCount - a.submissionCount; // Popular first
  }
  return Math.random() - 0.5; // Random within ties
});
```

### Weighted Voting
- Accommodations start with votes equal to submission count
- Live voting adds to initial totals
- Prevents double-counting with smart reset logic

## 🌙 Dark Mode

System-aware dark mode with manual toggle:
- Respects user's system preference
- Persistent theme selection
- Smooth transitions between modes
- Comprehensive component coverage

## 📱 Mobile Support

- Touch-friendly swipe gestures
- Responsive design for all screen sizes
- Mobile-optimized tournament interface
- Progressive Web App ready

## 🔧 Configuration

### Environment Variables
```bash
# Server
PORT=5001
NODE_ENV=development

# API Keys (optional)
RAPIDAPI_KEY=your_hotel_api_key
```

### Customization
- Modify destinations in `server/data/destinations.js`
- Adjust ranking algorithm in `server/routes/accommodations.js`
- Customize UI themes in `client/src/styles/`

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Setup
- Set `NODE_ENV=production`
- Configure any API keys
- Ensure file write permissions for data storage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🎿 Happy Skiing!

Built with ❤️ for group ski trip planning. May your powder be deep and your accommodations be cozy! 🏔️
