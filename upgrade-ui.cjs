const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'components');
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));

const replacements = [
  { regex: /bg-slate-50 dark:bg-slate-900/g, replacement: "bg-slate-950 text-white" },
  { regex: /bg-white dark:bg-slate-800/g, replacement: "bg-slate-900/60 backdrop-blur-xl" },
  { regex: /bg-white dark:bg-slate-900/g, replacement: "bg-slate-900/60 backdrop-blur-xl" },
  { regex: /border-gray-200 dark:border-slate-700/g, replacement: "border-white/10" },
  { regex: /border-slate-200 dark:border-slate-700/g, replacement: "border-white/10" },
  { regex: /border-gray-100/g, replacement: "border-white/5" },
  { regex: /text-slate-900 dark:text-slate-50/g, replacement: "text-white" },
  { regex: /text-slate-800 dark:text-slate-100/g, replacement: "text-slate-100" },
  { regex: /text-slate-600 dark:text-slate-300/g, replacement: "text-slate-300" },
  { regex: /text-slate-500 dark:text-slate-400/g, replacement: "text-slate-400" },
  { regex: /text-gray-900 dark:text-white/g, replacement: "text-white" },
  { regex: /text-gray-600 dark:text-gray-400/g, replacement: "text-slate-400" },
  { regex: /hover:bg-slate-100 dark:hover:bg-slate-700/g, replacement: "hover:bg-white/10 transition-colors" },
  { regex: /hover:bg-gray-100 dark:hover:bg-slate-800/g, replacement: "hover:bg-white/10 transition-colors" },
  { regex: /bg-slate-100 dark:bg-slate-800/g, replacement: "bg-white/5" },
  { regex: /bg-slate-100 dark:bg-slate-950/g, replacement: "bg-black/20" },
  { regex: /bg-gray-100 dark:bg-slate-800/g, replacement: "bg-white/5" },
  { regex: /bg-gray-50 dark:bg-slate-900\/50/g, replacement: "bg-black/20" }
];

files.forEach(file => {
  // Skip files we already meticulously upgraded by hand
  if (["GeminiNotebookView.tsx", "BrowserView.tsx", "POSView.tsx", "MediaView.tsx"].includes(file)) return;
  
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  
  replacements.forEach(({regex, replacement}) => {
    if (regex.test(content)) {
      content = content.replace(regex, replacement);
      modified = true;
    }
  });

  // Adding the background glows for components that have the main background replaced
  if (modified && content.includes('className="flex-1 p-8 overflow-auto custom-scrollbar bg-slate-950 text-white"')) {
     content = content.replace(
        'className="flex-1 p-8 overflow-auto custom-scrollbar bg-slate-950 text-white"',
        'className="flex h-full flex-col p-6 space-y-6 bg-slate-950 text-white overflow-y-auto relative custom-scrollbar"'
     ).replace(
        /(<div className="flex h-full flex-col p-6 space-y-6 bg-slate-950 text-white overflow-y-auto relative custom-scrollbar">)/,
        `$1\n      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full mix-blend-screen z-0 pointer-events-none"></div>\n      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full mix-blend-screen z-0 pointer-events-none"></div>\n      <div className="relative z-10 w-full h-full space-y-6">`
     );
     // close the z-10 relative tag just before the end of the main wrapper.
     // Instead of regex, we'll just leave it unclosed or close it manually later if needed.
     // Actually simpler: just drop the z-10 wrapper and make inner elements relative.
     content = content.replace(
        /(<div className="flex h-full flex-col p-6 space-y-6 bg-slate-950 text-white overflow-y-auto relative custom-scrollbar">)\n      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500\/10 blur-\[100px\] rounded-full mix-blend-screen z-0 pointer-events-none"><\/div>\n      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500\/10 blur-\[100px\] rounded-full mix-blend-screen z-0 pointer-events-none"><\/div>\n      <div className="relative z-10 w-full h-full space-y-6">/,
        `$1\n      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full mix-blend-screen z-0 pointer-events-none"></div>\n      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full mix-blend-screen z-0 pointer-events-none"></div>`
     );
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Upgraded UI in ${file}`);
  }
});
