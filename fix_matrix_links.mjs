import fs from 'fs';

const filePath = 'components/CTMatrixControlView.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Replace all external hrefs with # and an onClick
content = content.replace(/href="https:\/\/mrmegatronix\.github\.io[^"]*"/g, `href="#" onClick={(e) => { e.preventDefault(); alert('This external module is currently offline for maintenance.'); }}`);

fs.writeFileSync(filePath, content);
console.log('Fixed CTMatrixControlView links');
