import React, { useState } from 'react';
import {
  Smartphone,
  Send,
  Beer,
  BellRing,
  UtensilsCrossed,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Plus,
  RefreshCw,
  Clock,
  Sparkles
} from 'lucide-react';

interface TableAlert {
  id: string;
  tableNumber: string;
  type: 'bill' | 'server' | 'order' | 'clean';
  time: string;
  status: 'pending' | 'acknowledged' | 'resolved';
}

interface KegStatus {
  id: string;
  name: string;
  type: string;
  percentRemaining: number;
  tempCelsius: number;
  psi: number;
  status: 'ok' | 'low' | 'critical';
}

interface StaffBroadcast {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  priority: 'normal' | 'urgent';
}

const INITIAL_ALERTS: TableAlert[] = [
  { id: 'alt-1', tableNumber: 'Table 14', type: 'bill', time: '2 mins ago', status: 'pending' },
  { id: 'alt-2', tableNumber: 'Table 6 (Garden)', type: 'server', time: '5 mins ago', status: 'pending' },
  { id: 'alt-3', tableNumber: 'Table 22 (Booths)', type: 'order', time: '8 mins ago', status: 'acknowledged' },
  { id: 'alt-4', tableNumber: 'Table 3', type: 'clean', time: '12 mins ago', status: 'resolved' },
];

const INITIAL_KEGS: KegStatus[] = [
  { id: 'keg-1', name: 'DB Export Gold (50L)', type: 'Lager', percentRemaining: 74, tempCelsius: 2.8, psi: 14.2, status: 'ok' },
  { id: 'keg-2', name: 'Heineken Original (50L)', type: 'Lager', percentRemaining: 62, tempCelsius: 2.7, psi: 14.0, status: 'ok' },
  { id: 'keg-3', name: 'Monteiths Hazy IPA (50L)', type: 'Craft IPA', percentRemaining: 18, tempCelsius: 3.1, psi: 13.8, status: 'low' },
  { id: 'keg-4', name: 'Tiger Crystal Cold (50L)', type: 'Lager', percentRemaining: 88, tempCelsius: 2.6, psi: 14.5, status: 'ok' },
  { id: 'keg-5', name: 'Orchard Thieves Crisp Cider (50L)', type: 'Cider', percentRemaining: 9, tempCelsius: 3.0, psi: 13.5, status: 'critical' },
  { id: 'keg-6', name: 'Guinness Draught (30L)', type: 'Stout', percentRemaining: 55, tempCelsius: 4.2, psi: 32.0, status: 'ok' },
];

const INITIAL_BROADCASTS: StaffBroadcast[] = [
  { id: 'bc-1', sender: 'Head Chef Marco', message: 'Kitchen 86 on Pork Ribs - running low on Angus burger patties.', timestamp: '10:14 PM', priority: 'urgent' },
  { id: 'bc-2', sender: 'Bar Duty Mgr Liam', message: 'Garden bar restocked with clean glassware. Good job team!', timestamp: '09:45 PM', priority: 'normal' },
  { id: 'bc-3', sender: 'Hostess Desk', message: 'VIP group of 12 arriving in 15 mins for Upstairs Booths.', timestamp: '09:30 PM', priority: 'normal' },
];

