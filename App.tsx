
import React, { useState, useEffect } from 'react';
import { AppView } from './types';
import Dashboard from './components/Dashboard';
import Marketplace from './components/Marketplace';
import Advisory from './components/Advisory';
import Profile from './components/Profile';
import Header from './components/Header';
import BottomNav from './components/BottomNav';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>(AppView.DASHBOARD);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const renderView = () => {
    switch (activeView) {
      case AppView.DASHBOARD:
        return <Dashboard />;
      case AppView.MARKETPLACE:
        return <Marketplace />;
      case AppView.ADVISORY:
        return <Advisory />;
      case AppView.PROFILE:
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Header isOnline={isOnline} isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} />
      
      <main className="flex-1 overflow-y-auto pb-24 pt-16 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto w-full">
        {renderView()}
      </main>

      <BottomNav activeView={activeView} onViewChange={setActiveView} />
      
      {/* Offline Sync Status Notification */}
      {!isOnline && (
        <div className="fixed top-16 left-0 right-0 z-40 px-4">
          <div className="bg-amber-100 border border-amber-200 text-amber-800 text-xs px-3 py-2 rounded-lg shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            Working Offline. Changes will sync when online.
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
