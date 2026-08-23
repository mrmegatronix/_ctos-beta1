import React, { useState } from 'react';
import { TVScheduleItem } from '../types';
import { formatTime, formatDate, generateId } from '../utils';
import { Tv, Plus, Volume2, Calendar, Radio, RefreshCw, Trash2, X, Clock, PlayCircle } from 'lucide-react';

interface TVScheduleViewProps {
  schedule: TVScheduleItem[];
  onSave: (item: TVScheduleItem) => void;
  onDelete?: (id: string) => void;
}

const TVScheduleView: React.FC<TVScheduleViewProps> = ({ schedule, onSave, onDelete }) => {
  const [filterSport, setFilterSport] = useState<string>('All');
  const [filterDay, setFilterDay] = useState<'Today' | 'Tomorrow' | 'All'>('Today');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<TVScheduleItem>>({
    isLive: true,
    sport: 'Rugby',
    startTime: new Date(),
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000)
  });
  const [isSyncing, setIsSyncing] = useState(false);

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const isSameDay = (d1: Date, d2: Date) => 
    d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();

  const filteredSchedule = schedule.filter(item => {
    const itemDate = item.startTime instanceof Date ? item.startTime : new Date(item.startTime);
    const matchesSport = filterSport === 'All' || item.sport === filterSport;
    let matchesDay = true;
    if (filterDay === 'Today') matchesDay = isSameDay(itemDate, today);
    if (filterDay === 'Tomorrow') matchesDay = isSameDay(itemDate, tomorrow);
    return matchesSport && matchesDay;
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const getEventColor = (sport: string, match: string) => {
    const s = `${sport} ${match}`.toLowerCase();
    if (s.includes('super rugby') || s.includes('all blacks') || s.includes('crusaders')) return '#ef4444';
    if (s.includes('nrl') || s.includes('warriors')) return '#10b981';
    if (s.includes('cricket') || s.includes('black caps')) return '#0ea5e9';
    if (s.includes('ufc') || s.includes('fight') || s.includes('boxing')) return '#f59e0b';
    if (s.includes('premier league') || s.includes('football') || s.includes('fifa')) return '#8b5cf6';
    return '#6366f1';
  };

  const getChannelColor = (channel: string) => {
    if (channel.includes('1')) return 'bg-blue-600 text-white';
    if (channel.includes('2')) return 'bg-amber-500 text-slate-900';
    if (channel.includes('3')) return 'bg-rose-600 text-white';
    if (channel.includes('4')) return 'bg-emerald-600 text-white';
    if (channel.includes('Select')) return 'bg-purple-600 text-white';
    return 'bg-slate-700 text-white';
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.match || !newItem.channel || !newItem.startTime) return;

    const start = newItem.startTime instanceof Date ? newItem.startTime : new Date(newItem.startTime);

    onSave({
      id: `tv-${generateId()}`,
      sport: (newItem.sport as any) || 'Rugby',
      match: newItem.match.trim(),
      channel: newItem.channel,
      startTime: start,
      endTime: newItem.endTime ? (newItem.endTime instanceof Date ? newItem.endTime : new Date(newItem.endTime)) : new Date(start.getTime() + 2 * 60 * 60 * 1000),
      isLive: newItem.isLive ?? true,
      notes: newItem.notes?.trim() || undefined
    });

    setIsModalOpen(false);
    setNewItem({ isLive: true, sport: 'Rugby', startTime: new Date() });
  };

  const handleSyncSky = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sync-sky');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.items)) {
          for (const item of data.items) {
            onSave(item);
          }
        }
      }
    } catch {
      // Offline fallback
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex h-full flex-col p-6 space-y-6 bg-slate-950 text-white overflow-y-auto relative custom-scrollbar">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full mix-blend-screen z-0 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full mix-blend-screen z-0 pointer-events-none"></div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Tv className="w-7 h-7 mr-3 text-sky-600 dark:text-sky-400" />
              Live Sports Broadcast Schedule
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300">
              {filteredSchedule.length} Fixtures
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Sky Sport and live broadcast planner for Main Bar, Garden Screen & Sports Lounges.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSyncSky}
            disabled={isSyncing}
            className="bg-slate-900/60 backdrop-blur-xl border border-white/10 text-slate-700 dark:text-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-white/10 transition-colors transition-colors flex items-center shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync TV Guide'}
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-sky-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-sky-700 transition-colors flex items-center space-x-1.5 shadow-lg shadow-sky-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add TV Fixture</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-black uppercase text-slate-400 mr-2">Timeline:</span>
          {(['Today', 'Tomorrow', 'All'] as const).map(day => (
            <button
              key={day}
              onClick={() => setFilterDay(day)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterDay === day
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-300 hover:bg-slate-200'
              }`}
            >
              {day === 'All' ? 'All Upcoming' : day}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-black uppercase text-slate-400 mr-2">Sport:</span>
          {['All', 'Rugby', 'League', 'Cricket', 'Football', 'UFC', 'Other'].map(sport => (
            <button
              key={sport}
              onClick={() => setFilterSport(sport)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                filterSport === sport
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                  : 'text-slate-500 hover:bg-white/10 transition-colors'
              }`}
            >
              {sport}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule Items */}
      <div className="space-y-4">
        {filteredSchedule.map(item => {
          const itemTime = item.startTime instanceof Date ? item.startTime : new Date(item.startTime);
          const accentColor = getEventColor(item.sport, item.match);

          return (
            <div
              key={item.id}
              className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center gap-5 relative overflow-hidden"
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-2"
                style={{ backgroundColor: accentColor }}
              />

              {/* Time Column */}
              <div className="pl-3 md:w-36 flex-shrink-0">
                <div className="text-xl font-black text-white">{formatTime(itemTime)}</div>
                <div className="text-xs font-medium text-slate-400 flex items-center mt-0.5">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(itemTime)}
                </div>
                {item.isLive && (
                  <span className="inline-flex items-center mt-1.5 px-2 py-0.5 bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 rounded-md text-[10px] font-black uppercase tracking-wider animate-pulse border border-red-200 dark:border-red-800">
                    <Radio className="w-2.5 h-2.5 mr-1" /> LIVE
                  </span>
                )}
              </div>

              {/* Match Info */}
              <div className="flex-1 w-full">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-300">
                    {item.sport}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{item.match}</h3>
                {item.notes && (
                  <div className="flex items-center text-sky-600 dark:text-sky-400 text-xs font-semibold mt-1">
                    <Volume2 className="w-3.5 h-3.5 mr-1" /> {item.notes}
                  </div>
                )}
              </div>

              {/* Channel and Actions */}
              <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-700">
                <div className={`px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-sm ${getChannelColor(item.channel)}`}>
                  {item.channel}
                </div>

                {onDelete && (
                  <button
                    onClick={() => {
                      if (confirm(`Remove "${item.match}" from TV listings?`)) {
                        onDelete(item.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-white/10 transition-colors"
                    title="Delete Fixture"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredSchedule.length === 0 && (
          <div className="text-center py-16 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-dashed border-white/10">
            <Tv className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h4 className="font-bold text-slate-800 dark:text-slate-200">No Scheduled Sports Broadcasts</h4>
            <p className="text-xs text-slate-400 mt-1">Add a fixture manually or sync Sky TV guide.</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-white flex items-center">
                <PlayCircle className="w-5 h-5 mr-2 text-sky-600" />
                Add Live Broadcast Fixture
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">
                  Match / Event Title *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 text-white border border-white/10 rounded-xl text-sm font-semibold text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="e.g. Warriors vs Broncos, All Blacks vs Springboks"
                  value={newItem.match || ''}
                  onChange={e => setNewItem({ ...newItem, match: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">
                    Sport
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-slate-950 text-white border border-white/10 rounded-xl text-xs font-semibold text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                    value={newItem.sport}
                    onChange={e => setNewItem({ ...newItem, sport: e.target.value as any })}
                  >
                    <option value="Rugby">Rugby Union</option>
                    <option value="League">Rugby League</option>
                    <option value="Cricket">Cricket</option>
                    <option value="Football">Football / Soccer</option>
                    <option value="UFC">UFC / Combat</option>
                    <option value="Other">Other Sport</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">
                    Channel
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-slate-950 text-white border border-white/10 rounded-xl text-xs font-semibold text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                    value={newItem.channel}
                    onChange={e => setNewItem({ ...newItem, channel: e.target.value })}
                  >
                    <option value="Sky Sport 1">Sky Sport 1</option>
                    <option value="Sky Sport 2">Sky Sport 2</option>
                    <option value="Sky Sport 3">Sky Sport 3</option>
                    <option value="Sky Sport 4">Sky Sport 4</option>
                    <option value="Sky Sport Select">Sky Sport Select</option>
                    <option value="Freeview / TVNZ">Freeview / TVNZ</option>
                    <option value="Optus Sport / DAZN">Optus / DAZN</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 text-white border border-white/10 rounded-xl text-sm font-semibold text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                  onChange={e => setNewItem({ ...newItem, startTime: new Date(e.target.value) })}
                />
              </div>

              <div className="flex items-center space-x-2 p-2.5 bg-slate-950 text-white rounded-xl border border-white/10">
                <input
                  type="checkbox"
                  id="liveCheck"
                  checked={newItem.isLive}
                  onChange={e => setNewItem({ ...newItem, isLive: e.target.checked })}
                  className="w-4 h-4 rounded text-sky-600"
                />
                <label htmlFor="liveCheck" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Live Broadcast Flag (Audio & Priority)
                </label>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">
                  Screen Routing & Audio Notes
                </label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2 bg-slate-950 text-white border border-white/10 rounded-xl text-xs text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="e.g. Main screen audio ON, Garden screens mirror"
                  value={newItem.notes || ''}
                  onChange={e => setNewItem({ ...newItem, notes: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 transition-colors rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Add Fixture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TVScheduleView;
