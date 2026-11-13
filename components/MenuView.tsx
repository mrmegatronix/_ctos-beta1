import React, { useState, useMemo } from 'react';
import { Menu, MenuItem, STANDARD_ALLERGENS, STANDARD_DIETARY_OPTIONS } from '../types';
import { generateId } from '../utils';
import { Search, Plus, Edit2, Trash2, CheckCircle2, AlertTriangle, Grid, List, ShieldCheck, X } from 'lucide-react';

interface MenuViewProps {
  menus: Menu[];
  defaultMatrixMode?: boolean;
  onSaveMenu: (menu: Menu) => void;
  onDeleteMenu: (id: string) => void;
}

const MATRIX_ALLERGENS = STANDARD_ALLERGENS.filter(a => a.id !== 'sulphites' && a.id !== 'alcohol');

const SHORT_ALLERGEN_LABELS: Record<string, string> = {
  wheat: 'Gluten',
  dairy: 'Dairy',
  eggs: 'Eggs',
  garlic: 'Garlic',
  onion: 'Onion',
  nuts: 'Nuts',
  peanuts: 'Peanut',
  shellfish: 'Shell',
  fish: 'Fish',
  soy: 'Soy',
  sesame: 'Sesame',
  chilli: 'Chilli',
  alcohol: 'Alc',
  sulphites: 'Sulph',
};

