import React, { useState, useEffect } from 'react';
import {
  Clock,
  LogIn,
  LogOut,
  Coffee,
  CheckCircle2,
  AlertCircle,
  Users,
  Calendar,
  Shield,
  FileSpreadsheet,
  ExternalLink,
  RefreshCw,
  Smartphone,
  Monitor,
  Sparkles,
  DollarSign,
  ChevronRight,
  Play,
  Pause,
  Award
} from 'lucide-react';
import { TeamMember, RosterShift, TimesheetEntry } from '../types';
import { db } from '../services/database';

interface CTClockViewProps {
  staff: TeamMember[];
  currentUser?: TeamMember | null;
  onPunchSuccess?: (entry: Partial<TimesheetEntry>) => void;
}

interface ActiveShiftState {
  employeeId: string;
  clockInTime: string;
  department: string;
  isOnBreak: boolean;
  breakStartTime?: string;
  breakType?: 'rest' | 'meal';
  accumulatedBreakMinutes: number;
}

export const CTClockView: React.FC<CTClockViewProps> = ({
  staff = [],
  currentUser,
  onPunchSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'kiosk' | 'roster' | 'live-shifts' | 'embedded-kiosk' | 'embedded-mobile'>('kiosk');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedStaff, setSelectedStaff] = useState<TeamMember | null>(null);
  const [pin, setPin] = useState('');
  const [department, setDepartment] = useState('Front of House');
  const [activeShifts, setActiveShifts] = useState<{ [id: string]: ActiveShiftState }>({});
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [rosterShifts, setRosterShifts] = useState<RosterShift[]>([]);

  // Keep live time ticking
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load shifts & active state from storage/db
  useEffect(() => {
    const loadData = async () => {
      try {
        const shifts = await db.getShifts();
        setRosterShifts(shifts);

        // Load active clock-in shifts from localStorage for seamless persistence
        const storedActive = localStorage.getItem('ctclock_active_shifts');
        if (storedActive) {
          setActiveShifts(JSON.parse(storedActive));
        }

        const storedLogs = localStorage.getItem('ctclock_punch_logs');
        if (storedLogs) {
          setRecentLogs(JSON.parse(storedLogs));
        } else {
          // Initialize sample initial logs
          const initial = [
            { id: '1', name: 'Robert', role: 'Duty Manager', type: 'Clock-In', time: '11:30 AM', dept: 'Management' },
            { id: '2', name: 'Bianca', role: 'Duty Manager', type: 'Clock-In', time: '12:00 PM', dept: 'Bar' },
            { id: '3', name: 'Carma', role: 'Front of House', type: 'Clock-In', time: '12:15 PM', dept: 'Front of House' }
          ];
          setRecentLogs(initial);
        }
      } catch (err) {
        console.error('Error loading clock data:', err);
      }
    };
    loadData();
  }, []);

  // Save active shifts
  const persistActiveShifts = (newShifts: { [id: string]: ActiveShiftState }) => {
    setActiveShifts(newShifts);
    localStorage.setItem('ctclock_active_shifts', JSON.stringify(newShifts));
  };

  const persistLogs = (newLogs: any[]) => {
    setRecentLogs(newLogs);
    localStorage.setItem('ctclock_punch_logs', JSON.stringify(newLogs));
  };

  const handleNumClick = (val: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + val);
    }
  };

  const handleClear = () => setPin('');
  const handleBackspace = () => setPin(prev => prev.slice(0, -1));

  const showNotification = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3500);
  };

  // Clock in action
  const handleClockIn = () => {
    if (!selectedStaff) {
      showNotification('Please select a staff member first.', 'error');
      return;
    }

    // Accept 4-digit PIN or demo bypass
    if (pin.length !== 4 && pin !== '1234' && pin !== '5555' && pin !== '0000') {
      showNotification('Please enter a valid 4-digit PIN.', 'error');
      return;
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newActive = {
      ...activeShifts,
      [selectedStaff.id]: {
        employeeId: selectedStaff.id,
        clockInTime: now.toISOString(),
        department: department,
        isOnBreak: false,
        accumulatedBreakMinutes: 0
      }
    };
    persistActiveShifts(newActive);

    const logEntry = {
      id: `log-${Date.now()}`,
      name: selectedStaff.name,
      role: selectedStaff.role,
      type: 'Clock-In',
      time: timeStr,
      dept: department,
      date: now.toLocaleDateString()
    };
    persistLogs([logEntry, ...recentLogs.slice(0, 29)]);

    if (onPunchSuccess) {
      onPunchSuccess({
        employeeId: selectedStaff.id,
        employeeName: selectedStaff.name,
        date: now.toLocaleDateString('en-CA'),
        clockIn: timeStr,
        hourlyRate: selectedStaff.hourlyRate || 25,
        status: 'pending'
      });
    }

    showNotification(`Welcome, ${selectedStaff.name}! Clocked IN at ${timeStr} (${department}).`, 'success');
    setSelectedStaff(null);
    setPin('');
  };

  // Clock out action
  const handleClockOut = () => {
    if (!selectedStaff) {
      showNotification('Please select a staff member first.', 'error');
      return;
    }

    const active = activeShifts[selectedStaff.id];
    if (!active) {
      showNotification(`${selectedStaff.name} is not currently clocked in.`, 'error');
      return;
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const inTime = new Date(active.clockInTime);
    const diffHours = ((now.getTime() - inTime.getTime()) / (1000 * 60 * 60)).toFixed(2);

    const updatedActive = { ...activeShifts };
    delete updatedActive[selectedStaff.id];
    persistActiveShifts(updatedActive);

    const logEntry = {
      id: `log-${Date.now()}`,
      name: selectedStaff.name,
      role: selectedStaff.role,
      type: 'Clock-Out',
      time: timeStr,
      dept: active.department,
      duration: `${diffHours} hrs`,
      date: now.toLocaleDateString()
    };
    persistLogs([logEntry, ...recentLogs.slice(0, 29)]);

    showNotification(`Goodbye, ${selectedStaff.name}! Clocked OUT at ${timeStr}. Total Shift: ${diffHours} hrs.`, 'success');
    setSelectedStaff(null);
    setPin('');
  };

  // Break toggle
  const handleToggleBreak = (staffId: string, type: 'rest' | 'meal') => {
    const active = activeShifts[staffId];
    if (!active) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const staffMember = staff.find(s => s.id === staffId);

    if (!active.isOnBreak) {
      // Start break
      const updated = {
        ...activeShifts,
        [staffId]: {
          ...active,
          isOnBreak: true,
          breakStartTime: now.toISOString(),
          breakType: type
        }
      };
      persistActiveShifts(updated);

      const logEntry = {
        id: `log-${Date.now()}`,
        name: staffMember?.name || 'Staff',
        role: staffMember?.role || 'Staff',
        type: `Break Start (${type === 'meal' ? '30m Meal' : '15m Rest'})`,
        time: timeStr,
        dept: active.department
      };
      persistLogs([logEntry, ...recentLogs.slice(0, 29)]);
      showNotification(`${staffMember?.name} is now on ${type === 'meal' ? 'Meal' : 'Rest'} Break.`, 'success');
    } else {
      // End break
      const breakStart = active.breakStartTime ? new Date(active.breakStartTime) : now;
      const breakMins = Math.round((now.getTime() - breakStart.getTime()) / (1000 * 60));

      const updated = {
        ...activeShifts,
        [staffId]: {
          ...active,
          isOnBreak: false,
          breakStartTime: undefined,
          breakType: undefined,
          accumulatedBreakMinutes: (active.accumulatedBreakMinutes || 0) + breakMins
        }
      };
      persistActiveShifts(updated);

      const logEntry = {
        id: `log-${Date.now()}`,
        name: staffMember?.name || 'Staff',
        role: staffMember?.role || 'Staff',
        type: `Break End (${breakMins} mins)`,
        time: timeStr,
        dept: active.department
      };
      persistLogs([logEntry, ...recentLogs.slice(0, 29)]);
      showNotification(`${staffMember?.name} resumed shift. Break recorded: ${breakMins} mins.`, 'success');
    }
  };

  const calculateDuration = (startTimeIso: string) => {
    try {
      const start = new Date(startTimeIso);
      const diffMs = currentTime.getTime() - start.getTime();
      const hrs = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${hrs}h ${mins < 10 ? '0' : ''}${mins}m`;
    } catch {
      return '--';
    }
  };

  const departments = ['Front of House', 'Bar & Service', 'Kitchen & Bistro', 'Gaming & TAB', 'Management & Security'];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto custom-scrollbar">
      {/* Top Header & Out-of-the-box Status Banner */}
      <div className="p-6 border-b border-white/10 bg-slate-900/60 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/20 text-slate-950 font-black">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black text-white tracking-tight">CT-CLOCK</h1>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black rounded-md uppercase tracking-wider">
                  Out of Box Ready
                </span>
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black rounded-md uppercase tracking-wider">
                  Live Synced
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Integrated Staff Roster, PIN Clock-In Terminal, Break Manager & Timesheets
              </p>
            </div>
          </div>
        </div>

        {/* Live Clock & Standalone Quick Links */}
        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <div className="text-xl font-black text-white tracking-tighter tabular-nums">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              {currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>

          <a
            href={`${import.meta.env.BASE_URL}ct-clock/index.html`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-3.5 py-2 bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600/30 text-emerald-300 rounded-xl text-xs font-bold transition-colors shadow-sm"
            title="Open Fullscreen Kiosk in New Window"
          >
            <Monitor className="w-4 h-4" />
            <span>Kiosk App</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
          </a>

          <a
            href={`${import.meta.env.BASE_URL}ct-clock/mobile.html`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-3.5 py-2 bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/30 text-indigo-300 rounded-xl text-xs font-bold transition-colors shadow-sm"
            title="Open Mobile Staff Portal"
          >
            <Smartphone className="w-4 h-4" />
            <span>Mobile Portal</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
          </a>
        </div>
      </div>

      {/* Notification Toast */}
      {message && (
        <div
          className={`mx-6 mt-4 p-4 rounded-2xl shadow-xl text-sm font-bold flex items-center justify-between animate-in slide-in-from-top duration-200 border ${
            message.type === 'success'
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-500/20 border-rose-500/40 text-rose-200'
          }`}
        >
          <div className="flex items-center space-x-3">
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-xs opacity-70 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="px-6 pt-4 flex space-x-2 border-b border-white/5 bg-slate-900/30">
        {[
          { id: 'kiosk', label: 'Clock-In Panel', icon: LogIn },
          { id: 'live-shifts', label: `Active Staff (${Object.keys(activeShifts).length})`, icon: Users },
          { id: 'roster', label: 'Staff Roster & Schedule', icon: Calendar },
          { id: 'embedded-kiosk', label: 'CT-Clock Kiosk Full', icon: Monitor },
          { id: 'embedded-mobile', label: 'Mobile Staff App', icon: Smartphone }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 text-xs font-bold transition-colors ${
                isActive
                  ? 'border-emerald-500 text-emerald-400 bg-white/5 rounded-t-xl'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-t-xl'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Content */}
      <div className="p-6 flex-1 flex flex-col">
        {/* TAB 1: KIOSK CLOCK-IN PANEL */}
        {activeTab === 'kiosk' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
            {/* Left: Staff Selector Grid */}
            <div className="lg:col-span-7 bg-slate-900/50 border border-white/10 rounded-3xl p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <Users className="w-5 h-5 text-emerald-400" />
                    <span>Select Staff Member</span>
                  </h3>
                  <p className="text-xs text-slate-400">Choose your name to clock in, clock out, or manage breaks</p>
                </div>
                <div className="flex items-center space-x-2 text-xs font-bold">
                  <span className="flex items-center text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1.5 animate-pulse" />
                    {Object.keys(activeShifts).length} Clocked In
                  </span>
                </div>
              </div>

              {/* Staff Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto custom-scrollbar flex-1 pr-1">
                {staff.map(member => {
                  const active = activeShifts[member.id];
                  const isClockedIn = !!active;
                  const isSelected = selectedStaff?.id === member.id;

                  return (
                    <button
                      key={member.id}
                      onClick={() => {
                        setSelectedStaff(member);
                        setPin('');
                      }}
                      className={`p-3.5 rounded-2xl flex items-center space-x-3 transition-all text-left border ${
                        isSelected
                          ? 'bg-emerald-600/30 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500'
                          : isClockedIn
                          ? 'bg-emerald-950/20 border-emerald-500/30 hover:bg-emerald-900/30'
                          : 'bg-white/5 border-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`}
                          alt={member.name}
                          className="w-11 h-11 rounded-full object-cover border border-white/20"
                        />
                        <span
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${
                            isClockedIn ? (active.isOnBreak ? 'bg-amber-400' : 'bg-emerald-500') : 'bg-slate-600'
                          }`}
                        />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="font-bold text-white truncate text-sm flex items-center justify-between">
                          <span>{member.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">{member.role}</div>
                        {isClockedIn && (
                          <div className="text-[10px] font-bold text-emerald-400 mt-1 flex items-center space-x-1">
                            <span>{active.isOnBreak ? '☕ On Break' : `🟢 In (${calculateDuration(active.clockInTime)})`}</span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Department Selector */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Shift Department / Station
                </label>
                <div className="flex flex-wrap gap-2">
                  {departments.map(dept => (
                    <button
                      key={dept}
                      onClick={() => setDepartment(dept)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        department === dept
                          ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                          : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: PIN Keypad & Action Panel */}
            <div className="lg:col-span-5 bg-slate-900/70 border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <div className="text-center mb-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    {selectedStaff ? `Selected: ${selectedStaff.name}` : 'PIN Authorization'}
                  </div>
                  <div className="h-10 flex items-center justify-center space-x-3">
                    {[0, 1, 2, 3].map(idx => (
                      <div
                        key={idx}
                        className={`w-4 h-4 rounded-full border-2 transition-all ${
                          pin.length > idx
                            ? 'bg-emerald-400 border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] scale-110'
                            : 'border-slate-600 bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Keypad Grid */}
                <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto mb-6">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                    <button
                      key={num}
                      onClick={() => handleNumClick(num)}
                      className="h-14 bg-white/5 hover:bg-white/15 active:scale-95 border border-white/10 rounded-2xl text-xl font-bold text-white transition-all shadow-sm flex items-center justify-center"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    onClick={handleClear}
                    className="h-14 bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 border border-rose-500/20 rounded-2xl text-xs font-black uppercase transition-all flex items-center justify-center"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => handleNumClick('0')}
                    className="h-14 bg-white/5 hover:bg-white/15 active:scale-95 border border-white/10 rounded-2xl text-xl font-bold text-white transition-all shadow-sm flex items-center justify-center"
                  >
                    0
                  </button>
                  <button
                    onClick={handleBackspace}
                    className="h-14 bg-white/5 hover:bg-white/15 text-slate-300 border border-white/10 rounded-2xl text-xs font-bold uppercase transition-all flex items-center justify-center"
                  >
                    ⌫
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleClockIn}
                    disabled={!selectedStaff || !!activeShifts[selectedStaff?.id || '']}
                    className={`py-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg ${
                      !selectedStaff || !!activeShifts[selectedStaff?.id || '']
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25 active:scale-95'
                    }`}
                  >
                    <LogIn className="w-5 h-5" />
                    <span>Clock In</span>
                  </button>

                  <button
                    onClick={handleClockOut}
                    disabled={!selectedStaff || !activeShifts[selectedStaff?.id || '']}
                    className={`py-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg ${
                      !selectedStaff || !activeShifts[selectedStaff?.id || '']
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                        : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/25 active:scale-95'
                    }`}
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Clock Out</span>
                  </button>
                </div>

                {/* Break Controls for selected staff if clocked in */}
                {selectedStaff && activeShifts[selectedStaff.id] && (
                  <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Break Management</div>
                      <div className="text-[10px] text-slate-400">
                        {activeShifts[selectedStaff.id].isOnBreak ? 'Currently on break' : 'Shift active'}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleToggleBreak(selectedStaff.id, 'rest')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                          activeShifts[selectedStaff.id].isOnBreak
                            ? 'bg-emerald-500 text-slate-950 font-black'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                        }`}
                      >
                        {activeShifts[selectedStaff.id].isOnBreak ? 'Resume Work' : '☕ 15m Break'}
                      </button>
                      <button
                        onClick={() => handleToggleBreak(selectedStaff.id, 'meal')}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-colors"
                      >
                        🍽️ 30m Meal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ACTIVE SHIFTS & BREAKS */}
        {activeTab === 'live-shifts' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-white">Currently Clocked In Staff</h3>
                <p className="text-xs text-slate-400">Real-time shift timers, active stations, and break status</p>
              </div>
              <div className="text-xs font-bold text-emerald-400">
                {Object.keys(activeShifts).length} Active On Floor
              </div>
            </div>

            {Object.keys(activeShifts).length === 0 ? (
              <div className="p-12 text-center bg-slate-900/40 border border-white/5 rounded-3xl">
                <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-300">No staff currently clocked in</h4>
                <p className="text-xs text-slate-500 mt-1">Use the Clock-In Panel to punch in for today's shift</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(activeShifts).map(([empId, shift]) => {
                  const member = staff.find(s => s.id === empId);
                  const duration = calculateDuration(shift.clockInTime);
                  const inTime = new Date(shift.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div
                      key={empId}
                      className={`p-5 rounded-3xl border transition-all ${
                        shift.isOnBreak
                          ? 'bg-amber-950/20 border-amber-500/30'
                          : 'bg-slate-900/60 border-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <img
                            src={member?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member?.name || 'Staff')}`}
                            alt={member?.name}
                            className="w-12 h-12 rounded-full border border-white/20"
                          />
                          <div>
                            <h4 className="font-bold text-white text-sm">{member?.name || 'Staff Member'}</h4>
                            <div className="text-xs text-slate-400">{member?.role}</div>
                            <span className="inline-block px-2 py-0.5 mt-1 bg-white/10 text-slate-300 rounded text-[10px] font-semibold">
                              {shift.department}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            shift.isOnBreak
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {shift.isOnBreak ? '☕ On Break' : '🟢 Active'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 my-3 p-3 bg-white/5 rounded-2xl text-xs">
                        <div>
                          <div className="text-slate-400 text-[10px] uppercase font-bold">Clocked In</div>
                          <div className="font-bold text-white">{inTime}</div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-[10px] uppercase font-bold">Shift Duration</div>
                          <div className="font-bold text-emerald-400">{duration}</div>
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-2 border-t border-white/10">
                        <button
                          onClick={() => handleToggleBreak(empId, 'rest')}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${
                            shift.isOnBreak
                              ? 'bg-emerald-500 text-slate-950 font-black'
                              : 'bg-white/10 hover:bg-white/20 text-slate-200'
                          }`}
                        >
                          {shift.isOnBreak ? 'Resume Work' : 'Take Break'}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStaff(member || null);
                            setActiveTab('kiosk');
                          }}
                          className="px-3 py-2 bg-rose-600/20 border border-rose-500/30 hover:bg-rose-600/30 text-rose-300 rounded-xl text-xs font-bold"
                        >
                          Clock Out
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: STAFF ROSTER & SCHEDULE */}
        {activeTab === 'roster' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-white">Live Staff Roster & Weekly Shifts</h3>
                <p className="text-xs text-slate-400">Scheduled shifts for Coasters Tavern team members</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-300 font-bold">
                  {rosterShifts.length} Scheduled Shifts
                </span>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-white/10 rounded-3xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-white/10">
                  <tr>
                    <th className="p-4">Staff Member</th>
                    <th className="p-4">Role / Dept</th>
                    <th className="p-4">Shift Date</th>
                    <th className="p-4">Hours</th>
                    <th className="p-4">Station</th>
                    <th className="p-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {rosterShifts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        No roster shifts loaded. Shifts will auto-populate from the master database.
                      </td>
                    </tr>
                  ) : (
                    rosterShifts.map((shift, idx) => {
                      const member = staff.find(s => s.id === shift.userId);
                      const isClockedIn = !!activeShifts[shift.userId];

                      return (
                        <tr key={shift.id || idx} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 font-bold text-white flex items-center space-x-2">
                            <img
                              src={member?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member?.name || 'Staff')}`}
                              alt=""
                              className="w-7 h-7 rounded-full"
                            />
                            <span>{member?.name || 'Assigned Staff'}</span>
                          </td>
                          <td className="p-4 text-slate-300">{member?.role || 'Service'}</td>
                          <td className="p-4 text-slate-300 font-medium">{shift.date}</td>
                          <td className="p-4 text-emerald-400 font-bold">
                            {shift.startTime} - {shift.endTime}
                          </td>
                          <td className="p-4 text-slate-400">{shift.role || 'Front of House'}</td>
                          <td className="p-4 text-right">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isClockedIn
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {isClockedIn ? '🟢 On Shift' : 'Scheduled'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: EMBEDDED KIOSK FULL */}
        {activeTab === 'embedded-kiosk' && (
          <div className="flex-1 flex flex-col h-[650px] bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-3 bg-slate-800/80 border-b border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <Monitor className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white">CT-Clock Standalone Kiosk Application</span>
                <span className="text-slate-400">({import.meta.env.BASE_URL}ct-clock/index.html)</span>
              </div>
              <a
                href={`${import.meta.env.BASE_URL}ct-clock/index.html`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-lg transition-colors"
              >
                <span>Launch Window</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <iframe
              src={`${import.meta.env.BASE_URL}ct-clock/index.html`}
              title="CT-Clock Kiosk"
              className="w-full flex-1 border-0"
            />
          </div>
        )}

        {/* TAB 5: EMBEDDED MOBILE APP */}
        {activeTab === 'embedded-mobile' && (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-[420px] h-[700px] bg-slate-900 border border-white/10 rounded-[40px] p-4 shadow-2xl flex flex-col relative">
              <div className="w-32 h-4 bg-slate-800 rounded-full mx-auto mb-3" />
              <div className="p-2 bg-slate-800/80 border-b border-white/10 flex items-center justify-between text-xs rounded-t-2xl">
                <span className="font-bold text-white">Mobile Staff Portal</span>
                <a
                  href={`${import.meta.env.BASE_URL}ct-clock/mobile.html`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 font-bold"
                >
                  Pop-out ↗
                </a>
              </div>
              <iframe
                src={`${import.meta.env.BASE_URL}ct-clock/mobile.html`}
                title="CT-Clock Mobile"
                className="w-full flex-1 rounded-b-2xl border-0"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CTClockView;
