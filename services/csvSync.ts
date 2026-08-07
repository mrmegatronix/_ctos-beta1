import Papa from 'papaparse';
import { TVScheduleItem, EntertainmentEvent, CalendarEvent } from '../types';
import { generateId } from '../utils';
import { db } from './database';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTjplY4qgdlDPmFO4sKUoWHnBPoeqf-rY3Tc0Y50wgDbDutbTn4j_hXhW3aXhYVjvfbIlwcIOF07250/pub?gid=1948723750&single=true&output=csv';

interface ParsedCSVRow {
  Date: string;
  Day: string;
  'Event Type': string;
  'Event Name': string;
  Details: string;
  'Billboard Text': string;
  Time: string;
  Price: string;
  Location: string;
  'Slide Background': string;
}

function parseDateTime(dateStr: string, timeStr: string, isAllDayDefault = false): { start: Date; end: Date } {
  if (!dateStr) {
    const now = new Date();
    return { start: now, end: new Date(now.getTime() + 2 * 60 * 60 * 1000) };
  }

  const parts = dateStr.trim().split('/');
  if (parts.length < 3) {
    const now = new Date();
    return { start: now, end: new Date(now.getTime() + 2 * 60 * 60 * 1000) };
  }

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);

  let startHours = isAllDayDefault ? 11 : 12;
  let startMinutes = isAllDayDefault ? 30 : 0;
  let durationHours = isAllDayDefault ? 9.5 : 2.5;

  if (timeStr && timeStr.trim()) {
    const cleanTime = timeStr.replace(/~/g, '').trim().toLowerCase();
    
    // Check for range e.g. "4.30pm & 6.30pm" or "4:30pm - 6:30pm"
    const rangeMatch = cleanTime.match(/(\d+)(?:[:.](\d+))?\s*(am|pm)?\s*(?:-|&|to)\s*(\d+)(?:[:.](\d+))?\s*(am|pm)?/);
    if (rangeMatch) {
      let h1 = parseInt(rangeMatch[1] || '0', 10);
      const m1 = parseInt(rangeMatch[2] || '0', 10);
      const p1 = rangeMatch[3];

      let h2 = parseInt(rangeMatch[4] || '0', 10);
      const m2 = parseInt(rangeMatch[5] || '0', 10);
      const p2 = rangeMatch[6] || p1;

      if (p1 === 'pm' && h1 < 12) h1 += 12;
      if (p1 === 'am' && h1 === 12) h1 = 0;
      if (p2 === 'pm' && h2 < 12) h2 += 12;
      if (p2 === 'am' && h2 === 12) h2 = 0;

      startHours = h1;
      startMinutes = m1;
      durationHours = Math.max(1, (h2 * 60 + m2 - (h1 * 60 + m1)) / 60);
    } else {
      const singleMatch = cleanTime.match(/(\d+)(?:[:.](\d+))?\s*(am|pm)?/);
      if (singleMatch) {
        let h = parseInt(singleMatch[1] || '0', 10);
        const m = parseInt(singleMatch[2] || '0', 10);
        const p = singleMatch[3];
        if (p === 'pm' && h < 12) h += 12;
        if (p === 'am' && h === 12) h = 0;
        startHours = h;
        startMinutes = m;
      }
    }
  }

  const start = new Date(year, month, day, startHours, startMinutes, 0);
  const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
  return { start, end };
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
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = results.data as ParsedCSVRow[];
          const tvSchedule: TVScheduleItem[] = [];
          const entertainment: EntertainmentEvent[] = [];
          const events: CalendarEvent[] = [];

          for (const row of rows) {
            if (!row.Date || !row['Event Type']) continue;
            const eventTypeRaw = (row['Event Type'] || '').trim();
            const eventType = eventTypeRaw.toLowerCase();
            const eventName = (row['Event Name'] || '').trim();
            const details = (row.Details || '').trim();
            const timeStr = (row.Time || '').trim();
            const price = (row.Price || '').trim();
            const location = (row.Location || '').trim();

            // Skip header repeat rows or metadata rows
            if (eventTypeRaw === 'Event Type' || eventType.includes('social link') || eventType.includes('information')) {
              continue;
            }

            const isWeeklySpecial = eventType.includes('special') || eventName.toLowerCase().includes('special') || eventName.toLowerCase().includes('day');
            const { start, end } = parseDateTime(row.Date, timeStr, isWeeklySpecial);

            // 1. Sports for TV Schedule (Super Rugby, NRL, All Blacks, NPC, Football, UFC, etc.)
            const isSport = eventType.includes('rugby') || 
                            eventType.includes('nrl') || 
                            eventType.includes('all blacks') || 
                            eventType.includes('npc') ||
                            eventType.includes('cricket') ||
                            eventType.includes('football') ||
                            eventType.includes('soccer') ||
                            eventType.includes('ufc') ||
                            eventType.includes('basketball') ||
                            eventType.includes('league');

            if (isSport) {
              let sport: TVScheduleItem['sport'] = 'Other';
              if (eventType.includes('nrl') || eventType.includes('league')) sport = 'League';
              else if (eventType.includes('rugby') || eventType.includes('all blacks') || eventType.includes('npc')) sport = 'Rugby';
              else if (eventType.includes('cricket')) sport = 'Cricket';
              else if (eventType.includes('football') || eventType.includes('soccer')) sport = 'Football';
              else if (eventType.includes('ufc')) sport = 'UFC';
              else if (eventType.includes('basketball')) sport = 'Basketball';

              const matchTitle = `${eventName} ${details}`.trim();
              const tvItem: TVScheduleItem = {
                id: `tv-${row.Date.replace(/\//g, '')}-${matchTitle.replace(/[^a-zA-Z0-9]/g, '')}`.substring(0, 50),
                sport,
                match: matchTitle,
                channel: price || 'Big Screen',
                startTime: start,
                endTime: end,
                isLive: true,
                notes: location || 'Live on Big Screens'
              };
              tvSchedule.push(tvItem);
              await db.saveTVScheduleItem(tvItem);

              // Also add to Venue Calendar
              const sportIcon = sport === 'League' ? '🏉 NRL' : (sport === 'Rugby' ? '🏉 Rugby' : '📺 Sport');
              const calSportEvent: CalendarEvent = {
                id: `cal-sport-${row.Date.replace(/\//g, '')}-${matchTitle.replace(/[^a-zA-Z0-9]/g, '')}`.substring(0, 50),
                title: `[${sportIcon}] ${matchTitle}`,
                description: `${price ? `Channel: ${price}\n` : ''}${location ? `Location: ${location}\n` : ''}${details}`,
                start,
                end,
                attendeeIds: [],
                type: 'event',
                source: 'google'
              };
              events.push(calSportEvent);
              await db.saveEvent(calSportEvent);
            }
            // 2. Bands & Entertainment (Bands, Karaoke, DJ, Quiz Nights)
            else if (eventType.includes('band') || eventType.includes('karaoke') || eventType.includes('quiz') || eventType.includes('dj')) {
              let entType: EntertainmentEvent['type'] = 'Band';
              if (eventType.includes('karaoke') || eventType.includes('dj')) entType = 'DJ';
              if (eventType.includes('quiz') || eventName.toLowerCase().includes('quiz')) entType = 'Quiz';

              const entTitle = eventName || eventTypeRaw;
              const entItem: EntertainmentEvent = {
                id: `ent-${row.Date.replace(/\//g, '')}-${entTitle.replace(/[^a-zA-Z0-9]/g, '')}`.substring(0, 50),
                title: entTitle,
                type: entType,
                date: start,
                description: details || location || '',
                performerName: eventName,
                status: 'confirmed'
              };
              entertainment.push(entItem);
              await db.saveEntertainment(entItem);

              // Also add to Venue Calendar
              const entIcon = entType === 'Band' ? '🎵 Live Band' : (entType === 'Quiz' ? '🧠 Quiz Night' : '🎤 Karaoke');
              const calEntEvent: CalendarEvent = {
                id: `cal-ent-${row.Date.replace(/\//g, '')}-${entTitle.replace(/[^a-zA-Z0-9]/g, '')}`.substring(0, 50),
                title: `[${entIcon}] ${entTitle}`,
                description: `${details}\n${location ? `Venue Info: ${location}` : ''}`.trim(),
                start,
                end,
                attendeeIds: [],
                type: 'event',
                source: 'google'
              };
              events.push(calEntEvent);
              await db.saveEvent(calEntEvent);
            }
            // 3. Daily Menu Specials, Weekly Specials & Venue Events
            else {
              const prefix = isWeeklySpecial ? '🍽️ Special' : '🎉 Event';
              const title = eventName || eventTypeRaw;
              const calEvent: CalendarEvent = {
                id: `cal-gen-${row.Date.replace(/\//g, '')}-${title.replace(/[^a-zA-Z0-9]/g, '')}`.substring(0, 50),
                title: `[${prefix}] ${title}${price ? ` (${price})` : ''}`,
                description: `${details}\n${price ? `Price: ${price}\n` : ''}${location ? `Location: ${location}` : ''}`.trim(),
                start,
                end,
                attendeeIds: [],
                type: 'event',
                source: 'google'
              };
              events.push(calEvent);
              await db.saveEvent(calEvent);
            }
          }

          resolve({ tvSchedule, entertainment, events });
        } catch (err) {
          console.error('[csvSync] Error parsing and saving CSV rows:', err);
          reject(err);
        }
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
      console.log('[CTOS] Syncing CSV live spreadsheet data...');
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

