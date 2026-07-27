
import React from 'react';
import { Printer, Share2, Send, Edit, MoreVertical, Download, RefreshCw } from 'lucide-react';

interface ActionToolbarProps {
  onEdit?: () => void;
  onPrint?: () => void;
  onShare?: () => void;
  onSend?: () => void;
  onSync?: () => void;
  title?: string;
  isFohMode?: boolean;
}

const ActionToolbar: React.FC<ActionToolbarProps> = ({ onEdit, onPrint, onShare, onSend, onSync, title, isFohMode }) => {
  const handlePrint = () => {
    if (onPrint) onPrint();
    else window.print();
  };

  const btnClass = isFohMode 
    ? "flex flex-col items-center justify-center p-4 glass-panel  rounded-xl border-2 border-white/10  shadow-lg active:scale-95 transition-all text-slate-200 " 
    : "p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-slate-300  transition-colors";

  const iconClass = isFohMode ? "w-6 h-6 mb-1" : "w-4 h-4";
  const labelClass = isFohMode ? "text-xs font-bold" : "hidden";

  if (isFohMode) {
      return (
          <div className="grid grid-cols-4 gap-4 mb-6">
              <button onClick={onEdit} className={btnClass}><Edit className={iconClass} /><span className={labelClass}>Edit</span></button>
              <button onClick={handlePrint} className={btnClass}><Printer className={iconClass} /><span className={labelClass}>Print</span></button>
              <button onClick={onShare} className={btnClass}><Share2 className={iconClass} /><span className={labelClass}>Share</span></button>
              <button onClick={onSend || (() => window.location.href = `mailto:?subject=${encodeURIComponent(title + ' Report')}`)} className={btnClass}><Send className={iconClass} /><span className={labelClass}>Send</span></button>
          </div>
      );
  }

  return (
    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 ">
      {title && <h2 className="text-2xl font-bold text-slate-50 ">{title}</h2>}
      <div className="flex items-center space-x-2">
         {onSync && (
             <button onClick={onSync} className={`${btnClass} text-indigo-600 dark:text-indigo-400`} title="Sync with Google">
                 <RefreshCw className={iconClass} />
             </button>
         )}
         <button onClick={onEdit} className={btnClass} title="Edit"><Edit className={iconClass} /></button>
         <button onClick={handlePrint} className={btnClass} title="Print"><Printer className={iconClass} /></button>
         <button onClick={onShare} className={btnClass} title="Share"><Share2 className={iconClass} /></button>
         <button onClick={onSend || (() => window.location.href = `mailto:?subject=${encodeURIComponent(title + ' Report')}`)} className={btnClass} title="Send"><Send className={iconClass} /></button>
         <div className="w-px h-4 bg-gray-300  mx-2"></div>
         <button className={btnClass}><MoreVertical className={iconClass} /></button>
      </div>
    </div>
  );
};

export default ActionToolbar;
