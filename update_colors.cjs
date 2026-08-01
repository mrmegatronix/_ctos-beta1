const fs = require('fs');

let tvCode = fs.readFileSync('components/TVScheduleView.tsx', 'utf8');

// The user wants sports and events to be color-coded as stated in the CSV file.
// The CSV has "Accent Hex Colour" column.
// Super Rugby: #ff0000 (red)
// NRL: #00ff00 (green)
// Karaoke / Music: #800080 (purple)
// Band: #ffa500 (orange)
// Weekly Event: #eab308 (yellow)
// Weekly Special: #f97316 (orange) or #3b82f6 (blue)

// Let's add a helper function to get color based on sport/event name.
const colorHelper = `
  const getEventColor = (sport: string, match: string) => {
    const s = (sport + ' ' + match).toLowerCase();
    if (s.includes('super rugby') || s.includes('crusaders')) return '#ff0000';
    if (s.includes('nrl') || s.includes('warriors')) return '#00ff00';
    if (s.includes('karaoke')) return '#800080';
    if (s.includes('band')) return '#ffa500';
    if (s.includes('quiz') || s.includes('weekly event')) return '#eab308';
    if (s.includes('special') || s.includes('burger')) return '#f97316';
    return '#3b82f6'; // default blue
  };
`;

// Insert the helper function
tvCode = tvCode.replace('const getChannelColor', colorHelper + '\n  const getChannelColor');

// Apply the color to the border or text of the event.
// Let's change the border color of the card.
// Original: className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm  rounded-xl border border-gray-200 dark:border-slate-700  p-4 shadow-lg hover:shadow-xl transition-shadow flex flex-col md:flex-row items-center gap-4"
tvCode = tvCode.replace(/className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm  rounded-xl border border-gray-200 dark:border-slate-700  p-4 shadow-lg hover:shadow-xl transition-shadow flex flex-col md:flex-row items-center gap-4"/g, 
  'className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border-l-4 p-4 shadow-lg hover:shadow-xl transition-shadow flex flex-col md:flex-row items-center gap-4" style={{ borderLeftColor: getEventColor(item.sport, item.match) }}"');

fs.writeFileSync('components/TVScheduleView.tsx', tvCode);
