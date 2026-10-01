import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import LegalModule from './components/LegalModule';
import AboutPage from './components/AboutPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import TermsOfServicePage from './components/TermsOfServicePage';
import RegistrationPage from './components/RegistrationPage';
import LoginPage from './components/LoginPage';

import type { Page, User, HeroHeading, SiteStat, PartnerLogo } from './types';

import {
  initDatabase,
  getAllUsers, registerUser, updateUser, deleteUser,
  getHeroHeading, saveHeroHeading,
  getStats, updateStat,
  getPartnerLogos,
  getApiUrl
} from './utils/db';


const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [returnToPage, setReturnToPage] = useState<Page>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Base data states
  const [heroHeading, setHeroHeading] = useState<HeroHeading | null>(null);
  const [stats, setStats] = useState<SiteStat[]>([]);
  const [partnerLogos, setPartnerLogos] = useState<PartnerLogo[]>([]);

  // --- Data Loading ---
  useEffect(() => {
    const loadData = async () => {
      await initDatabase();
      const [heading, siteStats, logos] = await Promise.all([
        getHeroHeading(),
        getStats(),
        getPartnerLogos(),
      ]);
      setHeroHeading(heading);
      setStats(siteStats);
      setPartnerLogos(logos);
    };
    loadData();
  }, []);

  // --- Navigation ---
  const handleNavigate = (page: Page, subPage?: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // --- Auth ---
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    const returnPage = returnToPage || 'home';
    setReturnToPage('home');
    handleNavigate(returnPage);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    handleNavigate('home');
  };

  // --- Page Renderer ---
  const renderPage = () => {
    switch (currentPage) {
      case 'legal':
        return <LegalModule onBack={() => handleNavigate('home')} />;
      case 'about':
        return <AboutPage onNavigate={handleNavigate} />;
      case 'privacy-policy':
        return <PrivacyPolicyPage onNavigate={handleNavigate} />;
      case 'terms-of-service':
        return <TermsOfServicePage onNavigate={handleNavigate} />;
      case 'register':
        return <RegistrationPage onNavigate={handleNavigate} onLogin={handleLogin} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} returnTo={returnToPage} onLoginSuccess={handleLogin} />;
      case 'dashboard':
        if (!currentUser) {
          return <LoginPage onNavigate={handleNavigate} returnTo="dashboard" onLoginSuccess={handleLogin} />;
        }
        // TODO: Sprint 1 - Implement full user dashboard based on role (RBAC)
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Bienvenido/a, {currentUser.firstName}</h2>
            <p className="text-gray-600 mb-4">Panel de usuario en desarrollo (Sprint 1)</p>
            <p className="text-sm text-gray-500">Rol: {currentUser.role}</p>
            <button onClick={handleLogout} className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
              Cerrar Sesión
            </button>
          </div>
        );
      case 'home':
      default:
        return (
          <HomePage
            currentUser={currentUser}
            onNavigate={handleNavigate}
            heroHeading={heroHeading}
            stats={stats}
            partnerLogos={partnerLogos}
          />
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      {currentPage !== 'register' && currentPage !== 'login' && (
        <Header
          currentPage={currentPage}
          onNavigate={handleNavigate}
          isAdminMode={false}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      )}

      <main className="flex-grow">
        {renderPage()}
      </main>

      {currentPage !== 'register' && currentPage !== 'login' && (
        <Footer onNavigate={handleNavigate} partnerLogos={partnerLogos} currentUser={currentUser} />
      )}
    </div>
  );
};

export default App;
