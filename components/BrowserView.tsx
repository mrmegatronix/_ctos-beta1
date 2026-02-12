import React, { useState, useEffect } from 'react';
import { BrowserBookmark } from '../types';
import { db } from '../services/database';
import { ArrowLeft, ArrowRight, RotateCw, Star, X } from 'lucide-react';

const BrowserView: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<BrowserBookmark[]>([]);
  const [currentUrl, setCurrentUrl] = useState<string>('https://www.google.com');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const bm = await db.getBookmarks();
      setBookmarks(bm);
      if (bm.length > 0) {
        setCurrentUrl(bm[0].url);
      }
    };
    load();
  }, []);

  const handleNavigate = (url: string) => {
    setIsLoading(true);
    setCurrentUrl(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-100 dark:bg-slate-900">
      {/* Browser Toolbar */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-2 flex items-center space-x-2">
         <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500"><ArrowLeft className="w-4 h-4" /></button>
         <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500"><ArrowRight className="w-4 h-4" /></button>
         <button onClick={() => { setIsLoading(true); const u = currentUrl; setCurrentUrl(''); setTimeout(() => setCurrentUrl(u), 10); }} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500"><RotateCw className="w-4 h-4" /></button>
         
         <div className="flex-1 bg-gray-100 dark:bg-slate-900 rounded-lg px-4 py-2 text-sm text-gray-600 dark:text-gray-300 flex items-center">
            {currentUrl}
         </div>

         <div className="flex items-center space-x-1 border-l border-gray-200 dark:border-slate-700 pl-2">
            {bookmarks.map(bm => (
                <button 
                  key={bm.id} 
                  onClick={() => handleNavigate(bm.url)}
                  className={`p-2 rounded-lg text-xs font-medium flex items-center space-x-2 transition-colors ${currentUrl === bm.url ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400'}`}
                >
                   {bm.icon === 'monitor' && <span className="text-lg">🖥️</span>}
                   {bm.icon === 'calendar' && <span className="text-lg">📅</span>}
                   {bm.icon === 'google' && <span className="text-lg">G</span>}
                   <span className="hidden md:inline">{bm.title}</span>
                </button>
            ))}
         </div>
      </div>

      {/* Frame Content */}
      <div className="flex-1 relative bg-white">
         {isLoading && (
             <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
             </div>
         )}
         <iframe 
            src={currentUrl} 
            className="w-full h-full border-none"
            onLoad={() => setIsLoading(false)}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            title="Embedded Browser"
         />
      </div>
    </div>
  );
};

export default BrowserView;