const fs = require('fs');

// 1. Fix database.ts version
let dbContent = fs.readFileSync('services/database.ts', 'utf8');
dbContent = dbContent.replace(/const DB_VERSION = '[\d.]+';/, "const DB_VERSION = '1.9';");
fs.writeFileSync('services/database.ts', dbContent);

// 2. Fix constants.ts octals and append missing lines
let constants = fs.readFileSync('constants.ts', 'utf8');

// Fix octal dates: new Date(2026, 7, 06, 23, 30) -> new Date(2026, 7, 6, 23, 30)
constants = constants.replace(/new Date\(([^)]+)\)/g, (match, args) => {
    const newArgs = args.split(',').map(arg => {
        let trimmed = arg.trim();
        // Replace leading zeros but not for a single zero
        if (/^0[0-9]+$/.test(trimmed)) {
            return trimmed.replace(/^0+/, '');
        }
        return trimmed;
    }).join(', ');
    return `new Date(${newArgs})`;
});

// If the file is missing INITIAL_FILES, append the missing exports
if (!constants.includes('INITIAL_FILES')) {
    constants += `\nexport const INITIAL_ORDERS: any[] = [];\nexport const INITIAL_TIME_PUNCHES: any[] = [];\nexport const INITIAL_BUDGETS: any[] = [];\nexport const SOCIAL_LINKS = [];\nexport const HOURS: number[] = Array.from({ length: 24 }, (_, i) => i);\nexport const INITIAL_FILES: any[] = [];\n`;
}

fs.writeFileSync('constants.ts', constants);
console.log('Fixed files successfully.');
