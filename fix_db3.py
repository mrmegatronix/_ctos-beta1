with open('services/database.ts', 'r') as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if line.strip().startswith("async getRecipes()"): skip = True
    if line.strip().startswith("async getEntertainment()"): skip = True
    if line.strip().startswith("async getStock()"): skip = True
    if line.strip().startswith("async getSuppliers()"): skip = True

    if skip and "}" in line:
        skip = False
        continue
    
    if not skip:
        new_lines.append(line)

with open('services/database.ts', 'w') as f:
    f.writelines(new_lines)
