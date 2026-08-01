import React from 'react';
import { BookOpen } from 'lucide-react';

const GeminiNotebookView: React.FC = () => {
  return (
    <div className="flex-1 p-6 overflow-hidden flex flex-col bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm h-full w-full">
      <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="text-2xl font-bold text-slate-50 flex items-center">
              <BookOpen className="w-6 h-6 mr-3 text-emerald-500" />
              Google NotebookLM
          </h2>
      </div>

      <div className="flex-1 w-full bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
          <iframe 
             src="https://notebook.google.com/notebook/90a21ec7-8843-431f-b6a7-08ff69ce1a74" 
             className="w-full h-full border-0"
             title="Google Notebook"
             allow="clipboard-read; clipboard-write"
          />
      </div>
    </div>
  );
};

export default GeminiNotebookView;

