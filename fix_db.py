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

# The last brace of the class is right before "export const db ="
idx = content.rfind('}', 0, content.find('export const db ='))
if idx != -1:
    content = content[:idx] + functions_to_add + content[idx:]
    with open('services/database.ts', 'w') as f:
        f.write(content)
    print("Fixed database.ts")
else:
    print("Failed to find insertion point")
