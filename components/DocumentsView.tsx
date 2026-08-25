import React, { useState } from 'react';
import { FileItem, StockItem, Supplier } from '../types';
import { Folder, FileText, FileSpreadsheet, Image, File as FileIconLucide, ChevronRight, Home, ArrowUp, Download, MoreVertical, Plus } from 'lucide-react';
import { formatDate } from '../utils';
import DropzoneArea from './DropzoneArea';
import TemplateViewerModal from './TemplateViewerModal';
import StocktakeSheet from './templates/StocktakeSheet';
import FunctionRunSheet from './templates/FunctionRunSheet';
import OnboardingChecklist from './templates/OnboardingChecklist';
import IncidentReportForm from './templates/IncidentReportForm';
import LostAndFoundLog from './templates/LostAndFoundLog';
import OrderingSheet from './templates/OrderingSheet';
import FOHShiftRunsheet from './templates/FOHShiftRunsheet';
import LowStockSheet from './templates/LowStockSheet';
import BlankRosterSheet from './templates/BlankRosterSheet';

interface DocumentsViewProps {
  files: FileItem[];
  stock?: StockItem[];
  suppliers?: Supplier[];
  onSaveFile?: (file: FileItem) => void;
  onDeleteFile?: (id: string) => void;
}

const DocumentsView: React.FC<DocumentsViewProps> = ({ files = [], stock = [], suppliers = [], onSaveFile, onDeleteFile }) => {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

  const getContents = (parentId: string | null) => {
    if (parentId === 'templates-folder') {
      return [
        { id: 'tpl-stocktake', name: 'Stocktake Sheet', type: 'doc', parentId: 'templates-folder', lastModified: new Date() },
        { id: 'tpl-function', name: 'Function Run Sheet', type: 'doc', parentId: 'templates-folder', lastModified: new Date() },
        { id: 'tpl-onboarding', name: 'Onboarding Checklist', type: 'doc', parentId: 'templates-folder', lastModified: new Date() },
        { id: 'tpl-incident', name: 'Incident Report', type: 'doc', parentId: 'templates-folder', lastModified: new Date() },
        { id: 'tpl-lostfound', name: 'Lost & Found Log', type: 'doc', parentId: 'templates-folder', lastModified: new Date() },
        { id: 'tpl-ordering', name: 'Ordering Sheet', type: 'doc', parentId: 'templates-folder', lastModified: new Date() },
        { id: 'tpl-fohshift', name: 'FOH Shift Runsheet', type: 'doc', parentId: 'templates-folder', lastModified: new Date() },
        { id: 'tpl-lowstock', name: 'Low Stock Sheet', type: 'doc', parentId: 'templates-folder', lastModified: new Date() },
        { id: 'tpl-purchaseorder', name: 'Purchase Order Sheet', type: 'doc', parentId: 'templates-folder', lastModified: new Date() },
        { id: 'tpl-roster', name: 'Blank Staff Roster', type: 'doc', parentId: 'templates-folder', lastModified: new Date() },
      ] as FileItem[];
    }
    const safeFiles = Array.isArray(files) ? files : [];
    return safeFiles.filter(f => f.parentId === parentId);
  };

  const getBreadcrumbs = () => {
    const crumbs = [{ id: null, name: 'Documents' }];
    if (!currentFolderId) return crumbs;

    if (currentFolderId === 'templates-folder') {
      crumbs.push({ id: 'templates-folder', name: 'Printable Templates' });
      return crumbs;
    }

    const safeFiles = Array.isArray(files) ? files : [];
    const folder = safeFiles.find(f => f.id === currentFolderId);
    if (folder) {
        // Simple 1-level depth logic
        crumbs.push({ id: folder.id, name: folder.name });
    }
    return crumbs;
  };

  const handleFolderClick = (id: string) => {
    setCurrentFolderId(id);
  };

  const handleUpLevel = () => {
    if (!currentFolderId) return;
    if (currentFolderId === 'templates-folder') {
      setCurrentFolderId(null);
      return;
    }
    const safeFiles = Array.isArray(files) ? files : [];
    const current = safeFiles.find(f => f.id === currentFolderId);
    setCurrentFolderId(current?.parentId || null);
  };

  const handleFilesAccepted = (acceptedFiles: File[]) => {
      acceptedFiles.forEach(file => {
          let type: FileItem['type'] = 'doc';
          if (file.type.includes('pdf')) type = 'pdf';
          if (file.type.includes('image')) type = 'image';
          if (file.type.includes('sheet') || file.type.includes('csv')) type = 'sheet';

          if (onSaveFile) {
              onSaveFile({
                  id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  name: file.name,
                  type,
                  parentId: currentFolderId,
                  size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
                  lastModified: new Date()
              });
          }
      });
      setShowUpload(false);
  }

  const handleCreateFolder = () => {
    const name = window.prompt("Enter new folder name:");
    if (name && onSaveFile) {
        onSaveFile({
            id: `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: name,
            type: 'folder',
            parentId: currentFolderId,
            lastModified: new Date()
        });
    }
  };

  const getIcon = (type: FileItem['type']) => {
    switch (type) {
        case 'folder': return <Folder className="w-12 h-12 text-indigo-400 fill-indigo-100 dark:fill-indigo-900/30" />;
        case 'pdf': return <FileText className="w-12 h-12 text-red-500" />;
        case 'doc': return <FileText className="w-12 h-12 text-blue-500" />;
        case 'sheet': return <FileSpreadsheet className="w-12 h-12 text-green-500" />;
        case 'image': return <Image className="w-12 h-12 text-purple-500" />;
        default: return <FileIconLucide className="w-12 h-12 text-gray-400" />;
    }
  };

  let currentItems = getContents(currentFolderId);

  // Inject Templates folder at root
  if (currentFolderId === null) {
    currentItems = [
      { id: 'templates-folder', name: 'Printable Templates', type: 'folder', parentId: null, lastModified: new Date() } as FileItem,
      ...currentItems
    ];
  }

  return (
    <div className="flex-1 p-6 overflow-hidden flex flex-col bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-sm relative">
       <div className="flex items-center justify-between mb-6 shrink-0">
           <h2 className="text-2xl font-bold text-slate-50 ">Filing Cabinet</h2>
           <div className="flex space-x-2">
             <button onClick={handleCreateFolder} className="flex items-center space-x-2 bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-600 transition-colors shadow-lg">
               <Folder className="w-4 h-4" /> <span>New Folder</span>
             </button>
             <button onClick={() => setShowUpload(!showUpload)} className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-lg">
               <Plus className="w-4 h-4" /> <span>Upload File</span>
             </button>
           </div>
       </div>

       {/* Breadcrumbs & Navigation */}
       <div className="bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-sm  p-3 rounded-xl border border-white/10  flex items-center space-x-2 mb-6">
           <button onClick={() => setCurrentFolderId(null)} className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-md">
               <Home className="w-4 h-4 text-slate-300 " />
           </button>
           {getBreadcrumbs().slice(1).map(crumb => (
               <div key={crumb.id || 'root'} className="flex items-center space-x-2">
                   <ChevronRight className="w-4 h-4 text-gray-400" />
                   <span className="text-sm font-medium text-slate-50 ">{crumb.name}</span>
               </div>
           ))}
           
           {currentFolderId && (
               <div className="flex-1 flex justify-end">
                   <button onClick={handleUpLevel} className="flex items-center space-x-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                       <ArrowUp className="w-4 h-4" /> <span>Up Level</span>
                   </button>
               </div>
           )}
       </div>

       {showUpload && (
           <div className="mb-6 bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-sm  p-6 rounded-xl border border-white/10  max-w-2xl">
               <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-slate-50 ">Upload Documents</h3>
                   <button onClick={() => setShowUpload(false)} className="text-gray-400 hover:text-slate-300 dark:hover:text-gray-200">Cancel</button>
               </div>
               <DropzoneArea onFilesAccepted={handleFilesAccepted} />
           </div>
       )}

       {/* File Grid */}
       <div className="flex-1 overflow-auto custom-scrollbar">
           {currentItems.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                   <Folder className="w-16 h-16 mb-4 opacity-20" />
                   <p>This folder is empty.</p>
               </div>
           ) : (
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                   {currentItems.map(item => (
                       <div 
                         key={item.id}
                         onDoubleClick={() => {
                           if (item.type === 'folder') {
                             handleFolderClick(item.id);
                           } else if (item.id.startsWith('tpl-')) {
                             setActiveTemplate(item.id);
                           }
                         }}
                         className={`group relative bg-slate-900/60 backdrop-blur-xl shadow-sm rounded-xl p-4 flex flex-col items-center text-center transition-all cursor-pointer ${
                           item.id === 'templates-folder' 
                             ? 'border-2 border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-600' 
                             : 'border border-white/10 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:border-indigo-300 dark:hover:border-indigo-700'
                         }`}
                       >
                           <div className={`mb-3 transition-transform group-hover:scale-105 ${item.id === 'templates-folder' ? 'animate-pulse group-hover:animate-none' : ''}`}>
                               {getIcon(item.type)}
                           </div>
                           <span className="text-sm font-medium text-slate-200  break-words w-full line-clamp-2">
                               {item.name}
                           </span>
                           {item.size && (
                               <span className="text-xs text-gray-400 mt-1">{item.size}</span>
                           )}
                           
                           <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded">
                                   <MoreVertical className="w-4 h-4 text-slate-400" />
                                </button>
                           </div>
                       </div>
                   ))}
               </div>
           )}
       </div>
       
       {activeTemplate && (
         <TemplateViewerModal title={currentItems.find(i => i.id === activeTemplate)?.name || 'Template'} onClose={() => setActiveTemplate(null)}>
           {activeTemplate === 'tpl-stocktake' && <StocktakeSheet stock={stock} />}
           {activeTemplate === 'tpl-function' && <FunctionRunSheet />}
           {activeTemplate === 'tpl-onboarding' && <OnboardingChecklist />}
           {activeTemplate === 'tpl-incident' && <IncidentReportForm />}
           {activeTemplate === 'tpl-lostfound' && <LostAndFoundLog />}
           {activeTemplate === 'tpl-ordering' && <OrderingSheet stock={stock} suppliers={suppliers} />}
           {activeTemplate === 'tpl-fohshift' && <FOHShiftRunsheet />}
           {activeTemplate === 'tpl-lowstock' && <LowStockSheet stock={stock} />}
           {activeTemplate === 'tpl-purchaseorder' && <PurchaseOrderSheet stock={stock} suppliers={suppliers} />}
           {activeTemplate === 'tpl-roster' && <BlankRosterSheet />}
         </TemplateViewerModal>
       )}
    </div>
  );
};

export default DocumentsView;
