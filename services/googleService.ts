import { CalendarEvent, Booking } from "../types";
import { generateId } from "../utils";

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/contacts',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/spreadsheets'
].join(' ');

const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
  'https://people.googleapis.com/$discovery/rest?version=v1',
  'https://sheets.googleapis.com/$discovery/rest?version=v4',
  'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
  'https://gmail.googleapis.com/$discovery/rest?version=v1'
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

let googleAccessToken = '';

export const handleGoogleLogin = async (): Promise<any> => {
    return new Promise((resolve, reject) => {
        if (!gisInited) {
            reject(new Error("Google Identity Services not initialized"));
            return;
        }
        
        tokenClient.callback = async (resp: any) => {
            if (resp.error !== undefined) {
                reject(resp);
            }
            googleAccessToken = resp.access_token;
            
            try {
                // Fetch user profile from People API
                const response = await fetch('https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,photos', {
                    headers: {
                        'Authorization': `Bearer ${googleAccessToken}`
                    }
                });
                const data = await response.json();
                
                resolve({
                    name: data.names?.[0]?.displayName || "Google User",
                    email: data.emailAddresses?.[0]?.value || "unknown@gmail.com",
                    picture: data.photos?.[0]?.url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Google"
                });
            } catch (err) {
                console.error("Error fetching Google profile", err);
                resolve({
                    name: "Connected User",
                    email: "coastersinfo@gmail.com",
                    picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Google"
                });
            }
        };

        if (window.gapi.client.getToken() === null) {
            // Prompt the user to select a Google Account and ask for consent to share their data
            tokenClient.requestAccessToken({prompt: 'consent'});
        } else {
            // Skip display of account chooser and consent dialog for an existing session.
            tokenClient.requestAccessToken({prompt: ''});
        }
    });
};

export const importGoogleCalendarEvents = async (): Promise<CalendarEvent[]> => {
    try {
        const response = await window.gapi.client.calendar.events.list({
            'calendarId': 'primary',
            'timeMin': (new Date()).toISOString(),
            'showDeleted': false,
            'singleEvents': true,
            'maxResults': 100,
            'orderBy': 'startTime',
        });
        
        const events = response.result.items;
        if (!events || events.length === 0) {
            return [];
        }
        
        return events.map((event: any) => ({
            id: event.id,
            title: event.summary || 'Untitled Google Event',
            start: new Date(event.start.dateTime || event.start.date),
            end: new Date(event.end.dateTime || event.end.date),
            description: event.description || '',
            attendeeIds: [],
            isMeeting: !!event.attendees,
            source: 'google'
        }));
    } catch (err) {
        console.error("Error importing Google Calendar events", err);
        return [];
    }
};

export const exportEventToGoogleCalendar = async (event: CalendarEvent) => {
    if (!gapiInited) return;
    
    const googleEvent = {
        'summary': event.title,
        'description': event.description,
        'start': {
            'dateTime': event.start.toISOString(),
            'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        'end': {
            'dateTime': event.end.toISOString(),
            'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
    };
    
    try {
        const request = await window.gapi.client.calendar.events.insert({
            'calendarId': 'primary',
            'resource': googleEvent,
        });
        return request.result;
    } catch (err) {
        console.error("Error exporting to Google Calendar", err);
        throw err;
    }
};
export const fetchEmailBookings = async (): Promise<Booking[]> => {
    try {
        // Search Gmail for recent unread emails about bookings
        const response = await window.gapi.client.gmail.users.messages.list({
            'userId': 'me',
            'q': 'subject:booking is:unread',
            'maxResults': 5
        });

        const messages = response.result.messages;
        if (!messages || messages.length === 0) return [];

        const bookings: Booking[] = [];
        
        for (const msg of messages) {
            const msgDetails = await window.gapi.client.gmail.users.messages.get({
                'userId': 'me',
                'id': msg.id,
                'format': 'full'
            });
            
            // Very naive extraction for demo
            const snippet = msgDetails.result.snippet || "";
            const today = new Date();
            
            bookings.push({
                id: 'bkg-' + msg.id,
                customerName: 'Extracted from Email',
                time: new Date(today.setHours(19, 30)),
                guests: 2,
                table: 'Auto',
                phone: '',
                status: 'pending',
                notes: `Email snippet: ${snippet}`,
                source: 'email'
            });
            
            // Mark as read
            await window.gapi.client.gmail.users.messages.modify({
                'userId': 'me',
                'id': msg.id,
                'resource': {
                    'removeLabelIds': ['UNREAD']
                }
            });
        }
        
        return bookings;
    } catch (err) {
        console.error("Error fetching email bookings", err);
        return [];
    }
};

export const sendEmailViaGmail = async (to: string, subject: string, messageText: string) => {
    // Create raw email
    const email = [
        `To: ${to}`,
        'Content-Type: text/plain; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${subject}`,
        '',
        messageText,
    ].join('\n');

    const encodedEmail = btoa(email).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    
    try {
        await window.gapi.client.gmail.users.messages.send({
            'userId': 'me',
            'resource': {
                'raw': encodedEmail
            }
        });
        return true;
    } catch (err) {
        console.error("Error sending email via Gmail", err);
        throw err;
    }
};

export const fetchGoogleContacts = async () => {
    try {
        const response = await window.gapi.client.people.people.connections.list({
            'resourceName': 'people/me',
            'pageSize': 100,
            'personFields': 'names,emailAddresses,phoneNumbers'
        });
        return response.result.connections || [];
    } catch (err) {
        console.error("Error fetching Google Contacts", err);
        return [];
    }
};

export const uploadToGoogleDrive = async (fileName: string, mimeType: string, content: string) => {
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const metadata = {
        'name': fileName,
        'mimeType': mimeType
    };

    const multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: ' + mimeType + '\r\n\r\n' +
        content +
        close_delim;

    try {
        const request = window.gapi.client.request({
            'path': 'https://www.googleapis.com/upload/drive/v3/files',
            'method': 'POST',
            'params': {'uploadType': 'multipart'},
            'headers': {
                'Content-Type': 'multipart/related; boundary="' + boundary + '"'
            },
            'body': multipartRequestBody
        });
        
        const response = await request;
        return response.result;
    } catch (err) {
        console.error("Error uploading to Google Drive", err);
        throw err;
    }
};

export const exportToGoogleSheets = async (spreadsheetId: string, range: string, values: any[][]) => {
    try {
        // If spreadsheetId is empty, create a new one
        let targetId = spreadsheetId;
        if (!targetId) {
            const createResponse = await window.gapi.client.sheets.spreadsheets.create({
                resource: {
                    properties: { title: `CTOS Export - ${new Date().toLocaleDateString()}` }
                }
            });
            targetId = createResponse.result.spreadsheetId;
        }

        const response = await window.gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: targetId,
            range: range,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: values
            }
        });
        
        return { success: true, spreadsheetId: targetId, result: response.result };
    } catch (err) {
        console.error("Error exporting to Google Sheets", err);
        throw err;
    }
};
