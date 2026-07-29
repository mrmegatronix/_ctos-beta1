import re

with open('services/database.ts', 'r') as f:
    content = f.read()

# Add missing get/save functions before the end of the class

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
    # insert before the last brace
    content = content.rstrip()
    if content.endswith('}'):
        content = content[:-1] + functions_to_add + '\n}\n'
        with open('services/database.ts', 'w') as f:
            f.write(content)
        print("Updated database.ts")
    else:
        print("Failed to find end of class")
else:
    print("Already added")
