import os
import re

COMPONENTS_DIR = "components"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Backgrounds
    content = re.sub(r'bg-white\s+(dark:bg-slate-[0-9]+)?', 'glass-panel ', content)
    content = re.sub(r'bg-slate-50\s+(dark:bg-slate-[0-9]+)?', 'glass-panel ', content)
    content = re.sub(r'bg-slate-100\s+(dark:bg-slate-[0-9]+)?', 'glass-panel ', content)
    content = re.sub(r'bg-gray-50\s+(dark:bg-slate-[0-9]+)?', 'glass-panel ', content)
    
    # Drop "dark:bg-..." because glass-panel is already dark
    content = re.sub(r'dark:bg-slate-[0-9]+', '', content)
    
    # Text colors
    content = re.sub(r'text-gray-900', 'text-slate-50', content)
    content = re.sub(r'text-slate-900', 'text-slate-50', content)
    content = re.sub(r'text-gray-800', 'text-slate-100', content)
    content = re.sub(r'text-slate-800', 'text-slate-100', content)
    content = re.sub(r'text-gray-700', 'text-slate-200', content)
    content = re.sub(r'text-slate-700', 'text-slate-200', content)
    content = re.sub(r'text-gray-600', 'text-slate-300', content)
    content = re.sub(r'text-slate-600', 'text-slate-300', content)
    content = re.sub(r'text-gray-500', 'text-slate-400', content)
    content = re.sub(r'text-slate-500', 'text-slate-400', content)
    
    # Borders
    content = re.sub(r'border-gray-200', 'border-white/10', content)
    content = re.sub(r'border-slate-200', 'border-white/10', content)
    content = re.sub(r'border-gray-300', 'border-white/20', content)
    content = re.sub(r'border-slate-300', 'border-white/20', content)
    
    # Drop dark:border-...
    content = re.sub(r'dark:border-slate-[0-9]+', '', content)
    
    # Shadows
    content = re.sub(r'shadow-sm', 'shadow-lg', content)
    content = re.sub(r'shadow-md', 'shadow-xl', content)
    
    # Drop dark:text-... because everything is dark mode now
    content = re.sub(r'dark:text-slate-[0-9]+', '', content)
    content = re.sub(r'dark:text-gray-[0-9]+', '', content)
    content = re.sub(r'dark:text-white', '', content)

    # Clean up double spaces without destroying the code
    # We will just replace double spaces that are inside quotes
    # actually, just leave spaces, it's fine.
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for filename in os.listdir(COMPONENTS_DIR):
    if filename.endswith(".tsx") and filename != "DashboardView.tsx":
        process_file(os.path.join(COMPONENTS_DIR, filename))
        
