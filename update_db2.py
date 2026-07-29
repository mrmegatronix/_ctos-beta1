import re

with open('services/database.ts', 'r') as f:
    content = f.read()

functions_to_add = """
  async getRecipes(): Promise<Recipe[]> {
    return this.loadCollection<Recipe>(COLLECTIONS.RECIPES);
  }
  async saveRecipe(recipe: Recipe): Promise<void> {
    await this.upsert(COLLECTIONS.RECIPES, recipe);
  }
  
  async getEntertainment(): Promise<EntertainmentEvent[]> {
    return this.loadCollection<EntertainmentEvent>(COLLECTIONS.ENTERTAINMENT);
  }
  async saveEntertainment(event: EntertainmentEvent): Promise<void> {
    await this.upsert(COLLECTIONS.ENTERTAINMENT, event);
  }
  
  async getStock(): Promise<StockItem[]> {
    return this.loadCollection<StockItem>(COLLECTIONS.STOCK);
  }
  async saveStock(item: StockItem): Promise<void> {
    await this.upsert(COLLECTIONS.STOCK, item);
  }
  
  async getSuppliers(): Promise<Supplier[]> {
    return this.loadCollection<Supplier>(COLLECTIONS.SUPPLIERS);
  }
  async saveSupplier(supplier: Supplier): Promise<void> {
    await this.upsert(COLLECTIONS.SUPPLIERS, supplier);
  }
"""

if "saveEntertainment" not in content:
    content = content.replace("export const db = new DatabaseService();", functions_to_add + "\n}\n\nexport const db = new DatabaseService();")
    # Clean up the extra brace we just pushed down, we actually need to insert before the last brace of the class.
    # Actually, the replace above puts it OUTSIDE the class. Let's do a better replace.
    
    # Find the last '}' before 'export const db'
    idx = content.rfind('}', 0, content.find('export const db'))
    if idx != -1:
        content = content[:idx] + functions_to_add + content[idx:]
        with open('services/database.ts', 'w') as f:
            f.write(content)
        print("Updated database.ts")
    else:
        print("Could not find insertion point")
