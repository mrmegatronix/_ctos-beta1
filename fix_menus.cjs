const fs = require('fs');
let content = fs.readFileSync('constants.ts', 'utf8');

const replacement = `export const INITIAL_MENUS: any[] = [
  {
    id: 'menu-1',
    name: 'Winter Main Menu',
    category: 'Mains',
    items: [
      { id: 'item-1', name: 'Coasters Beef Burger', description: 'Angus beef patty, bacon, cheese, lettuce, tomato, beetroot, egg, onion rings, fries', price: 28, allergens: ['Gluten', 'Dairy', 'Egg'] },
      { id: 'item-2', name: 'Chicken Parmigiana', description: 'Crumbed chicken breast, Napoli sauce, ham, cheese, fries, salad', price: 29, allergens: ['Gluten', 'Dairy'] },
      { id: 'item-3', name: 'Beer Battered Fish & Chips', description: 'Fresh catch, tartare sauce, lemon, fries, salad', price: 27, allergens: ['Gluten', 'Fish'] },
      { id: 'item-4', name: 'Ribeye Steak 300g', description: 'Cooked to your liking with fries, salad and mushroom sauce', price: 39, allergens: ['Dairy'] },
    ]
  },
  {
    id: 'menu-2',
    name: 'Starters & Snacks',
    category: 'Starters',
    items: [
      { id: 'item-5', name: 'Garlic Bread', description: 'Toasted ciabatta with garlic & herb butter', price: 10, allergens: ['Gluten', 'Dairy'] },
      { id: 'item-6', name: 'Salt & Pepper Squid', description: 'Crispy squid with aioli', price: 16, allergens: ['Gluten', 'Egg', 'Seafood'] },
      { id: 'item-7', name: 'Wedges', description: 'With bacon, cheese, sour cream & sweet chili', price: 15, allergens: ['Gluten', 'Dairy'] },
    ]
  }
];
export const INITIAL_FILES: any[] = [];`;

content = content.replace(/export const INITIAL_FILES: any\[\] = \[\];/s, replacement);
fs.writeFileSync('constants.ts', content);
console.log('Menus Updated');
