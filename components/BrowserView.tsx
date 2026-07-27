import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Globe } from 'lucide-react';

const BrowserView: React.FC = () => {
  const [currentUrl, setCurrentUrl] = useState<string>('https://google.com');
  const [inputUrl, setInputUrl] = useState<string>('https://google.com');
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    let url = inputUrl;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    setCurrentUrl(url);
    setInputUrl(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-100  overflow-hidden">
      {/* Browser Toolbar */}
      <div className="glass-panel  border-b border-white/10  p-2 flex items-center space-x-2 shrink-0">
         <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-slate-400"><ArrowLeft className="w-4 h-4" /></button>
         <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-slate-400"><ArrowRight className="w-4 h-4" /></button>
         <button onClick={() => { setIsLoading(true); const u = currentUrl; setCurrentUrl(''); setTimeout(() => setCurrentUrl(u), 10); }} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-slate-400"><RotateCw className="w-4 h-4" /></button>
         
         <form onSubmit={handleNavigate} className="flex-1 ml-2">
            <div className="flex items-center bg-gray-100  rounded-lg px-4 py-2">
               <Globe className="w-4 h-4 text-gray-400 mr-2" />
               <input 
                  type="text" 
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="bg-transparent border-none outline-none w-full text-sm text-slate-300 "
                  placeholder="Enter URL..."
               />
            </div>
         </form>
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