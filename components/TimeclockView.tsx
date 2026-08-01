import React from 'react';
import { TeamMember, StaffRole } from '../types';

interface TimeclockViewProps {
  user: TeamMember | null;
  staff: any[];
}

const TimeclockView: React.FC<TimeclockViewProps> = ({ user }) => {
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full relative">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900/40 -z-10" />
      
      {/* Container */}
      <div className="flex-1 w-full h-full p-4 overflow-hidden">
        <div className="w-full h-full max-w-7xl mx-auto bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden relative rounded-2xl flex flex-col">
          <div className="p-4 border-b border-gray-700/50 flex justify-between items-center bg-gray-800/30">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Standalone Timeclock</h2>
              <p className="text-gray-400">Powered by ct-clock integration</p>
            </div>
            <a 
              href="./ct-clock/mobile.html" 
              target="_blank" 
              rel="noreferrer"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <span>Open Kiosk Mode</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
          
          <div className="flex-1 w-full relative bg-[#0f172a]">
            {/* Embed the standalone ct-clock app */}
            <iframe 
              src="./ct-clock/mobile.html" 
              className="w-full h-full border-0 absolute inset-0"
              title="ct-clock standalone application"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeclockView;
