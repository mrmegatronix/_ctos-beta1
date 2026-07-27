import React, { useState, useEffect } from 'react';
import { CalendarEvent, TeamMember } from '../types';
import { generateId } from '../utils';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  onDelete: (id: string) => void;
  initialEvent?: Partial<CalendarEvent>;
  teamMembers: TeamMember[];
}

const EventModal: React.FC<EventModalProps> = ({ 
  isOpen, onClose, onSave, onDelete, initialEvent, teamMembers 
}) => {
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [description, setDescription] = useState('');
  const [attendees, setAttendees] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (initialEvent) {
        setTitle(initialEvent.title || '');
        // Convert Date objects to "YYYY-MM-DDTHH:mm" for input[type="datetime-local"]
        const toLocalISO = (d?: Date) => {
            if (!d) return '';
            const pad = (n: number) => n < 10 ? '0' + n : n;
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        };
        
        setStart(toLocalISO(initialEvent.start || new Date()));
        setEnd(toLocalISO(initialEvent.end || new Date(new Date().setHours(new Date().getHours() + 1))));
        setDescription(initialEvent.description || '');
        setAttendees(initialEvent.attendeeIds || []);
      } else {
        // Reset
        setTitle('');
        setStart('');
        setEnd('');
        setDescription('');
        setAttendees([]);
      }
    }
  }, [isOpen, initialEvent]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: CalendarEvent = {
      id: initialEvent?.id || generateId(),
      title: title || '(No Title)',
      start: new Date(start),
      end: new Date(end),
      description,
      attendeeIds: attendees,
      isMeeting: attendees.length > 1,
      source: initialEvent?.source || 'local'
    };
    onSave(newEvent);
    onClose();
  };

  const toggleAttendee = (id: string) => {
    setAttendees(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="glass-panel  rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-100 ">
        <div className="px-6 py-4 border-b border-gray-100  flex justify-between items-center glass-panel ">
          <h2 className="text-lg font-semibold text-slate-100 ">
            {initialEvent?.id ? 'Edit Event' : 'New Event'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-slate-300  dark:hover:text-gray-300 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200  mb-1">Title</label>
            <input 
              type="text" 
              required
              className="w-full px-3 py-2 border border-white/10  glass-panel  text-slate-50  rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="e.g. Weekly Sync"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200  mb-1">Start</label>
              <input 
                type="datetime-local" 
                required
                className="w-full px-3 py-2 border border-white/10  glass-panel  text-slate-50  rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={start}
                onChange={e => setStart(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200  mb-1">End</label>
              <input 
                type="datetime-local" 
                required
                className="w-full px-3 py-2 border border-white/10  glass-panel  text-slate-50  rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={end}
                onChange={e => setEnd(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200  mb-1">Attendees</label>
            <div className="flex flex-wrap gap-2">
              {teamMembers.map(member => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => toggleAttendee(member.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    attendees.includes(member.id) 
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300' 
                      : 'glass-panel  border-white/10  text-slate-300  hover:glass-panel dark:hover:bg-slate-700'
                  }`}
                >
                  <img src={member.avatar} alt={member.name} className="w-5 h-5 rounded-full" />
                  <span>{member.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200  mb-1">Description</label>
            <textarea 
              rows={3}
              className="w-full px-3 py-2 border border-white/10  glass-panel  text-slate-50  rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Add details..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100 ">
             {initialEvent?.id ? (
                <button 
                  type="button" 
                  onClick={() => { onDelete(initialEvent.id!); onClose(); }}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Delete Event
                </button>
             ) : (
                 <div></div>
             )}
            <div className="flex space-x-3">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 text-slate-200  font-medium hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-lg shadow-indigo-200 dark:shadow-none transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;