const CTSCAppView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'alerts' | 'kegs' | 'broadcast' | 'quickpos'>('alerts');
  const [alerts, setAlerts] = useState<TableAlert[]>(INITIAL_ALERTS);
  const [kegs, setKegs] = useState<KegStatus[]>(INITIAL_KEGS);
  const [broadcasts, setBroadcasts] = useState<StaffBroadcast[]>(INITIAL_BROADCASTS);
  const [newMessage, setNewMessage] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [quickCart, setQuickCart] = useState<{ [name: string]: number }>({});
  const [selectedTable, setSelectedTable] = useState('Table 1');

  const handleResolveAlert = (id: string) => {
    setAlerts(prev =>
      prev.map(a => (a.id === id ? { ...a, status: 'resolved' as const } : a))
    );
  };

  const handleAckAlert = (id: string) => {
    setAlerts(prev =>
      prev.map(a => (a.id === id ? { ...a, status: 'acknowledged' as const } : a))
    );
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const newBc: StaffBroadcast = {
      id: `bc-${Date.now()}`,
      sender: 'Duty Manager (Terminal)',
      message: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      priority: isUrgent ? 'urgent' : 'normal'
    };

    setBroadcasts([newBc, ...broadcasts]);
    setNewMessage('');
    setIsUrgent(false);
  };

  const handleAddToCart = (item: string) => {
    setQuickCart(prev => ({
      ...prev,
      [item]: (prev[item] || 0) + 1
    }));
  };

  const handleClearCart = () => {
    setQuickCart({});
  };

  const quickItems = [
    { name: 'Export Gold Pint', category: 'Beer', price: 9.5 },
    { name: 'Heineken Pint', category: 'Beer', price: 11.5 },
    { name: 'Monteiths Hazy IPA', category: 'Beer', price: 12.0 },
    { name: 'House Sauvignon Blanc (150ml)', category: 'Wine', price: 10.0 },
    { name: 'House Pinot Noir (150ml)', category: 'Wine', price: 12.0 },
    { name: 'Classic Smash Burger & Fries', category: 'Food', price: 24.0 },
    { name: 'Spicy Buffalo Wings (1/2 Dozen)', category: 'Food', price: 18.0 },
    { name: 'Loaded Wedges w/ Sour Cream', category: 'Food', price: 14.5 },
    { name: 'Coca-Cola (Can)', category: 'Non-Alc', price: 5.0 },
    { name: 'Sparkling Mineral Water (500ml)', category: 'Non-Alc', price: 6.5 },
  ];

  const pendingAlertCount = alerts.filter(a => a.status === 'pending').length;

  return (
    <div className="flex h-full flex-col p-6 space-y-6 bg-slate-950 text-white overflow-y-auto relative custom-scrollbar">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full mix-blend-screen z-0 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full mix-blend-screen z-0 pointer-events-none"></div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Smartphone className="w-7 h-7 mr-3 text-indigo-600 dark:text-indigo-400" />
              CT Smart Connect (CTSC) Staff Companion
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-1.5 animate-pulse" />
              Cellar & POS Sync Active
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Floor service buzzer alerts, cellar tap diagnostics, staff walkie broadcasts & mobile POS companion.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-slate-900/60 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-sm">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all relative ${
              activeTab === 'alerts'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-300 hover:bg-white/10 transition-colors'
            }`}
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Table Alerts</span>
            {pendingAlertCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-black">
                {pendingAlertCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('kegs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
              activeTab === 'kegs'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-300 hover:bg-white/10 transition-colors'
            }`}
          >
            <Beer className="w-3.5 h-3.5" />
            <span>Cellar Kegs ({kegs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('broadcast')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
              activeTab === 'broadcast'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-300 hover:bg-white/10 transition-colors'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Staff Broadcast</span>
          </button>
          <button
            onClick={() => setActiveTab('quickpos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
              activeTab === 'quickpos'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-300 hover:bg-white/10 transition-colors'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Quick POS Companion</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Table Service Alerts */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center">
              <BellRing className="w-4 h-4 mr-2 text-indigo-500" />
              Live Table Calls & Service Requests
            </h3>
            <button
              onClick={() => {
                const randomTable = `Table ${Math.floor(Math.random() * 20) + 1}`;
                const types: TableAlert['type'][] = ['bill', 'server', 'order', 'clean'];
                const randomType = types[Math.floor(Math.random() * types.length)];
                setAlerts([
                  {
                    id: `alt-${Date.now()}`,
                    tableNumber: randomTable,
                    type: randomType,
                    time: 'Just now',
                    status: 'pending'
                  },
                  ...alerts
                ]);
              }}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Simulate Customer Table Buzzer</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map(alt => (
              <div
                key={alt.id}
                className={`bg-slate-900/60 backdrop-blur-xl border rounded-3xl p-5 shadow-sm transition-all flex flex-col justify-between ${
                  alt.status === 'pending'
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/20'
                    : alt.status === 'acknowledged'
                    ? 'border-amber-300 dark:border-amber-700/60'
                    : 'border-white/10 opacity-60'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-lg font-black text-white">{alt.tableNumber}</h4>
                      <span className="text-xs text-slate-400 flex items-center mt-0.5">
                        <Clock className="w-3 h-3 mr-1" /> {alt.time}
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        alt.type === 'bill'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                          : alt.type === 'server'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                          : alt.type === 'order'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                      }`}
                    >
                      {alt.type === 'bill' ? 'Bill / Check' : alt.type === 'server' ? 'Server Call' : alt.type === 'order' ? 'Ready to Order' : 'Table Reset'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mb-4">
                    {alt.type === 'bill' && 'Customer requested the final bill / EFTPOS terminal.'}
                    {alt.type === 'server' && 'Customer pressed table call button for general server assistance.'}
                    {alt.type === 'order' && 'Table is ready to order drinks / mains.'}
                    {alt.type === 'clean' && 'Table vacated and ready for sanitization and restock.'}
                  </p>
                </div>

                <div className="flex items-center space-x-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                  {alt.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAckAlert(alt.id)}
                        className="flex-1 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 transition-colors"
                      >
                        Acknowledge
                      </button>
                      <button
                        onClick={() => handleResolveAlert(alt.id)}
                        className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-sm"
                      >
                        Mark Resolved
                      </button>
                    </>
                  )}
                  {alt.status === 'acknowledged' && (
                    <button
                      onClick={() => handleResolveAlert(alt.id)}
                      className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm flex items-center justify-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Complete & Dismiss</span>
                    </button>
                  )}
                  {alt.status === 'resolved' && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Resolved
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Cellar Kegs */}
      {activeTab === 'kegs' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center">
                <Beer className="w-4 h-4 mr-2 text-indigo-500" />
                Live Cellar Flowmeter & Tap Telemetry
              </h3>
              <p className="text-xs text-slate-400">Automated cellar pressure and temperature monitoring.</p>
            </div>
            <button
              onClick={() => {
                setKegs(prev =>
                  prev.map(k => ({
                    ...k,
                    tempCelsius: +(2.5 + Math.random() * 1).toFixed(1),
                    psi: +(13.5 + Math.random() * 1.5).toFixed(1)
                  }))
                );
              }}
              className="px-3 py-1.5 rounded-xl border border-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-white/10 transition-colors transition-colors flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              <span>Refresh Sensors</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kegs.map(keg => (
              <div
                key={keg.id}
                className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-black text-base text-white">{keg.name}</h4>
                      <span className="text-xs text-slate-400 font-semibold">{keg.type}</span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        keg.status === 'ok'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : keg.status === 'low'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 animate-pulse'
                      }`}
                    >
                      {keg.status === 'ok' ? 'Good' : keg.status === 'low' ? 'Low Keg' : 'Change Now'}
                    </span>
                  </div>

                  {/* Level Bar */}
                  <div className="space-y-1.5 mb-5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400">Volume Remaining</span>
                      <span className="text-slate-900 dark:text-slate-100">{keg.percentRemaining}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          keg.percentRemaining > 30
                            ? 'bg-emerald-500'
                            : keg.percentRemaining > 15
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${keg.percentRemaining}%` }}
                      />
                    </div>
                  </div>

                  {/* Sensor Stats */}
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 text-white rounded-2xl border border-slate-100 dark:border-slate-700 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Line Temp</span>
                      <span className="font-black text-slate-100">{keg.tempCelsius}°C</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">CO2 Pressure</span>
                      <span className="font-black text-slate-100">{keg.psi} PSI</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <span className="text-xs text-slate-400">Cellar Line #{keg.id.replace('keg-', '')}</span>
                  {keg.percentRemaining <= 20 && (
                    <span className="text-xs font-bold text-red-500 flex items-center">
                      <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                      Swap Backup
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Staff Broadcast */}
      {activeTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Dispatch Box (Left) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-white mb-1">
                Dispatch Staff Broadcast
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Instantly notifies all active floor staff headsets & POS terminals.
              </p>

              <form onSubmit={handleSendBroadcast} className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">
                    Announcement Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="e.g. 86 on burger buns, table 12 spill in garden bar, all hands for shift change..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    className="w-full p-3.5 bg-slate-950 text-white border border-white/10 rounded-2xl text-xs text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center space-x-2 p-3 bg-slate-950 text-white rounded-xl border border-white/10">
                  <input
                    type="checkbox"
                    id="urgentCheck"
                    checked={isUrgent}
                    onChange={e => setIsUrgent(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600"
                  />
                  <label htmlFor="urgentCheck" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    High Priority (Emergency / Audio Chime)
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-colors shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Broadcast Pager</span>
                </button>
              </form>
            </div>
          </div>

          {/* Broadcast History (Right) */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center">
              <Radio className="w-4 h-4 mr-2 text-indigo-500" />
              Broadcast Feed ({broadcasts.length})
            </h3>

            <div className="space-y-3">
              {broadcasts.map(bc => (
                <div
                  key={bc.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    bc.priority === 'urgent'
                      ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800/80'
                      : 'bg-slate-900/60 backdrop-blur-xl border-white/10'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-white">{bc.sender}</span>
                      {bc.priority === 'urgent' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-600 text-white">
                          URGENT
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400">{bc.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300">{bc.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Quick POS Companion */}
      {activeTab === 'quickpos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Quick Menu Items (Left) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-300">
                Speed Punch Items
              </h3>
              <div className="flex items-center space-x-2">
                <label className="text-xs font-bold text-slate-400">Target Table:</label>
                <select
                  value={selectedTable}
                  onChange={e => setSelectedTable(e.target.value)}
                  className="px-3 py-1.5 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl text-xs font-bold text-slate-100 outline-none"
                >
                  {Array.from({ length: 24 }).map((_, i) => (
                    <option key={i} value={`Table ${i + 1}`}>
                      Table {i + 1}
                    </option>
                  ))}
                  <option value="Bar Tab 1">Bar Tab 1</option>
                  <option value="Garden Tab">Garden Tab</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {quickItems.map(item => (
                <button
                  key={item.name}
                  onClick={() => handleAddToCart(item.name)}
                  className="p-4 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl text-left hover:border-indigo-500 hover:shadow-md transition-all flex flex-col justify-between min-h-[90px]"
                >
                  <div>
                    <span className="text-[10px] font-black uppercase text-indigo-500">{item.category}</span>
                    <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100 mt-0.5 line-clamp-2">
                      {item.name}
                    </h5>
                  </div>
                  <div className="text-xs font-black text-slate-700 dark:text-slate-300 mt-2">
                    ${item.price.toFixed(2)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Quick Order Cart (Right) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[380px]">
              <div>
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 dark:border-slate-700">
                  <div>
                    <h4 className="font-black text-sm text-white">Quick Cart</h4>
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">{selectedTable}</span>
                  </div>
                  <button
                    onClick={handleClearCart}
                    className="text-xs text-slate-400 hover:text-red-500 font-semibold"
                  >
                    Clear
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-auto custom-scrollbar">
                  {Object.entries(quickCart).map(([name, qty]) => (
                    <div key={name} className="flex justify-between items-center text-xs p-2 rounded-xl bg-slate-950 text-white">
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate flex-1 mr-2">{name}</span>
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-black">
                        x{qty}
                      </span>
                    </div>
                  ))}

                  {Object.keys(quickCart).length === 0 && (
                    <div className="text-center py-10 text-slate-400 text-xs">
                      Tap items on the left to punch orders.
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  disabled={Object.keys(quickCart).length === 0}
                  onClick={() => {
                    alert(`Order sent to Kitchen & Bar printers for ${selectedTable}!`);
                    handleClearCart();
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Send To Kitchen / Bar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CTSCAppView;
