const fs = require('fs');
let constants = fs.readFileSync('constants.ts', 'utf8');

// Use a regex specifically targeting INITIAL_STOCK
// Since INITIAL_STOCK is a large array of objects, we can just replace "quantity": \d+ with "quantity": 0 in that block.
const stockStart = constants.indexOf('export const INITIAL_STOCK: StockItem[] = [');
const stockEnd = constants.indexOf('];', stockStart);

if (stockStart !== -1 && stockEnd !== -1) {
    const before = constants.slice(0, stockStart);
    let stockBlock = constants.slice(stockStart, stockEnd);
    const after = constants.slice(stockEnd);

    // Replace all "quantity": <number> with "quantity": 0
    stockBlock = stockBlock.replace(/"quantity":\s*\d+/g, '"quantity": 0');

    fs.writeFileSync('constants.ts', before + stockBlock + after);
    console.log("Stock quantities reset to 0 in constants.ts");
} else {
    console.log("Could not find INITIAL_STOCK array");
}

// Bump DB version again so it takes effect
let dbContent = fs.readFileSync('services/database.ts', 'utf8');
let currentVersion = dbContent.match(/const DB_VERSION = '([\d.]+)';/)[1];
let nextVersion = (parseFloat(currentVersion) + 0.1).toFixed(1);
dbContent = dbContent.replace(/const DB_VERSION = '[\d.]+';/, `const DB_VERSION = '${nextVersion}';`);
fs.writeFileSync('services/database.ts', dbContent);
console.log(`DB_VERSION bumped to ${nextVersion}`);
