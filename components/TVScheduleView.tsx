
import React, { useState } from 'react';
import { TVScheduleItem } from '../types';
import { formatTime, formatDate, generateId } from '../utils';
import { Tv, Search, Plus, Volume2, Calendar, Radio, RefreshCw } from 'lucide-react';

interface TVScheduleViewProps {
  schedule: TVScheduleItem[];
  onSave: (item: TVScheduleItem) => void;
}

const TVScheduleView: React.FC<TVScheduleViewProps> = ({ schedule, onSave }) => {
  const [filterSport, setFilterSport] = useState<string>('All');
  const [filterDay, setFilterDay] = useState<'Today' | 'Tomorrow' | 'All'>('Today');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<TVScheduleItem>>({
    isLive: true,
    sport: 'Rugby',
    startTime: new Date(),
    endTime: new Date(new Date().getTime() + 2 * 60 * 60 * 1000) // Default 2 hours
  });

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const isSameDay = (d1: Date, d2: Date) => 
    d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth();

  const filteredSchedule = schedule.filter(item => {
    const matchesSport = filterSport === 'All' || item.sport === filterSport;
    let matchesDay = true;
    if (filterDay === 'Today') matchesDay = isSameDay(new Date(item.startTime), today);
    if (filterDay === 'Tomorrow') matchesDay = isSameDay(new Date(item.startTime), tomorrow);
    
    return matchesSport && matchesDay;
  }).sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const getChannelColor = (channel: string) => {
    if (channel.includes('1')) return 'bg-blue-600 text-white';
    if (channel.includes('2')) return 'bg-yellow-500 text-black';
    if (channel.includes('3')) return 'bg-red-600 text-white';
    if (channel.includes('4')) return 'bg-green-600 text-white';
    if (channel.includes('Select')) return 'bg-purple-600 text-white';
    return 'bg-gray-700 text-white';
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.match || !newItem.channel || !newItem.startTime) return;

    onSave({
      id: generateId(),
      sport: newItem.sport as any,
      match: newItem.match,
      channel: newItem.channel,
      startTime: newItem.startTime,
      endTime: newItem.endTime || new Date(newItem.startTime.getTime() + 2*60*60*1000),
      isLive: newItem.isLive || false,
      notes: newItem.notes
    });
    setIsModalOpen(false);
    setNewItem({ isLive: true, sport: 'Rugby', startTime: new Date() });
  };

  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncSky = async () => {
    setIsSyncing(true);
    try {
      // In production, this should point to your hosted backend URL.
      const res = await fetch('http://localhost:5000/api/sync-sky');
      if (res.ok) {
        alert("Sky TV Schedule Synced Successfully! It may take a moment to appear.");
        // The App.tsx realtime listener should auto-update the list soon.
      } else {
        alert("Failed to sync TV schedule.");
      }
    } catch (e) {
      console.error("Sync Error:", e);
      alert("Error contacting the backend sync server. Make sure it is running.");
    }
    setIsSyncing(false);
  };

  return (
    <div className="flex-1 p-8 overflow-auto custom-scrollbar glass-panel ">
       <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-50  flex items-center">
              <Tv className="w-6 h-6 mr-3 text-sky-500" />
              Live Sport TV Schedule
            </h2>
            <p className="text-slate-400 ">Sky Sport Listings for Main Screen & Garden Bar.</p>
          </div>
          
          <div className="flex gap-2">
            <select 
              className="px-3 py-2 glass-panel  border border-white/10  rounded-lg outline-none"
              value={filterDay}
              onChange={(e) => setFilterDay(e.target.value as any)}
            >
               <option value="Today">Today</option>
               <option value="Tomorrow">Tomorrow</option>
               <option value="All">All Upcoming</option>
            </select>
            <select 
              className="px-3 py-2 glass-panel  border border-white/10  rounded-lg outline-none"
              value={filterSport}
              onChange={(e) => setFilterSport(e.target.value)}
            >
               <option value="All">All Sports</option>
               <option value="Rugby">Rugby</option>
               <option value="League">League</option>
               <option value="Cricket">Cricket</option>
               <option value="Football">Football</option>
               <option value="UFC">UFC</option>
            </select>
            <button 
              onClick={handleSyncSky}
              disabled={isSyncing}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} /> Sync Sky TV
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Listing
            </button>
          </div>
       </div>

       <div className="space-y-4">
         {filteredSchedule.map(item => (
           <div key={item.id} className="glass-panel  rounded-xl border border-white/10  p-4 shadow-lg hover:shadow-xl transition-shadow flex flex-col md:flex-row items-center gap-4">
              
              {/* Time Column */}
              <div className="md:w-32 flex-shrink-0 text-center md:text-left">
                  <div className="text-lg font-bold text-slate-50 ">{formatTime(new Date(item.startTime))}</div>
                  <div className="text-xs text-slate-400 ">{formatDate(new Date(item.startTime))}</div>
                  {item.isLive && (
                    <span className="inline-flex items-center mt-1 px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded text-[10px] font-bold uppercase tracking-wider animate-pulse">
                      <Radio className="w-3 h-3 mr-1" /> LIVE
                    </span>
                  )}
              </div>

              {/* Match Info */}
              <div className="flex-1 text-center md:text-left w-full">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                     <span className="text-xs font-semibold uppercase text-slate-400  tracking-wide">{item.sport}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-50 ">{item.match}</h3>
                  {item.notes && (
                    <div className="flex items-center justify-center md:justify-start text-sky-600 dark:text-sky-400 text-sm font-medium mt-1">
                      <Volume2 className="w-4 h-4 mr-1" /> {item.notes}
                    </div>
                  )}
              </div>

              {/* Channel Badge */}
              <div className={`px-4 py-2 rounded-lg font-bold text-sm shadow-lg ${getChannelColor(item.channel)}`}>
                 {item.channel}
              </div>
           </div>
         ))}

         {filteredSchedule.length === 0 && (
           <div className="text-center py-12 glass-panel /50 rounded-xl border border-dashed border-white/20 ">
             <Tv className="w-12 h-12 text-gray-300 mx-auto mb-3" />
             <p className="text-slate-400">No scheduled sport found for these filters.</p>
           </div>
         )}
       </div>

       {/* Add Modal */}
       {isModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="glass-panel  rounded-2xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95">
               <h3 className="text-lg font-bold text-slate-50  mb-4">Add TV Listing</h3>
               <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-200  mb-1">Match / Event Name</label>
                    <input type="text" required className="w-full px-3 py-2 glass-panel  border border-white/20  rounded-lg outline-none" 
                      placeholder="e.g. Warriors vs Storm"
                      value={newItem.match || ''}
                      onChange={e => setNewItem({...newItem, match: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-200  mb-1">Sport</label>
                        <select className="w-full px-3 py-2 glass-panel  border border-white/20  rounded-lg outline-none"
                          value={newItem.sport}
                          onChange={e => setNewItem({...newItem, sport: e.target.value as any})}
                        >
                          <option value="Rugby">Rugby</option>
                          <option value="League">League</option>
                          <option value="Cricket">Cricket</option>
                          <option value="Football">Football</option>
                          <option value="UFC">UFC</option>
                          <option value="Other">Other</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-200  mb-1">Channel</label>
                        <select className="w-full px-3 py-2 glass-panel  border border-white/20  rounded-lg outline-none"
                          value={newItem.channel}
                          onChange={e => setNewItem({...newItem, channel: e.target.value})}
                        >
                          <option value="Sky Sport 1">Sky Sport 1</option>
                          <option value="Sky Sport 2">Sky Sport 2</option>
                          <option value="Sky Sport 3">Sky Sport 3</option>
                          <option value="Sky Sport 4">Sky Sport 4</option>
                          <option value="Sky Sport Select">Sky Sport Select</option>
                        </select>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-200  mb-1">Start Time</label>
                        <input type="datetime-local" required className="w-full px-3 py-2 glass-panel  border border-white/20  rounded-lg outline-none"
                          onChange={e => setNewItem({...newItem, startTime: new Date(e.target.value)})}
                        />
                      </div>
                      <div className="flex items-end pb-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                           <input type="checkbox" checked={newItem.isLive} onChange={e => setNewItem({...newItem, isLive: e.target.checked})} className="w-5 h-5 rounded text-sky-600" />
                           <span className="text-sm font-medium">Live Broadcast</span>
                        </label>
                      </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-200  mb-1">Notes (Optional)</label>
                    <input type="text" className="w-full px-3 py-2 glass-panel  border border-white/20  rounded-lg outline-none" 
                      placeholder="e.g. Sound On Main Screen"
                      value={newItem.notes || ''}
                      onChange={e => setNewItem({...newItem, notes: e.target.value})}
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-300  hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700">Add Listing</button>
                  </div>
               </form>
            </div>
         </div>
       )}
    </div>
  );
};

export default TVScheduleView;
