import os
import re

files_to_update = {
    'components/SuppliersView.tsx': {
        'interface': 'Supplier',
        'fields': "id: `sup-${Date.now()}`, name: name || 'New Supplier', contactPerson: '', email: '', phone: '', address: '', category: 'General', website: ''",
        'title': 'Add Supplier'
    },
    'components/StockView.tsx': {
        'interface': 'StockItem',
        'fields': "id: `stk-${Date.now()}`, name: name || 'New Item', category: 'General', quantity: 0, unit: 'pcs', minLevel: 0, cost: 0, supplierId: ''",
        'title': 'Add Stock Item'
    },
    'components/RecipesView.tsx': {
        'interface': 'Recipe',
        'fields': "id: `rec-${Date.now()}`, name: name || 'New Recipe', category: 'Food', ingredients: [], method: '', prepTime: 0, cost: 0, price: 0",
        'title': 'Add Recipe'
    },
    'components/EntertainmentView.tsx': {
        'interface': 'EntertainmentEvent',
        'fields': "id: `ent-${Date.now()}`, title: name || 'New Event', type: 'Band', date: new Date(), description: '', performerName: '', status: 'pending', cost: 0",
        'title': 'Add Event'
    }
}

for filepath, info in files_to_update.items():
    with open(filepath, 'r') as f:
        content = f.read()

    # Add onSave prop
    if 'onSave?: (' not in content:
        content = content.replace(f"  {info['interface'].lower()}s?: {info['interface']}[];\n}}", f"  {info['interface'].lower()}s?: {info['interface']}[];\n  onSave?: (item: {info['interface']}) => void;\n}}")
        content = content.replace(f"interface {filepath.split('/')[-1].split('.')[0]}Props {{\n", f"interface {filepath.split('/')[-1].split('.')[0]}Props {{\n  onSave?: (item: {info['interface']}) => void;\n")
        
        # Add onSave to signature
        content = re.sub(r'const (\w+): React\.FC<([^>]+)> = \(\{\s*([^\}]+)\s*\}\) => \{', r'const \1: React.FC<\2> = ({ \3, onSave }) => {', content)
        
        # Inject the mock modal logic
        injection = f"""
  const handleAdd = () => {{
      const name = window.prompt("Enter {info['title']} Name (Basic entry mode):");
      if (name && onSave) {{
          onSave({{
              {info['fields']}
          }} as any);
      }}
  }};
"""
        # find where to put handleAdd (after the signature {)
        sig_match = re.search(r'const (\w+): React\.FC<([^>]+)> = \(\{\s*([^\}]+)\s*\}\) => \{', content)
        if sig_match:
            idx = sig_match.end()
            content = content[:idx] + injection + content[idx:]
        
        # hook up the button
        content = re.sub(r'<button([^>]*)>(\s*Add\s+[^<]+)</button>', r'<button\1 onClick={handleAdd}>\2</button>', content)
        
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

