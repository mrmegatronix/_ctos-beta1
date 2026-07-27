
import React, { useState } from 'react';
import { LostItem, TeamMember } from '../types';
import { formatDate, generateId } from '../utils';
import { Search, Umbrella, CheckCircle2, Clock, Trash2, Plus } from 'lucide-react';

interface LostAndFoundViewProps {
  items: LostItem[];
  staff: TeamMember[];
  currentUser: TeamMember;
  onSave: (item: LostItem) => void;
}

const LostAndFoundView: React.FC<LostAndFoundViewProps> = ({ items, staff, currentUser, onSave }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<LostItem>>({
      status: 'unclaimed',
      dateFound: new Date()
  });

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newItem.itemDescription || !newItem.locationFound) return;

      const item: LostItem = {
          id: generateId(),
          dateFound: newItem.dateFound || new Date(),
          foundByStaffId: currentUser.id,
          itemDescription: newItem.itemDescription,
          locationFound: newItem.locationFound,
          status: 'unclaimed',
          contactDetails: newItem.contactDetails
      };

      onSave(item);
      setIsFormOpen(false);
      setNewItem({ status: 'unclaimed', dateFound: new Date() });
  };

  const handleStatusUpdate = (item: LostItem, status: LostItem['status']) => {
      onSave({ ...item, status });
  };

  const filteredItems = items.filter(i => i.itemDescription.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex-1 p-8 overflow-auto custom-scrollbar glass-panel ">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-50  flex items-center">
                    <Umbrella className="w-6 h-6 mr-3 text-indigo-500" />
                    Lost & Found
                </h2>
                <p className="text-slate-400 ">Track items left behind by customers.</p>
            </div>
            
            <div className="flex w-full md:w-auto gap-2">
                <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search items..." 
                        className="w-full pl-9 pr-4 py-2 glass-panel  border border-white/10  rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <button 
                    onClick={() => setIsFormOpen(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors whitespace-nowrap"
                >
                    <Plus className="w-4 h-4 inline mr-1" /> Log Item
                </button>
            </div>
        </div>

        {isFormOpen && (
            <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-xl p-6 mb-8 animate-in slide-in-from-top-4">
                <h3 className="font-bold text-lg text-indigo-900 dark:text-indigo-200 mb-4">Found Item Details</h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-slate-200  mb-1">Item Description</label>
                        <input 
                            type="text" required
                            className="w-full px-3 py-2 glass-panel  border border-white/20  rounded-lg outline-none"
                            placeholder="e.g. Black iPhone 12 with floral case"
                            value={newItem.itemDescription || ''}
                            onChange={e => setNewItem({...newItem, itemDescription: e.target.value})}
                        />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-slate-200  mb-1">Location Found</label>
                        <input 
                            type="text" required
                            className="w-full px-3 py-2 glass-panel  border border-white/20  rounded-lg outline-none"
                            placeholder="e.g. Table 12, under seat"
                            value={newItem.locationFound || ''}
                            onChange={e => setNewItem({...newItem, locationFound: e.target.value})}
                        />
                    </div>
                    <div className="flex justify-end col-span-2 space-x-3 pt-2">
                        <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-slate-300 hover:bg-gray-200 rounded-lg">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">Save Item</button>
                    </div>
                </form>
            </div>
        )}

        <div className="glass-panel  rounded-xl border border-white/10  overflow-hidden shadow-lg">
            <table className="w-full text-left">
                <thead className="glass-panel /50 text-xs uppercase text-slate-400 ">
                    <tr>
                        <th className="px-6 py-3">Date Found</th>
                        <th className="px-6 py-3">Item</th>
                        <th className="px-6 py-3">Location</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                    {filteredItems.map(item => (
                        <tr key={item.id} className="hover:glass-panel dark:hover:bg-slate-700/30">
                            <td className="px-6 py-4 text-sm text-slate-400 ">{formatDate(new Date(item.dateFound))}</td>
                            <td className="px-6 py-4 font-medium text-slate-50 ">{item.itemDescription}</td>
                            <td className="px-6 py-4 text-sm text-slate-300 ">{item.locationFound}</td>
                            <td className="px-6 py-4">
                                {item.status === 'unclaimed' ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                                        <Clock className="w-3 h-3 mr-1" /> Unclaimed
                                    </span>
                                ) : item.status === 'returned' ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                        <CheckCircle2 className="w-3 h-3 mr-1" /> Returned
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-slate-100  ">
                                        <Trash2 className="w-3 h-3 mr-1" /> Disposed
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right">
                                {item.status === 'unclaimed' && (
                                    <div className="flex justify-end space-x-2">
                                        <button onClick={() => handleStatusUpdate(item, 'returned')} className="text-xs font-medium text-green-600 hover:bg-green-50 px-2 py-1 rounded">Return</button>
                                        <button onClick={() => handleStatusUpdate(item, 'disposed')} className="text-xs font-medium text-slate-400 hover:bg-gray-100 px-2 py-1 rounded">Dispose</button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                    {filteredItems.length === 0 && (
                        <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No items found matching criteria.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default LostAndFoundView;
