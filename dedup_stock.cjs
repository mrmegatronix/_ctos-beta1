const fs = require('fs');

let constants = fs.readFileSync('constants.ts', 'utf8');

const stockStart = constants.indexOf('export const INITIAL_STOCK: StockItem[] = [');
const stockEnd = constants.indexOf('];', stockStart) + 2;

if (stockStart !== -1 && stockEnd !== -1) {
    const before = constants.slice(0, stockStart);
    let stockBlockStr = constants.slice(stockStart, stockEnd);
    const after = constants.slice(stockEnd);

    // Extract the array content
    let arrayStr = stockBlockStr.replace('export const INITIAL_STOCK: StockItem[] = ', '');
    // clean up any trailing semicolon if needed
    if (arrayStr.endsWith(';')) arrayStr = arrayStr.slice(0, -1);
    
    // Evaluate it safely since it's just JSON-like objects
    let stockArray;
    try {
        stockArray = eval(arrayStr);
    } catch(e) {
        console.error("Failed to eval", e);
        process.exit(1);
    }

    // Deduplicate by name (or id)
    const uniqueStock = [];
    const seen = new Set();
    for (const item of stockArray) {
        if (!seen.has(item.id)) {
            seen.add(item.id);
            uniqueStock.push(item);
        } else {
            // maybe we want to keep the one with larger price or unit?
            // for now just skip duplicates
        }
    }

    console.log(`Original: ${stockArray.length}, Unique: ${uniqueStock.length}`);

    // Reconstruct
    const newStockBlock = `export const INITIAL_STOCK: StockItem[] = [\n` + 
        uniqueStock.map(item => `  ${JSON.stringify(item)}`).join(',\n') +
        `\n];`;

    fs.writeFileSync('constants.ts', before + newStockBlock + after);
}

// Bump DB version again
let dbContent = fs.readFileSync('services/database.ts', 'utf8');
let currentVersion = dbContent.match(/const DB_VERSION = '([\d.]+)';/)[1];
let nextVersion = (parseFloat(currentVersion) + 0.1).toFixed(1);
dbContent = dbContent.replace(/const DB_VERSION = '[\d.]+';/, `const DB_VERSION = '${nextVersion}';`);
fs.writeFileSync('services/database.ts', dbContent);
console.log(`DB bumped to ${nextVersion}`);
