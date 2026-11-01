import React, { useState } from 'react';
import { Menu, MenuItem, Allergen, STANDARD_ALLERGENS } from '../types';
import { generateId } from '../utils';
import { Search, Plus, Edit2, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';

interface MenuViewProps {
  menus: Menu[];
  onSaveMenu: (menu: Menu) => void;
  onDeleteMenu: (id: string) => void;
}

const MenuView: React.FC<MenuViewProps> = ({ menus, onSaveMenu, onDeleteMenu }) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(menus.length > 0 ? menus[0].id : null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isEditingMenuTitle, setIsEditingMenuTitle] = useState(false);
  const [menuTitleInput, setMenuTitleInput] = useState('');
  const [activePdfUrl, setActivePdfUrl] = useState<string | null>(null);
  const [allergenFilter, setAllergenFilter] = useState<string | null>(null);

  const pdfMenus = [
    { id: 'pdf-main', title: '📄 Main Menu (PDF)', url: '/ct-matrix/_menus/Coasters-Tavern_Main-Menu.pdf' },
    { id: 'pdf-lunch', title: '📄 Lunch Menu (PDF)', url: '/ct-matrix/_menus/Coasters-Tavern_Lunch-Menu.pdf' }
  ];

  const activeMenu = menus.find(m => m.id === activeMenuId) || menus[0];

  const handleAddMenu = () => {
      const newMenu: Menu = {
          id: generateId(),
          title: 'New Menu',
          isActive: false,
          items: []
      };
      onSaveMenu(newMenu);
      setActiveMenuId(newMenu.id);
      setActivePdfUrl(null);
  };

  const handleSaveMenuTitle = () => {
      if (activeMenu && menuTitleInput.trim()) {
          onSaveMenu({ ...activeMenu, title: menuTitleInput });
      }
      setIsEditingMenuTitle(false);
  };

  const handleAddItem = () => {
      setEditingItem({
          id: generateId(),
          name: '',
          description: '',
          price: 0,
          category: 'Mains',
          allergens: [],
          isAvailable: true
      });
  };

  const handleSaveItem = () => {
      if (!activeMenu || !editingItem) return;
      
      const itemExists = activeMenu.items.some(i => i.id === editingItem.id);
      const updatedItems = itemExists 
          ? activeMenu.items.map(i => i.id === editingItem.id ? editingItem : i)
          : [...activeMenu.items, editingItem];

      onSaveMenu({ ...activeMenu, items: updatedItems });
      setEditingItem(null);
  };

  const handleDeleteItem = (itemId: string) => {
      if (!activeMenu) return;
      onSaveMenu({
          ...activeMenu,
          items: activeMenu.items.filter(i => i.id !== itemId)
      });
  };

  const toggleItem86 = (item: MenuItem) => {
      if (!activeMenu) return;
      const updatedItems = activeMenu.items.map(i => i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i);
      onSaveMenu({ ...activeMenu, items: updatedItems });
  };

  const toggleAllergen = (allergenId: string) => {
      if (!editingItem) return;
      const has = editingItem.allergens.includes(allergenId);
      if (has) {
          setEditingItem({ ...editingItem, allergens: editingItem.allergens.filter(id => id !== allergenId) });
      } else {
          setEditingItem({ ...editingItem, allergens: [...editingItem.allergens, allergenId] });
      }
  };

  const getAllergenNames = (ids: string[]) => {
      return ids.map(id => STANDARD_ALLERGENS.find(a => a.id === id)?.name || id).join(', ');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-white overflow-hidden">
      
      {/* Top Bar for Menu Selection */}
      <div className="bg-slate-900/60 backdrop-blur-xl border-b border-white/10 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-x-auto">
              {menus.map(menu => (
                  <button 
                      key={menu.id}
                      onClick={() => { setActiveMenuId(menu.id); setActivePdfUrl(null); }}
                      className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${!activePdfUrl && activeMenuId === menu.id ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-white/10 transition-colors'}`}
                  >
                      {menu.title}
                  </button>
              ))}
              <div className="h-6 w-px bg-white/10 mx-2 shrink-0" />
              {pdfMenus.map(pdf => (
                  <button
                      key={pdf.id}
                      onClick={() => setActivePdfUrl(pdf.url)}
                      className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${activePdfUrl === pdf.url ? 'bg-amber-600 text-white' : 'text-amber-300/80 hover:bg-amber-500/10 border border-amber-500/20'}`}
                  >
                      {pdf.title}
                  </button>
              ))}
              <button onClick={handleAddMenu} className="p-2 text-slate-400 hover:text-indigo-400 bg-white/5 rounded-lg shrink-0">
                  <Plus className="w-5 h-5" />
              </button>
          </div>
          
          {!activePdfUrl && activeMenu && (
              <div className="flex items-center space-x-3">
                  <span className="text-sm text-slate-500">Status:</span>
                  <button 
                      onClick={() => onSaveMenu({...activeMenu, isActive: !activeMenu.isActive})}
                      className={`flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${activeMenu.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}
                  >
                      {activeMenu.isActive ? 'LIVE MENU' : 'DRAFT'}
                  </button>
              </div>
          )}
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar p-8">
          {activePdfUrl ? (
              <div className="h-full flex flex-col max-w-6xl mx-auto">
                  <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold text-white">{pdfMenus.find(p => p.url === activePdfUrl)?.title}</h2>
                      <a href={activePdfUrl} target="_blank" rel="noreferrer" className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold rounded-lg transition-colors">
                          Open Fullscreen PDF
                      </a>
                  </div>
                  <div className="flex-1 bg-slate-900 rounded-xl border border-white/10 overflow-hidden min-h-[650px]">
                      <iframe src={activePdfUrl} className="w-full h-full min-h-[650px]" title="Menu PDF Viewer" />
                  </div>
              </div>
          ) : activeMenu ? (
              <div className="max-w-5xl mx-auto">
                  
                  <div className="flex justify-between items-center mb-6">
                      {isEditingMenuTitle ? (
                          <div className="flex items-center space-x-3">
                              <input 
                                  type="text"
                                  className="text-3xl font-bold bg-slate-900/60 backdrop-blur-xl border border-gray-300 dark:border-slate-600 rounded px-3 py-1 outline-none text-white"
                                  value={menuTitleInput}
                                  onChange={e => setMenuTitleInput(e.target.value)}
                                  autoFocus
                              />
                              <button onClick={handleSaveMenuTitle} className="p-2 bg-indigo-600 text-white rounded"><CheckCircle2 className="w-5 h-5"/></button>
                          </div>
                      ) : (
                          <div className="flex items-center space-x-3 group">
                              <h2 className="text-3xl font-bold text-white">{activeMenu.title}</h2>
                              <button 
                                  onClick={() => { setMenuTitleInput(activeMenu.title); setIsEditingMenuTitle(true); }}
                                  className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-indigo-600 transition-opacity"
                              >
                                  <Edit2 className="w-4 h-4" />
                              </button>
                          </div>
                      )}
                      
                      <button onClick={handleAddItem} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-colors">
                          <Plus className="w-5 h-5 mr-2" /> Add Item
                      </button>
                  </div>

                  {/* Quick Allergen Filter Bar for FOH & BOH */}
                  <div className="mb-6 bg-slate-900/60 border border-white/10 rounded-xl p-4 flex items-center flex-wrap gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2 flex items-center">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mr-1.5" /> Exclude Allergen:
                      </span>
                      <button
                          onClick={() => setAllergenFilter(null)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${!allergenFilter ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                      >
                          Show All
                      </button>
                      {STANDARD_ALLERGENS.map(a => (
                          <button
                              key={a.id}
                              onClick={() => setAllergenFilter(allergenFilter === a.id ? null : a.id)}
                              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${allergenFilter === a.id ? 'bg-red-600 text-white ring-2 ring-red-400/50' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                          >
                              No {a.name}
                          </button>
                      ))}
                  </div>

                  <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl shadow-sm overflow-hidden">
                      <table className="w-full text-left">
                          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-white/10 text-xs uppercase text-slate-400">
                              <tr>
                                  <th className="px-6 py-4">Item Name</th>
                                  <th className="px-6 py-4">Category</th>
                                  <th className="px-6 py-4">Price</th>
                                  <th className="px-6 py-4">Allergens</th>
                                  <th className="px-6 py-4">Status</th>
                                  <th className="px-6 py-4 text-right">Actions</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                              {activeMenu.items
                                .filter(item => !allergenFilter || !item.allergens.includes(allergenFilter))
                                .map(item => (
                                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                                      <td className="px-6 py-4">
                                          <div className="font-bold text-white flex items-center">
                                              <span className={!item.isAvailable ? 'line-through text-slate-500' : ''}>{item.name}</span>
                                              {!item.isAvailable && <span className="ml-2 px-2 py-0.5 bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-black rounded uppercase">86'd</span>}
                                          </div>
                                          <div className="text-sm text-slate-400 truncate max-w-xs">{item.description}</div>
                                      </td>
                                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{item.category}</td>
                                      <td className="px-6 py-4 font-semibold text-white">${item.price.toFixed(2)}</td>
                                      <td className="px-6 py-4">
                                          {item.allergens.length > 0 ? (
                                              <div className="flex items-center text-amber-600 dark:text-amber-400 text-sm" title={getAllergenNames(item.allergens)}>
                                                  <AlertTriangle className="w-4 h-4 mr-1.5 shrink-0" /> 
                                                  <span className="truncate max-w-[160px]">{getAllergenNames(item.allergens)}</span>
                                              </div>
                                          ) : (
                                              <span className="text-sm text-emerald-400/70">Allergen Free</span>
                                          )}
                                      </td>
                                      <td className="px-6 py-4">
                                          <button
                                              onClick={() => toggleItem86(item)}
                                              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${item.isAvailable ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30' : 'bg-red-600 text-white border-red-500 hover:bg-emerald-600'}`}
                                          >
                                              {item.isAvailable ? 'In Stock' : "86'd (Tap to Restore)"}
                                          </button>
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                          <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                              <button onClick={() => setEditingItem(item)} className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"><Edit2 className="w-4 h-4"/></button>
                                              <button onClick={() => handleDeleteItem(item.id)} className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400"><Trash2 className="w-4 h-4"/></button>
                                          </div>
                                      </td>
                                  </tr>
                              ))}
                              {activeMenu.items.length === 0 && (
                                  <tr>
                                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                          This menu is empty. Add items to get started.
                                      </td>
                                  </tr>
                              )}
                          </tbody>
                      </table>
                  </div>

              </div>
          ) : (
              <div className="flex h-full items-center justify-center text-slate-400">
                  Select or create a menu to begin.
              </div>
          )}
      </div>

      {/* Edit Item Modal */}
      {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
              <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
                      <h3 className="text-xl font-bold text-white">{editingItem.id.startsWith('menu') ? 'Edit Item' : 'New Menu Item'}</h3>
                  </div>
                  <div className="p-6 space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                          <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Item Name</label>
                              <input 
                                  type="text" 
                                  className="w-full px-4 py-2 bg-slate-950 text-white border border-white/10 rounded-lg outline-none"
                                  value={editingItem.name}
                                  onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                              />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-sm font-medium text-slate-300 mb-1">Price ($)</label>
                                  <input 
                                      type="number" 
                                      className="w-full px-4 py-2 bg-slate-950 text-white border border-white/10 rounded-lg outline-none"
                                      value={editingItem.price || ''}
                                      onChange={e => setEditingItem({...editingItem, price: parseFloat(e.target.value) || 0})}
                                  />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                                  <select 
                                      className="w-full px-4 py-2 bg-slate-950 text-white border border-white/10 rounded-lg outline-none"
                                      value={editingItem.category}
                                      onChange={e => setEditingItem({...editingItem, category: e.target.value})}
                                  >
                                      <option value="Starters">Starters</option>
                                      <option value="Mains">Mains</option>
                                      <option value="Desserts">Desserts</option>
                                      <option value="Sides">Sides</option>
                                      <option value="Beverages">Beverages</option>
                                  </select>
                              </div>
                          </div>
                      </div>
                      
                      <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Description (for printed menu)</label>
                          <textarea 
                              className="w-full px-4 py-2 bg-slate-950 text-white border border-white/10 rounded-lg outline-none min-h-[80px]"
                              value={editingItem.description}
                              onChange={e => setEditingItem({...editingItem, description: e.target.value})}
                          />
                      </div>

                      <div className="border-t border-white/10 pt-6">
                          <h4 className="text-sm font-bold text-white mb-3 flex items-center">
                              <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />
                              Allergen Tags (Food & Beverage)
                          </h4>
                          <div className="flex flex-wrap gap-2">
                              {STANDARD_ALLERGENS.map(allergen => (
                                  <button
                                      key={allergen.id}
                                      onClick={() => toggleAllergen(allergen.id)}
                                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                                          editingItem.allergens.includes(allergen.id) 
                                              ? 'bg-amber-500/20 border-amber-500 text-amber-300' 
                                              : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                                      }`}
                                  >
                                      {allergen.name}
                                  </button>
                              ))}
                          </div>
                      </div>

                      <div className="flex items-center pt-2">
                          <input 
                              type="checkbox"
                              id="isAvailable"
                              checked={editingItem.isAvailable}
                              onChange={e => setEditingItem({...editingItem, isAvailable: e.target.checked})}
                              className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                          />
                          <label htmlFor="isAvailable" className="ml-2 text-sm font-medium text-slate-300">
                              Item is currently available (uncheck to 86)
                          </label>
                      </div>

                  </div>
                  <div className="px-6 py-4 bg-slate-950 text-white border-t border-white/10 flex justify-end space-x-3">
                      <button onClick={() => setEditingItem(null)} className="px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-lg">Cancel</button>
                      <button onClick={handleSaveItem} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save Item</button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default MenuView;
