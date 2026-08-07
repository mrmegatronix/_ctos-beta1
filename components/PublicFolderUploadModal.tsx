import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  FolderPlus,
  FolderOpen,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  FileCode,
  File,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ExternalLink,
  RefreshCw,
  Search,
  Folder,
  Shield,
  Crown,
  Database,
  X,
  Plus
} from 'lucide-react';
import {
  uploadFileToPublicFolder,
  fetchPublicFilesList,
  deletePublicFolderFile,
  PublicFileInfo,
  UploadPublicResult
} from '../services/publicUpload';
import { scanAndImportPublicFolder } from '../services/publicSync';

interface PublicFolderUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowNotification?: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const PRESET_FOLDERS = [
  { label: 'Dropbox Root (/public/dropbox)', value: 'dropbox' },
  { label: 'Dropbox Menus (/public/dropbox/Menus)', value: 'dropbox/Menus' },
  { label: 'Dropbox Rosters (/public/dropbox/Rosters)', value: 'dropbox/Rosters' },
  { label: 'CT-Matrix TV Ads (/public/ct-matrix)', value: 'ct-matrix' },
  { label: 'CT-Matrix Snaps (/public/ct-matrix/snaps)', value: 'ct-matrix/snaps' },
  { label: 'CT-Clock App (/public/ct-clock)', value: 'ct-clock' },
  { label: 'Images (/public/images)', value: 'images' },
  { label: 'Public Root (/public)', value: '' }
];

