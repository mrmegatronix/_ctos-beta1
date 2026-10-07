const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

const regex = /\{\/\* Financials & POS \*\/\}([\s\S]*?)<\/div>\n\s*\{\/\* Events & Bookings \*\/\}/;
const match = content.match(regex);

if (match) {
    const blockToMove = match[1] + '</div>\n\n                ';
    content = content.replace(match[0], '{/* Events & Bookings */}');
    const targetRegex = /(\{\/\* System & Master Admin \*\/\})/;
    content = content.replace(targetRegex, `{/* Financials & POS */}${blockToMove}$1`);
    fs.writeFileSync('App.tsx', content);
    console.log('Moved Financials & POS to bottom of Office nav');
} else {
    console.log('Could not find Financials & POS block');
}
