import React, { useCallback, useState } from 'react';
import { UploadCloud, File as FileIcon, X, CheckCircle } from 'lucide-react';

interface DropzoneAreaProps {
  onFilesAccepted: (files: File[]) => void;
  maxFiles?: number;
}

const DropzoneArea: React.FC<DropzoneAreaProps> = ({ onFilesAccepted, maxFiles = 10 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const validFiles = droppedFiles.slice(0, maxFiles);
      setSelectedFiles(prev => [...prev, ...validFiles].slice(0, maxFiles));
    }
  }, [maxFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const chosenFiles = Array.from(e.target.files);
      const validFiles = chosenFiles.slice(0, maxFiles);
      setSelectedFiles(prev => [...prev, ...validFiles].slice(0, maxFiles));
    }
  }, [maxFiles]);

  const removeFile = (index: number) => {
      setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleUploadClick = () => {
      if(selectedFiles.length > 0) {
          onFilesAccepted(selectedFiles);
          setSelectedFiles([]); // clear after sending
      }
  };

  return (
    <div className="w-full">
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${isDragging ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-gray-300 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-600 bg-gray-50 dark:bg-slate-800'}`}
      >
        <UploadCloud className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-indigo-500' : 'text-gray-400'}`} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Drag & Drop files here</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">or click to browse from your computer</p>
        
        <label className="bg-white dark:bg-slate-700 text-gray-700 dark:text-white px-6 py-2.5 rounded-lg text-sm font-medium border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 cursor-pointer shadow-sm transition-colors">
            Browse Files
            <input type="file" className="hidden" multiple onChange={handleFileInput} />
        </label>
      </div>

      {selectedFiles.length > 0 && (
          <div className="mt-6">
              <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center justify-between">
                  <span>Selected Files ({selectedFiles.length})</span>
                  <button onClick={handleUploadClick} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded flex items-center gap-1 hover:bg-indigo-700">
                      <CheckCircle className="w-3 h-3" /> Upload All
                  </button>
              </h4>
              <ul className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                  {selectedFiles.map((file, idx) => (
                      <li key={idx} className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-100 dark:border-slate-700 text-sm shadow-sm hover:shadow transition-shadow">
                          <div className="flex items-center space-x-3 overflow-hidden">
                              <FileIcon className="w-5 h-5 text-indigo-500 shrink-0" />
                              <div>
                                  <p className="font-medium text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                                  <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                          </div>
                          <button onClick={() => removeFile(idx)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md text-gray-400 hover:text-red-500 transition-colors">
                              <X className="w-4 h-4" />
                          </button>
                      </li>
                  ))}
              </ul>
          </div>
      )}
    </div>
  );
};

export default DropzoneArea;
