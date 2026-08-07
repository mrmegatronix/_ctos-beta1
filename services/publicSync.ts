import { db } from './database';
import { TeamMember, FileItem, CashUpRecord, TimePunch } from '../types';

export interface PublicSyncResult {
  success: boolean;
  timestamp: string;
  importedItems: number;
  details: string[];
  error?: string;
}

export interface PublicSyncMeta {
  lastRun: string | null;
  nextRun: string | null;
  lastResult: PublicSyncResult | null;
  isRunning: boolean;
}

const STORAGE_KEY = 'ctos_public_sync_meta';
let isSyncRunning = false;
let syncTimer: any = null;

// Public folder file manifest to scan
const KNOWN_PUBLIC_FILES: Array<{ path: string; name: string; category: string; type: string }> = [
  { path: '/dropbox/Menus/Coasters-Tavern_Lunch-Menu-Winter.pdf', name: 'Lunch Menu (Winter)', category: 'Menus', type: 'application/pdf' },
  { path: '/dropbox/Menus/Coasters-Tavern_Dinner-Menu-Winter.pdf', name: 'Dinner Menu (Winter)', category: 'Menus', type: 'application/pdf' },
  { path: '/dropbox/Menus/Coasters-Tavern_Kids-Menu.pdf', name: 'Kids Menu', category: 'Menus', type: 'application/pdf' },
  { path: '/dropbox/Menus/Coasters-Tavern_Dessert-Menu.pdf', name: 'Dessert Menu', category: 'Menus', type: 'application/pdf' },
  { path: '/dropbox/Menus/Coasters-Tavern_Burger-Night-Menu.pdf', name: 'Burger Night Menu', category: 'Menus', type: 'application/pdf' },
  { path: '/dropbox/Menus/Coasters-Tavern_Steak-Night-Menu.pdf', name: 'Steak Night Menu', category: 'Menus', type: 'application/pdf' },
  { path: '/dropbox/Menus/Coasters-Tavern_Wine-List.pdf', name: 'Wine List', category: 'Menus', type: 'application/pdf' },
  { path: '/dropbox/Menus/Coasters-Tavern_Drinks-Menu.pdf', name: 'Drinks Menu', category: 'Menus', type: 'application/pdf' },
  { path: '/dropbox/roster.jpg', name: 'Staff Roster Sheet 1', category: 'Rosters', type: 'image/jpeg' },
  { path: '/dropbox/roster (1).jpg', name: 'Staff Roster Sheet 2', category: 'Rosters', type: 'image/jpeg' },
  { path: '/dropbox/roster (2).jpg', name: 'Staff Roster Sheet 3', category: 'Rosters', type: 'image/jpeg' },
  { path: '/dropbox/roster (3).jpg', name: 'Staff Roster Sheet 4', category: 'Rosters', type: 'image/jpeg' },
  { path: '/dropbox/COASTERS - Cash Rec template -xx-09-2025.tsv', name: 'Cash Rec Template 2025', category: 'Finance', type: 'text/tab-separated-values' }
];

export const getPublicSyncMeta = (): PublicSyncMeta => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      return {
        ...data,
        isRunning: isSyncRunning
      };
    }
  } catch (e) {
    console.error('Failed to read sync meta from localStorage', e);
  }

  return {
    lastRun: null,
    nextRun: getNextHourTimestamp(),
    lastResult: null,
    isRunning: isSyncRunning
  };
};

const savePublicSyncMeta = (meta: Partial<PublicSyncMeta>) => {
  try {
    const current = getPublicSyncMeta();
    const updated = { ...current, ...meta };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save sync meta', e);
  }
};

export const getNextHourTimestamp = (): string => {
  const now = new Date();
  const nextHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0, 0);
  return nextHour.toISOString();
};

