import React from 'react';
import ThemeToggle from './ThemeToggle';
import logo from '../logo.png';

interface LayoutProps {
  children: React.ReactNode;
  user?: { username: string } | null;
  onLogout?: () => void;
  isDark?: boolean;
  toggleTheme?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, isDark = false, toggleTheme }) => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden transition-colors duration-500 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* Dynamic Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 bg-slate-50 dark:bg-slate-900 transition-colors duration-500"></div>
      <div className="fixed -top-24 -left-24 w-96 h-96 bg-indigo-200/40 dark:bg-indigo-900/40 rounded-full blur-[100px] -z-10 animate-pulse transition-colors duration-500"></div>
      <div className="fixed top-1/2 -right-24 w-80 h-80 bg-purple-200/40 dark:bg-purple-900/40 rounded-full blur-[100px] -z-10 animate-slow-float transition-colors duration-500"></div>

      <header className="glass sticky top-0 z-50 w-full border-b border-white/40 dark:border-slate-700/40 dark:bg-slate-800/70 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="group-hover:scale-105 transition-all duration-500 w-12 h-12 flex items-center justify-center">
              <img src={logo} alt="flow-x logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight gradient-text">flow-x</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Intelligent Flow</p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {toggleTheme && <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />}
            {user && (
              <>
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Pilot</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{user.username}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 px-5 py-2.5 rounded-2xl text-xs font-black transition-all border border-red-100 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-500/50 active:scale-95 shadow-sm"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 relative">
        {children}
      </main>

      <footer className="py-12 border-t border-slate-200 dark:border-slate-800 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">
            &copy; {new Date().getFullYear()} flow-x AI. Built for <span className="text-indigo-600 dark:text-indigo-400 font-bold">Resilience</span>.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;