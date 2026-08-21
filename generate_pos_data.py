import json
import os
import uuid

food_menu = [
    # PIZZA
    {"name": "Flat Bread", "price": 16.0, "category": "Pizza"},
    {"name": "Pepperoni Pizza", "price": 22.0, "category": "Pizza"},
    {"name": "Hawaiian Pizza", "price": 22.0, "category": "Pizza"},
    {"name": "Veggie Attack", "price": 22.0, "category": "Pizza"},
    {"name": "Meatlovers Pizza", "price": 25.0, "category": "Pizza"},
    {"name": "Cranberry Chicken", "price": 25.0, "category": "Pizza"},
    {"name": "The BBQ Grazier", "price": 25.0, "category": "Pizza"},

    # STARTERS
    {"name": "Fries", "price": 12.0, "category": "Starters"},
    {"name": "Mini Garlic Loaf", "price": 14.0, "category": "Starters"},
    {"name": "Jalapeno Bites", "price": 15.0, "category": "Starters"},
    {"name": "Wedges", "price": 16.0, "category": "Starters"},
    {"name": "Crumbed Camembert", "price": 18.0, "category": "Starters"},
    {"name": "Prawn Twisters", "price": 18.0, "category": "Starters"},
    {"name": "Pork Belly Bites", "price": 20.0, "category": "Starters"},
    {"name": "Chicken Poppers", "price": 20.0, "category": "Starters"},
    {"name": "Chilli Garlic Butter Prawns", "price": 21.0, "category": "Starters"},
    {"name": "Coaster's Basket", "price": 22.0, "category": "Starters"},
    {"name": "Nachos", "price": 25.0, "category": "Starters"},

    # BAO BUNS
    {"name": "Bao Buns", "price": 20.0, "category": "Bao Buns"},

    # BURGERS
    {"name": "Fish Burger", "price": 25.0, "category": "Burgers"},
    {"name": "Chicken Burger", "price": 25.0, "category": "Burgers"},
    {"name": "The Coaster's Burger", "price": 26.0, "category": "Burgers"},
    {"name": "Pork Belly Burger", "price": 27.0, "category": "Burgers"},
    {"name": "Peri Peri Burger", "price": 27.0, "category": "Burgers"},

    # SALADS
    {"name": "Roast Veggie Salad", "price": 22.0, "category": "Salads"},
    {"name": "Thai Salad", "price": 22.0, "category": "Salads"},
    {"name": "Pork Belly Salad", "price": 28.0, "category": "Salads"},

    # STEAKS
    {"name": "Rump", "price": 28.0, "category": "Steaks"},
    {"name": "Sirloin", "price": 32.0, "category": "Steaks"},
    {"name": "Surf 'n' Turf", "price": 40.0, "category": "Steaks"},

    # SIDES
    {"name": "Roast Root Veggies", "price": 7.5, "category": "Sides"},
    {"name": "Mash", "price": 7.5, "category": "Sides"},
    {"name": "2 Eggs", "price": 7.5, "category": "Sides"},
    {"name": "Greens", "price": 8.5, "category": "Sides"},
    {"name": "Mushrooms", "price": 8.5, "category": "Sides"},
    {"name": "Salad", "price": 8.5, "category": "Sides"},
    {"name": "Slaw", "price": 5.0, "category": "Sides"},
    {"name": "Mushroom Sauce", "price": 5.0, "category": "Sides"},
    {"name": "Plum Sauce", "price": 2.0, "category": "Sides"},
    {"name": "Sweet Chilli Sauce", "price": 2.0, "category": "Sides"},
    {"name": "Peppercorn Sauce", "price": 6.0, "category": "Sides"},
    {"name": "Blue Cheese Sauce", "price": 6.0, "category": "Sides"},
    {"name": "Sour Cream", "price": 5.0, "category": "Sides"},
    {"name": "Gravy", "price": 5.0, "category": "Sides"},
    {"name": "Garlic Butter", "price": 5.0, "category": "Sides"},

    # MAINS
    {"name": "Bangers & Mash", "price": 23.0, "category": "Mains"},
    {"name": "Cauli-Crunch", "price": 24.0, "category": "Mains"},
    {"name": "Seafood Chowder", "price": 25.0, "category": "Mains"},
    {"name": "Roast of the Day", "price": 28.0, "category": "Mains"},
    {"name": "Coasters Signature Pasta", "price": 29.0, "category": "Mains"},
    {"name": "Fish & Chips", "price": 30.0, "category": "Mains"},
    {"name": "Chicken Schnitzel", "price": 30.0, "category": "Mains"},
    {"name": "Chicken Toscana", "price": 34.0, "category": "Mains"},
    {"name": "Coaster's Ribs", "price": 30.0, "category": "Mains"},
    {"name": "Pork Belly", "price": 34.0, "category": "Mains"},
    {"name": "Fish of the Day", "price": 34.0, "category": "Mains"},
    {"name": "Chef's Beef Cheek", "price": 35.0, "category": "Mains"},

    # KIDS MENU
    {"name": "Kid's Platter", "price": 15.0, "category": "Kids"},
    {"name": "Kid's Pasta", "price": 15.0, "category": "Kids"},
    {"name": "Kid's Plate", "price": 15.0, "category": "Kids"},

    # DESSERTS
    {"name": "Ice Cream Sundae", "price": 13.0, "category": "Desserts"},
    {"name": "Cheesecake", "price": 15.0, "category": "Desserts"},
    {"name": "Chocolate Brownie", "price": 16.0, "category": "Desserts"},
    {"name": "Pistachio Tiramisu", "price": 16.0, "category": "Desserts"}
]

# Read new_menu.json for beverages
beverages = []
try:
    with open('new_menu.json', 'r') as f:
        beverages = json.load(f)
except Exception as e:
    print(f"Error reading new_menu.json: {e}")

# Format food items like the beverage items
formatted_food = []
for item in food_menu:
    formatted_food.append({
        "id": f"food-{str(uuid.uuid4())[:8]}",
        "name": item["name"],
        "description": "Food - " + item["category"],
        "price": item["price"],
        "category": item["category"],
        "allergens": [],
        "isAvailable": True
    })

combined = beverages + formatted_food

# Write to src/posData.ts
ts_content = "export interface POSMenuItem {\n  id: string;\n  name: string;\n  description?: string;\n  price: number;\n  category: string;\n  allergens?: string[];\n  isAvailable: boolean;\n  stockItemId?: string;\n  deductionMl?: number;\n}\n\n"
ts_content += f"export const POS_MENU: POSMenuItem[] = {json.dumps(combined, indent=2)};\n"
with open('posData.ts', 'w') as f:
    f.write(ts_content)

print("Created posData.ts with", len(combined), "items.")
