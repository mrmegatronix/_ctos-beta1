const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

const regex = /\s*{\/\* Financials & POS \*\/}[\s\S]*?<\/div>[\s\S]*?<\/div>\n\n/;
const match = content.match(regex);

if (match) {
    content = content.replace(match[0], '');
    const targetRegex = /(\s*{\/\* System & Master Admin \*\/})/;
    const replacement = `\n\n${match[0].trim()}\n\n$1`;
    content = content.replace(targetRegex, replacement);
    fs.writeFileSync('App.tsx', content);
    console.log('Moved Financials & POS');
} else {
    console.log('Could not find Financials & POS block');
}
