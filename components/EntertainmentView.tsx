import React from 'react';
import { EntertainmentEvent } from '../types';
import { formatDate, formatTime } from '../utils';
import { Music, Mic2, Tv, Trophy, Calendar } from 'lucide-react';

interface EntertainmentViewProps {
  onSave?: (item: EntertainmentEvent) => void;
  events: EntertainmentEvent[];
}

const EntertainmentView: React.FC<EntertainmentViewProps> = ({ events , onSave }) => {
  const handleAdd = () => {
      const name = window.prompt("Enter Add Event Name (Basic entry mode):");
      if (name && onSave) {
          onSave({
              id: `ent-${Date.now()}`, title: name || 'New Event', type: 'Band', date: new Date(), description: '', performerName: '', status: 'pending', cost: 0
          } as any);
      }
  };

  const getIcon = (type: EntertainmentEvent['type']) => {
    switch (type) {
      case 'Band': return <Music className="w-5 h-5 text-purple-500" />;
      case 'DJ': return <Mic2 className="w-5 h-5 text-blue-500" />;
      case 'Sport': return <Trophy className="w-5 h-5 text-amber-500" />;
      case 'Quiz': return <Tv className="w-5 h-5 text-emerald-500" />;
      default: return <Calendar className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="flex-1 p-8 overflow-auto custom-scrollbar glass-panel ">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-50 ">Entertainment Schedule</h2>
          <p className="text-slate-400 ">Upcoming gigs, sports, and trivia.</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors" onClick={handleAdd}>
          Add Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {events.map(event => (
          <div key={event.id} className="glass-panel  rounded-xl border border-white/10  p-6 flex flex-col hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 glass-panel  rounded-lg">
                  {getIcon(event.type)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-50  text-lg">{event.title}</h3>
                  <div className="text-sm text-slate-400  flex items-center">
                     <Calendar className="w-3 h-3 mr-1" />
                     {formatDate(event.date)} at {formatTime(event.date)}
                  </div>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${event.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-amber-100 text-amber-800'}`}>
                {event.status}
              </span>
            </div>
            
            <p className="text-slate-300  mb-4 flex-1">{event.description}</p>
            
            {event.performerName && (
              <div className="mb-4 p-3 glass-panel /50 rounded-lg flex justify-between items-center text-sm">
                <span className="text-slate-400 ">Performer:</span>
                <span className="font-medium text-slate-50 ">{event.performerName}</span>
              </div>
            )}

            <div className="border-t border-gray-100  pt-4 flex justify-between items-center">
               <div className="text-sm font-medium text-slate-50 ">
                 {event.cost ? `Cost: $${event.cost}` : 'No Cost'}
               </div>
               <button className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold hover:underline">Edit Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EntertainmentView;