import csv
import json
import re

tsv_file = "ProductBulkUpdate_CoastersPackage_11_01_2026 - ProductBulkUpdate_CoastersPacka.tsv"

stock_items = []

with open(tsv_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter='\t')
    for row in reader:
        if not row.get('ProductID') or not row.get('ProductName'):
            continue
            
        try:
            price = float(row.get('GrossSellPrice', 0) or 0)
        except:
            price = 0
            
        try:
            cost = float(row.get('CostPricePerSKU', 0) or 0)
        except:
            cost = 0
            
        min_level = row.get('StockWarningLevel', '')
        if min_level and min_level.isdigit():
            minLevel = int(min_level)
        else:
            minLevel = 10
            
        item = {
            "id": str(row['ProductID']),
            "name": row['ProductName'],
            "category": row.get('ProductGroup', 'Uncategorized'),
            "quantity": 50,
            "unit": row.get('Measure', 'Each') or 'Each',
            "minLevel": minLevel,
            "price": price,
            "cost": cost,
            "productType": row.get('ProductType', 'Beverage'),
            "isDemo": False
        }
        stock_items.append(item)

js_array = "export const INITIAL_STOCK: StockItem[] = [\n"
for item in stock_items:
    js_array += f"  {json.dumps(item)},\n"
js_array += "];"

with open('constants.ts', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r"export const INITIAL_STOCK:\ StockItem\[\]\ =\ \[.*?\];"
new_content = re.sub(pattern, js_array, content, flags=re.DOTALL)

with open('constants.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"Successfully injected {len(stock_items)} items into constants.ts")
