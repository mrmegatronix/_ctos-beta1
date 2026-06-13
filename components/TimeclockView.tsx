import React, { useState, useEffect } from 'react';
import { TeamMember, TimePunch } from '../types';
import { Clock, UserCheck, Play, Square, Coffee } from 'lucide-react';
import { generateId } from '../utils';

interface TimeclockViewProps {
  staff: TeamMember[];
  onPunch: (punch: TimePunch) => void;
}

const TimeclockView: React.FC<TimeclockViewProps> = ({ staff, onPunch }) => {
  const [pin, setPin] = useState('');
  const [activeStaff, setActiveStaff] = useState<TeamMember | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePinEntry = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      
      // Auto-submit if we find a match
      const matched = staff.find(s => s.pinCode === newPin);
      if (matched) {
        setActiveStaff(matched);
        setPin(''); // Reset for security
      }
    }
  };

  const handleClear = () => {
    setPin('');
    setActiveStaff(null);
  };

  const handleAction = (type: TimePunch['type']) => {
    if (activeStaff) {
      onPunch({
        id: generateId(),
        staffId: activeStaff.id,
        type,
        timestamp: new Date()
      });
      // Show success message briefly then clear
      setTimeout(handleClear, 1500);
    }
  };

  if (activeStaff) {
    return (
      <div className="flex-1 p-8 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center border border-slate-200 dark:border-slate-700">
          <img src={activeStaff.avatar} alt={activeStaff.name} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-indigo-100 dark:border-indigo-900/50 object-cover" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Hello, {activeStaff.name}</h2>
          <p className="text-slate-500 mb-8">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => handleAction('clock-in')} className="p-4 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl flex flex-col items-center justify-center transition-colors">
              <Play className="w-8 h-8 mb-2" />
              <span className="font-bold">Clock In</span>
            </button>
            <button onClick={() => handleAction('start-break')} className="p-4 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-xl flex flex-col items-center justify-center transition-colors">
              <Coffee className="w-8 h-8 mb-2" />
              <span className="font-bold">Start Break</span>
            </button>
            <button onClick={() => handleAction('end-break')} className="p-4 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-xl flex flex-col items-center justify-center transition-colors">
              <UserCheck className="w-8 h-8 mb-2" />
              <span className="font-bold">End Break</span>
            </button>
            <button onClick={() => handleAction('clock-out')} className="p-4 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl flex flex-col items-center justify-center transition-colors">
              <Square className="w-8 h-8 mb-2" />
              <span className="font-bold">Clock Out</span>
            </button>
          </div>
          <button onClick={handleClear} className="mt-8 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium">Cancel / Not You?</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center border border-slate-200 dark:border-slate-700">
        <div className="inline-flex items-center justify-center p-4 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-full mb-6">
          <Clock className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</h2>
        <p className="text-slate-500 mb-8">Enter your PIN to clock in or out.</p>

        <div className="mb-6 flex justify-center space-x-2">
            {[0, 1, 2, 3].map(i => (
                <div key={i} className={`w-4 h-4 rounded-full ${i < pin.length ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
            ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handlePinEntry(num.toString())}
              className="p-4 text-2xl font-bold bg-slate-50 hover:bg-slate-100 dark:bg-slate-700/50 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl transition-colors"
            >
              {num}
            </button>
          ))}
          <button onClick={handleClear} className="p-4 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">CLEAR</button>
          <button onClick={() => handlePinEntry('0')} className="p-4 text-2xl font-bold bg-slate-50 hover:bg-slate-100 dark:bg-slate-700/50 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl transition-colors">0</button>
          <div></div>
        </div>
      </div>
    </div>
  );
};

export default TimeclockView;