const MenuView: React.FC<MenuViewProps> = ({ menus, defaultMatrixMode = false, onSaveMenu }) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(menus.length > 0 ? menus[0].id : null);
  const [viewMode, setViewMode] = useState<'matrix' | 'list'>(defaultMatrixMode ? 'matrix' : 'list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [excludedAllergens, setExcludedAllergens] = useState<string[]>([]);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isEditingMenuTitle, setIsEditingMenuTitle] = useState(false);
  const [menuTitleInput, setMenuTitleInput] = useState('');

  const activeMenu = menus.find(m => m.id === activeMenuId) || menus[0];

  const categories = useMemo(() => {
    if (!activeMenu) return ['All'];
    const cats = Array.from(new Set(activeMenu.items.map(i => i.category).filter(Boolean)));
    return ['All', ...cats];
  }, [activeMenu]);

  const filteredItems = useMemo(() => {
    if (!activeMenu) return [];
    return activeMenu.items.filter(item => {
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchDesc = (item.description || '').toLowerCase().includes(q);
        if (!matchName && !matchDesc) return false;
      }
      if (excludedAllergens.length > 0) {
        const hasExcluded = excludedAllergens.some(a => (item.allergens || []).includes(a));
        if (hasExcluded) return false;
      }
      return true;
    });
  }, [activeMenu, selectedCategory, searchQuery, excludedAllergens]);

  const handleAddMenu = () => {
    const newMenu: Menu = {
      id: generateId(),
      title: 'New Menu',
      isActive: false,
      items: []
    };
    onSaveMenu(newMenu);
    setActiveMenuId(newMenu.id);
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
      category: selectedCategory !== 'All' ? selectedCategory : 'Starters',
      allergens: [],
      dietaryOptions: [],
      allergenNotes: '',
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

  // Instant 1-click inline toggle for Chef Allergen Matrix
  const handleInlineToggleAllergen = (item: MenuItem, allergenId: string) => {
    if (!activeMenu) return;
    const current = item.allergens || [];
    const nextAllergens = current.includes(allergenId)
      ? current.filter(id => id !== allergenId)
      : [...current, allergenId];
    const updatedItems = activeMenu.items.map(i =>
      i.id === item.id ? { ...i, allergens: nextAllergens } : i
    );
    onSaveMenu({ ...activeMenu, items: updatedItems });
  };

  const handleInlineToggleDietary = (item: MenuItem, code: string) => {
    if (!activeMenu) return;
    const current = item.dietaryOptions || [];
    const nextDietary = current.includes(code)
      ? current.filter(c => c !== code)
      : [...current, code];
    const updatedItems = activeMenu.items.map(i =>
      i.id === item.id ? { ...i, dietaryOptions: nextDietary } : i
    );
    onSaveMenu({ ...activeMenu, items: updatedItems });
  };

  const handleInlineToggleAvailable = (item: MenuItem) => {
    if (!activeMenu) return;
    const updatedItems = activeMenu.items.map(i =>
      i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i
    );
    onSaveMenu({ ...activeMenu, items: updatedItems });
  };

  const toggleEditingAllergen = (allergenId: string) => {
    if (!editingItem) return;
    const has = editingItem.allergens.includes(allergenId);
    setEditingItem({
      ...editingItem,
      allergens: has
        ? editingItem.allergens.filter(id => id !== allergenId)
        : [...editingItem.allergens, allergenId]
    });
  };

  const toggleEditingDietary = (code: string) => {
    if (!editingItem) return;
    const current = editingItem.dietaryOptions || [];
    const has = current.includes(code);
    setEditingItem({
      ...editingItem,
      dietaryOptions: has ? current.filter(c => c !== code) : [...current, code]
    });
  };

  const toggleExcludeFilter = (allergenId: string) => {
    setExcludedAllergens(prev =>
      prev.includes(allergenId) ? prev.filter(id => id !== allergenId) : [...prev, allergenId]
    );
  };

  const getAllergenNames = (ids: string[]) => {
    return ids.map(id => SHORT_ALLERGEN_LABELS[id] || STANDARD_ALLERGENS.find(a => a.id === id)?.name || id).join(', ');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-white overflow-hidden">
      {/* Top Bar for Menu Selection & View Mode */}
      <div className="bg-slate-900/60 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 overflow-x-auto custom-scrollbar">
          {menus.map(menu => (
            <button
              key={menu.id}
              onClick={() => { setActiveMenuId(menu.id); setSelectedCategory('All'); }}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${activeMenu?.id === menu.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 bg-white/5 hover:bg-white/10'}`}
            >
              {menu.title || (menu as any).name}
            </button>
          ))}
          <button onClick={handleAddMenu} className="p-2 text-slate-400 hover:text-indigo-400 bg-white/5 rounded-xl shrink-0" title="New Menu">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Matrix vs List Toggle */}
          <div className="flex bg-slate-950/80 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setViewMode('matrix')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${viewMode === 'matrix' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Allergen Matrix</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Menu List</span>
            </button>
          </div>

          {activeMenu && (
            <button
              onClick={() => onSaveMenu({ ...activeMenu, isActive: !activeMenu.isActive })}
              className={`hidden sm:flex items-center px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${activeMenu.isActive ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-500/30' : 'bg-gray-800 text-gray-400'}`}
            >
              {activeMenu.isActive ? 'LIVE MENU' : 'DRAFT'}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar p-4 sm:p-6 lg:p-8">
        {activeMenu ? (
          <div className="max-w-7xl mx-auto space-y-5">
            {/* Title + Add Item */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {isEditingMenuTitle ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    className="text-xl sm:text-2xl font-bold bg-slate-900/60 border border-slate-600 rounded-lg px-3 py-1.5 outline-none text-white"
                    value={menuTitleInput}
                    onChange={e => setMenuTitleInput(e.target.value)}
                    autoFocus
                  />
                  <button onClick={handleSaveMenuTitle} className="p-2 bg-indigo-600 text-white rounded-lg"><CheckCircle2 className="w-5 h-5" /></button>
                </div>
              ) : (
                <div className="flex items-center space-x-3 group min-w-0">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white truncate">{activeMenu.title || (activeMenu as any).name}</h2>
                  <button
                    onClick={() => { setMenuTitleInput(activeMenu.title || (activeMenu as any).name || ''); setIsEditingMenuTitle(true); }}
                    className="p-1.5 text-slate-400 hover:text-indigo-400 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <button onClick={handleAddItem} className="flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm shadow hover:bg-indigo-700 transition-colors whitespace-nowrap">
                <Plus className="w-4 h-4 mr-2" /> Add Meal / Item
              </button>
            </div>

            {/* Search, Category Filter & "Safe For (Exclude Allergens)" Bar */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search meals, ingredients, descriptions..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-emerald-600 text-white' : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Allergy Safety Filter */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center mr-1 whitespace-nowrap">
                  <ShieldCheck className="w-4 h-4 mr-1" /> Safe For (Exclude):
                </span>
                {MATRIX_ALLERGENS.map(a => {
                  const active = excludedAllergens.includes(a.id);
                  return (
                    <button
                      key={a.id}
                      onClick={() => toggleExcludeFilter(a.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap ${
                        active
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                          : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {active ? `No ${SHORT_ALLERGEN_LABELS[a.id]}` : SHORT_ALLERGEN_LABELS[a.id]}
                    </button>
                  );
                })}
                {excludedAllergens.length > 0 && (
                  <button
                    onClick={() => setExcludedAllergens([])}
                    className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-300 hover:bg-red-500/30 flex items-center whitespace-nowrap"
                  >
                    <X className="w-3 h-3 mr-1" /> Clear
                  </button>
                )}
              </div>
            </div>

            {viewMode === 'matrix' ? (
              <>
                {/* Desktop / Tablet 1-Click Allergen Matrix Table */}
                <div className="hidden md:block bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-sm overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-800/80 border-b border-white/10 text-[11px] uppercase text-slate-300">
                      <tr>
                        <th className="px-4 py-3.5 sticky left-0 bg-slate-900 z-10 min-w-[210px]">Meal / Dish</th>
                        <th className="px-2 py-3.5 text-center whitespace-nowrap">Avail</th>
                        {MATRIX_ALLERGENS.map(a => (
                          <th key={a.id} className="px-2 py-3.5 text-center whitespace-nowrap">{SHORT_ALLERGEN_LABELS[a.id]}</th>
                        ))}
                        <th className="px-3 py-3.5 text-right whitespace-nowrap">Edit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredItems.map(item => (
                        <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3 sticky left-0 bg-slate-900/95 z-10 border-r border-white/5">
                            <div className="font-bold text-sm text-white flex items-center gap-1.5">
                              <span className="truncate max-w-[165px]">{item.name}</span>
                              {!item.isAvailable && <span className="px-1.5 py-0.5 bg-red-500/20 text-red-300 text-[10px] rounded font-bold uppercase">86</span>}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <span>{item.category}</span>
                              <span>•</span>
                              <span className="text-emerald-400 font-semibold">${item.price.toFixed(2)}</span>
                              {(item.dietaryOptions || []).length > 0 && (
                                <span className="text-amber-300 font-semibold truncate max-w-[90px]">
                                  {(item.dietaryOptions || []).join('/')}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-2 py-3 text-center">
                            <button
                              onClick={() => handleInlineToggleAvailable(item)}
                              className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase whitespace-nowrap ${item.isAvailable ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}
                            >
                              {item.isAvailable ? 'IN' : '86'}
                            </button>
                          </td>
                          {MATRIX_ALLERGENS.map(a => {
                            const checked = (item.allergens || []).includes(a.id);
                            return (
                              <td key={a.id} className="px-1.5 py-3 text-center">
                                <button
                                  onClick={() => handleInlineToggleAllergen(item, a.id)}
                                  title={`${item.name}: ${a.name}`}
                                  className={`w-7 h-7 rounded-lg border inline-flex items-center justify-center transition-all ${
                                    checked
                                      ? 'bg-amber-500 border-amber-400 text-slate-950 font-black shadow-sm'
                                      : 'bg-slate-950/60 border-white/10 text-transparent hover:border-white/30'
                                  }`}
                                >
                                  ✓
                                </button>
                              </td>
                            );
                          })}
                          <td className="px-3 py-3 text-right">
                            <button onClick={() => setEditingItem(item)} className="p-1.5 bg-blue-500/15 text-blue-400 rounded-lg hover:bg-blue-500/25">
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredItems.length === 0 && (
                        <tr>
                          <td colSpan={MATRIX_ALLERGENS.length + 3} className="px-6 py-10 text-center text-slate-400">
                            No meals match the selected filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Touch-First Quick-Tick Cards */}
                <div className="md:hidden space-y-4">
                  {filteredItems.map(item => (
                    <div key={item.id} className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-base truncate">{item.name}</h3>
                            <span className="text-xs font-bold text-emerald-400 whitespace-nowrap">${item.price.toFixed(2)}</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{item.description}</p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => handleInlineToggleAvailable(item)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase ${item.isAvailable ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}
                          >
                            {item.isAvailable ? 'Available' : "86'd"}
                          </button>
                          <button onClick={() => setEditingItem(item)} className="p-2 bg-blue-500/15 text-blue-400 rounded-lg">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Tap Allergens Present</p>
                        <div className="flex flex-wrap gap-1.5">
                          {MATRIX_ALLERGENS.map(a => {
                            const checked = (item.allergens || []).includes(a.id);
                            return (
                              <button
                                key={a.id}
                                onClick={() => handleInlineToggleAllergen(item, a.id)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                                  checked
                                    ? 'bg-amber-500 border-amber-400 text-slate-950'
                                    : 'bg-slate-950/60 border-white/10 text-slate-400'
                                }`}
                              >
                                {checked ? `✓ ${SHORT_ALLERGEN_LABELS[a.id]}` : SHORT_ALLERGEN_LABELS[a.id]}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Dietary Options</p>
                        <div className="flex flex-wrap gap-1.5">
                          {STANDARD_DIETARY_OPTIONS.map(code => {
                            const active = (item.dietaryOptions || []).includes(code);
                            return (
                              <button
                                key={code}
                                onClick={() => handleInlineToggleDietary(item, code)}
                                className={`px-2 py-1 rounded-md text-[11px] font-bold border ${
                                  active
                                    ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300'
                                    : 'bg-slate-950/50 border-white/10 text-slate-500'
                                }`}
                              >
                                {code}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredItems.length === 0 && (
                    <div className="p-8 text-center text-slate-400 bg-slate-900/60 rounded-2xl border border-white/10">
                      No meals match the selected filters.
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Standard Menu List View (Responsive) */
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-sm overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-800/50 border-b border-white/10 text-xs uppercase text-slate-400">
                    <tr>
                      <th className="px-4 sm:px-6 py-4">Item Name</th>
                      <th className="px-4 py-4 hidden sm:table-cell">Category</th>
                      <th className="px-4 py-4">Price</th>
                      <th className="px-4 py-4">Allergens & Dietary</th>
                      <th className="px-4 sm:px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredItems.map(item => (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                        <td className="px-4 sm:px-6 py-4">
                          <div className="font-bold text-white flex items-center flex-wrap gap-1.5">
                            <span>{item.name}</span>
                            {!item.isAvailable && <span className="px-2 py-0.5 bg-red-500/20 text-red-300 text-[10px] rounded uppercase font-bold">86'd</span>}
                          </div>
                          <div className="text-xs sm:text-sm text-slate-400 line-clamp-2 max-w-md mt-0.5">{item.description}</div>
                        </td>
                        <td className="px-4 py-4 text-slate-300 hidden sm:table-cell whitespace-nowrap">{item.category}</td>
                        <td className="px-4 py-4 font-semibold text-emerald-400 whitespace-nowrap">${item.price.toFixed(2)}</td>
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            {item.allergens.length > 0 ? (
                              <div className="flex items-center text-amber-400 text-xs sm:text-sm" title={getAllergenNames(item.allergens)}>
                                <AlertTriangle className="w-4 h-4 mr-1.5 flex-shrink-0" />
                                <span className="line-clamp-2">{getAllergenNames(item.allergens)}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-500">No tagged allergens</span>
                            )}
                            {(item.dietaryOptions || []).length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {(item.dietaryOptions || []).map(code => (
                                  <span key={code} className="px-1.5 py-0.5 bg-emerald-500/15 text-emerald-300 rounded text-[10px] font-bold">{code}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex justify-end space-x-2">
                            <button onClick={() => setEditingItem(item)} className="p-2 bg-blue-900/30 text-blue-400 rounded-lg hover:bg-blue-900/50"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => handleDeleteItem(item.id)} className="p-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredItems.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                          No items match your current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            Select or create a menu to begin.
          </div>
        )}
      </div>

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-lg sm:text-xl font-bold text-white">{editingItem.name ? `Edit: ${editingItem.name}` : 'New Menu Item'}</h3>
              <button onClick={() => setEditingItem(null)} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Item Name</label>
                  <input
                    type="text"
                    className="w-full px-3.5 py-2.5 bg-slate-950 text-white border border-white/10 rounded-xl outline-none focus:border-indigo-500"
                    value={editingItem.name}
                    onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Price ($)</label>
                    <input
                      type="number"
                      className="w-full px-3.5 py-2.5 bg-slate-950 text-white border border-white/10 rounded-xl outline-none focus:border-indigo-500"
                      value={editingItem.price || ''}
                      onChange={e => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Category</label>
                    <select
                      className="w-full px-3 py-2.5 bg-slate-950 text-white border border-white/10 rounded-xl outline-none focus:border-indigo-500"
                      value={editingItem.category}
                      onChange={e => setEditingItem({ ...editingItem, category: e.target.value })}
                    >
                      <option value="Pizza">Pizza</option>
                      <option value="Starters">Starters</option>
                      <option value="Bao Buns">Bao Buns</option>
                      <option value="Burgers">Burgers</option>
                      <option value="Salads">Salads</option>
                      <option value="Mains">Mains</option>
                      <option value="Desserts">Desserts</option>
                      <option value="Sides">Sides</option>
                      <option value="Beverages">Beverages</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Description</label>
                <textarea
                  className="w-full px-3.5 py-2.5 bg-slate-950 text-white border border-white/10 rounded-xl outline-none min-h-[72px] focus:border-indigo-500"
                  value={editingItem.description}
                  onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                />
              </div>

              <div className="border-t border-white/10 pt-4 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-white mb-2.5 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />
                    Allergens & Intolerances (Tick All Present)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {STANDARD_ALLERGENS.map(allergen => {
                      const active = editingItem.allergens.includes(allergen.id);
                      return (
                        <button
                          key={allergen.id}
                          type="button"
                          onClick={() => toggleEditingAllergen(allergen.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                            active
                              ? 'bg-amber-500 border-amber-400 text-slate-950'
                              : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          {active ? `✓ ${allergen.name}` : allergen.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-emerald-400 mb-2 uppercase tracking-wider">Dietary Options Available</h5>
                  <div className="flex flex-wrap gap-2">
                    {STANDARD_DIETARY_OPTIONS.map(code => {
                      const active = (editingItem.dietaryOptions || []).includes(code);
                      return (
                        <button
                          key={code}
                          type="button"
                          onClick={() => toggleEditingDietary(code)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                            active
                              ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300'
                              : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          {active ? `✓ ${code}` : code}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Chef Allergen Notes (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Garlic in marinade only, fryer cross-contamination..."
                    className="w-full px-3.5 py-2 bg-slate-950 text-white border border-white/10 rounded-xl outline-none text-sm focus:border-indigo-500"
                    value={editingItem.allergenNotes || ''}
                    onChange={e => setEditingItem({ ...editingItem, allergenNotes: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center pt-1">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={editingItem.isAvailable}
                  onChange={e => setEditingItem({ ...editingItem, isAvailable: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-500"
                />
                <label htmlFor="isAvailable" className="ml-2.5 text-sm font-medium text-slate-300">
                  Item is currently available (uncheck to 86)
                </label>
              </div>
            </div>
            <div className="px-5 py-4 bg-slate-950 border-t border-white/10 flex justify-end space-x-3">
              <button onClick={() => setEditingItem(null)} className="px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-xl text-sm font-medium">Cancel</button>
              <button onClick={handleSaveItem} className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-sm font-bold">Save Item</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuView;
