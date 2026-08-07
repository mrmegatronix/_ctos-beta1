import { fetchAndParseCSV } from './csvSync';

export const syncWithGoogleSheets = async () => {
  try {
    console.log('[Sync] Fetching latest live CSV data from Google Sheets...');
    const data = await fetchAndParseCSV();
    console.log(`[Sync] Successfully synced ${data.events.length} calendar events, ${data.tvSchedule.length} TV matches, and ${data.entertainment.length} entertainment gigs.`);
    return true;
  } catch (err) {
    console.error('[Sync] Error syncing from Google Sheets:', err);
    return false;
  }
};

export const startAutoSync = (intervalMinutes = 15) => {
  console.log(`[Sync] Starting Google Sheets auto-sync every ${intervalMinutes} minutes.`);
  syncWithGoogleSheets();
  return setInterval(syncWithGoogleSheets, intervalMinutes * 60 * 1000);
};

