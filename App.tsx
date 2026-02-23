import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import { UserProfile, Task } from './types';
import { STORAGE_KEY_USER, STORAGE_KEY_TASKS } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  useEffect(() => {
    const savedUserStr = localStorage.getItem(STORAGE_KEY_USER);
    const savedTasksStr = localStorage.getItem(STORAGE_KEY_TASKS);

    if (savedUserStr) {
      try {
        const parsedUser = JSON.parse(savedUserStr);
        if (parsedUser && parsedUser.username) {
          setUser({ username: parsedUser.username });
          setProfile(parsedUser);
        }
      } catch (e) { console.error("Error parsing user data", e); }
    }

    if (savedTasksStr) {
      try {
        setTasks(JSON.parse(savedTasksStr));
      } catch (e) { console.error("Error parsing task data", e); }
    }

    setIsInitialized(true);
  }, []);

  const handleLogin = (username: string) => {
    setUser({ username });

    // Check if the saved profile belongs to this user
    const savedStr = localStorage.getItem(STORAGE_KEY_USER);
    if (savedStr) {
      try {
        const p = JSON.parse(savedStr);
        if (p.username === username) {
          setProfile(p);
          return;
        }
      } catch (e) { }
    }

    // New profile or different user
    setProfile({
      username,
      profession: 'Student',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      regularHours: { start: '09:00', end: '17:00' },
      extraHours: [],
      onboardingComplete: false
    });
  };

  const handleLogout = () => {
    setUser(null);
    setProfile(null);
  };

  const handleOnboardingComplete = (data: Partial<UserProfile>) => {
    if (profile) {
      const completeProfile: UserProfile = {
        ...profile,
        ...data,
        onboardingComplete: true,
      };
      setProfile(completeProfile);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(completeProfile));
    }
  };

  const updateTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(newTasks));
  };

  if (!isInitialized) return null;

  return (
    <Layout user={user} onLogout={handleLogout} isDark={isDark} toggleTheme={toggleTheme}>
      {!user ? (
        <Auth onLogin={handleLogin} />
      ) : profile && !profile.onboardingComplete ? (
        <Onboarding onComplete={handleOnboardingComplete} />
      ) : profile ? (
        <Dashboard
          profile={profile}
          tasks={tasks}
          onUpdateTasks={updateTasks}
        />
      ) : null}
    </Layout>
  );
};

export default App;
