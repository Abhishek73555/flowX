import React, { useState, useEffect } from 'react';
import { Task, DayOfWeek, Priority, WorkingHours } from '../types';
import { DAYS_OF_WEEK, PRIORITIES } from '../constants';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  workingHours: WorkingHours;
  selectedDay: DayOfWeek;
  selectedDate: string;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, workingHours, selectedDay, selectedDate }) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState<string>(selectedDate);
  const [startTime, setStartTime] = useState('08:00');
  const [duration, setDuration] = useState(30);
  const [priority, setPriority] = useState<Priority>('Medium');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Update date if the selected date in dashboard changes
  useEffect(() => {
    if (isOpen) {
      setDate(selectedDate);
      // set reasonable default start time
      const now = new Date();
      const h = String(now.getHours() + 1).padStart(2, '0');
      setStartTime(`${h}:00`);
    }
  }, [isOpen, selectedDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (startTime >= workingHours.start && startTime < workingHours.end) {
      setError(`Warning: Protocol conflict. This occurs during your primary work window (${workingHours.start}-${workingHours.end}).`);
      return;
    }

    onSave({
      id: crypto.randomUUID(),
      name, 
      date, 
      startTime, 
      duration, 
      priority, 
      notes, 
      status: 'Pending', 
      alertTime: 'at-start'
    });
    setName('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="glass w-full max-w-xl rounded-[4rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border-white/40 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-12 border-b border-white/20 flex justify-between items-center">
          <div>
            <h3 className="text-4xl font-black text-slate-800 tracking-tight">New Protocol</h3>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Deploying to timeline</p>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-slate-100 rounded-2xl transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-12 space-y-8">
          {error && <div className="p-5 bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase rounded-2xl tracking-widest animate-pulse">{error}</div>}
          
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Activity Objective</label>
            <input 
              required
              autoFocus
              className="w-full p-6 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-3xl outline-none font-extrabold text-slate-800 text-xl transition-all shadow-inner placeholder:text-slate-300"
              placeholder="e.g. Cognitive Deep Dive"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Target Date</label>
              <input 
                type="date"
                required
                className="w-full p-6 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-3xl outline-none font-bold text-slate-800 transition-all shadow-inner"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Ignition Time</label>
              <input 
                type="time" 
                className="w-full p-6 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-3xl outline-none font-bold text-slate-800 transition-all shadow-inner"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Duration (Minutes)</label>
              <input 
                type="number" 
                className="w-full p-6 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-3xl outline-none font-bold text-slate-800 transition-all shadow-inner"
                value={duration}
                onChange={e => setDuration(parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Priority Vector</label>
              <select 
                className="w-full p-6 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-3xl outline-none font-bold text-slate-800 appearance-none transition-all cursor-pointer shadow-inner"
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
              >
                {PRIORITIES.map(p => <option key={p} value={p}>{p} Intensity</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-6 pt-10">
            <button type="button" onClick={onClose} className="flex-1 py-6 rounded-3xl border-2 border-slate-100 text-slate-400 font-black text-lg hover:bg-slate-50 transition-all">Abort</button>
            <button type="submit" className="flex-[2] gradient-bg text-white py-6 rounded-3xl font-black text-lg shadow-2xl shadow-indigo-200 hover:shadow-indigo-400 transition-all active:scale-95">Deploy to Timeline</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;