export const PublicFolderUploadModal: React.FC<PublicFolderUploadModalProps> = ({
  isOpen,
  onClose,
  onShowNotification
}) => {
  const [files, setFiles] = useState<PublicFileInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState('dropbox');
  const [customFolder, setCustomFolder] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [autoImport, setAutoImport] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'dropbox' | 'matrix' | 'clock' | 'other'>('all');
  const [uploadResult, setUploadResult] = useState<UploadPublicResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const list = await fetchPublicFilesList();
      setFiles(list);
    } catch (e) {
      console.error('Failed to load public files', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const targetFolder = isCustom ? customFolder : selectedFolder;

  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFileUpload(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFileUpload(Array.from(e.target.files));
    }
  };

  const processFileUpload = async (uploadFiles: File[]) => {
    setUploading(true);
    setUploadResult(null);

    let totalImported = 0;
    let successCount = 0;

    for (const file of uploadFiles) {
      try {
        const res = await uploadFileToPublicFolder(file, targetFolder, autoImport);
        if (res.success) {
          successCount++;
          if (res.autoImportedCount) {
            totalImported += res.autoImportedCount;
          }
          setUploadResult(res);
        }
      } catch (err: any) {
        if (onShowNotification) {
          onShowNotification(`Upload failed for ${file.name}: ${err.message}`, 'error');
        }
      }
    }

    setUploading(false);
    await loadFiles();

    if (onShowNotification && successCount > 0) {
      onShowNotification(
        `Successfully uploaded ${successCount} file(s) to public/${targetFolder || ''}. ${
          totalImported > 0 ? `Auto-imported ${totalImported} records into CTOS database.` : ''
        }`,
        'success'
      );
    }
  };

  const handleDelete = async (relativePath: string) => {
    if (!confirm(`Are you sure you want to delete /public/${relativePath}?`)) return;
    try {
      const ok = await deletePublicFolderFile(relativePath);
      if (ok) {
        if (onShowNotification) {
          onShowNotification(`Deleted /public/${relativePath}`, 'info');
        }
        await loadFiles();
      }
    } catch (e: any) {
      if (onShowNotification) {
        onShowNotification(`Delete failed: ${e.message}`, 'error');
      }
    }
  };

  const handleManualTriggerSync = async () => {
    setLoading(true);
    try {
      const res = await scanAndImportPublicFolder();
      if (onShowNotification) {
        onShowNotification(`Public Scan Complete: ${res.importedItems} items imported`, 'success');
      }
      await loadFiles();
    } catch (e: any) {
      if (onShowNotification) {
        onShowNotification(`Scan failed: ${e.message}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (ext: string) => {
    if (['.csv', '.tsv', '.xlsx', '.xls'].includes(ext)) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
    }
    if (['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'].includes(ext)) {
      return <ImageIcon className="w-5 h-5 text-amber-400" />;
    }
    if (['.pdf', '.txt', '.doc', '.docx'].includes(ext)) {
      return <FileText className="w-5 h-5 text-rose-400" />;
    }
    if (['.html', '.js', '.json', '.ts'].includes(ext)) {
      return <FileCode className="w-5 h-5 text-indigo-400" />;
    }
    return <File className="w-5 h-5 text-slate-400" />;
  };

  const filteredFiles = files.filter(f => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.relativePath.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === 'dropbox') return f.relativePath.startsWith('dropbox');
    if (selectedFilter === 'matrix') return f.relativePath.startsWith('ct-matrix');
    if (selectedFilter === 'clock') return f.relativePath.startsWith('ct-clock');
    if (selectedFilter === 'other')
      return (
        !f.relativePath.startsWith('dropbox') &&
        !f.relativePath.startsWith('ct-matrix') &&
        !f.relativePath.startsWith('ct-clock')
      );

    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-slate-800/80 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-red-600 rounded-2xl text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-white">Public Folder Upload Manager</h2>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black rounded-md uppercase tracking-wider">
                  Master Admin Root
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Directly upload, store, and auto-ingest CSV sheets, menus, rosters, images, and slides into{' '}
                <code className="text-amber-300 font-mono">/public/</code>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {/* Upload Configuration & Dropzone Card */}
          <div className="bg-slate-950/60 border border-white/10 rounded-3xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Folder Selector */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-2 flex items-center">
                  <FolderOpen className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                  Target Destination Directory
                </label>
                <div className="space-y-2">
                  <select
                    value={isCustom ? '__custom__' : selectedFolder}
                    onChange={e => {
                      if (e.target.value === '__custom__') {
                        setIsCustom(true);
                      } else {
                        setIsCustom(false);
                        setSelectedFolder(e.target.value);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs font-bold text-white outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {PRESET_FOLDERS.map(f => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                    <option value="__custom__">+ Custom Subdirectory...</option>
                  </select>

                  {isCustom && (
                    <input
                      type="text"
                      placeholder="e.g. dropbox/Specials or signage/summer"
                      value={customFolder}
                      onChange={e => setCustomFolder(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-900 border border-amber-500/40 rounded-xl text-xs text-amber-300 font-mono outline-none"
                    />
                  )}
                </div>
              </div>

              {/* Auto-Import Toggle */}
              <div className="flex flex-col justify-between">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-2 flex items-center">
                  <Database className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                  Automated Database Ingestion
                </label>
                <div className="p-3 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-between">
                  <div className="pr-2">
                    <span className="text-xs font-bold text-white block">Auto-Sync on Upload</span>
                    <span className="text-[11px] text-slate-400">
                      Instantly import CSV/TSV/JSON data (sports, menus, specials) into CTOS DB
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={autoImport}
                      onChange={e => setAutoImport(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/20 hover:border-amber-500/60 bg-white/5 hover:bg-white/10 rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileInputChange}
              />
              <div className="p-4 bg-amber-500/10 text-amber-400 rounded-full group-hover:scale-110 transition-transform">
                {uploading ? (
                  <RefreshCw className="w-8 h-8 animate-spin" />
                ) : (
                  <UploadCloud className="w-8 h-8" />
                )}
              </div>
              <div>
                <span className="text-sm font-bold text-white block">
                  {uploading
                    ? 'Uploading & Ingesting Files...'
                    : 'Drag & Drop files here, or click to browse'}
                </span>
                <span className="text-xs text-slate-400 mt-1 block">
                  Target Destination: <code className="text-amber-300 font-mono">/public/{targetFolder || ''}</code>
                </span>
              </div>
              <div className="flex flex-wrap gap-2 justify-center text-[10px] text-slate-400 font-semibold">
                <span className="px-2 py-0.5 bg-white/10 rounded">.CSV / .TSV</span>
                <span className="px-2 py-0.5 bg-white/10 rounded">.PDF</span>
                <span className="px-2 py-0.5 bg-white/10 rounded">.JPG / .PNG / .WEBP</span>
                <span className="px-2 py-0.5 bg-white/10 rounded">.JSON</span>
                <span className="px-2 py-0.5 bg-white/10 rounded">.XLSX</span>
              </div>
            </div>

            {/* Upload Notification Banner */}
            {uploadResult && (
              <div className="mt-4 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs animate-in fade-in">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{uploadResult.message}</span>
                </div>
                <a
                  href={uploadResult.urlPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-emerald-500 text-slate-950 font-black rounded-lg text-[10px] flex items-center space-x-1"
                >
                  <span>Preview</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Public Files Explorer Section */}
          <div className="bg-slate-950/60 border border-white/10 rounded-3xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center">
                  <Folder className="w-4 h-4 mr-2 text-indigo-400" />
                  Public Files Directory Explorer ({filteredFiles.length} files)
                </h3>
                <p className="text-xs text-slate-400">
                  Files residing in the public directory accessible to web clients and signage players
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleManualTriggerSync}
                  disabled={loading}
                  className="px-3.5 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Rescan Public Folder</span>
                </button>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search public files by name or directory..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex space-x-1 bg-slate-900 p-1 rounded-xl border border-white/10 text-xs">
                {(['all', 'dropbox', 'matrix', 'clock', 'other'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setSelectedFilter(f)}
                    className={`px-3 py-1 rounded-lg font-bold capitalize transition-colors ${
                      selectedFilter === f
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Files List Table */}
            <div className="max-h-72 overflow-y-auto custom-scrollbar border border-white/10 rounded-2xl">
              {filteredFiles.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  {loading ? 'Scanning public directory...' : 'No public files found matching criteria.'}
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 font-bold border-b border-white/10 sticky top-0 backdrop-blur">
                    <tr>
                      <th className="p-3">File Name</th>
                      <th className="p-3">Directory Path</th>
                      <th className="p-3">Size</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredFiles.map((file, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors group">
                        <td className="p-3 font-semibold text-white flex items-center space-x-2.5">
                          {getFileIcon(file.extension)}
                          <span className="truncate max-w-xs" title={file.name}>
                            {file.name}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 font-mono text-[11px]">
                          <span className="px-2 py-0.5 bg-slate-900 rounded-md border border-white/5 text-amber-300/80">
                            /public/{file.relativePath}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400">
                          {file.size > 1024 * 1024
                            ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                            : `${Math.round(file.size / 1024)} KB`}
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <a
                            href={file.urlPath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white rounded-lg inline-flex items-center"
                            title="Preview / Open in New Tab"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => handleDelete(file.relativePath)}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/30 text-rose-400 rounded-lg inline-flex items-center"
                            title="Delete file"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-800/80 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Master Admin file access with instant database auto-ingestion</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
