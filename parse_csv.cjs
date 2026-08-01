const fs = require('fs');

const csv = fs.readFileSync('test.csv', 'utf8');
const lines = csv.split('\n');
const headers = lines[0].split(',').map(h => h.trim());

let events = [];
let eventId = 1;

for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    // Quick and dirty CSV split (handles simple quotes if no internal commas)
    // Actually, some rows have quotes with internal commas like "Apollo Projects, Chch"
    // Let's use a regex to split properly
    const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
    // Or just a proper parse
    let cells = [];
    let inQuotes = false;
    let currentCell = '';
    for (let c = 0; c < lines[i].length; c++) {
        const char = lines[i][c];
        if (char === '"' && lines[i][c+1] === '"') {
            currentCell += '"';
            c++;
        } else if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            cells.push(currentCell.trim());
            currentCell = '';
        } else {
            currentCell += char;
        }
    }
    cells.push(currentCell.trim());

    // Date (03/04/2026), Day, Event Type, Event Name, Details, ... Time (7:05 pm)
    let dateStr = cells[0];
    let eventType = cells[2];
    let eventName = cells[3];
    let details = cells[4];
    let timeStr = cells[6];

    if (!dateStr || !eventName) continue;

    const [dd, mm, yyyy] = dateStr.split('/');
    if (!yyyy) continue;
    
    let hour = 12;
    let min = 0;
    if (timeStr) {
        timeStr = timeStr.replace(/[^0-9:a-pm]/gi, '').toLowerCase(); // remove ~ etc
        let pm = timeStr.includes('pm');
        let parts = timeStr.replace(/[a-pm]/gi, '').split(':');
        if (parts[0]) {
            hour = parseInt(parts[0], 10);
            if (pm && hour !== 12) hour += 12;
            if (!pm && hour === 12) hour = 0;
            if (parts[1]) {
                min = parseInt(parts[1], 10);
            }
        }
    }

    let typeMapped = 'Sport';
    if (eventType.includes('Band')) typeMapped = 'Band';
    else if (eventType.includes('Karaoke')) typeMapped = 'DJ'; // Map to DJ or Band
    else if (eventType.includes('Quiz')) typeMapped = 'Quiz';
    else if (eventType.includes('Weekly Event')) typeMapped = 'Quiz'; // or whatever
    else if (eventType.includes('Weekly Special')) continue; // Skip food specials for entertainment

    events.push({
        id: `ent-${eventId++}`,
        title: eventName,
        type: typeMapped,
        date: new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd), hour, min),
        description: details || '',
        performerName: eventName,
        status: 'confirmed'
    });
}

let constants = fs.readFileSync('constants.ts', 'utf8');
const replaceRegex = /export const INITIAL_ENTERTAINMENT: EntertainmentEvent\[\] = \[.*?\];/s;
const newStr = `export const INITIAL_ENTERTAINMENT: EntertainmentEvent[] = [\n${events.map(e => `  { id: "${e.id}", title: ${JSON.stringify(e.title)}, type: "${e.type}", date: new Date(${e.date.getFullYear()}, ${e.date.getMonth()}, ${e.date.getDate()}, ${e.date.getHours()}, ${e.date.getMinutes()}), description: ${JSON.stringify(e.description)}, performerName: ${JSON.stringify(e.performerName)}, status: "${e.status}" }`).join(',\n')}\n];`;

if (replaceRegex.test(constants)) {
    constants = constants.replace(replaceRegex, newStr);
} else {
    console.log("Could not find INITIAL_ENTERTAINMENT to replace.");
}

fs.writeFileSync('constants.ts', constants);

// Bump DB version
let dbContent = fs.readFileSync('services/database.ts', 'utf8');
let currentVersion = dbContent.match(/const DB_VERSION = '([\d.]+)';/)[1];
let nextVersion = (parseFloat(currentVersion) + 0.1).toFixed(1);
dbContent = dbContent.replace(/const DB_VERSION = '[\d.]+';/, `const DB_VERSION = '${nextVersion}';`);
fs.writeFileSync('services/database.ts', dbContent);

console.log(`Parsed ${events.length} events. DB version bumped to ${nextVersion}`);
