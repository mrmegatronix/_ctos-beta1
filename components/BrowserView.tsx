import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Globe, ShieldCheck } from 'lucide-react';

const BrowserView: React.FC = () => {
  const [currentUrl, setCurrentUrl] = useState<string>('https://google.com/search?q=hospitality+news');
  const [inputUrl, setInputUrl] = useState<string>('https://google.com/search?q=hospitality+news');
  const [isLoading, setIsLoading] = useState(true);

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    
    setIsLoading(true);
    let url = inputUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    setCurrentUrl(url);
    setInputUrl(url);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    const u = currentUrl;
    setCurrentUrl('');
    setTimeout(() => setCurrentUrl(u), 50);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full mix-blend-screen z-0 pointer-events-none"></div>

      {/* Browser Toolbar */}
      <div className="relative z-10 bg-slate-900/60 backdrop-blur-xl border-b border-white/10 p-3 flex items-center space-x-3 shrink-0 shadow-lg">
         <div className="flex items-center space-x-1">
             <button className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all active:scale-95">
                 <ArrowLeft className="w-5 h-5" />
             </button>
             <button className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all active:scale-95">
                 <ArrowRight className="w-5 h-5" />
             </button>
             <button onClick={handleRefresh} className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all active:scale-95">
                 <RotateCw className={`w-5 h-5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
             </button>
         </div>
         
         <form onSubmit={handleNavigate} className="flex-1 max-w-4xl mx-auto">
            <div className="flex items-center bg-slate-950/50 border border-white/10 hover:border-indigo-500/50 transition-colors rounded-xl px-4 py-2.5 shadow-inner">
               <ShieldCheck className="w-4 h-4 text-emerald-400 mr-3" />
               <input 
                  type="text" 
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="bg-transparent border-none outline-none w-full text-sm text-slate-200 font-medium placeholder-slate-500 tracking-wide"
                  placeholder="Search or enter web address"
               />
               <button type="submit" className="ml-2">
                 <Globe className="w-4 h-4 text-slate-400 hover:text-indigo-400 transition-colors" />
               </button>
            </div>
         </form>
      </div>

      {/* Frame Content */}
      <div className="flex-1 relative bg-white dark:bg-slate-900 z-10">
         {isLoading && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-md z-20 transition-all">
                 <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                 <p className="text-indigo-400 font-medium animate-pulse">Navigating...</p>
             </div>
         )}
         {currentUrl && (
             <iframe 
                src={currentUrl} 
                className="w-full h-full border-none bg-white"
                onLoad={() => setIsLoading(false)}
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                title="Embedded Browser"
             />
         )}
      </div>
    </div>
  );
};

export default BrowserView;