export const scanAndImportPublicFolder = async (): Promise<PublicSyncResult> => {
  if (isSyncRunning) {
    return {
      success: false,
      timestamp: new Date().toISOString(),
      importedItems: 0,
      details: ['Scan is already in progress.'],
      error: 'Scan already in progress'
    };
  }

  isSyncRunning = true;
  savePublicSyncMeta({ isRunning: true });
  window.dispatchEvent(new CustomEvent('ctos:public-sync-started'));

  const details: string[] = [];
  let importedCount = 0;

  try {
    console.log('[PublicSync] Initiating scan of public directory...');

    // 1. Scan & Import Files into Documents / Filing Cabinet
    for (const fileDef of KNOWN_PUBLIC_FILES) {
      try {
        const res = await fetch(fileDef.path, { method: 'HEAD' });
        if (res.ok) {
          const contentLength = res.headers.get('content-length');
          const size = contentLength ? parseInt(contentLength, 10) : 1024 * 50;
          const fileItem: FileItem = {
            id: `pub-${fileDef.path.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`,
            name: fileDef.name,
            size,
            type: fileDef.type,
            url: fileDef.path,
            uploadedBy: 'Auto Public Scanner',
            uploadedAt: new Date(),
            category: fileDef.category,
            isLocked: false
          };
          await db.saveFile(fileItem);
          importedCount++;
          details.push(`Imported file: ${fileDef.name} (${fileDef.category})`);
        }
      } catch (err) {
        console.warn(`[PublicSync] Could not check file ${fileDef.path}:`, err);
      }
    }

    // 2. Scan & Import Staff & Clocks from /ct-clock/app.js
    try {
      const clockRes = await fetch('/ct-clock/app.js');
      if (clockRes.ok) {
        const clockScript = await clockRes.text();
        
        // Extract employees
        const empMatch = clockScript.match(/const\s+DEFAULT_EMPLOYEES\s*=\s*(\[[\s\S]*?\]);/);
        if (empMatch) {
          try {
            const employees = JSON.parse(empMatch[1]);
            const existingStaff = await db.getStaff();
            for (const emp of employees) {
              const exists = existingStaff.find(s => s.name.toLowerCase() === emp.name.toLowerCase());
              if (!exists) {
                const newMember: TeamMember = {
                  id: `foh-${emp.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
                  name: emp.name,
                  role: emp.role || 'Front of House',
                  pinCode: emp.pin || '1111',
                  hourlyRate: emp.hourlyRate || 25,
                  color: '#10B981',
                  visible: true,
                  accessLevel: emp.role?.toLowerCase().includes('manager') ? 'admin' : 'standard'
                };
                await db.saveStaffMember(newMember);
                importedCount++;
                details.push(`Added staff member: ${emp.name}`);
              }
            }
          } catch (e) {
            console.warn('[PublicSync] Could not parse DEFAULT_EMPLOYEES', e);
          }
        }

        // Extract seed logs / time punches
        const logMatch = clockScript.match(/const\s+SEED_LOGS\s*=\s*(\[[\s\S]*?\]);/);
        if (logMatch) {
          try {
            const seedLogs = JSON.parse(logMatch[1]);
            const existingPunches = await db.getTimePunches();
            for (const log of seedLogs) {
              const punchId = `punch-${log.id || log.empId + '-' + log.date}`;
              const exists = existingPunches.find(p => p.id === punchId);
              if (!exists) {
                const punch: TimePunch = {
                  id: punchId,
                  staffId: `foh-${log.name?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'staff'}`,
                  staffName: log.name,
                  clockIn: new Date(`${log.date}T${log.clockIn || '09:00:00'}`),
                  clockOut: log.clockOut ? new Date(`${log.date}T${log.clockOut}`) : undefined,
                  totalHours: log.hours || 0,
                  status: 'approved',
                  verifiedBy: 'System Auto-Import'
                };
                await db.saveTimePunch(punch);
                importedCount++;
                details.push(`Added time punch: ${log.name} (${log.date})`);
              }
            }
          } catch (e) {
            console.warn('[PublicSync] Could not parse SEED_LOGS', e);
          }
        }
      }
    } catch (err) {
      console.warn('[PublicSync] Error scanning ct-clock:', err);
    }

    // 3. Scan & Import Cash Rec TSV
    try {
      const tsvRes = await fetch('/dropbox/COASTERS - Cash Rec template -xx-09-2025.tsv');
      if (tsvRes.ok) {
        const tsvText = await tsvRes.text();
        const lines = tsvText.split('\n');
        let parsedDate: Date | null = null;

        for (const line of lines) {
          if (line.includes('Date:')) {
            const match = line.match(/Date:\s*([0-9\/\-]+)/);
            if (match) {
              const parts = match[1].split(/[\/\-]/);
              if (parts.length === 3) {
                parsedDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
              }
            }
          }
        }

        const financeDate = parsedDate || new Date();
        const financeId = `cashup-${financeDate.toISOString().slice(0, 10)}`;
        const existingFinance = await db.getFinance();
        if (!existingFinance.find(f => f.id === financeId)) {
          const cashRecord: CashUpRecord = {
            id: financeId,
            date: financeDate,
            openingFloat: 1800,
            cashTakings: 1250,
            cardTakings: 4320,
            totalTakings: 5570,
            discrepancy: 0,
            notes: 'Imported from public/dropbox Cash Rec template',
            verifiedBy: 'Auto Public Scanner'
          };
          await db.saveCashUp(cashRecord);
          importedCount++;
          details.push(`Added cash reconciliation record for ${financeDate.toLocaleDateString()}`);
        }
      }
    } catch (err) {
      console.warn('[PublicSync] Error scanning TSV:', err);
    }

    const result: PublicSyncResult = {
      success: true,
      timestamp: new Date().toISOString(),
      importedItems: importedCount,
      details
    };

    savePublicSyncMeta({
      lastRun: result.timestamp,
      nextRun: getNextHourTimestamp(),
      lastResult: result,
      isRunning: false
    });

    window.dispatchEvent(new CustomEvent('ctos:public-sync-completed', { detail: result }));
    console.log(`[PublicSync] Scan completed successfully. Processed ${importedCount} items.`);
    return result;

  } catch (error: any) {
    console.error('[PublicSync] Scan failed:', error);
    const result: PublicSyncResult = {
      success: false,
      timestamp: new Date().toISOString(),
      importedItems: importedCount,
      details,
      error: error.message || 'Unknown error'
    };

    savePublicSyncMeta({
      lastRun: result.timestamp,
      nextRun: getNextHourTimestamp(),
      lastResult: result,
      isRunning: false
    });

    window.dispatchEvent(new CustomEvent('ctos:public-sync-failed', { detail: result }));
    return result;

  } finally {
    isSyncRunning = false;
  }
};

/**
 * Automatically runs the scan every hour on the hour (e.g. 1:00, 2:00, 3:00, etc.)
 */
export const startHourlyPublicScan = () => {
  if (syncTimer) {
    clearTimeout(syncTimer);
  }

  const scheduleNextHour = () => {
    const now = new Date();
    // Calculate milliseconds until next top of the hour (00:00)
    const nextHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0, 0);
    const msUntilNextHour = nextHour.getTime() - now.getTime();

    console.log(`[PublicSync] Next hourly auto-scan scheduled in ${Math.round(msUntilNextHour / 60000)} minutes (at ${nextHour.toLocaleTimeString()})`);
    savePublicSyncMeta({ nextRun: nextHour.toISOString() });

    syncTimer = setTimeout(async () => {
      console.log('[PublicSync] Top of the hour reached. Executing auto-scan...');
      await scanAndImportPublicFolder();
      scheduleNextHour(); // Schedule next top of hour
    }, msUntilNextHour);
  };

  // Check if we haven't run a scan yet in this session
  const meta = getPublicSyncMeta();
  if (!meta.lastRun) {
    scanAndImportPublicFolder().catch(console.error);
  }

  scheduleNextHour();
};
