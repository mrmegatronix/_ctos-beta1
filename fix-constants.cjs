const fs = require('fs');
const path = require('path');

const constantsPath = path.join(__dirname, 'constants.ts');
let content = fs.readFileSync(constantsPath, 'utf8');

const stockItemRegex = /"name":\s*"([^"]+)\s\([^)]+\)"/g;
content = content.replace(stockItemRegex, '"name": "$1"');

const priceRegex = /"price":\s*([0-9.]+),/g;
content = content.replace(priceRegex, '"price": $1,\n    "status": "In Stock",');

fs.writeFileSync(constantsPath, content);
console.log('constants.ts updated successfully.');
