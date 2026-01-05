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
import TheoreticalClassesPage from './src/pages/TheoreticalClassesPage';
import CnhIssuancePage from './src/pages/CnhIssuancePage';
import DetranFeePage from './src/pages/DetranFeePage';
import VerificationPage from './src/pages/VerificationPage';
import CategorySelectionPage from './src/pages/CategorySelectionPage';
import PaymentPage from './src/pages/PaymentPage';
import ScrollToTop from './src/components/ScrollToTop';

const App: React.FC = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/contact-info" element={<ContactInfoPage />} />
        <Route path="/eligibility" element={<EligibilityPage />} />
        <Route path="/app-access" element={<AppAccessPage />} />
        <Route path="/theoretical-classes" element={<TheoreticalClassesPage />} />
        <Route path="/cnh-issuance" element={<CnhIssuancePage />} />
        <Route path="/detran-fee" element={<DetranFeePage />} />
        <Route path="/verification" element={<VerificationPage />} />
        <Route path="/category-selection" element={<CategorySelectionPage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
        <Route path="/payment" element={<PaymentPage />} />
      </Routes>
    </>
  );
};

export default App;