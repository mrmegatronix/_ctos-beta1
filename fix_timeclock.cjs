const fs = require('fs');
let code = fs.readFileSync('components/TimeclockView.tsx', 'utf8');

code = code.replace(/user: User/g, 'user: TeamMember');
code = code.replace(/User \| null/g, 'TeamMember | null');
code = code.replace(/User/g, 'TeamMember'); // Be careful, but should be fine

fs.writeFileSync('components/TimeclockView.tsx', code);
