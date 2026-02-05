/**
 * Main App Component
 * Root component with routing and navigation
 */
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Navbar } from './components/common/Navbar';
import HomePage from './pages/HomePage';
import BB84Page from './pages/BB84Page';
import E91Page from './pages/E91Page';
import EncryptionPage from './pages/EncryptionPage';
import HistoryPage from './pages/HistoryPage';

const App = () => {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-[#06060e] page-with-navbar">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/simulate/bb84" element={<BB84Page />} />
              <Route path="/simulate/e91" element={<E91Page />} />
              <Route path="/encrypt" element={<EncryptionPage />} />
              <Route path="/history" element={<HistoryPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
