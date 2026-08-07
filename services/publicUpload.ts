import Papa from 'papaparse';
import { db } from './database';
import { scanAndImportPublicFolder } from './publicSync';

export interface PublicFileInfo {
  name: string;
  relativePath: string;
  urlPath: string;
  size: number;
  modified: string;
  extension: string;
  isLocalOnly?: boolean;
}

export interface UploadPublicResult {
  success: boolean;
  filename: string;
  urlPath: string;
  relativePath: string;
  size: number;
  autoImportedCount?: number;
  message: string;
  error?: string;
}

const LOCAL_UPLOADS_KEY = 'ctos_local_public_uploads';

export const getLocalUploadedFiles = (): PublicFileInfo[] => {
  try {
    const raw = localStorage.getItem(LOCAL_UPLOADS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to get local public uploads', e);
  }
  return [];
};

export const saveLocalUploadedFile = (file: PublicFileInfo) => {
  try {
    const existing = getLocalUploadedFiles().filter(f => f.relativePath !== file.relativePath);
    existing.unshift(file);
    localStorage.setItem(LOCAL_UPLOADS_KEY, JSON.stringify(existing.slice(0, 100)));
  } catch (e) {
    console.error('Failed to save local uploaded file', e);
  }
};

/**
 * Reads a browser File object to a Base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Upload a file directly to the public folder (or subfolder)
 */
export const uploadFileToPublicFolder = async (
  file: File,
  subfolder: string = 'dropbox',
  autoImport: boolean = true
): Promise<UploadPublicResult> => {
  const cleanSubfolder = subfolder.replace(/^(\.\.[\/\\])+/, '').replace(/^\/+/, '');
  const targetRelPath = cleanSubfolder ? `${cleanSubfolder}/${file.name}` : file.name;
  const targetUrlPath = `/${targetRelPath}`;

  let serverSuccess = false;
  let serverResponse: any = null;

  try {
    const base64Content = await fileToBase64(file);

    // Try posting to Vite server endpoint
    const response = await fetch('/api/upload-public', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        subfolder: cleanSubfolder,
        base64Content
      })
    });

    if (response.ok) {
      serverResponse = await response.json();
      serverSuccess = serverResponse.success;
    }
  } catch (err) {
    console.warn('[PublicUpload] Server API upload unreachable, using client cache fallback:', err);
  }

  // Register in local records
  const fileInfo: PublicFileInfo = {
    name: file.name,
    relativePath: targetRelPath,
    urlPath: targetUrlPath,
    size: file.size,
    modified: new Date().toISOString(),
    extension: file.name.slice(file.name.lastIndexOf('.')).toLowerCase(),
    isLocalOnly: !serverSuccess
  };
  saveLocalUploadedFile(fileInfo);

  // Auto-Ingest into CTOS Database if requested
  let autoImportedCount = 0;
  if (autoImport) {
    autoImportedCount = await autoIngestUploadedFile(file, targetUrlPath);
  }

  // Trigger public sync scan to refresh all modules
  try {
    await scanAndImportPublicFolder();
  } catch (e) {
    console.error('Auto scan after upload failed', e);
  }

  window.dispatchEvent(new CustomEvent('ctos:public-file-uploaded', { detail: fileInfo }));

  return {
    success: true,
    filename: file.name,
    urlPath: targetUrlPath,
    relativePath: targetRelPath,
    size: file.size,
    autoImportedCount,
    message: serverSuccess
      ? `Uploaded to public/${targetRelPath} and indexed.`
      : `File cached in public registry and indexed for offline/session use.`
  };
};

/**
 * Automatically inspects uploaded file and parses structured data into CTOS database
 */
