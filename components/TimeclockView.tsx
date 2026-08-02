import React, { useState, useEffect } from 'react';
import { TeamMember } from '../types';
import { Clock, CheckCircle, LogIn, LogOut, X } from 'lucide-react';

interface TimeclockViewProps {
  user: TeamMember | null;
  staff: TeamMember[];
}

const TimeclockView: React.FC<TimeclockViewProps> = ({ staff }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedStaff, setSelectedStaff] = useState<TeamMember | null>(null);
  const [pin, setPin] = useState('');
  const [clockedInStaff, setClockedInStaff] = useState<Record<string, Date>>({});
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleNumClick = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
    }
  };

  const handleClear = () => setPin('');

  const handleAction = (action: 'in' | 'out') => {
    if (!selectedStaff) return;
    
    if (pin.length === 4 || selectedStaff.isDemo) {
        if (action === 'in') {
            setClockedInStaff(prev => ({ ...prev, [selectedStaff.id]: new Date() }));
            showMessage(`Welcome, ${selectedStaff.name}. You are clocked IN.`, 'success');
        } else {
            const newClockedIn = { ...clockedInStaff };
            delete newClockedIn[selectedStaff.id];
            setClockedInStaff(newClockedIn);
            showMessage(`Goodbye, ${selectedStaff.name}. You are clocked OUT.`, 'success');
        }
        setSelectedStaff(null);
        setPin('');
    } else {
        showMessage('Invalid PIN. Please try again.', 'error');
        setPin('');
    }
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
      setMessage({ text, type });
      setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-950 -z-10" />
        
        {message && (
            <div className={`absolute top-10 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl text-lg font-bold animate-in slide-in-from-top flex items-center space-x-2 ${message.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <X className="w-5 h-5" />}
                <span>{message.text}</span>
            </div>
        )}

        <div className="text-center mb-8">
            <h1 className="text-6xl font-black text-white mb-2 drop-shadow-lg tracking-tighter tabular-nums">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </h1>
            <p className="text-xl text-slate-400 font-medium">CT-Clock Terminal</p>
        </div>

        <div className="flex gap-8 w-full max-w-5xl h-[500px]">
            <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md flex flex-col">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <Clock className="w-6 h-6 mr-3 text-indigo-400" />
                    Select Your Name
                </h3>
                <div className="grid grid-cols-2 gap-3 overflow-y-auto custom-scrollbar pr-2 flex-1">
                    {staff.map(member => {
                        const isClockedIn = !!clockedInStaff[member.id];
                        return (
                            <button
                                key={member.id}
                                onClick={() => {
                                    setSelectedStaff(member);
                                    setPin('');
                                }}
                                className={`p-4 rounded-xl flex items-center space-x-3 transition-all text-left border ${
                                    selectedStaff?.id === member.id 
                                        ? 'bg-indigo-600/30 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' 
                                        : 'bg-white/5 border-white/5 hover:bg-white/10'
                                }`}
                            >
                                <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full border border-white/20" />
                                <div className="flex-1 overflow-hidden">
                                    <div className="font-bold text-white truncate text-sm">{member.name}</div>
                                    <div className="text-xs text-slate-400 flex items-center space-x-1 mt-1">
                                        <div className={`w-2 h-2 rounded-full ${isClockedIn ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                                        <span className="text-[10px] uppercase tracking-wider">{isClockedIn ? 'IN' : 'OUT'}</span>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="w-[400px] flex flex-col bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
                {selectedStaff ? (
                    <>
                        <div className="text-center mb-4">
                            <img src={selectedStaff.avatar} alt="Avatar" className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-white/10 shadow-lg" />
                            <h3 className="text-xl font-bold text-white">{selectedStaff.name}</h3>
                            <p className="text-slate-400 text-xs">{selectedStaff.role}</p>
                        </div>

                        <div className="flex justify-center space-x-3 mb-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className={`w-3 h-3 rounded-full border-2 transition-colors ${i < pin.length ? 'bg-white border-white shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'border-white/30'}`} />
                            ))}
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                <button 
                                    key={num} 
                                    onClick={() => handleNumClick(num.toString())}
                                    className="h-12 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xl font-bold text-white transition-all active:scale-95"
                                >
                                    {num}
                                </button>
                            ))}
                            <button onClick={handleClear} className="h-12 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-sm transition-all active:scale-95">CLR</button>
                            <button onClick={() => handleNumClick('0')} className="h-12 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xl font-bold text-white transition-all active:scale-95">0</button>
                            <button onClick={() => setSelectedStaff(null)} className="h-12 rounded-xl bg-slate-700/50 hover:bg-slate-700 border border-white/10 text-slate-300 font-bold transition-all active:scale-95 flex items-center justify-center">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-auto">
                            <button 
                                onClick={() => handleAction('in')}
                                disabled={pin.length < 4 && !selectedStaff.isDemo}
                                className="flex flex-col items-center py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white rounded-xl transition-all shadow-lg active:scale-95 border border-emerald-500/50"
                            >
                                <LogIn className="w-5 h-5 mb-1" />
                                <span className="text-sm font-bold">CLOCK IN</span>
                            </button>
                            <button 
                                onClick={() => handleAction('out')}
                                disabled={pin.length < 4 && !selectedStaff.isDemo}
                                className="flex flex-col items-center py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:hover:bg-rose-600 text-white rounded-xl transition-all shadow-lg active:scale-95 border border-rose-500/50"
                            >
                                <LogOut className="w-5 h-5 mb-1" />
                                <span className="text-sm font-bold">CLOCK OUT</span>
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                        <Clock className="w-16 h-16 text-white/20 mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">Select Your Profile</h3>
                        <p className="text-slate-400 text-sm">Choose your name from the list to clock in or out.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default TimeclockView;
