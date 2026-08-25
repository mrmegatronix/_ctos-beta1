const fs = require('fs');
const path = require('path');

const constantsPath = path.join(__dirname, 'constants.ts');
let content = fs.readFileSync(constantsPath, 'utf8');

// The regex will look for " (1000ml Bottle)" or " (50000ml Keg)" or any "(...)" at the end of the name.
// Since some names have "(745ml Bottle)", we'll just match ` \([^)]+\)` at the end of the string.
const stockItemRegex = /"name":\s*"([^"]+)\s\([^)]+\)"/g;
content = content.replace(stockItemRegex, '"name": "$1"');

// We also need to add "status": "In Stock" to each item in INITIAL_STOCK.
// Let's parse INITIAL_STOCK and rewrite it properly if we can, or just do regex replacements.
// Let's do a regex to add "status": "In Stock" before "productType" or "price".
const priceRegex = /"price":\s*([0-9.]+),/g;
content = content.replace(priceRegex, '"price": $1,\n    "status": "In Stock",');

fs.writeFileSync(constantsPath, content);
console.log('constants.ts updated successfully.');
