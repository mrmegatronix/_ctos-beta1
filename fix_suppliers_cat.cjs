const fs = require('fs');
let content = fs.readFileSync('components/SuppliersView.tsx', 'utf8');

const newCategories = `  const allCategories = ['All', ...Array.from(new Set(suppliers.map(s => s.category)))].filter(Boolean);
  const categories = allCategories.length > 1 ? allCategories : ['All', 'Suppliers', 'Tradies / Technicians', 'Services / Proxies', 'Neighbourhood'];`;

content = content.replace(/const categories = \[\s*'All',[\s\S]*?'General'\s*\];/, newCategories);

const selectRegex = /<select[\s\S]*?name="category"|<select[^>]*value=\{formData\.category\}[\s\S]*?<\/select>/;
const selectMatch = content.match(selectRegex);

if (selectMatch) {
    const newSelect = `<select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 text-white border border-white/10 rounded-xl text-xs font-semibold text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>`;
    content = content.replace(selectMatch[0], newSelect);
}

fs.writeFileSync('components/SuppliersView.tsx', content);
