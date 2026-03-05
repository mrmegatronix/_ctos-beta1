import React, { useState } from 'react';
import { FileItem } from '../types';
import { Folder, FileText, FileSpreadsheet, Image, File as FileIconLucide, ChevronRight, Home, ArrowUp, Download, MoreVertical, Plus } from 'lucide-react';
import { formatDate } from '../utils';
import DropzoneArea from './DropzoneArea';

interface DocumentsViewProps {
  files: FileItem[];
}

const DocumentsView: React.FC<DocumentsViewProps> = ({ files }) => {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const getContents = (parentId: string | null) => {
    return files.filter(f => f.parentId === parentId);
  };

  const getBreadcrumbs = () => {
    const crumbs = [{ id: null, name: 'Documents' }];
    if (!currentFolderId) return crumbs;

    const folder = files.find(f => f.id === currentFolderId);
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
    const current = files.find(f => f.id === currentFolderId);
    setCurrentFolderId(current?.parentId || null);
  };

  const handleFilesAccepted = async (acceptedFiles: File[]) => {
      // Stub integration to Firebase
      console.log('Files accepted for upload:', acceptedFiles);
      alert(`${acceptedFiles.length} files queued for upload to Firebase.`);
      setShowUpload(false);
  }

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

  const currentItems = getContents(currentFolderId);

  return (
    <div className="flex-1 p-6 overflow-hidden flex flex-col bg-white dark:bg-slate-900">
       <div className="flex items-center justify-between mb-6 shrink-0">
           <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Filing Cabinet</h2>
           <button onClick={() => setShowUpload(!showUpload)} className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
             <Plus className="w-4 h-4" /> <span>Upload/Folder</span>
           </button>
       </div>

       {/* Breadcrumbs & Navigation */}
       <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-xl border border-gray-200 dark:border-slate-700 flex items-center space-x-2 mb-6">
           <button onClick={() => setCurrentFolderId(null)} className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-md">
               <Home className="w-4 h-4 text-gray-600 dark:text-gray-300" />
           </button>
           {getBreadcrumbs().slice(1).map(crumb => (
               <div key={crumb.id || 'root'} className="flex items-center space-x-2">
                   <ChevronRight className="w-4 h-4 text-gray-400" />
                   <span className="text-sm font-medium text-gray-900 dark:text-white">{crumb.name}</span>
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
           <div className="mb-6 bg-gray-50 dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 max-w-2xl">
               <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-gray-900 dark:text-white">Upload Documents</h3>
                   <button onClick={() => setShowUpload(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">Cancel</button>
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
                         onDoubleClick={() => item.type === 'folder' && handleFolderClick(item.id)}
                         className="group relative bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl p-4 flex flex-col items-center text-center hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all cursor-pointer"
                       >
                           <div className="mb-3 transition-transform group-hover:scale-105">
                               {getIcon(item.type)}
                           </div>
                           <span className="text-sm font-medium text-gray-700 dark:text-gray-200 break-words w-full line-clamp-2">
                               {item.name}
                           </span>
                           {item.size && (
                               <span className="text-xs text-gray-400 mt-1">{item.size}</span>
                           )}
                           
                           <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded">
                                   <MoreVertical className="w-4 h-4 text-gray-500" />
                                </button>
                           </div>
                       </div>
                   ))}
               </div>
           )}
       </div>
    </div>
  );
};

export default DocumentsView;
