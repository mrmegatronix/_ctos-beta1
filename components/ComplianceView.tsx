import React, { useState, useEffect } from 'react';
import { Thermometer, ClipboardCheck, Sparkles, Plus, CheckCircle2, AlertTriangle, Clock, UserCheck, Flame, Snowflake } from 'lucide-react';
import { TeamMember } from '../types';
import { generateId } from '../utils';

interface TempLogEntry {
  id: string;
  unitName: string;
  unitType: 'chiller' | 'freezer' | 'hot';
  temperature: number;
  recordedAt: string;
  staffName: string;
  inRange: boolean;
  notes?: string;
}

interface ChecklistTask {
  id: string;
  area: 'FOH Open' | 'FOH Close' | 'BOH Open' | 'BOH Close' | 'Duty Manager';
  label: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: string;
}

interface CleaningTask {
  id: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  equipment: string;
  zone: 'Bar' | 'Kitchen' | 'Floor & Gaming';
  lastCleaned: string;
  cleanedBy: string;
}

interface ComplianceViewProps {
  currentUser?: TeamMember | null;
}

const DEFAULT_UNITS: { name: string; type: 'chiller' | 'freezer' | 'hot'; min: number; max: number }[] = [
  { name: 'Walk-in Coolroom (Kitchen)', type: 'chiller', min: 0, max: 4.9 },
  { name: 'Walk-in Keg Chiller', type: 'chiller', min: 0, max: 5.0 },
  { name: 'Under-Bench Fridge 1 (Main Line)', type: 'chiller', min: 0, max: 4.9 },
  { name: 'Under-Bench Fridge 2 (Garde Manger)', type: 'chiller', max: 4.9, min: 0 },
  { name: 'Bar Display Chiller (Mains)', type: 'chiller', min: 0, max: 5.0 },
  { name: 'Walk-in Freezer', type: 'freezer', min: -25, max: -18 },
  { name: 'Pastry / Fry Freezer', type: 'freezer', min: -25, max: -18 },
  { name: 'Hot Pass / Bain Marie', type: 'hot', min: 60, max: 95 },
];

const INITIAL_CHECKLISTS: ChecklistTask[] = [
  { id: 'chk-1', area: 'FOH Open', label: 'Disarm security alarm, turn on main house & garden lights', completed: true, completedBy: 'Duty Manager', completedAt: '09:05' },
  { id: 'chk-2', area: 'FOH Open', label: 'Count & verify F&B, TAB, and Gaming floats from safe', completed: true, completedBy: 'Duty Manager', completedAt: '09:15' },
  { id: 'chk-3', area: 'FOH Open', label: 'Turn on coffee machine, purge group heads, dial in espresso', completed: false },
  { id: 'chk-4', area: 'FOH Open', label: 'Check restrooms stocked, clean, and sanitize touchpoints', completed: false },
  { id: 'chk-5', area: 'FOH Open', label: 'Power on Sky TV boxes & CT-Matrix digital signage screens', completed: false },
  { id: 'chk-6', area: 'BOH Open', label: 'Record morning Walk-in Chiller & Freezer temperatures', completed: true, completedBy: 'Head Chef', completedAt: '08:30' },
  { id: 'chk-7', area: 'BOH Open', label: 'Turn on extraction hoods, deep fryers, and combi oven', completed: true, completedBy: 'Head Chef', completedAt: '08:35' },
  { id: 'chk-8', area: 'BOH Open', label: 'Check date labels on all prepped containers & discard expired stock', completed: false },
  { id: 'chk-9', area: 'BOH Open', label: 'Set up sanitizer buckets & handwash stations (soap + paper towels)', completed: false },
  { id: 'chk-10', area: 'FOH Close', label: 'Clear all tables, wipe down menus, and bring in outdoor furniture', completed: false },
  { id: 'chk-11', area: 'FOH Close', label: 'Empty glasswasher, clean filters, and polish remaining glassware', completed: false },
  { id: 'chk-12', area: 'FOH Close', label: 'Cap beer taps, soak nozzles in soda water, wipe down drip trays', completed: false },
  { id: 'chk-13', area: 'BOH Close', label: 'Filter & power OFF all deep fryers and gas burners', completed: false },
  { id: 'chk-14', area: 'BOH Close', label: 'Wrap, date-label, and store all line prep into walk-in chiller', completed: false },
  { id: 'chk-15', area: 'BOH Close', label: 'Degrease & sanitize prep benches, sweep and mop kitchen floor', completed: false },
  { id: 'chk-16', area: 'Duty Manager', label: 'Verify Duty Manager name plate displayed at main bar', completed: true, completedBy: 'Duty Manager', completedAt: '09:20' },
  { id: 'chk-17', area: 'Duty Manager', label: 'Ensure Free Drinking Water station is full and accessible', completed: true, completedBy: 'Duty Manager', completedAt: '09:22' },
  { id: 'chk-18', area: 'Duty Manager', label: 'Lock Gaming Room & reconcile pokie clearance/float to safe', completed: false },
  { id: 'chk-19', area: 'Duty Manager', label: 'Complete Incident Register & Shift Handover Notes', completed: false },
];

