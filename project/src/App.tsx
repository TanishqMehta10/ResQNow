import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import IntroAnimation from './components/IntroAnimation';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './components/LandingPage';
import TouristSignup from './components/tourist/TouristSignup';
import TouristLogin from './components/tourist/TouristLogin';
import TouristDashboard from './components/tourist/TouristDashboard';
import AuthorityLogin from './components/authority/AuthorityLogin';
import AuthorityDashboard from './components/authority/AuthorityDashboard';
import PoliceDashboard from './components/authority/PoliceDashboard';
import KYCVerification from './components/tourist/KYCVerification';
import DigitalID from './components/tourist/DigitalID';

function App() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <LanguageProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/tourist/signup" element={<TouristSignup />} />
            <Route path="/tourist/login" element={<TouristLogin />} />
            <Route path="/tourist/kyc" element={<KYCVerification />} />
            <Route path="/tourist/digital-id" element={<DigitalID />} />
            <Route path="/tourist/dashboard" element={<TouristDashboard />} />
            <Route path="/authority/login" element={<AuthorityLogin />} />
            <Route path="/authority/dashboard" element={
              <ErrorBoundary>
                <AuthorityDashboard />
              </ErrorBoundary>
            } />
            <Route path="/police/dashboard" element={
              <ErrorBoundary>
                <PoliceDashboard />
              </ErrorBoundary>
            } />
          </Routes>
          {/* Intro animation overlay (renders above routes but doesn't short-circuit rendering) */}
          {showIntro && <IntroAnimation onComplete={() => setShowIntro(false)} />}
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;