import Papa from 'papaparse';
import { TVScheduleItem, EntertainmentEvent, CalendarEvent } from '../types';
import { generateId } from '../utils';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTjplY4qgdlDPmFO4sKUoWHnBPoeqf-rY3Tc0Y50wgDbDutbTn4j_hXhW3aXhYVjvfbIlwcIOF07250/pub?gid=1948723750&single=true&output=csv';

interface ParsedCSVRow {
  Date: string;
  Day: string;
  'Event Type': string;
  'Event Name': string;
  Details: string;
  Time: string;
  Price: string;
  Location: string;
  'Slide Background': string;
}

function parseDateTime(dateStr: string, timeStr: string): Date {
  // dateStr is DD/MM/YYYY
  // timeStr is e.g. "7:05 pm", "~9:30 PM", or empty
  if (!dateStr) return new Date();
  const [day, month, year] = dateStr.split('/');
  
  let hours = 0;
  let minutes = 0;
  
  if (timeStr) {
    const cleanTimeStr = timeStr.replace(/~/g, '').trim().toLowerCase();
    const match = cleanTimeStr.match(/(\d+):?(\d+)?\s*(am|pm)?/);
    if (match) {
      hours = parseInt(match[1] || '0', 10);
      minutes = parseInt(match[2] || '0', 10);
      const ampm = match[3];
      if (ampm === 'pm' && hours < 12) hours += 12;
      if (ampm === 'am' && hours === 12) hours = 0;
    }
  }
  
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hours, minutes);
}

export async function fetchAndParseCSV(): Promise<{
  tvSchedule: TVScheduleItem[];
  entertainment: EntertainmentEvent[];
  events: CalendarEvent[];
}> {
  return new Promise((resolve, reject) => {
    Papa.parse(CSV_URL, {
      download: true,
      header: true,
      complete: (results) => {
        const rows = results.data as ParsedCSVRow[];
        
        const tvSchedule: TVScheduleItem[] = [];
        const entertainment: EntertainmentEvent[] = [];
        const events: CalendarEvent[] = [];
        
        rows.forEach(row => {
          if (!row.Date || !row['Event Type']) return;
          
          const startTime = parseDateTime(row.Date, row.Time);
          const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // add 2 hours approx
          
          const eventType = row['Event Type'].toLowerCase();
          
          if (eventType.includes('rugby') || eventType.includes('nrl') || eventType.includes('all blacks')) {
            let sport: TVScheduleItem['sport'] = 'Other';
            if (eventType.includes('rugby') || eventType.includes('all blacks')) sport = 'Rugby';
            if (eventType.includes('nrl')) sport = 'League';
            
            tvSchedule.push({
              id: generateId(),
              sport,
              match: `${row['Event Name']} ${row.Details}`.trim(),
              channel: row.Price || 'Big Screen',
              startTime,
              endTime,
              isLive: true,
              notes: row.Location
            });
          } else if (eventType.includes('band') || eventType.includes('karaoke')) {
            entertainment.push({
              id: generateId(),
              title: row['Event Name'] || 'Entertainment',
              type: eventType.includes('band') ? 'Band' : 'DJ',
              date: startTime,
              description: row.Details || '',
              status: 'confirmed'
            });
          } else {
            // Treat as general event/special
            events.push({
              id: generateId(),
              title: row['Event Name'] || row['Event Type'],
              description: row.Details,
              start: startTime,
              end: endTime,
              attendeeIds: [],
              type: 'event',
              source: 'google'
            });
          }
        });
        
        resolve({ tvSchedule, entertainment, events });
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}

export function startCsvSync(
  intervalMinutes: number, 
  onUpdate: (data: { tvSchedule: TVScheduleItem[], entertainment: EntertainmentEvent[], events: CalendarEvent[] }) => void
) {
  const sync = async () => {
    try {
      console.log('[CTOS] Syncing CSV data...');
      const data = await fetchAndParseCSV();
      onUpdate(data);
    } catch (error) {
      console.error('[CTOS] Error syncing CSV data:', error);
    }
  };

  // Initial sync
  sync();

  // Schedule regular syncs
  return setInterval(sync, intervalMinutes * 60 * 1000);
}
