import React, { useState } from 'react';
import { BookOpen, Sparkles, RefreshCw, Maximize2, ExternalLink } from 'lucide-react';

const GeminiNotebookView: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  const notebookUrl = "https://notebook.google.com/notebook/90a21ec7-8843-431f-b6a7-08ff69ce1a74";

  return (
    <div className="flex-1 p-4 md:p-8 overflow-hidden flex flex-col h-full w-full relative">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-emerald-900 opacity-50 z-0"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full mix-blend-screen z-0 pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col h-full w-full">
        <div className="flex items-center justify-between mb-6 shrink-0 bg-white/5 dark:bg-slate-900/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-xl">
            <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-emerald-400 to-indigo-500 rounded-xl shadow-lg mr-4">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-50 flex items-center tracking-tight">
                      Google NotebookLM
                      <Sparkles className="w-4 h-4 ml-2 text-emerald-400 animate-pulse" />
                  </h2>
                  <p className="text-sm text-slate-400">AI-powered research and intelligence hub</p>
                </div>
            </div>
            
            <div className="flex space-x-3">
               <button 
                 onClick={() => setIsLoading(true)}
                 className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                 title="Refresh Notebook"
               >
                 <RefreshCw className="w-5 h-5" />
               </button>
               <a 
                 href={notebookUrl} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                 title="Open in new tab"
               >
                 <ExternalLink className="w-5 h-5" />
               </a>
            </div>
        </div>

        <div className="flex-1 w-full relative bg-slate-900/60 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 shadow-2xl transition-all">
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-md z-20">
                <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                <p className="text-emerald-400 font-medium animate-pulse">Loading Intelligence Hub...</p>
              </div>
            )}
            <iframe 
               src={notebookUrl} 
               className="w-full h-full border-0 absolute inset-0 z-10"
               title="Google Notebook"
               allow="clipboard-read; clipboard-write"
               onLoad={() => setIsLoading(false)}
            />
        </div>
      </div>
    </div>
  );
};

export default GeminiNotebookView;
