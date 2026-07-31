import React from 'react';
import { AlertCircle, Sliders } from 'lucide-react';

const CTMatrixControlView: React.FC = () => {
  return (
    <div className="flex-1 p-6 overflow-hidden flex flex-col glass-panel ">
      <div className="flex items-center justify-between mb-6 shrink-0">
          <h2 className="text-2xl font-bold text-slate-50 flex items-center">
              <Sliders className="w-6 h-6 mr-3 text-red-500" />
              CT Matrix Control
          </h2>
      </div>

      <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 mb-6 rounded-r">
        <div className="flex items-center">
          <AlertCircle className="w-6 h-6 mr-3" />
          <h3 className="font-bold">Under Construction</h3>
        </div>
        <p className="mt-1 text-sm">This module is currently being built for the CT Matrix Control integration.</p>
      </div>
    </div>
  );
};

export default CTMatrixControlView;
