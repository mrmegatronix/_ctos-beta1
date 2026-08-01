import React from 'react';
import { AlertCircle, Smartphone } from 'lucide-react';

const CTSCAppView: React.FC = () => {
  return (
    <div className="flex-1 p-6 overflow-hidden flex flex-col bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm ">
      <div className="flex items-center justify-between mb-6 shrink-0">
          <h2 className="text-2xl font-bold text-slate-50 flex items-center">
              <Smartphone className="w-6 h-6 mr-3 text-indigo-500" />
              CTSC App
          </h2>
      </div>

      <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 mb-6 rounded-r">
        <div className="flex items-center">
          <AlertCircle className="w-6 h-6 mr-3" />
          <h3 className="font-bold">Under Construction</h3>
        </div>
        <p className="mt-1 text-sm">This module is currently being built for the CTSC App integration.</p>
      </div>
    </div>
  );
};

export default CTSCAppView;
