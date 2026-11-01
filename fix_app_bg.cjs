const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

const newContainerClasses = `  // Determine dynamic container classes
  let bgClass = "bg-gray-50 dark:bg-[#0B0F19]";
  if (appMode === 'FOH') bgClass = "bg-slate-100 dark:bg-indigo-950/40";
  if (appMode === 'BOH') bgClass = "bg-slate-100 dark:bg-emerald-950/30";
  const containerClasses = \`flex h-screen print:h-auto flex-col transition-colors duration-300 relative overflow-hidden \${bgClass} text-gray-900 dark:text-white\`;`;

content = content.replace(/const containerClasses = "flex h-screen.*?text-white";/, newContainerClasses);

fs.writeFileSync('App.tsx', content);
