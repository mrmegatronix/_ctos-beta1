import React, { useState, useEffect, useMemo } from 'react';
import { TeamMember, TimePunch } from '../types';
import { db } from '../services/database';
import { Clock, CheckCircle, LogIn, LogOut, Coffee, ShieldCheck, List, AlertCircle } from 'lucide-react';
import { formatTime, formatDate } from '../utils';

interface TimeclockViewProps {
  user: TeamMember;
  staff: TeamMember[];
}

const TimeclockView: React.FC<TimeclockViewProps> = ({ user, staff }) => {
  const [punches, setPunches] = useState<TimePunch[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'personal' | 'manager'>('personal');

  const isManager = ['General Manager', 'Duty Manager', 'Admin'].includes(user.role);

  // Load time punches
  useEffect(() => {
    const loadPunches = async () => {
      setLoading(true);
      try {
        const data = await db.getTimePunches();
        // Sort newest first
        const sorted = data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setPunches(sorted);
      } catch (err) {
        console.error("Error loading time punches:", err);
      } finally {
        setLoading(false);
      }
    };
    loadPunches();
  }, []);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute status for the active user
  const userPunches = useMemo(() => punches.filter(p => p.staffId === user.id), [punches, user.id]);
  const lastPunch = userPunches.length > 0 ? userPunches[0] : null;

  let currentStatus: 'Clocked Out' | 'Clocked In' | 'On Break' = 'Clocked Out';
  if (lastPunch) {
    if (lastPunch.type === 'clock-in' || lastPunch.type === 'end-break') {
      currentStatus = 'Clocked In';
    } else if (lastPunch.type === 'start-break') {
      currentStatus = 'On Break';
    }
  }

  const handlePunch = async (type: TimePunch['type']) => {
    const newPunch: TimePunch = {
      id: `punch_${Date.now()}`,
      staffId: user.id,
      type,
      timestamp: new Date()
    };
    
    // Optimistic UI update
    setPunches(prev => [newPunch, ...prev]);

    try {
      await db.saveTimePunch(newPunch);
    } catch (err) {
      console.error("Failed to save punch:", err);
      // Rollback if needed, but keeping it simple
    }
  };

  // Manager View computations
  const currentlyClockedIn = useMemo(() => {
    const statusMap = new Map<string, TimePunch>();
    
    // Since punches are sorted newest first, we just take the first punch per staffId
    punches.forEach(p => {
      if (!statusMap.has(p.staffId)) {
        statusMap.set(p.staffId, p);
      }
    });

    const activeStaff: { member: TeamMember, status: 'Clocked In' | 'On Break', since: Date }[] = [];
    statusMap.forEach((punch, staffId) => {
      if (punch.type === 'clock-in' || punch.type === 'end-break' || punch.type === 'start-break') {
        const member = staff.find(s => s.id === staffId);
        if (member) {
          activeStaff.push({
            member,
            status: punch.type === 'start-break' ? 'On Break' : 'Clocked In',
            since: new Date(punch.timestamp)
          });
        }
      }
    });

    return activeStaff;
  }, [punches, staff]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-900 text-white">
      {/* Top Header / Tabs */}
      <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900/50">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
            <Clock size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Time Clock</h1>
            <p className="text-gray-400">Welcome, {user.name} ({user.role})</p>
          </div>
        </div>

        {isManager && (
          <div className="flex space-x-2 bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('personal')}
              className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-colors ${
                activeTab === 'personal' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Clock size={18} />
              <span>Personal</span>
            </button>
            <button
              onClick={() => setActiveTab('manager')}
              className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-colors ${
                activeTab === 'manager' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <ShieldCheck size={18} />
              <span>Manager</span>
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'personal' ? (
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Clock Terminal */}
            <div className="glass-panel p-8 flex flex-col items-center justify-center text-center">
              <div className="mb-4">
                <div className="text-6xl font-black text-white tracking-tighter tabular-nums drop-shadow-lg">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
                <div className="text-xl text-blue-300 font-medium mt-2">
                  {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>

              <div className={`mt-6 mb-10 inline-flex items-center space-x-2 px-6 py-3 rounded-full text-lg font-semibold border ${
                currentStatus === 'Clocked In' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                currentStatus === 'On Break' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                'bg-gray-800 text-gray-400 border-gray-700'
              }`}>
                {currentStatus === 'Clocked In' && <CheckCircle size={20} />}
                {currentStatus === 'On Break' && <Coffee size={20} />}
                {currentStatus === 'Clocked Out' && <LogOut size={20} />}
                <span>Status: {currentStatus}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full">
                {currentStatus === 'Clocked Out' ? (
                  <button 
                    onClick={() => handlePunch('clock-in')}
                    className="col-span-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-6 rounded-2xl flex flex-col items-center justify-center transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-blue-900/20"
                  >
                    <LogIn size={32} className="mb-2" />
                    <span className="text-xl">Clock In</span>
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => handlePunch('clock-out')}
                      className="bg-red-600/90 hover:bg-red-500 text-white font-bold py-6 rounded-2xl flex flex-col items-center justify-center transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-red-900/20"
                    >
                      <LogOut size={32} className="mb-2" />
                      <span className="text-xl">Clock Out</span>
                    </button>

                    {currentStatus === 'Clocked In' ? (
                      <button 
                        onClick={() => handlePunch('start-break')}
                        className="bg-yellow-600/90 hover:bg-yellow-500 text-white font-bold py-6 rounded-2xl flex flex-col items-center justify-center transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-yellow-900/20"
                      >
                        <Coffee size={32} className="mb-2" />
                        <span className="text-xl">Start Break</span>
                      </button>
                    ) : (
                      <button 
                        onClick={() => handlePunch('end-break')}
                        className="bg-green-600/90 hover:bg-green-500 text-white font-bold py-6 rounded-2xl flex flex-col items-center justify-center transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-green-900/20"
                      >
                        <LogIn size={32} className="mb-2" />
                        <span className="text-xl">End Break</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Recent History */}
            <div className="glass-panel p-6 flex flex-col">
              <div className="flex items-center space-x-2 mb-6">
                <List className="text-blue-400" size={24} />
                <h3 className="text-xl font-bold text-white">Recent Punches</h3>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {userPunches.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <AlertCircle size={48} className="mb-4 opacity-50" />
                    <p>No recent time punches found.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userPunches.slice(0, 10).map((punch, idx) => {
                      const punchDate = new Date(punch.timestamp);
                      return (
                        <div key={punch.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${
                              punch.type === 'clock-in' || punch.type === 'end-break' ? 'bg-green-500/20 text-green-400' :
                              punch.type === 'start-break' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {punch.type === 'clock-in' ? <LogIn size={18} /> : 
                               punch.type === 'clock-out' ? <LogOut size={18} /> : 
                               <Coffee size={18} />}
                            </div>
                            <div>
                              <div className="font-medium text-white capitalize">{punch.type.replace('-', ' ')}</div>
                              <div className="text-sm text-gray-400">{punchDate.toLocaleDateString()}</div>
                            </div>
                          </div>
                          <div className="text-lg font-bold text-gray-200">
                            {punchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>
        ) : (
          <div className="max-w-6xl mx-auto glass-panel p-6">
             <div className="flex items-center space-x-2 mb-6">
                <Users className="text-blue-400" size={24} />
                <h3 className="text-xl font-bold text-white">Currently On-Site</h3>
              </div>

              {currentlyClockedIn.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-gray-500">
                  <CheckCircle size={48} className="mb-4 opacity-50" />
                  <p className="text-lg">No staff currently clocked in.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentlyClockedIn.map(active => (
                    <div key={active.member.id} className="p-5 bg-gray-800/50 rounded-xl border border-gray-700/50 flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {active.member.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-white text-lg">{active.member.name}</div>
                        <div className="text-sm text-gray-400">{active.member.role}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-semibold mb-1 ${
                          active.status === 'On Break' ? 'text-yellow-400' : 'text-green-400'
                        }`}>
                          {active.status}
                        </div>
                        <div className="text-xs text-gray-500">
                          Since {active.since.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

// Quick fix for missing Users icon
import { Users } from 'lucide-react';

export default TimeclockView;
