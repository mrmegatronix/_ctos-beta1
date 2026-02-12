import React from 'react';
import { Supplier } from '../types';
import { Mail, Phone, MapPin, Globe, Building2 } from 'lucide-react';

interface SuppliersViewProps {
  suppliers: Supplier[];
}

const SuppliersView: React.FC<SuppliersViewProps> = ({ suppliers }) => {
  return (
    <div className="flex-1 p-8 overflow-auto custom-scrollbar bg-white dark:bg-slate-900">
       <div className="mb-6 flex justify-between items-center">
         <div>
             <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Suppliers Address Book</h2>
             <p className="text-gray-500 dark:text-gray-400">Manage contacts for food, beverage, and services.</p>
         </div>
         <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            Add Supplier
         </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {suppliers.map(supplier => (
           <div key={supplier.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
             
             <div className="flex items-start justify-between mb-4">
                 <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                    <Building2 className="w-6 h-6" />
                 </div>
                 <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300">
                    {supplier.category}
                 </span>
             </div>

             <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{supplier.name}</h3>
             <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Contact: <span className="font-medium text-gray-700 dark:text-gray-300">{supplier.contactPerson}</span></p>

             <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-700/50 p-2 rounded-lg">
                    <Mail className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="truncate">{supplier.email}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-700/50 p-2 rounded-lg">
                    <Phone className="w-4 h-4 mr-3 text-gray-400" />
                    <span>{supplier.phone}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-700/50 p-2 rounded-lg text-left">
                    <MapPin className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{supplier.address}</span>
                </div>
                {supplier.website && (
                    <div className="flex items-center text-sm text-indigo-600 dark:text-indigo-400 bg-gray-50 dark:bg-slate-700/50 p-2 rounded-lg cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                        <Globe className="w-4 h-4 mr-3" />
                        <span className="truncate">Visit Website</span>
                    </div>
                )}
             </div>
             
             <div className="mt-6 flex gap-2">
                <button className="flex-1 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                    Edit Details
                </button>
             </div>
           </div>
         ))}
       </div>
    </div>
  );
};

export default SuppliersView;