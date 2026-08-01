const fs = require('fs');

let cCode = fs.readFileSync('constants.ts', 'utf8');

// The avatars for Nikko is 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop'
cCode = cCode.replace(/'https:\/\/images\.unsplash\.com[^']*'/g, "''");

fs.writeFileSync('constants.ts', cCode);
