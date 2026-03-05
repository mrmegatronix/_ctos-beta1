import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Wind, Droplets } from 'lucide-react';
import ActionToolbar from './ActionToolbar';

const WeatherView: React.FC = () => {
  // Placeholder data - in a real app, this would fetch from a weather API
  const [weather] = useState({
    temp: 22,
    condition: 'Partly Cloudy',
    humidity: 60,
    wind: 15,
    forecast: [
      { day: 'Tomorrow', temp: 24, icon: Sun },
      { day: 'Wednesday', temp: 19, icon: CloudRain },
      { day: 'Thursday', temp: 21, icon: Cloud },
    ]
  });

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-y-auto">
      <div className="p-6">
         <ActionToolbar title="Local Weather" isFohMode={false} />
      </div>

      <div className="p-6 max-w-4xl mx-auto w-full">
         <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-8 text-white shadow-xl mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-20">
               <Sun className="w-48 h-48 animate-spin-slow" />
            </div>
            
            <div className="relative z-10">
               <h2 className="text-2xl font-bold mb-1 opacity-90">Christchurch, NZ</h2>
               <p className="text-blue-100 mb-8">Currently</p>
               
               <div className="flex items-center justify-between">
                  <div>
                     <div className="text-8xl font-black tracking-tighter shadow-sm">{weather.temp}°</div>
                     <div className="text-2xl font-medium mt-2 flex items-center gap-2">
                        <Cloud className="w-8 h-8" />
                        {weather.condition}
                     </div>
                  </div>
               </div>

               <div className="flex gap-8 mt-12 bg-white/10 rounded-2xl p-4 backdrop-blur-sm w-fit">
                  <div className="flex items-center gap-2">
                     <Wind className="w-5 h-5 text-blue-200" />
                     <span className="font-medium">{weather.wind} km/h</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <Droplets className="w-5 h-5 text-blue-200" />
                     <span className="font-medium">{weather.humidity}%</span>
                  </div>
               </div>
            </div>
         </div>

         <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">3-Day Forecast</h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {weather.forecast.map((day, idx) => (
               <div key={idx} className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center shadow-sm border border-gray-100 dark:border-slate-700">
                  <p className="text-gray-500 dark:text-gray-400 font-medium mb-4">{day.day}</p>
                  <day.icon className="w-12 h-12 text-blue-500 mb-4" />
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">{day.temp}°</div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default WeatherView;
