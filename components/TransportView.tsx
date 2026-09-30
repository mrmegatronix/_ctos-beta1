import React, { useState } from 'react';
import { Truck, Car, Map, Phone } from 'lucide-react';

const TransportView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trip' | 'taxis'>('trip');

  const tabs = [
    { id: 'trip', label: 'CT-TRIP Courtesy Van', icon: <Truck className="w-4 h-4" /> },
    { id: 'taxis', label: 'Other Options (Taxis)', icon: <Car className="w-4 h-4" /> },
  ] as const;

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Header and Tabs */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 pb-0 flex-shrink-0">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-6 tracking-tight flex items-center">
          <Truck className="w-8 h-8 mr-3 text-indigo-500" />
          Local Transport
        </h1>
        
        <div className="flex space-x-1 overflow-x-auto custom-scrollbar pb-px">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-3 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              } rounded-t-lg`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto h-full">
          {activeTab === 'trip' && (
            <div className="h-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col min-h-[600px]">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                 <span className="text-sm font-medium text-slate-600 dark:text-slate-300">CT-TRIP Integration</span>
              </div>
              <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
                 <Map className="w-16 h-16 text-indigo-400 mb-4" />
                 <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">CT-TRIP Courtesy Van</h2>
                 <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                   This module integrates with the CT-TRIP project. 
                 </p>
                 {/* Placeholder for iframe or component embedding */}
                 <div className="w-full max-w-2xl bg-slate-100 dark:bg-slate-900 rounded-xl p-8 border border-dashed border-slate-300 dark:border-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Iframe or Application view will be mounted here.
                    </p>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'taxis' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                    <Car className="w-8 h-8 text-amber-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gold Band Taxis</h2>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <a href="tel:033795795" className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                    <Phone className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">(03) 379 5795</span>
                  </a>
                  <a href="tel:08003795795" className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                    <Phone className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">0800 379 5795 (Freephone)</span>
                  </a>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <Car className="w-8 h-8 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Blue Star Taxis</h2>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <a href="tel:033799799" className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                    <Phone className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">(03) 379 9799</span>
                  </a>
                  <a href="tel:0800737373" className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                    <Phone className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">0800 737 373 (Freephone)</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransportView;
