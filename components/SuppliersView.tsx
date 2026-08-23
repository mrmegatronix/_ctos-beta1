import React, { useState } from 'react';
import { Supplier } from '../types';
import { generateId } from '../utils';
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Building2,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  ExternalLink,
  Users
} from 'lucide-react';
import { fetchGoogleContacts } from '../services/googleService';

interface SuppliersViewProps {
  suppliers: Supplier[];
  onSave: (item: Supplier) => void;
  onDelete?: (id: string) => void;
}

const SuppliersView: React.FC<SuppliersViewProps> = ({ suppliers, onSave, onDelete }) => {
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [formData, setFormData] = useState<Partial<Supplier>>({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    category: 'Food & Produce',
    address: '',
    website: ''
  });

  const categories = [
    'All',
    'Food & Produce',
    'Beverage & Brewery',
    'Equipment & Maintenance',
    'Cleaning & Hygiene',
    'POS & Tech',
    'General'
  ];

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      category: 'Food & Produce',
      address: '',
      website: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sup: Supplier) => {
    setEditingSupplier(sup);
    setFormData({
      name: sup.name,
      contactPerson: sup.contactPerson,
      email: sup.email,
      phone: sup.phone,
      category: sup.category,
      address: sup.address,
      website: sup.website || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const itemToSave: Supplier = {
      id: editingSupplier ? editingSupplier.id : `sup-${generateId()}`,
      name: formData.name.trim(),
      contactPerson: formData.contactPerson?.trim() || '',
      email: formData.email?.trim() || '',
      phone: formData.phone?.trim() || '',
      category: formData.category?.trim() || 'General',
      address: formData.address?.trim() || '',
      website: formData.website?.trim() || undefined
    };

    onSave(itemToSave);
    setIsModalOpen(false);
  };

  const handleSyncContacts = async () => {
    setIsSyncing(true);
    try {
      const contacts = await fetchGoogleContacts();
      let importedCount = 0;
      
      contacts.forEach((c: any) => {
        const name = c.names?.[0]?.displayName;
        const email = c.emailAddresses?.[0]?.value;
        const phone = c.phoneNumbers?.[0]?.value;
        
        if (name) {
          // Check if already exists
          if (!suppliers.find(s => s.name === name || s.email === email)) {
            onSave({
              id: 'sup-' + generateId(),
              name: name,
              contactPerson: name,
              email: email || '',
              phone: phone || '',
              category: 'Other',
              address: '',
              website: ''
            });
            importedCount++;
          }
        }
      });
      
      alert(`Imported ${importedCount} new suppliers from Google Contacts.`);
    } catch (err) {
      console.error(err);
      alert('Failed to sync contacts. Ensure you are connected to Google.');
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredSuppliers = suppliers.filter(s => {
    const matchesCat = filterCategory === 'All' || s.category === filterCategory;
    const matchesSearch =
      searchQuery === '' ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex-1 p-8 overflow-auto custom-scrollbar bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 flex items-center">
              <Building2 className="w-7 h-7 mr-3 text-indigo-600 dark:text-indigo-400" />
              Suppliers & Vendor Directory
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              {filteredSuppliers.length} Vendors Active
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Maintain contact directory, delivery addresses, and ordering portals for all venue vendors.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Supplier</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search vendor name, contact, address..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button 
            onClick={handleSyncContacts}
            disabled={isSyncing}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-xl hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors disabled:opacity-50"
          >
            <Users className={`w-4 h-4 ${isSyncing ? 'animate-pulse' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Contacts'}</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Supplier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map(supplier => (
          <div
            key={supplier.id}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  {supplier.category}
                </span>
              </div>

              <h3 className="text-lg font-black text-slate-900 dark:text-slate-50 mb-1">{supplier.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Representative:{' '}
                <span className="font-bold text-slate-800 dark:text-slate-200">{supplier.contactPerson || 'N/A'}</span>
              </p>

              <div className="space-y-2.5">
                {supplier.email && (
                  <a
                    href={`mailto:${supplier.email}`}
                    className="flex items-center text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700 hover:text-indigo-600 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 mr-2.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{supplier.email}</span>
                  </a>
                )}

                {supplier.phone && (
                  <a
                    href={`tel:${supplier.phone}`}
                    className="flex items-center text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700 hover:text-indigo-600 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 mr-2.5 text-slate-400 flex-shrink-0" />
                    <span>{supplier.phone}</span>
                  </a>
                )}

                {supplier.address && (
                  <div className="flex items-center text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                    <MapPin className="w-3.5 h-3.5 mr-2.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{supplier.address}</span>
                  </div>
                )}

                {supplier.website && (
                  <a
                    href={supplier.website.startsWith('http') ? supplier.website : `https://${supplier.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900 hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5 mr-2.5 flex-shrink-0" />
                    <span className="truncate">Supplier Portal</span>
                    <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
                  </a>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex gap-2">
              <button
                onClick={() => handleOpenEdit(supplier)}
                className="flex-1 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-center space-x-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Vendor</span>
              </button>
              {onDelete && (
                <button
                  onClick={() => {
                    if (confirm(`Remove supplier "${supplier.name}"?`)) {
                      onDelete(supplier.id);
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  title="Delete Supplier"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredSuppliers.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
            <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h4 className="font-bold text-slate-800 dark:text-slate-200">No Suppliers Found</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Add a supplier or adjust search query to see entries.
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
                <Building2 className="w-5 h-5 mr-2 text-indigo-600" />
                {editingSupplier ? 'Edit Vendor Details' : 'Add New Vendor'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Company / Vendor Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lion Breweries, Bidfood NZ, Gilmours"
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dave Miller (Account Rep)"
                    value={formData.contactPerson || ''}
                    onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Food & Produce">Food & Produce</option>
                    <option value="Beverage & Brewery">Beverage & Brewery</option>
                    <option value="Equipment & Maintenance">Equipment & Maintenance</option>
                    <option value="Cleaning & Hygiene">Cleaning & Hygiene</option>
                    <option value="POS & Tech">POS & Tech</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="orders@supplier.co.nz"
                    value={formData.email || ''}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Phone / Mobile
                  </label>
                  <input
                    type="tel"
                    placeholder="0800 123 456"
                    value={formData.phone || ''}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Physical Address / Warehouse
                </label>
                <input
                  type="text"
                  placeholder="e.g. 14 Supply Road, Industrial Park, Auckland"
                  value={formData.address || ''}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Website / Ordering Portal
                </label>
                <input
                  type="text"
                  placeholder="e.g. portal.supplier.co.nz"
                  value={formData.website || ''}
                  onChange={e => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  {editingSupplier ? 'Save Changes' : 'Create Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuppliersView;