import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './src/pages/HomePage';
import LoginPage from './src/pages/LoginPage';
import ConfirmationPage from './src/pages/ConfirmationPage';
import QuizPage from './src/pages/QuizPage';
import ThankYouPage from './src/pages/ThankYouPage';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/confirmation" element={<ConfirmationPage />} />
      <Route path="/quiz" element={<QuizPage />} />
      <Route path="/thank-you" element={<ThankYouPage />} />
    </Routes>
  );
};

export default App;