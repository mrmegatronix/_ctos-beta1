import { CalendarEvent, Booking } from "../types";
import { generateId } from "../utils";

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

// Scopes updated for Calendar, Tasks, People (Contacts)
const SCOPES = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/tasks https://www.googleapis.com/auth/contacts.readonly';
const DISCOVERY_DOCS = [
    'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
    'https://www.googleapis.com/discovery/v1/apis/tasks/v1/rest',
    'https://www.googleapis.com/discovery/v1/apis/people/v1/rest'
];

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

// Mock environment
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'MOCK_CLIENT_ID';
const API_KEY = process.env.GOOGLE_API_KEY || 'MOCK_API_KEY';

export const initGoogleClient = (onInitComplete: () => void) => {
  const gapiLoaded = () => {
    window.gapi.load('client', async () => {
      try {
        await window.gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: DISCOVERY_DOCS,
        });
        gapiInited = true;
        if (gisInited) onInitComplete();
      } catch (e) {
          console.warn("Google API Init failed (likely due to mock keys). App will run in offline mode.");
      }
    });
  };

  const gisLoaded = () => {
    try {
        tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', 
        });
        gisInited = true;
        if (gapiInited) onInitComplete();
    } catch(e) {
        console.warn("GIS Init failed");
    }
  };

  if (window.gapi) gapiLoaded();
  if (window.google) gisLoaded();
};

export const handleGoogleLogin = async (): Promise<any> => {
    // In this web container, we return a mock user immediately to allow functionality testing
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                name: "Robert Manager",
                email: "robert@coasterstavern.com",
                picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert"
            });
        }, 500);
    });
};

export const importGoogleCalendarEvents = async (): Promise<CalendarEvent[]> => {
    // Mock Data for "Real" Integration feel when API fails
    const today = new Date();
    return [
        {
            id: 'g-' + generateId(),
            title: 'Google: Supplier Call',
            start: new Date(today.setHours(10, 0)),
            end: new Date(today.setHours(10, 30)),
            description: 'Synced from Google Calendar',
            attendeeIds: [],
            isMeeting: true,
            source: 'google'
        }
    ];
};
export const fetchEmailBookings = async (): Promise<Booking[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const today = new Date();
            // Simulate finding an email with "new booking" and extracting the details
            resolve([
                {
                    id: 'bkg-' + generateId(),
                    customerName: 'Alice Emailer',
                    time: new Date(today.setHours(19, 30)),
                    guests: 4,
                    table: 'T2',
                    phone: '021 555 9999',
                    status: 'pending',
                    notes: 'Extracted from email: "new booking for 4 at 7:30pm"',
                    source: 'email'
                }
            ]);
        }, 1500);
    });
};
