import React, { useState } from 'react';
import { EntertainmentEvent } from '../types';
import { formatDate, formatTime, generateId } from '../utils';
import {
  Music,
  Mic2,
  Tv,
  Trophy,
  Calendar,
  Plus,
  Trash2,
  Edit2,
  Search,
  DollarSign,
  X,
  Sparkles
} from 'lucide-react';

interface EntertainmentViewProps {
  events: EntertainmentEvent[];
  onSave: (item: EntertainmentEvent) => void;
  onDelete?: (id: string) => void;
}

const EntertainmentView: React.FC<EntertainmentViewProps> = ({ events, onSave, onDelete }) => {
  const [filterType, setFilterType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<EntertainmentEvent | null>(null);

  const [formData, setFormData] = useState<Partial<EntertainmentEvent>>({
    title: '',
    type: 'Band',
    date: new Date(),
    description: '',
    performerName: '',
    cost: 0,
    status: 'confirmed'
  });

  const getIcon = (type: EntertainmentEvent['type']) => {
    switch (type) {
      case 'Band':
        return <Music className="w-5 h-5 text-purple-500" />;
      case 'DJ':
        return <Mic2 className="w-5 h-5 text-blue-500" />;
      case 'Sport':
        return <Trophy className="w-5 h-5 text-amber-500" />;
      case 'Quiz':
        return <Tv className="w-5 h-5 text-emerald-500" />;
      default:
        return <Calendar className="w-5 h-5 text-slate-400" />;
    }
  };

  const handleOpenAdd = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      type: 'Band',
      date: new Date(),
      description: '',
      performerName: '',
      cost: 0,
      status: 'confirmed'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (evt: EntertainmentEvent) => {
    setEditingEvent(evt);
    setFormData({
      title: evt.title,
      type: evt.type,
      date: evt.date instanceof Date ? evt.date : new Date(evt.date),
      description: evt.description,
      performerName: evt.performerName || '',
      cost: evt.cost || 0,
      status: evt.status
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) return;

    const eventDate = formData.date instanceof Date ? formData.date : new Date(formData.date || Date.now());

    const itemToSave: EntertainmentEvent = {
      id: editingEvent ? editingEvent.id : `ent-${generateId()}`,
      title: formData.title.trim(),
      type: formData.type as any || 'Band',
      date: eventDate,
      description: formData.description?.trim() || '',
      performerName: formData.performerName?.trim() || undefined,
      cost: Number(formData.cost) || 0,
      status: formData.status as any || 'confirmed'
    };

    onSave(itemToSave);
    setIsModalOpen(false);
  };

  const filteredEvents = events.filter(evt => {
    const matchesType = filterType === 'All' || evt.type === filterType;
    const matchesSearch =
      searchQuery === '' ||
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.performerName && evt.performerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      evt.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="flex-1 p-8 overflow-auto custom-scrollbar bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 flex items-center">
              <Music className="w-7 h-7 mr-3 text-purple-600 dark:text-purple-400" />
              Entertainment & Live Acts Planner
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              {filteredEvents.length} Gigs Scheduled
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage live bands, resident DJs, weekly trivia, and headline venue events.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-lg shadow-purple-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Entertainment Event</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search events, bands, performers..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {['All', 'Band', 'DJ', 'Quiz', 'Sport'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === type
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {type === 'All' ? 'All Events' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEvents.map(event => {
          const eventDate = event.date instanceof Date ? event.date : new Date(event.date);

          return (
            <div
              key={event.id}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-purple-50 dark:bg-purple-950/50 rounded-2xl border border-purple-100 dark:border-purple-900">
                      {getIcon(event.type)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-50 text-lg">{event.title}</h3>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center mt-0.5">
                        <Calendar className="w-3.5 h-3.5 mr-1" />
                        {formatDate(eventDate)} at {formatTime(eventDate)}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      event.status === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {event.status}
                  </span>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{event.description}</p>

                {event.performerName && (
                  <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-700 flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-wider">Performer / Lineup:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{event.performerName}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-200 flex items-center">
                  <DollarSign className="w-4 h-4 text-emerald-500 -mr-0.5" />
                  {event.cost ? `Budget: $${event.cost.toFixed(2)}` : 'Free Entry'}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEdit(event)}
                    className="p-2 text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    title="Edit Event"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {onDelete && (
                    <button
                      onClick={() => {
                        if (confirm(`Remove event "${event.title}"?`)) {
                          onDelete(event.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      title="Delete Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredEvents.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
            <Music className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h4 className="font-bold text-slate-800 dark:text-slate-200">No Events Found</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              No entertainment matches your current search filters.
            </p>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                {editingEvent ? 'Edit Entertainment Event' : 'Add Entertainment Event'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Acoustic Sessions, Friday Night DJ set"
                  value={formData.title || ''}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Event Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Band">Live Band</option>
                    <option value="DJ">DJ Performance</option>
                    <option value="Quiz">Trivia / Quiz</option>
                    <option value="Sport">Special Sport Screening</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending Contract</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Date & Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    onChange={e => setFormData({ ...formData, date: new Date(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Artist Fee / Cost ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.cost || ''}
                    onChange={e => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Performer / Band Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. The Black Seeds, DJ Spinner, Quizmaster Mike"
                  value={formData.performerName || ''}
                  onChange={e => setFormData({ ...formData, performerName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Event Description & Details
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe venue staging, drink specials or ticketing..."
                  value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  {editingEvent ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntertainmentView;