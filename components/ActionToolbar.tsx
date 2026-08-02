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

  const baseBtnClass = isFohMode 
    ? "flex flex-col items-center justify-center p-2 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm rounded-lg border border-gray-200 dark:border-slate-700 transition-all text-slate-300" 
    : "p-2 rounded-lg text-slate-300 transition-colors";

  const getBtnClass = (isDisabled: boolean) => 
    `${baseBtnClass} ${isDisabled ? 'opacity-50 cursor-not-allowed' : (isFohMode ? 'active:scale-95' : 'hover:bg-gray-100 dark:hover:bg-slate-800')}`;

  const iconClass = isFohMode ? "w-6 h-6 mb-1" : "w-4 h-4";
  const labelClass = isFohMode ? "text-xs font-bold" : "hidden";

  if (isFohMode) {
      return (
          <div className="flex items-center space-x-2 mb-6">
              <button disabled={!onEdit} onClick={onEdit} className={getBtnClass(!onEdit)} title="Edit"><Edit className={iconClass} /><span className={labelClass}>Edit</span></button>
              <button onClick={handlePrint} className={getBtnClass(false)} title="Print"><Printer className={iconClass} /><span className={labelClass}>Print</span></button>
              <button disabled={!onShare} onClick={onShare} className={getBtnClass(!onShare)} title="Share"><Share2 className={iconClass} /><span className={labelClass}>Share</span></button>
              <button onClick={onSend || (() => window.location.href = `mailto:?subject=${encodeURIComponent((title || '') + ' Report')}`)} className={getBtnClass(false)} title="Send"><Send className={iconClass} /><span className={labelClass}>Send</span></button>
          </div>
      );
  }

  return (
    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
      {title && <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{title}</h2>}
      <div className="flex items-center space-x-2">
         {onSync && (
             <button onClick={onSync} className={`${getBtnClass(false)} text-indigo-600 dark:text-indigo-400`} title="Sync with Google">
                 <RefreshCw className={iconClass} />
             </button>
         )}
         <button disabled={!onEdit} onClick={onEdit} className={getBtnClass(!onEdit)} title="Edit"><Edit className={iconClass} /></button>
         <button onClick={handlePrint} className={getBtnClass(false)} title="Print"><Printer className={iconClass} /></button>
         <button disabled={!onShare} onClick={onShare} className={getBtnClass(!onShare)} title="Share"><Share2 className={iconClass} /></button>
         <button onClick={onSend || (() => window.location.href = `mailto:?subject=${encodeURIComponent((title || '') + ' Report')}`)} className={getBtnClass(false)} title="Send"><Send className={iconClass} /></button>
         <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 mx-2"></div>
         <button className={getBtnClass(false)} title="More options"><MoreVertical className={iconClass} /></button>
      </div>
    </div>
  );
};

export default ActionToolbar;
