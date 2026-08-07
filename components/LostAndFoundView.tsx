
import React, { useState } from 'react';
import { LostItem, TeamMember } from '../types';
import { formatDate, generateId } from '../utils';
import { Search, Umbrella, CheckCircle2, Clock, Trash2, Plus, Filter, UserCheck, Phone, MapPin, X } from 'lucide-react';

interface LostAndFoundViewProps {
  items: LostItem[];
  staff: TeamMember[];
  currentUser: TeamMember;
  onSave: (item: LostItem) => void;
  onDelete?: (id: string) => void;
}

const LostAndFoundView: React.FC<LostAndFoundViewProps> = ({ items, staff, currentUser, onSave, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [returningItem, setReturningItem] = useState<LostItem | null>(null);
  const [claimantName, setClaimantName] = useState('');
  const [claimantContact, setClaimantContact] = useState('');

  const [newItem, setNewItem] = useState<Partial<LostItem>>({
    status: 'unclaimed',
    dateFound: new Date(),
    itemDescription: '',
    locationFound: '',
    contactDetails: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.itemDescription || !newItem.locationFound) return;

    const item: LostItem = {
      id: `lf-${generateId()}`,
      dateFound: newItem.dateFound ? new Date(newItem.dateFound) : new Date(),
      foundByStaffId: currentUser.id,
      itemDescription: newItem.itemDescription,
      locationFound: newItem.locationFound,
      status: 'unclaimed',
      contactDetails: newItem.contactDetails || ''
    };

    onSave(item);
    setIsFormOpen(false);
    setNewItem({ status: 'unclaimed', dateFound: new Date(), itemDescription: '', locationFound: '', contactDetails: '' });
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returningItem) return;

    const updated: LostItem = {
      ...returningItem,
      status: 'returned',
      customerName: claimantName || returningItem.customerName,
      contactDetails: claimantContact || returningItem.contactDetails
    };

    onSave(updated);
    setReturningItem(null);
    setClaimantName('');
    setClaimantContact('');
  };

  const handleStatusUpdate = (item: LostItem, status: LostItem['status']) => {
    if (status === 'returned') {
      setReturningItem(item);
      setClaimantName(item.customerName || '');
      setClaimantContact(item.contactDetails || '');
    } else {
      onSave({ ...item, status });
    }
  };

  const getStaffName = (id: string) => staff.find(s => s.id === id)?.name || 'Staff';

  const filteredItems = items.filter(i => {
    if (filterStatus !== 'all' && i.status !== filterStatus) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const descMatch = i.itemDescription.toLowerCase().includes(q);
      const locMatch = i.locationFound.toLowerCase().includes(q);
      const custMatch = i.customerName?.toLowerCase().includes(q);
      const contactMatch = i.contactDetails?.toLowerCase().includes(q);
      return descMatch || locMatch || custMatch || contactMatch;
    }
    return true;
  }).sort((a, b) => new Date(b.dateFound).getTime() - new Date(a.dateFound).getTime());

  const unclaimedCount = items.filter(i => i.status === 'unclaimed').length;

  return (
    <div className="flex-1 p-8 overflow-auto custom-scrollbar bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 flex items-center">
              <Umbrella className="w-7 h-7 mr-3 text-indigo-600 dark:text-indigo-400" />
              Lost & Found Management
            </h2>
            {unclaimedCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700">
                {unclaimedCount} Unclaimed
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Secure custody log for patron belongings, property return tracking, and retention records.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Log Found Item
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Status:</span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'All Items' },
              { id: 'unclaimed', label: 'Unclaimed' },
              { id: 'returned', label: 'Returned' },
              { id: 'disposed', label: 'Disposed' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  filterStatus === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search items, locations, claimants..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Add Item Modal / Box */}
      {isFormOpen && (
        <div className="bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-900/40 rounded-2xl p-6 mb-8 shadow-xl animate-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-lg text-indigo-700 dark:text-indigo-300 flex items-center">
              <Umbrella className="w-5 h-5 mr-2" />
              Log Found Belonging
            </h3>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Found by: <strong>{currentUser.name}</strong>
            </span>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Item Description & Characteristics
              </label>
              <input
                type="text"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-800 dark:text-slate-100"
                placeholder="e.g. Black leather wallet, floral Ray-Ban sunglasses, Apple AirPods Pro..."
                value={newItem.itemDescription || ''}
                onChange={e => setNewItem({ ...newItem, itemDescription: e.target.value })}
              />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Location Found
              </label>
              <input
                type="text"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-800 dark:text-slate-100"
                placeholder="e.g. Table 14 booth, Main Bar stool, Restroom vanity..."
                value={newItem.locationFound || ''}
                onChange={e => setNewItem({ ...newItem, locationFound: e.target.value })}
              />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Date & Time Found
              </label>
              <input
                type="datetime-local"
                required
                defaultValue={new Date().toISOString().slice(0, 16)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-800 dark:text-slate-100"
                onChange={e => setNewItem({ ...newItem, dateFound: new Date(e.target.value) })}
              />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Initial Patron Details / Notes (Optional)
              </label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-800 dark:text-slate-100"
                placeholder="e.g. Inquired by customer on phone earlier..."
                value={newItem.contactDetails || ''}
                onChange={e => setNewItem({ ...newItem, contactDetails: e.target.value })}
              />
            </div>

            <div className="flex justify-end col-span-2 space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors shadow-md shadow-indigo-600/20"
              >
                Register Found Item
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Return Item Modal */}
      {returningItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-50 flex items-center">
                <UserCheck className="w-5 h-5 mr-2 text-green-600" />
                Record Item Return
              </h3>
              <button
                onClick={() => setReturningItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Item: <strong className="text-slate-800 dark:text-slate-200">{returningItem.itemDescription}</strong>
            </p>

            <form onSubmit={handleReturnSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Claimant / Customer Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  value={claimantName}
                  onChange={e => setClaimantName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-sm text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Contact Phone / Email
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +64 21 000 0000"
                  value={claimantContact}
                  onChange={e => setClaimantContact(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-sm text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReturningItem(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl transition-colors shadow-md shadow-green-600/20 flex items-center"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> Confirm Release
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Items Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-xs uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3.5">Date Found</th>
                <th className="px-6 py-3.5">Item Description</th>
                <th className="px-6 py-3.5">Location</th>
                <th className="px-6 py-3.5">Finder</th>
                <th className="px-6 py-3.5">Status & Custody</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredItems.map(item => {
                const itemDate = item.dateFound instanceof Date ? item.dateFound : new Date(item.dateFound);
                return (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {formatDate(itemDate)}
                    </td>
                    <td className="px-6 py-4 font-semibold text-sm text-slate-900 dark:text-slate-100">
                      {item.itemDescription}
                      {item.customerName && (
                        <div className="text-xs font-normal text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center">
                          <UserCheck className="w-3 h-3 mr-1 inline" /> Claimed by {item.customerName} ({item.contactDetails})
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300">
                      <span className="flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {item.locationFound}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {getStaffName(item.foundByStaffId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.status === 'unclaimed' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300">
                          <Clock className="w-3 h-3 mr-1.5" /> In Safe Storage
                        </span>
                      ) : item.status === 'returned' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3 mr-1.5" /> Returned to Patron
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-400">
                          <Trash2 className="w-3 h-3 mr-1.5" /> Disposed / Donated
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2">
                        {item.status === 'unclaimed' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(item, 'returned')}
                              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 px-2.5 py-1 rounded-lg transition-colors"
                            >
                              Release to Owner
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(item, 'disposed')}
                              className="text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 px-2.5 py-1 rounded-lg transition-colors"
                            >
                              Dispose
                            </button>
                          </>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => {
                              if (confirm("Delete this lost & found record?")) {
                                onDelete(item.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-red-600 rounded-md transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                    No lost & found items found matching the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LostAndFoundView;
