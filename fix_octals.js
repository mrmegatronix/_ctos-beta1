const fs = require('fs');
let content = fs.readFileSync('constants.ts', 'utf8');

content = content.replace(/new Date\(([^)]+)\)/g, (match, args) => {
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

fs.writeFileSync('constants.ts', content);
console.log('Done.');
