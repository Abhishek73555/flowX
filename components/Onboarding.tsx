import React, { useState } from 'react';
import { UserProfile, DayOfWeek } from '../types';
import { PROFESSIONS, DAYS_OF_WEEK } from '../constants';

interface OnboardingProps {
  onComplete: (profile: Partial<UserProfile>) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    profession: 'Student',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    regularHours: { start: '09:00', end: '17:00' },
    extraHours: [],
  });

  const next = () => setStep(s => s + 1);
  const prev = () => setStep(s => s - 1);

  const toggleDay = (day: DayOfWeek) => {
    setProfile(p => ({
      ...p,
      workingDays: p.workingDays?.includes(day)
        ? p.workingDays.filter(d => d !== day)
        : [...(p.workingDays || []), day]
    }));
  };

  const handleFinish = () => {
    onComplete(profile);
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="glass rounded-[3rem] shadow-2xl overflow-hidden border-white/60">
        <div className="bg-indigo-50 h-3">
          <div
            className="gradient-bg h-full transition-all duration-700 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>

        <div className="p-12">
          {step === 1 && (
            <div className="animate-in slide-in-from-right duration-500">
              <span className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">Step 01</span>
              <h2 className="text-4xl font-black text-slate-800 mt-4 mb-2">Identify Yourself</h2>
              <p className="text-slate-500 font-medium mb-10">We tailor flow-x suggestions based on your daily grind.</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {PROFESSIONS.map(p => (
                  <button
                    key={p}
                    onClick={() => setProfile(prev => ({ ...prev, profession: p }))}
                    className={`p-6 rounded-[2rem] text-center transition-all border-2 flex flex-col items-center justify-center space-y-3 group ${profile.profession === p
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200 ring-4 ring-indigo-50'
                        : 'bg-white/50 border-slate-100 hover:border-indigo-200 text-slate-600'
                      }`}
                  >
                    <span className={`text-sm font-extrabold ${profile.profession === p ? 'text-white' : 'text-slate-800'}`}>{p}</span>
                  </button>
                ))}
              </div>

              {profile.profession === 'Other' && (
                <div className="mt-8 animate-in fade-in duration-300">
                  <input
                    type="text"
                    placeholder="Describe your profession..."
                    className="w-full p-5 rounded-2xl bg-white border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-800 transition-all shadow-sm"
                    value={profile.customProfession || ''}
                    onChange={(e) => setProfile(p => ({ ...p, customProfession: e.target.value }))}
                  />
                </div>
              )}

              <button
                onClick={next}
                disabled={profile.profession === 'Other' && !profile.customProfession}
                className="w-full gradient-bg text-white py-5 rounded-[2rem] font-black text-xl mt-12 shadow-xl shadow-indigo-200 hover:shadow-indigo-300 transition-all active:scale-95 disabled:opacity-30"
              >
                Continue Adventure
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in slide-in-from-right duration-500">
              <span className="bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">Step 02</span>
              <h2 className="text-4xl font-black text-slate-800 mt-4 mb-2">Select Working Days</h2>
              <p className="text-slate-500 font-medium mb-10">When are you officially in the zone?</p>

              <div className="grid grid-cols-2 gap-3">
                {DAYS_OF_WEEK.map(day => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`p-4 rounded-2xl border-2 font-bold transition-all text-sm ${profile.workingDays?.includes(day)
                        ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-100'
                        : 'bg-white border-slate-100 text-slate-500 hover:border-purple-200'
                      }`}
                  >
                    {day}
                  </button>
                ))}
              </div>

              <div className="flex space-x-4 mt-12">
                <button onClick={prev} className="flex-1 py-4 border-2 border-slate-100 rounded-[2rem] text-slate-400 font-bold hover:bg-slate-50 transition-all">Back</button>
                <button onClick={next} className="flex-[2] gradient-bg text-white py-4 rounded-[2rem] font-black shadow-lg shadow-purple-200 transition-all active:scale-95">Next Step</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in slide-in-from-right duration-500">
              <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">Step 03</span>
              <h2 className="text-4xl font-black text-slate-800 mt-4 mb-2">Prime Hours</h2>
              <p className="text-slate-500 font-medium mb-10">Define your focus blocks. flow-x won't interrupt these.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Start of Duty</label>
                  <input
                    type="time"
                    className="w-full p-5 border-2 border-slate-100 rounded-3xl text-2xl font-black text-slate-800 outline-none focus:border-emerald-500 transition-all shadow-sm"
                    value={profile.regularHours?.start}
                    onChange={(e) => setProfile(p => ({ ...p, regularHours: { ...p.regularHours!, start: e.target.value } }))}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">End of Duty</label>
                  <input
                    type="time"
                    className="w-full p-5 border-2 border-slate-100 rounded-3xl text-2xl font-black text-slate-800 outline-none focus:border-emerald-500 transition-all shadow-sm"
                    value={profile.regularHours?.end}
                    onChange={(e) => setProfile(p => ({ ...p, regularHours: { ...p.regularHours!, end: e.target.value } }))}
                  />
                </div>
              </div>

              <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 mt-10">
                <div className="flex items-start space-x-3">
                  <div className="bg-emerald-200 p-1.5 rounded-full mt-0.5">
                    <svg className="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <p className="text-emerald-800 text-sm font-semibold leading-relaxed">
                    Setting clear boundaries allows flow-x to prioritize your recovery and habit growth during off-hours.
                  </p>
                </div>
              </div>

              <div className="flex space-x-4 mt-12">
                <button onClick={prev} className="flex-1 py-4 border-2 border-slate-100 rounded-[2rem] text-slate-400 font-bold hover:bg-slate-50 transition-all">Back</button>
                <button onClick={handleFinish} className="flex-[2] bg-slate-800 text-white py-4 rounded-[2rem] font-black shadow-2xl hover:bg-slate-900 transition-all active:scale-95">Finish Setup</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;