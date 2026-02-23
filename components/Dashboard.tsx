import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UserProfile, Task, TaskStatus, PerformanceRecord } from '../types';
import { PRIORITY_WEIGHTS, DAYS_OF_WEEK, STORAGE_KEY_PERFORMANCE } from '../constants';
import { getMotivationalFeedback, getTaskSuggestions, generateVoiceReminderText } from '../services/geminiService';
import TaskModal from './TaskModal';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';

interface DashboardProps {
  profile: UserProfile;
  tasks: Task[];
  onUpdateTasks: (tasks: Task[]) => void;
}

const CountdownTimer: React.FC<{ task: Task; onStatusChange: (status: TaskStatus) => void }> = ({ task, onStatusChange }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isDue, setIsDue] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const [hours, minutes] = task.startTime.split(':').map(Number);
      const target = new Date(task.date);
      target.setHours(hours, minutes, 0, 0);

      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        const endTime = new Date(target.getTime() + task.duration * 60000);
        const endDiff = endTime.getTime() - now.getTime();

        if (endDiff <= 0) {
          setTimeLeft('Elapsed');
          setIsDue(true);
        } else {
          const m = Math.floor(endDiff / 60000);
          const s = Math.floor((endDiff % 60000) / 1000);
          setTimeLeft(`${m}m ${s}s remaining`);
          setIsDue(false);
        }
      } else {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        if (d > 0) setTimeLeft(`${d}d ${h}h`);
        else setTimeLeft(`${h}h ${m}m ${s}s`);
        setIsDue(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [task]);

  return (
    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 ${isDue ? 'bg-red-50 text-red-500' : 'bg-indigo-50 text-indigo-600'}`}>
      <span className={`w-2 h-2 rounded-full ${isDue ? 'bg-red-500' : 'bg-indigo-500 animate-pulse'}`}></span>
      <span className="font-mono">{timeLeft}</span>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ profile, tasks, onUpdateTasks }) => {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<string>("Syncing your productivity flow...");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [view, setView] = useState<'day' | 'trends'>('day');
  const [animatingId, setAnimatingId] = useState<string | null>(null);

  const performanceHistory = useMemo(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PERFORMANCE);
    return saved ? JSON.parse(saved) as PerformanceRecord[] : [];
  }, [tasks]);

  const currentDayTasks = useMemo(() =>
    tasks.filter(t => t.date === selectedDate),
    [tasks, selectedDate]);

  const score = useMemo(() => {
    if (currentDayTasks.length === 0) return 0;
    let totalWeight = 0;
    let earnedWeight = 0;
    currentDayTasks.forEach(t => {
      const w = PRIORITY_WEIGHTS[t.priority];
      totalWeight += w;
      if (t.status === 'Completed') earnedWeight += w;
      else if (t.status === 'Completed Late') earnedWeight += w * 0.5;
    });
    return Math.round((earnedWeight / totalWeight) * 100);
  }, [currentDayTasks]);

  useEffect(() => {
    const updatePerformance = () => {
      if (currentDayTasks.length > 0) {
        const record: PerformanceRecord = {
          date: selectedDate,
          score,
          completedTasks: currentDayTasks.filter(t => t.status.includes('Completed')).length,
          totalTasks: currentDayTasks.length
        };
        const updated = [...performanceHistory.filter(r => r.date !== selectedDate), record];
        localStorage.setItem(STORAGE_KEY_PERFORMANCE, JSON.stringify(updated));
      }
    };
    updatePerformance();
  }, [score, currentDayTasks, selectedDate]);

  useEffect(() => {
    const fetchAI = async () => {
      const [fb, sug] = await Promise.all([
        getMotivationalFeedback(score, currentDayTasks),
        getTaskSuggestions(profile)
      ]);
      setFeedback(fb);
      setSuggestions(sug);
    };
    fetchAI();
  }, [selectedDate, profile, score]);

  const updateStatus = (id: string, status: TaskStatus) => {
    if (status === 'Completed') {
      setAnimatingId(id);
      setTimeout(() => setAnimatingId(null), 1000);
    }
    onUpdateTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
  };

  const handleVoiceReminder = async (task: Task) => {
    const text = await generateVoiceReminderText(task);
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);

    setTimeout(() => {
      if (confirm(`flow-x Reminder: Did you complete "${task.name}" on time?`)) {
        updateStatus(task.id, 'Completed');
      } else {
        updateStatus(task.id, 'Not Completed');
      }
    }, 2000);
  };

  const dayOfWeek = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' });
  const isWorkDay = profile.workingDays.includes(dayOfWeek as any);

  return (
    <div className="space-y-12 pb-20">
      {/* Dynamic Navigation Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 animate-slide-up" style={{ animationDelay: '0ms' }}>
        <div className="space-y-2">
          <div className="flex items-center space-x-4">
            <h2 className="text-6xl font-black text-slate-800 tracking-tighter leading-none">
              {view === 'day' ? 'Perspective' : 'Insights'}
            </h2>
            <div className="flex bg-slate-100 p-1.5 rounded-2xl shadow-inner">
              <button
                onClick={() => setView('day')}
                className={`px-6 py-2 rounded-xl text-xs font-black transition-all duration-300 transform active:scale-95 ${view === 'day' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Daily
              </button>
              <button
                onClick={() => setView('trends')}
                className={`px-6 py-2 rounded-xl text-xs font-black transition-all duration-300 transform active:scale-95 ${view === 'trends' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Yearly
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none text-slate-500 font-extrabold p-0 focus:ring-0 cursor-pointer hover:text-indigo-600 transition-colors"
            />
            <span className="text-slate-300">•</span>
            <span className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${isWorkDay ? 'text-indigo-500' : 'text-emerald-500'}`}>
              {isWorkDay ? 'Standard Orbit' : 'Rest Cycle'}
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsTaskModalOpen(true)}
          className="group gradient-bg text-white px-10 py-5 rounded-[2rem] font-black text-lg shadow-2xl shadow-indigo-100 hover:shadow-indigo-300 transform hover:-translate-y-1 active:scale-95 transition-all flex items-center space-x-4 overflow-hidden relative"
        >
          <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          <div className="bg-white/20 p-2 rounded-xl group-hover:rotate-90 transition-transform duration-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
          </div>
          <span className="relative z-10">Add Protocol</span>
        </button>
      </div>

      {view === 'day' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Task List */}
          <div className="lg:col-span-8 space-y-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="glass rounded-[4rem] p-10 shadow-2xl border-white/60 min-h-[600px] relative overflow-hidden">
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-3xl font-black text-slate-800 tracking-tight">Timeline</h3>
                <div className="flex space-x-2">
                  {['Pending', 'Completed', 'Not Completed'].map(status => (
                    <div key={status} className="flex items-center space-x-1.5 px-3 py-1 bg-white/50 rounded-full border border-white shadow-sm transition-all hover:bg-white">
                      <div className={`w-2 h-2 rounded-full ${status === 'Completed' ? 'bg-emerald-500' : status === 'Pending' ? 'bg-indigo-400' : 'bg-red-400'}`}></div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {currentDayTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center animate-slide-up">
                  <div className="w-32 h-32 bg-indigo-50 rounded-[3rem] flex items-center justify-center mb-10 animate-float shadow-inner">
                    <svg className="w-12 h-12 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h4 className="text-2xl font-black text-slate-800">Void Detected</h4>
                  <p className="text-slate-400 font-bold max-w-xs mt-3 uppercase text-[10px] tracking-widest">No active protocols in this coordinate.</p>

                  <div className="mt-12 flex flex-wrap justify-center gap-3">
                    {suggestions.slice(0, 3).map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => setIsTaskModalOpen(true)}
                        className="px-6 py-3 bg-white border border-indigo-50 rounded-2xl text-[10px] font-black text-indigo-500 hover:bg-indigo-600 hover:text-white transform hover:-translate-y-1 transition-all shadow-sm uppercase tracking-widest"
                      >
                        + Initiate {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {currentDayTasks.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((task, i) => (
                    <div
                      key={task.id}
                      className={`group relative glass bg-white/40 hover:bg-white/90 p-8 rounded-[3rem] border-white/80 transition-all hover-card-glow flex flex-col sm:flex-row items-center gap-8 animate-slide-up ${animatingId === task.id ? 'animate-success-pop' : ''}`}
                      style={{ animationDelay: `${i * 100 + 200}ms` }}
                    >
                      <div className="flex flex-col items-center transform transition-transform group-hover:scale-110">
                        <div className="text-3xl font-black text-indigo-600 tracking-tighter leading-none">{task.startTime}</div>
                        <div className="text-[10px] font-black text-slate-300 uppercase mt-1">Ignition</div>
                      </div>

                      <div className="flex-1 text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
                          <h4 className="text-2xl font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors duration-300">{task.name}</h4>
                          <span className={`text-[8px] px-3 py-1 rounded-full uppercase font-black tracking-[0.2em] shadow-sm transform transition-transform group-hover:scale-105 ${task.priority === 'High' ? 'bg-red-50 text-red-500' :
                              task.priority === 'Medium' ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'
                            }`}>
                            {task.priority}
                          </span>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-4 justify-center sm:justify-start opacity-70 group-hover:opacity-100 transition-opacity">
                          <CountdownTimer task={task} onStatusChange={() => { }} />
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{task.duration} min duration</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleVoiceReminder(task)}
                          className="p-4 rounded-2xl bg-indigo-50 text-indigo-500 hover:bg-indigo-500 hover:text-white transform hover:rotate-12 transition-all active:scale-90"
                          title="Voice Reminder"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                        </button>

                        <div className="h-10 w-px bg-slate-100 hidden sm:block"></div>

                        {task.status === 'Pending' ? (
                          <div className="flex gap-2">
                            <button onClick={() => updateStatus(task.id, 'Completed')} className="w-14 h-14 rounded-[1.5rem] bg-emerald-500 text-white flex items-center justify-center hover:shadow-xl hover:shadow-emerald-200 transform hover:scale-110 transition-all active:scale-90">
                              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" className="animate-check"></path>
                              </svg>
                            </button>
                            <button onClick={() => updateStatus(task.id, 'Not Completed')} className="w-14 h-14 rounded-[1.5rem] bg-white text-red-500 flex items-center justify-center border border-red-100 hover:bg-red-500 hover:text-white transform hover:scale-110 transition-all active:scale-90">
                              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                          </div>
                        ) : (
                          <div className={`px-6 py-3 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest shadow-sm transition-all duration-500 animate-success-pop ${task.status.includes('Completed') ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                            }`}>
                            {task.status}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Metrics Panel */}
          <div className="lg:col-span-4 space-y-8 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="glass rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden group animate-float border-white/60">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full -mr-24 -mt-24 group-hover:scale-125 transition-transform duration-1000"></div>
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse-ring"></div>
                <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">Efficiency Pulse</h3>
              </div>
              <div className="flex items-end space-x-3 transform transition-transform duration-500 group-hover:scale-105">
                <span className="text-9xl font-black text-slate-800 tracking-tighter leading-none">{score}</span>
                <span className="text-4xl font-black text-indigo-300 mb-2">%</span>
              </div>
              <div className="mt-12 p-8 bg-white/60 backdrop-blur-sm rounded-[2.5rem] border border-white italic font-bold text-slate-600 text-lg leading-relaxed shadow-inner">
                "{feedback}"
              </div>
            </div>

            <div className="glass rounded-[3rem] p-8 shadow-2xl border-white/60 hover-card-glow transition-all duration-500">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10 text-center">Outcome Distribution</h4>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Done', value: currentDayTasks.filter(t => t.status === 'Completed').length, fill: '#6366f1' },
                        { name: 'Late', value: currentDayTasks.filter(t => t.status === 'Completed Late').length, fill: '#a855f7' },
                        { name: 'Missed', value: currentDayTasks.filter(t => t.status === 'Not Completed').length, fill: '#f43f5e' },
                        { name: 'Pending', value: currentDayTasks.filter(t => t.status === 'Pending').length, fill: '#f1f5f9' }
                      ]}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="p-4 bg-emerald-50 rounded-2xl text-center border border-emerald-100 transform transition-transform hover:scale-105">
                  <div className="text-2xl font-black text-emerald-600">{currentDayTasks.filter(t => t.status.includes('Completed')).length}</div>
                  <div className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Achieved</div>
                </div>
                <div className="p-4 bg-red-50 rounded-2xl text-center border border-red-100 transform transition-transform hover:scale-105">
                  <div className="text-2xl font-black text-red-500">{currentDayTasks.filter(t => t.status === 'Not Completed').length}</div>
                  <div className="text-[8px] font-black text-red-400 uppercase tracking-widest">Postponed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-10 animate-in fade-in slide-in-from-right duration-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { label: 'Long-term Peak', value: performanceHistory.length ? Math.max(...performanceHistory.map(r => r.score)) + '%' : 'N/A', icon: '🔥' },
              { label: 'Average Sync', value: performanceHistory.length ? Math.round(performanceHistory.reduce((a, b) => a + b.score, 0) / performanceHistory.length) + '%' : 'N/A', icon: '📊' },
              { label: 'Total Cycles', value: performanceHistory.length, icon: '♻️' },
              { label: 'Protocols Logged', value: performanceHistory.reduce((a, b) => a + b.totalTasks, 0), icon: '📋' }
            ].map((stat, i) => (
              <div key={i} className="glass p-10 rounded-[3rem] text-center border-white shadow-xl hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl hover-card-glow">
                <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform">{stat.icon}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</div>
                <div className="text-4xl font-black text-slate-800">{stat.value}</div>
              </div>
            ))}
          </div>

          <div className="glass rounded-[4rem] p-12 shadow-2xl border-white/60 transition-all duration-500 hover:shadow-indigo-100/50">
            <h4 className="text-3xl font-black text-slate-800 tracking-tight mb-12">Temporal Performance Arc</h4>
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceHistory.sort((a, b) => a.date.localeCompare(b.date))}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    fontSize={10}
                    fontWeight="bold"
                    tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#6366f1"
                    strokeWidth={6}
                    fillOpacity={1}
                    fill="url(#colorScore)"
                    animationBegin={300}
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={(task) => {
          onUpdateTasks([...tasks, task]);
          setIsTaskModalOpen(false);
        }}
        workingHours={profile.regularHours}
        selectedDay={dayOfWeek as any}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default Dashboard;