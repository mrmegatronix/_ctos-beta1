import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Wine, Utensils, DollarSign, ShieldCheck, FileText, CheckCircle2, Clock } from 'lucide-react';
import { StockItem, TeamMember } from '../types';
import { generateId } from '../utils';

interface WastageEntry {
  id: string;
  itemName: string;
  category: 'Bar / Keg Ullage' | 'Kitchen Spoilage' | 'Staff / Comp Tab' | 'Breakage / Spill';
  quantity: string;
  estimatedCost: number;
  reason: string;
  loggedBy: string;
  timestamp: string;
}

interface ShiftHandoverEntry {
  id: string;
  date: string;
  shiftType: 'Day / Lunch' | 'Night / Close';
  dutyManager: string;
  certNumber: string;
  tradeSummary: string;
  rsaIncidents: string;
  maintenanceNotes: string;
  followUpRequired: boolean;
}

interface WastageAndHandoverViewProps {
  stockItems: StockItem[];
  currentUser?: TeamMember | null;
}

const WastageAndHandoverView: React.FC<WastageAndHandoverViewProps> = ({ stockItems, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'wastage' | 'handover'>('wastage');

  const [wastageLogs, setWastageLogs] = useState<WastageEntry[]>(() => {
    const saved = localStorage.getItem('ctos_wastage_logs');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'w-1', itemName: 'Speights Gold Medal Ale (50L Keg)', category: 'Bar / Keg Ullage', quantity: '2.5 Litres (Line Clean)', estimatedCost: 18.50, reason: 'Weekly caustic line flush', loggedBy: 'Duty Manager', timestamp: 'Today 09:40 AM' },
      { id: 'w-2', itemName: 'ribeye Steak 300g', category: 'Kitchen Spoilage', quantity: '1 Portion', estimatedCost: 14.20, reason: 'Overcooked (Medium-Well instead of Rare)', loggedBy: 'Chef', timestamp: 'Yesterday 07:15 PM' }
    ];
  });

  const [handoverLogs, setHandoverLogs] = useState<ShiftHandoverEntry[]>(() => {
    const saved = localStorage.getItem('ctos_handover_logs');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'h-1',
        date: new Date().toISOString().split('T')[0],
        shiftType: 'Day / Lunch',
        dutyManager: 'Duty Manager',
        certNumber: '48/CERT/1092/2025',
        tradeSummary: 'Steady lunch trade (45 covers). Quiz night bookings full for tonight. Bidfood delivery checked & put away.',
        rsaIncidents: 'Nil intoxication issues. Water station topped up at 2pm.',
        maintenanceNotes: 'Garden heater #2 igniter clicking slowly — needs new battery.',
        followUpRequired: false
      }
    ];
  });

  // Wastage Form State
  const [wasteItem, setWasteItem] = useState('');
  const [wasteCategory, setWasteCategory] = useState<WastageEntry['category']>('Bar / Keg Ullage');
  const [wasteQty, setWasteQty] = useState('');
  const [wasteCost, setWasteCost] = useState('');
  const [wasteReason, setWasteReason] = useState('');

  // Handover Form State
  const [shiftType, setShiftType] = useState<ShiftHandoverEntry['shiftType']>('Night / Close');
  const [dutyManager, setDutyManager] = useState(currentUser?.name || 'Duty Manager');
  const [certNumber, setCertNumber] = useState('48/CERT/1092/2025');
  const [tradeSummary, setTradeSummary] = useState('');
  const [rsaIncidents, setRsaIncidents] = useState('Nil RSA interventions');
  const [maintenanceNotes, setMaintenanceNotes] = useState('');
  const [followUpRequired, setFollowUpRequired] = useState(false);

  useEffect(() => {
    localStorage.setItem('ctos_wastage_logs', JSON.stringify(wastageLogs));
  }, [wastageLogs]);

  useEffect(() => {
    localStorage.setItem('ctos_handover_logs', JSON.stringify(handoverLogs));
  }, [handoverLogs]);

  const handleAddWastage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wasteItem.trim() || !wasteQty.trim()) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const entry: WastageEntry = {
      id: generateId(),
      itemName: wasteItem.trim(),
      category: wasteCategory,
      quantity: wasteQty.trim(),
      estimatedCost: parseFloat(wasteCost) || 0,
      reason: wasteReason.trim() || 'Standard operational waste',
      loggedBy: currentUser?.name || 'Staff',
      timestamp: `Today ${now}`
    };

    setWastageLogs([entry, ...wastageLogs]);
    setWasteItem('');
    setWasteQty('');
    setWasteCost('');
    setWasteReason('');
  };

  const handleAddHandover = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradeSummary.trim()) return;

    const entry: ShiftHandoverEntry = {
      id: generateId(),
      date: new Date().toISOString().split('T')[0],
      shiftType,
      dutyManager: dutyManager.trim() || 'Duty Manager',
      certNumber: certNumber.trim(),
      tradeSummary: tradeSummary.trim(),
      rsaIncidents: rsaIncidents.trim() || 'Nil',
      maintenanceNotes: maintenanceNotes.trim() || 'Nil',
      followUpRequired
    };

    setHandoverLogs([entry, ...handoverLogs]);
    setTradeSummary('');
    setMaintenanceNotes('');
    setFollowUpRequired(false);
  };

  const totalWastageCost = wastageLogs.reduce((acc, w) => acc + w.estimatedCost, 0);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-white overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900/60 backdrop-blur-xl border-b border-white/10 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-amber-400" />
            Wastage, Ullage & Duty Manager Logbook
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Track Bar Slops, Kitchen Spoilage, Comp Tabs & Licensed Duty Manager Shift Handovers</p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab('wastage')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'wastage' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <Wine className="w-4 h-4" /> Wastage & Ullage
          </button>
          <button
            onClick={() => setActiveTab('handover')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'handover' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <FileText className="w-4 h-4" /> Duty Manager Logbook
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {activeTab === 'wastage' && (
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form onSubmit={handleAddWastage} className="bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-4 h-fit">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" /> Log Wastage / Ullage
              </h3>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Product / Dish Name</label>
                <input
                  type="text"
                  list="stock-suggestions"
                  required
                  placeholder="e.g. Speights Pint, Sirloin 250g"
                  value={wasteItem}
                  onChange={e => setWasteItem(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm text-white outline-none"
                />
                <datalist id="stock-suggestions">
                  {stockItems.map(item => (
                    <option key={item.id} value={item.name} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Waste Category</label>
                <select
                  value={wasteCategory}
                  onChange={e => setWasteCategory(e.target.value as WastageEntry['category'])}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm text-white outline-none"
                >
                  <option value="Bar / Keg Ullage">Bar / Keg Ullage (Line Clean / Fobbing)</option>
                  <option value="Kitchen Spoilage">Kitchen Spoilage / Prep Waste</option>
                  <option value="Breakage / Spill">Dropped Glass / Customer Spill</option>
                  <option value="Staff / Comp Tab">Promo / Manager Comp Tab</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Qty / Measure</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 570ml / 2 Portions"
                    value={wasteQty}
                    onChange={e => setWasteQty(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Est. Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={wasteCost}
                    onChange={e => setWasteCost(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Reason / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Blown keg foam, dropped plate"
                  value={wasteReason}
                  onChange={e => setWasteReason(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm text-white outline-none"
                />
              </div>

              <button type="submit" className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-sm transition-colors">
                Record Wastage Entry
              </button>
            </form>

            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Logged Wastage Cost</span>
                  <div className="text-2xl font-black text-amber-400 mt-0.5">${totalWastageCost.toFixed(2)}</div>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <div>Entries Recorded: <strong className="text-white">{wastageLogs.length}</strong></div>
                  <div>Used for Weekly GP% Variance Reconciliation</div>
                </div>
              </div>

              <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-950/60 text-xs uppercase text-slate-400 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-3.5">Item & Reason</th>
                      <th className="px-6 py-3.5">Category</th>
                      <th className="px-6 py-3.5">Quantity</th>
                      <th className="px-6 py-3.5">Est. Cost</th>
                      <th className="px-6 py-3.5 text-right">Logged By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {wastageLogs.map(entry => (
                      <tr key={entry.id} className="hover:bg-white/5">
                        <td className="px-6 py-4">
                          <div className="font-bold text-white">{entry.itemName}</div>
                          <div className="text-xs text-slate-400">{entry.reason}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            {entry.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-200">{entry.quantity}</td>
                        <td className="px-6 py-4 font-mono font-bold text-red-400">${entry.estimatedCost.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right text-xs text-slate-400">
                          <div className="font-semibold text-slate-200">{entry.loggedBy}</div>
                          <div>{entry.timestamp}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'handover' && (
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form onSubmit={handleAddHandover} className="bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-4 h-fit">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" /> Sign Off Duty Manager Log
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Shift</label>
                  <select
                    value={shiftType}
                    onChange={e => setShiftType(e.target.value as ShiftHandoverEntry['shiftType'])}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-sm text-white outline-none"
                  >
                    <option value="Day / Lunch">Day / Lunch</option>
                    <option value="Night / Close">Night / Close</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Duty Manager</label>
                  <input
                    type="text"
                    required
                    value={dutyManager}
                    onChange={e => setDutyManager(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-sm text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Manager Certificate # (Sale & Supply of Alcohol Act)</label>
                <input
                  type="text"
                  value={certNumber}
                  onChange={e => setCertNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-sm text-white outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Trade & Handover Summary</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Key notes for incoming manager, function updates, stock shortages, safe/float status..."
                  value={tradeSummary}
                  onChange={e => setTradeSummary(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Host Responsibility / RSA Interventions</label>
                <input
                  type="text"
                  value={rsaIncidents}
                  onChange={e => setRsaIncidents(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Equipment / Maintenance Issues</label>
                <input
                  type="text"
                  placeholder="Nil or specify equipment fault..."
                  value={maintenanceNotes}
                  onChange={e => setMaintenanceNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-sm text-white outline-none"
                />
              </div>

              <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-colors">
                Submit Shift Handover Report
              </button>
            </form>

            <div className="lg:col-span-2 space-y-4">
              {handoverLogs.map(log => (
                <div key={log.id} className="bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 mr-2">
                        {log.shiftType}
                      </span>
                      <span className="font-bold text-white">{log.dutyManager}</span>
                      <span className="text-xs text-slate-400 font-mono ml-2">({log.certNumber})</span>
                    </div>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {log.date}
                    </span>
                  </div>

                  <p className="text-sm text-slate-200 leading-relaxed">{log.tradeSummary}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="bg-slate-950/70 p-3 rounded-xl border border-white/5">
                      <span className="font-bold text-emerald-400 uppercase block mb-0.5">Host Responsibility / RSA:</span>
                      <span className="text-slate-300">{log.rsaIncidents}</span>
                    </div>
                    <div className="bg-slate-950/70 p-3 rounded-xl border border-white/5">
                      <span className="font-bold text-amber-400 uppercase block mb-0.5">Maintenance / Follow-up:</span>
                      <span className="text-slate-300">{log.maintenanceNotes}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WastageAndHandoverView;
