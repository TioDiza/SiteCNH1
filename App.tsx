import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './src/pages/HomePage';
import LoginPage from './src/pages/LoginPage';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
};

export default App;