import React, { useState } from 'react';
import { TeamMember } from '../types';
import { ShieldCheck, UserCircle, Delete } from 'lucide-react';

interface LoginScreenProps {
  staff: TeamMember[];
  onLogin: (member: TeamMember) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ staff, onLogin }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleNum = (num: string) => {
    if (pin.length < 4) { // Allow up to 4 digits
      const newPin = pin + num;
      setPin(newPin);
      setError(false);
      
      // Attempt login on every keypress to support mixed length PINs (2 or 4 digits)
      attemptLogin(newPin);
    }
  };

  const attemptLogin = (code: string) => {
    const user = staff.find(s => s.pinCode === code);
    if (user) {
      onLogin(user);
    } else if (code.length === 4) {
      // Only error if we've reached max length and still no user
      setError(true);
      setTimeout(() => {
          setPin('');
          setError(false);
      }, 1000);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  React.useEffect(() => {
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
    <div className="min-h-screen transition-colors flex items-center justify-center p-4" style={{ backgroundImage: 'url(/landing_bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="glass-panel  w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-100 ">
        <div className="p-4 bg-indigo-600 text-center">
           <div className="w-12 h-12 bg-black rounded-full mx-auto mb-2 border-2 border-amber-500 flex items-center justify-center">
             <img src="https://placehold.co/400x400/000000/D4AF37?text=CT" alt="Logo" className="w-full h-full object-cover rounded-full" />
           </div>
           <h1 className="text-xl font-bold text-white">Coasters Tavern</h1>
           <p className="text-indigo-200 text-xs">Staff Access</p>
        </div>

        <div className="p-6 flex-1 flex flex-col items-center">
           <div className="mb-4 flex space-x-4">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all ${pin.length > i ? 'bg-indigo-600 border-indigo-600 scale-110' : 'border-white/20'}`}></div>
              ))}
           </div>
           
           {error && <div className="text-red-500 text-sm font-bold mb-4 animate-pulse">Invalid Code</div>}

           <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
              {[1,2,3,4,5,6,7,8,9].map(n => (
                  <button 
                    key={n}
                    onClick={() => handleNum(n.toString())}
                    className="h-14 rounded-xl bg-gray-100 dark:bg-slate-700 text-2xl font-bold text-slate-800 dark:text-slate-100 hover:bg-indigo-100 dark:hover:bg-slate-600 active:scale-95 transition-all"
                  >
                    {n}
                  </button>
              ))}
              <div className="col-start-2">
                 <button 
                    onClick={() => handleNum('0')}
                    className="w-full h-14 rounded-xl bg-gray-100 dark:bg-slate-700 text-2xl font-bold text-slate-800 dark:text-slate-100 hover:bg-indigo-100 dark:hover:bg-slate-600 active:scale-95 transition-all"
                  >
                    0
                  </button>
              </div>
              <div>
                  <button 
                    onClick={handleBackspace}
                    className="w-full h-14 rounded-xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 flex items-center justify-center hover:bg-rose-200 active:scale-95 transition-all"
                  >
                    <Delete className="w-6 h-6" />
                  </button>
              </div>
           </div>
        </div>

        <div className="p-3 glass-panel  text-center text-xs text-gray-400">
           <div>Use your 4-digit staff PIN to sign in.</div>
           <button onClick={() => alert('Please contact Management to reset your PIN.')} className="mt-2 text-indigo-500 hover:underline">Forgot PIN / Request Access</button>
           <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
              <p className="font-bold text-gray-600 dark:text-gray-300">Coasters Tavern</p>
              <p>1 Daniels Road, Redwood, Christchurch</p>
              <p>Phone: (03) 352 0210 | Email: info@coasterstavern.co.nz</p>
              <p>Trading Hours: Monday - Sunday 10:00am - Late</p>
           </div>
           <div className="mt-2 opacity-30">Build: {(window as any).__COMMIT_INFO__ || 'Development'}</div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;