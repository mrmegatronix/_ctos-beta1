import React from 'react';
import { EntertainmentEvent } from '../types';
import { formatDate, formatTime } from '../utils';
import { Music, Mic2, Tv, Trophy, Calendar } from 'lucide-react';

interface EntertainmentViewProps {
  events: EntertainmentEvent[];
}

const EntertainmentView: React.FC<EntertainmentViewProps> = ({ events }) => {
  const getIcon = (type: EntertainmentEvent['type']) => {
    switch (type) {
      case 'Band': return <Music className="w-5 h-5 text-purple-500" />;
      case 'DJ': return <Mic2 className="w-5 h-5 text-blue-500" />;
      case 'Sport': return <Trophy className="w-5 h-5 text-amber-500" />;
      case 'Quiz': return <Tv className="w-5 h-5 text-emerald-500" />;
      default: return <Calendar className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="flex-1 p-8 overflow-auto custom-scrollbar bg-white dark:bg-slate-900">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Entertainment Schedule</h2>
          <p className="text-gray-500 dark:text-gray-400">Upcoming gigs, sports, and trivia.</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
          Add Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {events.map(event => (
          <div key={event.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 flex flex-col hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  {getIcon(event.type)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">{event.title}</h3>
                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                     <Calendar className="w-3 h-3 mr-1" />
                     {formatDate(event.date)} at {formatTime(event.date)}
                  </div>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${event.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-amber-100 text-amber-800'}`}>
                {event.status}
              </span>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-4 flex-1">{event.description}</p>
            
            {event.performerName && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg flex justify-between items-center text-sm">
                <span className="text-gray-500 dark:text-gray-400">Performer:</span>
                <span className="font-medium text-gray-900 dark:text-white">{event.performerName}</span>
              </div>
            )}

            <div className="border-t border-gray-100 dark:border-slate-700 pt-4 flex justify-between items-center">
               <div className="text-sm font-medium text-gray-900 dark:text-white">
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