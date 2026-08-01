import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Wind, Droplets } from 'lucide-react';
import ActionToolbar from './ActionToolbar';

const WeatherView: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm overflow-y-auto">
      <div className="p-6 pb-2">
         <ActionToolbar title="Local Weather" isFohMode={false} />
      </div>

      <div className="p-6 max-w-5xl mx-auto w-full flex-1 flex flex-col">
         <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-800 bg-black/40 flex-1 flex items-center justify-center">
            <img 
               src="/weather.jpg" 
               alt="Christchurch Weather" 
               className="w-full h-full object-contain"
               onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/1920x1080/000000/FFFFFF?text=Weather+Data+Unavailable';
               }}
            />
         </div>
      </div>
    </div>
  );
};

export default WeatherView;
