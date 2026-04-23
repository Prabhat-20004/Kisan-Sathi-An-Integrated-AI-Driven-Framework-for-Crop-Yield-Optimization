
import React from 'react';
import { AppView } from '../types';

interface BottomNavProps {
  activeView: AppView;
  onViewChange: (view: AppView) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, onViewChange }) => {
  const navItems = [
    { id: AppView.DASHBOARD, label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: AppView.MARKETPLACE, label: 'Market', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: AppView.ADVISORY, label: 'Advisory', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
    { id: AppView.PROFILE, label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 h-20 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto w-full h-full flex items-center justify-around px-4 md:px-8">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`flex flex-col items-center justify-center w-full max-w-[100px] h-full transition-all ${
              activeView === item.id ? 'text-green-600 dark:text-green-500' : 'text-slate-400 dark:text-slate-600'
            }`}
          >
            <svg className={`w-6 h-6 mb-1 ${activeView === item.id ? 'fill-green-50 dark:fill-green-900/20' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeView === item.id ? 2.5 : 2} d={item.icon} />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
