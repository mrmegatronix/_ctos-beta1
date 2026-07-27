import { db } from './database';
import { generateId } from '../utils';
import { CalendarEvent, EntertainmentEvent, TVScheduleItem } from '../types';

const TSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTjplY4qgdlDPmFO4sKUoWHnBPoeqf-rY3Tc0Y50wgDbDutbTn4j_hXhW3aXhYVjvfbIlwcIOF07250/pub?gid=1948723750&single=true&output=tsv';

// Helper to parse dates like "03/04/2026" (DD/MM/YYYY) and time like "7:05 pm"
const parseDateTime = (dateStr: string, timeStr: string): Date => {
  try {
    const [day, month, year] = dateStr.split('/');
    if (!day || !month || !year) return new Date();
    
    let hours = 12;
    let mins = 0;
    
    if (timeStr && timeStr.trim() !== '') {
       // Clean up the time string (remove ~, etc.)
       const cleanTime = timeStr.replace(/[^0-9a-zA-Z:\s]/g, '').trim().toLowerCase();
       const match = cleanTime.match(/(\d+):(\d+)\s*(am|pm)/);
       if (match) {
         hours = parseInt(match[1]);
         mins = parseInt(match[2]);
         const period = match[3];
         if (period === 'pm' && hours < 12) hours += 12;
         if (period === 'am' && hours === 12) hours = 0;
       } else if (cleanTime.includes('pm')) {
         const hMatch = cleanTime.match(/(\d+)/);
         if (hMatch) {
             hours = parseInt(hMatch[1]);
             if (hours < 12) hours += 12;
         }
       }
    }

    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hours, mins);
  } catch (e) {
    console.error('Error parsing date/time:', dateStr, timeStr);
    return new Date();
  }
};

export const syncWithGoogleSheets = async () => {
  try {
    console.log('[Sync] Fetching latest TSV data from Google Sheets...');
    const response = await fetch(TSV_URL);
    if (!response.ok) throw new Error('Failed to fetch TSV');
    
    const text = await response.text();
    const lines = text.split('\n');
    
    // Skip header line (index 0)
    const records = lines.slice(1).filter(l => l.trim() !== '');

    let syncedCount = 0;

    for (const line of records) {
      const cols = line.split('\t');
      // TSV Columns: Date (0), Day (1), Event Type (2), Event Name (3), Details (4), Billboard Text (5), Time (6), Price (7), Location (8)
      if (cols.length < 5) continue;

      const dateStr = cols[0];
      const eventType = cols[2];
      const eventName = cols[3];
      const details = cols[4];
      const timeStr = cols[6] || '';
      
      const startDateTime = parseDateTime(dateStr, timeStr);
      // Assume events last 3 hours for calendar
      const endDateTime = new Date(startDateTime.getTime() + 3 * 60 * 60 * 1000);
      
      // Determine what type of record this is
      const lowerType = eventType.toLowerCase();
      
      // 1. Calendar Event (General)
      const calEvent: CalendarEvent = {
         id: `sync-cal-${dateStr.replace(/\//g, '')}-${eventName.replace(/\s+/g, '')}`.substring(0, 50),
         title: eventName,
         start: startDateTime,
         end: endDateTime,
         description: details,
         attendeeIds: [],
         source: 'local'
      };
      await db.saveEvent(calEvent);

      // 2. Entertainment / Band / Quiz
      if (lowerType.includes('band') || lowerType.includes('karaoke') || lowerType.includes('quiz')) {
         let type: 'Band' | 'DJ' | 'Quiz' | 'Sport' = 'Band';
         if (lowerType.includes('quiz')) type = 'Quiz';
         
         const entEvent: EntertainmentEvent = {
             id: `sync-ent-${dateStr.replace(/\//g, '')}-${eventName.replace(/\s+/g, '')}`.substring(0, 50),
             title: eventName,
             type: type,
             date: startDateTime,
             description: details,
             performerName: eventName,
             status: 'confirmed'
         };
         await db.saveEntertainment(entEvent);
      }

      // 3. Sport / TV Schedule
      if (lowerType.includes('rugby') || lowerType.includes('nrl') || lowerType.includes('all blacks')) {
         let sport: 'Rugby' | 'League' | 'Cricket' | 'Football' | 'UFC' | 'Basketball' | 'Motorsport' | 'Other' = 'Rugby';
         if (lowerType.includes('nrl')) sport = 'League';
         
         const tvEvent: TVScheduleItem = {
             id: `sync-tv-${dateStr.replace(/\//g, '')}-${eventName.replace(/\s+/g, '')}`.substring(0, 50),
             sport: sport,
             match: `${eventName} ${details}`,
             channel: 'Sky Sport 1',
             startTime: startDateTime,
             endTime: endDateTime,
             isLive: true,
             notes: cols[8] // location as notes
         };
         await db.saveTVScheduleItem(tvEvent);
      }
      
      syncedCount++;
    }
    
    console.log(`[Sync] Successfully synced ${syncedCount} records from Google Sheets.`);
    return true;
  } catch (err) {
    console.error('[Sync] Error syncing from Google Sheets:', err);
    return false;
  }
};

export const startAutoSync = (intervalMinutes = 15) => {
  console.log(`[Sync] Starting auto-sync every ${intervalMinutes} minutes.`);
  // Run immediately
  syncWithGoogleSheets();
  // Then schedule
  return setInterval(syncWithGoogleSheets, intervalMinutes * 60 * 1000);
};
