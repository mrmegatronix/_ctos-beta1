import React, { useState } from 'react';
import { Sparkles, Send, Loader2, X } from 'lucide-react';

interface AIAssistantProps {
  onCommand: (cmd: string) => Promise<string>;
  isProcessing: boolean;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ onCommand, isProcessing }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [lastResponse, setLastResponse] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    
    // Clear previous response while processing
    setLastResponse(null);
    const cmd = input;
    setInput('');
    
    // Parent handles the actual API call
    const response = await onCommand(cmd);
    setLastResponse(response);
  };

  return (
    <div className={`fixed bottom-6 right-6 z-40 flex flex-col items-end transition-all duration-300 ${isOpen ? 'w-96' : 'w-auto'}`}>
      
      {isOpen && (
        <div className="bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-sm  rounded-2xl shadow-2xl border border-indigo-100 dark:border-indigo-900/30 overflow-hidden w-full mb-4 animate-in slide-in-from-bottom-5 duration-200">
          <div className="bg-indigo-600 dark:bg-indigo-700 px-4 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-2 text-white">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">TeamSync AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-sm  min-h-[100px] max-h-[300px] overflow-y-auto text-slate-200 ">
             {!lastResponse && !isProcessing && (
                 <p className="text-sm text-slate-400 ">
                    Ask me to schedule meetings, move events, or summarize the team's availability. <br/><br/>
                    <i>"Schedule a 30m sync with Alex and Sarah tomorrow morning."</i>
                 </p>
             )}
             {isProcessing && (
                 <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 text-sm">
                     <Loader2 className="w-4 h-4 animate-spin" />
                     <span>Thinking...</span>
                 </div>
             )}
             {lastResponse && !isProcessing && (
                 <div className="text-sm text-slate-100  bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
                    {lastResponse}
                 </div>
             )}
          </div>

          <form onSubmit={handleSubmit} className="p-3 border-t border-white/10  bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-sm ">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your request..."
                className="w-full pl-4 pr-12 py-3 bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-sm  border border-white/10  rounded-xl focus:bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-sm dark:focus:bg-slate-900 text-slate-50  focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isProcessing}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center space-x-2 bg-indigo-600 text-white px-4 py-3 rounded-full shadow-lg shadow-indigo-300 dark:shadow-none hover:bg-indigo-700 transition-all hover:-translate-y-1"
        >
          <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
          <span className="font-medium">AI Assistant</span>
        </button>
      )}
    </div>
  );
};

export default AIAssistant;
