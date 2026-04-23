
import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, loginWithGoogle, logout } from '../lib/firebase';

interface HeaderProps {
  isOnline: boolean;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ isOnline, isDarkMode, onToggleDarkMode }) => {
  const [user] = useAuthState(auth);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-50 border-b border-slate-200 dark:border-slate-800 h-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto w-full h-full flex items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center shadow-lg shadow-green-200 dark:shadow-green-900/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <h1 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">Kisan <span className="text-green-600">Sathi</span></h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={onToggleDarkMode}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {isDarkMode ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {user ? (
            <button 
              onClick={logout}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all hover:border-red-200 dark:hover:border-red-900 group"
            >
              <img src={user.photoURL || ''} alt="user" className="w-6 h-6 rounded-full border border-white" />
              <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 group-hover:text-red-500 hidden sm:inline">SIGN OUT</span>
            </button>
          ) : (
            <button 
              onClick={loginWithGoogle}
              className="text-[10px] font-black text-white bg-green-600 px-3 py-1.5 rounded-full shadow-lg shadow-green-600/20 active:scale-95 transition-all"
            >
              SIGN IN
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