const INITIAL_CLEANING: CleaningTask[] = [
  { id: 'cln-1', frequency: 'Weekly', equipment: 'Beer Python & Tap Lines (Caustic Flush)', zone: 'Bar', lastCleaned: new Date().toISOString().split('T')[0], cleanedBy: 'Duty Manager' },
  { id: 'cln-2', frequency: 'Weekly', equipment: 'Kitchen Extraction Hood Baffle Filters', zone: 'Kitchen', lastCleaned: new Date().toISOString().split('T')[0], cleanedBy: 'Kitchen Hand' },
  { id: 'cln-3', frequency: 'Monthly', equipment: 'Ice Machine Internal Bin Descale & Sanitize', zone: 'Bar', lastCleaned: new Date().toISOString().split('T')[0], cleanedBy: 'Duty Manager' },
  { id: 'cln-4', frequency: 'Daily', equipment: 'Meat Slicer & Food Processor Blades', zone: 'Kitchen', lastCleaned: new Date().toISOString().split('T')[0], cleanedBy: 'Chef' },
  { id: 'cln-5', frequency: 'Weekly', equipment: 'Walk-in Coolroom Shelving & Door Seals', zone: 'Kitchen', lastCleaned: new Date().toISOString().split('T')[0], cleanedBy: 'Chef' },
  { id: 'cln-6', frequency: 'Daily', equipment: 'Gaming Room Machines & ATM Touchscreens', zone: 'Floor & Gaming', lastCleaned: new Date().toISOString().split('T')[0], cleanedBy: 'FOH Staff' },
];