const autoIngestUploadedFile = async (file: File, urlPath: string): Promise<number> => {
  let count = 0;
  const nameLower = file.name.toLowerCase();

  try {
    if (nameLower.endsWith('.csv') || nameLower.endsWith('.tsv')) {
      const text = await file.text();
      const delimiter = nameLower.endsWith('.tsv') ? '\t' : ',';
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true, delimiter });

      if (parsed.data && parsed.data.length > 0) {
        const rows = parsed.data as any[];

        // Check for Sports TV Schedule
        if (rows.some(r => r.Sport || r.Event || r.Channel || r.HomeTeam || r.Teams || r.Competition)) {
          rows.forEach((r, idx) => {
            const title = r.Event || r.Teams || `${r.HomeTeam || ''} vs ${r.AwayTeam || ''}`.trim() || r.Title || 'Live Sports';
            if (title && title !== 'vs') {
              db.insert('tvschedules', {
                id: `up-tv-${Date.now()}-${idx}`,
                title: String(title).trim(),
                sport: r.Sport || r.Category || 'Sports',
                channel: r.Channel || r.Station || 'Sky Sport',
                startTime: r.StartTime || r.Time || '19:00',
                endTime: r.EndTime || '21:00',
                date: r.Date || new Date().toISOString().split('T')[0],
                venueScreen: r.Screen || r.TV || 'Main Screen',
                priority: 'High',
                isSpecial: true
              });
              count++;
            }
          });
        }

        // Check for Entertainment / Bands / Specials
        if (rows.some(r => r.Band || r.Artist || r.Special || r.Meal || r.Deal || r.Promo)) {
          rows.forEach((r, idx) => {
            const title = r.Band || r.Artist || r.Special || r.Meal || r.Title || r.Deal;
            if (title) {
              db.insert('entertainment', {
                id: `up-ent-${Date.now()}-${idx}`,
                title: String(title).trim(),
                type: r.Band || r.Artist ? 'Live Music' : 'Special Offer',
                date: r.Date || new Date().toISOString().split('T')[0],
                time: r.Time || '18:00',
                description: r.Description || r.Details || r.Deal || 'Special Promotion',
                cost: r.Price ? parseFloat(String(r.Price).replace(/[^0-9.]/g, '')) : 0,
                status: 'Confirmed'
              });
              count++;
            }
          });
        }

        // Check for Staff / Roster records
        if (rows.some(r => r.Staff || r.Employee || r.PIN || r.Role)) {
          rows.forEach((r, idx) => {
            const name = r.Staff || r.Employee || r.Name;
            if (name) {
              db.insert('staff', {
                id: `up-staff-${Date.now()}-${idx}`,
                name: String(name).trim(),
                role: r.Role || 'Front of House',
                pinCode: String(r.PIN || r.Pin || '1234'),
                visible: true,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
                color: '#6366f1'
              });
              count++;
            }
          });
        }
      }
    }

    // Always register in Documents archive
    db.insert('documents', {
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      name: file.name,
      category: nameLower.includes('menu') ? 'Menus' : nameLower.includes('roster') ? 'Rosters' : 'Uploads',
      url: urlPath,
      size: `${Math.round(file.size / 1024)} KB`,
      type: file.type || 'application/octet-stream',
      uploadedAt: new Date().toISOString(),
      tags: ['public-folder', 'master-admin-upload']
    });
    count++;
  } catch (err) {
    console.error('Error during autoIngestUploadedFile:', err);
  }

  return count;
};

/**
 * Fetch all public files from server + local cache
 */
export const fetchPublicFilesList = async (): Promise<PublicFileInfo[]> => {
  const localFiles = getLocalUploadedFiles();
  let serverFiles: PublicFileInfo[] = [];

  try {
    const res = await fetch('/api/list-public');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.files)) {
        serverFiles = data.files;
      }
    }
  } catch (e) {
    console.warn('[PublicUpload] /api/list-public endpoint not responding, falling back to manifest', e);
  }

  // Merge and deduplicate by relativePath
  const map = new Map<string, PublicFileInfo>();
  serverFiles.forEach(f => map.set(f.relativePath, f));
  localFiles.forEach(f => {
    if (!map.has(f.relativePath)) {
      map.set(f.relativePath, f);
    }
  });

  return Array.from(map.values()).sort((a, b) => a.relativePath.localeCompare(b.relativePath));
};

/**
 * Delete a file from public directory
 */
export const deletePublicFolderFile = async (relativePath: string): Promise<boolean> => {
  try {
    const cleanPath = relativePath.replace(/^\/+/, '');
    const res = await fetch(`/api/delete-public?path=${encodeURIComponent(cleanPath)}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        // Remove from local storage registry as well
        const updated = getLocalUploadedFiles().filter(f => f.relativePath !== cleanPath);
        localStorage.setItem(LOCAL_UPLOADS_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('ctos:public-file-deleted', { detail: cleanPath }));
        return true;
      }
    }
  } catch (err) {
    console.error('Failed to delete file via API:', err);
  }

  // Fallback remove from local registry
  const updated = getLocalUploadedFiles().filter(f => f.relativePath !== relativePath);
  localStorage.setItem(LOCAL_UPLOADS_KEY, JSON.stringify(updated));
  return true;
};
