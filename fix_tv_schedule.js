const fs = require('fs');

const tvSchedule = [
  { id: 'tv-1', title: 'All Blacks vs Wallabies - Bledisloe Cup', channel: 'Sky Sport 1', startTime: new Date().setHours(19, 30, 0, 0), endTime: new Date().setHours(21, 30, 0, 0), sport: 'Rugby Union', isLive: true },
  { id: 'tv-2', title: 'NZ Warriors vs Penrith Panthers', channel: 'Sky Sport 4', startTime: new Date().setHours(20, 0, 0, 0), endTime: new Date().setHours(22, 0, 0, 0), sport: 'Rugby League', isLive: true },
  { id: 'tv-3', title: 'Crusaders vs Blues - Super Rugby Pacific', channel: 'Sky Sport 1', startTime: new Date().setHours(17, 0, 0, 0), endTime: new Date().setHours(19, 0, 0, 0), sport: 'Rugby Union', isLive: false },
  { id: 'tv-4', title: 'Wellington Phoenix vs Sydney FC', channel: 'Sky Sport 2', startTime: new Date().setHours(15, 0, 0, 0), endTime: new Date().setHours(17, 0, 0, 0), sport: 'Football', isLive: false },
  { id: 'tv-5', title: 'Black Caps vs Australia - T20 International', channel: 'Sky Sport 3', startTime: new Date().setHours(14, 0, 0, 0), endTime: new Date().setHours(18, 0, 0, 0), sport: 'Cricket', isLive: false },
];

let content = fs.readFileSync('constants.ts', 'utf8');

const replacement = `export const INITIAL_TV_SCHEDULE: TVScheduleItem[] = [
  { id: 'tv-1', title: 'All Blacks vs Wallabies - Bledisloe Cup', channel: 'Sky Sport 1', startTime: new Date(new Date().setHours(19, 30, 0, 0)).toISOString(), endTime: new Date(new Date().setHours(21, 30, 0, 0)).toISOString(), sport: 'Rugby Union', isLive: true },
  { id: 'tv-2', title: 'NZ Warriors vs Penrith Panthers', channel: 'Sky Sport 4', startTime: new Date(new Date().setHours(20, 0, 0, 0)).toISOString(), endTime: new Date(new Date().setHours(22, 0, 0, 0)).toISOString(), sport: 'Rugby League', isLive: true },
  { id: 'tv-3', title: 'Crusaders vs Blues - Super Rugby Pacific', channel: 'Sky Sport 1', startTime: new Date(new Date().setHours(17, 0, 0, 0)).toISOString(), endTime: new Date(new Date().setHours(19, 0, 0, 0)).toISOString(), sport: 'Rugby Union', isLive: false },
  { id: 'tv-4', title: 'Wellington Phoenix vs Sydney FC', channel: 'Sky Sport 2', startTime: new Date(new Date().setHours(15, 0, 0, 0)).toISOString(), endTime: new Date(new Date().setHours(17, 0, 0, 0)).toISOString(), sport: 'Football', isLive: false },
  { id: 'tv-5', title: 'Black Caps vs Australia - T20', channel: 'Sky Sport 3', startTime: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(), endTime: new Date(new Date().setHours(18, 0, 0, 0)).toISOString(), sport: 'Cricket', isLive: false },
];`;

content = content.replace(/export const INITIAL_TV_SCHEDULE.*?];/s, replacement);
fs.writeFileSync('constants.ts', content);
console.log('TV Schedule Updated');
