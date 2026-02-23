import React, { useState } from 'react';
import { User, ArrowRight } from 'lucide-react';

interface AuthProps {
  onLogin: (username: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 animate-in fade-in duration-700">
      <div className="glass w-full max-w-md p-10 rounded-[2.5rem] card-shadow border-white/50 dark:border-slate-700/50">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-3xl mb-4">
            <User className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Welcome to flow-x</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Enter a username to sync your progress.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. Alex"
              className="w-full bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 flex items-center px-4 focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800 dark:text-slate-100 text-center text-lg shadow-sm"
              autoFocus
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white py-4 rounded-2xl font-bold text-lg hover-card-glow transition-all flex items-center justify-center space-x-2"
          >
            <span>Continue</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;