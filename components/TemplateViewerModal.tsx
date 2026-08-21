import React from 'react';
import { X, Printer } from 'lucide-react';

interface TemplateViewerModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const TemplateViewerModal: React.FC<TemplateViewerModalProps> = ({ title, onClose, children }) => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-900/80 backdrop-blur-sm print:bg-white print:backdrop-blur-none">
      {/* Non-printable Header */}
      <div className="flex-none bg-slate-900 p-4 flex justify-between items-center print:hidden border-b border-slate-700">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <div className="flex space-x-4">
          <button 
            onClick={() => window.print()}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow"
          >
            <Printer className="w-5 h-5" />
            <span>Print Document</span>
          </button>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>
      
      {/* Printable Area - A4 Size Simulation */}
      <div className="flex-1 overflow-auto bg-slate-800 p-8 print:p-0 print:bg-white flex justify-center custom-scrollbar">
        <div className="bg-white w-[210mm] min-h-[297mm] shadow-2xl print:shadow-none print:w-full print:min-h-0 text-black">
          {children}
        </div>
      </div>
    </div>
  );
};

export default TemplateViewerModal;