const ComplianceView: React.FC<ComplianceViewProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'temps' | 'checklists' | 'cleaning'>('temps');
  const [activeChecklistArea, setActiveChecklistArea] = useState<ChecklistTask['area']>('FOH Open');

  const [tempLogs, setTempLogs] = useState<TempLogEntry[]>(() => {
    const saved = localStorage.getItem('ctos_fcp_temps');
    if (saved) return JSON.parse(saved);
    return [
      { id: 't-1', unitName: 'Walk-in Coolroom (Kitchen)', unitType: 'chiller', temperature: 2.8, recordedAt: '08:30 AM', staffName: 'Head Chef', inRange: true },
      { id: 't-2', unitName: 'Walk-in Freezer', unitType: 'freezer', temperature: -20.5, recordedAt: '08:32 AM', staffName: 'Head Chef', inRange: true },
      { id: 't-3', unitName: 'Walk-in Keg Chiller', unitType: 'chiller', temperature: 3.4, recordedAt: '09:10 AM', staffName: 'Duty Manager', inRange: true },
    ];
  });

  const [checklists, setChecklists] = useState<ChecklistTask[]>(() => {
    const saved = localStorage.getItem('ctos_checklists');
    return saved ? JSON.parse(saved) : INITIAL_CHECKLISTS;
  });

  const [cleaningTasks, setCleaningTasks] = useState<CleaningTask[]>(() => {
    const saved = localStorage.getItem('ctos_cleaning');
    return saved ? JSON.parse(saved) : INITIAL_CLEANING;
  });

  const [selectedUnit, setSelectedUnit] = useState(DEFAULT_UNITS[0].name);
  const [tempInput, setTempInput] = useState('');
  const [tempNotes, setTempNotes] = useState('');

  useEffect(() => {
    localStorage.setItem('ctos_fcp_temps', JSON.stringify(tempLogs));
  }, [tempLogs]);

  useEffect(() => {
    localStorage.setItem('ctos_checklists', JSON.stringify(checklists));
  }, [checklists]);

  useEffect(() => {
    localStorage.setItem('ctos_cleaning', JSON.stringify(cleaningTasks));
  }, [cleaningTasks]);

  const handleLogTemp = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(tempInput);
    if (isNaN(val)) return;

    const unitDef = DEFAULT_UNITS.find(u => u.name === selectedUnit) || DEFAULT_UNITS[0];
    const inRange = val >= unitDef.min && val <= unitDef.max;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newLog: TempLogEntry = {
      id: generateId(),
      unitName: unitDef.name,
      unitType: unitDef.type,
      temperature: val,
      recordedAt: now,
      staffName: currentUser?.name || 'Duty Staff',
      inRange,
      notes: tempNotes.trim() || undefined
    };

    setTempLogs([newLog, ...tempLogs]);
    setTempInput('');
    setTempNotes('');
  };

  const toggleChecklist = (id: string) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChecklists(prev => prev.map(item => {
      if (item.id !== id) return item;
      const nextState = !item.completed;
      return {
        ...item,
        completed: nextState,
        completedBy: nextState ? (currentUser?.name || 'Staff') : undefined,
        completedAt: nextState ? now : undefined
      };
    }));
  };

  const resetAreaChecklist = (area: ChecklistTask['area']) => {
    setChecklists(prev => prev.map(item => item.area === area ? { ...item, completed: false, completedBy: undefined, completedAt: undefined } : item));
  };

  const markCleanedToday = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setCleaningTasks(prev => prev.map(task => task.id === id ? { ...task, lastCleaned: today, cleanedBy: currentUser?.name || 'Staff' } : task));
  };

  const areas: ChecklistTask['area'][] = ['FOH Open', 'FOH Close', 'BOH Open', 'BOH Close', 'Duty Manager'];
  const areaTasks = checklists.filter(c => c.area === activeChecklistArea);
  const completedCount = areaTasks.filter(c => c.completed).length;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-white overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900/60 backdrop-blur-xl border-b border-white/10 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <ClipboardCheck className="w-7 h-7 text-emerald-400" />
            Food Control Plan & Venue Checklists
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">MPI Food Safety Temp Logs, Daily Open/Close Procedures & Deep Cleaning Matrix</p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab('temps')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'temps' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <Thermometer className="w-4 h-4" /> Temperature Logs
          </button>
          <button
            onClick={() => setActiveTab('checklists')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'checklists' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <ClipboardCheck className="w-4 h-4" /> Open / Close Checklists
          </button>
          <button
            onClick={() => setActiveTab('cleaning')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'cleaning' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <Sparkles className="w-4 h-4" /> Sanitation Schedule
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {activeTab === 'temps' && (
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Log Form */}
            <form onSubmit={handleLogTemp} className="bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-4 h-fit">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-indigo-400" /> Record Unit Temperature
              </h3>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Refrigeration / Hot Unit</label>
                <select
                  value={selectedUnit}
                  onChange={e => setSelectedUnit(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm text-white outline-none"
                >
                  {DEFAULT_UNITS.map(u => (
                    <option key={u.name} value={u.name}>
                      {u.name} ({u.min}°C to {u.max}°C)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Measured Temp (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="e.g. 3.2"
                  value={tempInput}
                  onChange={e => setTempInput(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Corrective Action / Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Defrost cycle active, re-check in 30m"
                  value={tempNotes}
                  onChange={e => setTempNotes(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm text-white outline-none"
                />
              </div>

              <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Log Temperature Check
              </button>
            </form>

            {/* Temp History Table */}
            <div className="lg:col-span-2 bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
                <h3 className="font-bold text-white">Today's FCP Temperature Records</h3>
                <span className="text-xs text-slate-400">Chillers: 0°C–5°C | Freezers: ≤ -18°C | Hot Hold: ≥ 60°C</span>
              </div>
              <table className="w-full text-left">
                <thead className="bg-slate-950/60 text-xs uppercase text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-3.5">Unit</th>
                    <th className="px-6 py-3.5">Reading</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Staff & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {tempLogs.map(log => (
                    <tr key={log.id} className="hover:bg-white/5">
                      <td className="px-6 py-4 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          {log.unitType === 'hot' ? <Flame className="w-4 h-4 text-orange-400" /> : <Snowflake className="w-4 h-4 text-sky-400" />}
                          {log.unitName}
                        </div>
                        {log.notes && <div className="text-xs text-amber-400 mt-0.5">Note: {log.notes}</div>}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-base">
                        {log.temperature.toFixed(1)}°C
                      </td>
                      <td className="px-6 py-4">
                        {log.inRange ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Safe Range
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                            <AlertTriangle className="w-3.5 h-3.5" /> Out of Spec
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs">
                        <div className="font-semibold text-slate-200">{log.staffName}</div>
                        <div>{log.recordedAt}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'checklists' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {areas.map(area => (
                  <button
                    key={area}
                    onClick={() => setActiveChecklistArea(area)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      activeChecklistArea === area
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow'
                        : 'bg-slate-900 border-white/10 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
              <button
                onClick={() => resetAreaChecklist(activeChecklistArea)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
              >
                Reset {activeChecklistArea} For New Shift
              </button>
            </div>

            <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
                <h3 className="font-bold text-lg text-white">{activeChecklistArea} Procedure</h3>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300">
                  {completedCount} / {areaTasks.length} Completed
                </span>
              </div>

              <div className="divide-y divide-white/5">
                {areaTasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => toggleChecklist(task.id)}
                    className={`px-6 py-4 flex items-center justify-between cursor-pointer transition-colors ${
                      task.completed ? 'bg-emerald-950/20' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${
                        task.completed ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-600 bg-slate-950'
                      }`}>
                        {task.completed && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                      </div>
                      <span className={`text-sm font-medium ${task.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                        {task.label}
                      </span>
                    </div>

                    {task.completed && (
                      <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                        <UserCheck className="w-4 h-4" />
                        <span>{task.completedBy}</span>
                        <span className="text-slate-500">•</span>
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-400">{task.completedAt}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cleaning' && (
          <div className="max-w-5xl mx-auto bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
              <h3 className="font-bold text-lg text-white">Deep Cleaning & Sanitation Schedule</h3>
              <span className="text-xs text-slate-400">Tap "Sign Off Today" when completed</span>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-950/60 text-xs uppercase text-slate-400 border-b border-white/10">
                <tr>
                  <th className="px-6 py-3.5">Equipment / Area</th>
                  <th className="px-6 py-3.5">Zone</th>
                  <th className="px-6 py-3.5">Frequency</th>
                  <th className="px-6 py-3.5">Last Signed Off</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {cleaningTasks.map(task => (
                  <tr key={task.id} className="hover:bg-white/5">
                    <td className="px-6 py-4 font-bold text-white">{task.equipment}</td>
                    <td className="px-6 py-4 text-slate-300">{task.zone}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300">
                        {task.frequency}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-300">
                      <div className="font-bold text-emerald-400">{task.lastCleaned}</div>
                      <div className="text-slate-400">by {task.cleanedBy}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => markCleanedToday(task.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        Sign Off Today
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplianceView;
