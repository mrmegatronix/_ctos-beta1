import React, { useState, useEffect } from 'react';
import { TeamMember } from '../types';
import { Crown, Delete, Check } from 'lucide-react';

interface LoginScreenProps {
  staff: TeamMember[];
  onLogin: (member: TeamMember) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ staff, onLogin }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [matchedUser, setMatchedUser] = useState<TeamMember | null>(null);

  const attemptLogin = (code: string) => {
    const user = staff.find(s => s.pinCode === code);
    if (user) {
      setMatchedUser(user);
      setTimeout(() => {
        onLogin(user);
      }, 250);
    } else if (code.length === 4) {
      setError(true);
      setTimeout(() => {
        setPin('');
        setError(false);
      }, 1000);
    }
  };

  const handleNum = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError(false);
      attemptLogin(newPin);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
    setMatchedUser(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleNum(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.82), rgba(15, 23, 42, 0.95)), url(./login-bg.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl">
        {/* Header with Master Admin & Role Badge */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-center border-b border-indigo-900/50 relative overflow-hidden">
          <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-amber-300 rounded-2xl mx-auto mb-3 p-0.5 shadow-lg flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Crown className="w-7 h-7 text-amber-400" />
            </div>
          </div>
          <h1 className="text-xl font-black text-white tracking-wide">Coasters Tavern</h1>
          <p className="text-indigo-300 text-xs font-semibold mt-0.5">Venue OS & Master Access Control</p>
        </div>

        {/* PIN Entry Area */}
        <div className="p-6 flex-1 flex flex-col items-center">
          {/* Matched User Display */}
          {matchedUser ? (
            <div className="mb-4 flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold animate-pulse">
              <Check className="w-3.5 h-3.5" />
              <span>
                Authenticating {matchedUser.name} ({matchedUser.role})
              </span>
            </div>
          ) : (
            <div className="mb-4 flex space-x-3">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-200 ${
                    pin.length > i
                      ? 'bg-indigo-600 border-indigo-600 scale-110 shadow-md shadow-indigo-500/50'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}
                />
              ))}
            </div>
          )}

          {error && (
            <div className="text-rose-500 text-xs font-black mb-3 tracking-wide animate-bounce">
              INVALID PIN CODE — ACCESS DENIED
            </div>
          )}

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2.5 w-full max-w-xs mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
              <button
                key={n}
                onClick={() => handleNum(n.toString())}
                className="h-13 rounded-2xl bg-slate-100 dark:bg-slate-700/80 text-xl font-bold text-slate-800 dark:text-slate-100 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 active:scale-95 transition-all shadow-sm flex items-center justify-center"
              >
                {n}
              </button>
            ))}
            <div className="col-start-2">
              <button
                onClick={() => handleNum('0')}
                className="w-full h-13 rounded-2xl bg-slate-100 dark:bg-slate-700/80 text-xl font-bold text-slate-800 dark:text-slate-100 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 active:scale-95 transition-all shadow-sm flex items-center justify-center"
              >
                0
              </button>
            </div>
            <div>
              <button
                onClick={handleBackspace}
                className="w-full h-13 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center hover:bg-rose-100 active:scale-95 transition-all shadow-sm"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-700/60 text-center text-xs text-slate-400">
          <div>Enter your authorized 4-digit staff PIN code to sign in.</div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;