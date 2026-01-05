import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './src/pages/HomePage';
import LoginPage from './src/pages/LoginPage';
import ConfirmationPage from './src/pages/ConfirmationPage';
import QuizPage from './src/pages/QuizPage';
import ContactInfoPage from './src/pages/ContactInfoPage';
import EligibilityPage from './src/pages/EligibilityPage';
import ThankYouPage from './src/pages/ThankYouPage';
import AppAccessPage from './src/pages/AppAccessPage';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/confirmation" element={<ConfirmationPage />} />
      <Route path="/quiz" element={<QuizPage />} />
      <Route path="/contact-info" element={<ContactInfoPage />} />
      <Route path="/eligibility" element={<EligibilityPage />} />
      <Route path="/app-access" element={<AppAccessPage />} />
      <Route path="/thank-you" element={<ThankYouPage />} />
    </Routes>
  );
};

export default App;