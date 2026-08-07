import React, { useState } from 'react';
import { Recipe } from '../types';
import { generateId } from '../utils';
import { 
  Search, ChefHat, Martini, Coffee, Info, X, Plus, Trash2, Edit3, 
  Clock, AlertCircle, Sparkles, Check, Image as ImageIcon, Utensils
} from 'lucide-react';

interface RecipesViewProps {
  recipes: Recipe[];
  onSave: (item: Recipe) => void;
  onDelete?: (id: string) => void;
}

const ALLERGEN_OPTIONS = [
  'Gluten', 'Dairy', 'Eggs', 'Nuts', 'Peanuts', 
  'Shellfish', 'Fish', 'Soy', 'Sesame', 'Sulfites', 'Mustard', 'Celery'
];

const RecipesView: React.FC<RecipesViewProps> = ({ recipes, onSave, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Recipe>>({
    name: '',
    category: 'Cocktail',
    ingredients: [],
    method: '',
    allergens: [],
    glassware: '',
    garnish: '',
    image: ''
  });
  const [ingredientInput, setIngredientInput] = useState('');

  const openCreateModal = () => {
    setEditingRecipe(null);
    setFormData({
      name: '',
      category: 'Cocktail',
      ingredients: [],
      method: '',
      allergens: [],
      glassware: '',
      garnish: '',
      image: ''
    });
    setIngredientInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setFormData({
      ...recipe,
      allergens: recipe.allergens || [],
      ingredients: recipe.ingredients || []
    });
    setIngredientInput('');
    setIsModalOpen(true);
    setSelectedRecipe(null);
  };

  const handleAddIngredient = () => {
    if (!ingredientInput.trim()) return;
    setFormData({
      ...formData,
      ingredients: [...(formData.ingredients || []), ingredientInput.trim()]
    });
    setIngredientInput('');
  };

  const handleRemoveIngredient = (idx: number) => {
    const updated = [...(formData.ingredients || [])];
    updated.splice(idx, 1);
    setFormData({ ...formData, ingredients: updated });
  };

  const toggleAllergen = (allergen: string) => {
    const current = formData.allergens || [];
    if (current.includes(allergen)) {
      setFormData({ ...formData, allergens: current.filter(a => a !== allergen) });
    } else {
      setFormData({ ...formData, allergens: [...current, allergen] });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.method?.trim()) return;

    const finalRecipe: Recipe = {
      id: editingRecipe?.id || `rec-${generateId()}`,
      name: formData.name.trim(),
      category: formData.category || 'Cocktail',
      ingredients: formData.ingredients && formData.ingredients.length > 0 ? formData.ingredients : ['Standard prep specs'],
      method: formData.method.trim(),
      allergens: formData.allergens || [],
      glassware: formData.glassware?.trim() || undefined,
      garnish: formData.garnish?.trim() || undefined,
      image: formData.image?.trim() || undefined
    };

    onSave(finalRecipe);
    setIsModalOpen(false);
  };

  const filtered = recipes.filter(r => {
    const matchesSearch = 
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.ingredients.some(i => i.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.glassware && r.glassware.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'All' || r.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getIcon = (cat: string) => {
    switch (cat) {
      case 'Cocktail': return <Martini className="w-5 h-5" />;
      case 'Food': return <ChefHat className="w-5 h-5" />;
      case 'Coffee': return <Coffee className="w-5 h-5" />;
      case 'Prep': return <Utensils className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Cocktail': return 'text-pink-500 bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-800';
      case 'Food': return 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
      case 'Coffee': return 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
      case 'Prep': return 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800';
      default: return 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800';
    }
  };

  return (
    <div className="flex-1 p-8 overflow-auto custom-scrollbar bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 flex items-center">
              <ChefHat className="w-7 h-7 mr-3 text-indigo-600 dark:text-indigo-400" />
              Standard Recipe & Beverage Specs
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
              {recipes.length} Verified Specs
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Standard operating procedures, cocktail builds, allergen matrices, and kitchen prep specs.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center space-x-2 shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Recipe Spec</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'All', label: 'All Specs', icon: Sparkles },
            { id: 'Cocktail', label: 'Cocktails', icon: Martini },
            { id: 'Food', label: 'Kitchen Dishes', icon: ChefHat },
            { id: 'Coffee', label: 'Coffee & Hot', icon: Coffee },
            { id: 'Prep', label: 'Batches & Prep', icon: Utensils }
          ].map(tab => {
            const Icon = tab.icon;
            const active = categoryFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                  active
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search recipes, ingredients, allergens..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 shadow-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid of Recipes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map(recipe => (
          <div
            key={recipe.id}
            onClick={() => setSelectedRecipe(recipe)}
            className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl cursor-pointer transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="h-44 bg-slate-100 dark:bg-slate-900 relative overflow-hidden">
                {recipe.image ? (
                  <img
                    src={recipe.image}
                    alt={recipe.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <div className="p-3 bg-slate-200 dark:bg-slate-800 rounded-full mb-2">
                      {getIcon(recipe.category)}
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{recipe.category}</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 p-2 rounded-xl shadow-md text-slate-700 dark:text-slate-200 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                  {getIcon(recipe.category)}
                </div>
                <div className="absolute bottom-2 left-2">
                  <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getCategoryColor(recipe.category)}`}>
                    {recipe.category}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-50 mb-2 group-hover:text-indigo-600 transition-colors">
                  {recipe.name}
                </h3>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {recipe.glassware && (
                    <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-bold uppercase rounded-md">
                      {recipe.glassware}
                    </span>
                  )}
                  {recipe.allergens?.map(a => (
                    <span
                      key={a}
                      className="px-2 py-0.5 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 text-[10px] font-bold uppercase rounded-md"
                    >
                      {a}
                    </span>
                  ))}
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {recipe.ingredients.slice(0, 3).join(', ')}
                  {recipe.ingredients.length > 3 ? ` + ${recipe.ingredients.length - 3} more` : ''}
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500">
              <span>{recipe.ingredients.length} Ingredients</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline">View Spec &rarr;</span>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            <ChefHat className="w-12 h-12 mx-auto text-slate-400 mb-3 opacity-60" />
            <h4 className="font-bold text-slate-800 dark:text-slate-200">No Recipes Matching Criteria</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Create a new recipe specification to populate this category.</p>
          </div>
        )}
      </div>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95">
            <div className="relative h-56 flex-shrink-0 bg-slate-200 dark:bg-slate-900">
              {selectedRecipe.image ? (
                <img src={selectedRecipe.image} className="w-full h-full object-cover" alt={selectedRecipe.name} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-indigo-950/40">
                  {getIcon(selectedRecipe.category)}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

              <button
                onClick={() => setSelectedRecipe(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-6 left-6 text-white pr-6">
                <div className="flex items-center space-x-2 mb-1.5 opacity-90">
                  <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider ${getCategoryColor(selectedRecipe.category)}`}>
                    {selectedRecipe.category}
                  </span>
                  {selectedRecipe.glassware && (
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-md backdrop-blur-sm">
                      Serve in: {selectedRecipe.glassware}
                    </span>
                  )}
                </div>
                <h2 className="text-3xl font-black">{selectedRecipe.name}</h2>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">
                    Ingredients Specification ({selectedRecipe.ingredients.length})
                  </h4>
                  <ul className="space-y-2.5">
                    {selectedRecipe.ingredients.map((ing, i) => (
                      <li
                        key={i}
                        className="flex items-center text-sm font-medium text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700/60 pb-2"
                      >
                        <span className="w-2 h-2 rounded-full bg-indigo-500 mr-3 flex-shrink-0"></span>
                        {ing}
                      </li>
                    ))}
                  </ul>

                  {selectedRecipe.garnish && (
                    <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-2xl">
                      <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider block mb-1">
                        Garnish & Finish
                      </span>
                      <span className="text-sm text-amber-950 dark:text-amber-100 font-semibold">{selectedRecipe.garnish}</span>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">
                    Standard Preparation Method
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                    {selectedRecipe.method}
                  </p>

                  {selectedRecipe.allergens && selectedRecipe.allergens.length > 0 && (
                    <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-2xl">
                      <div className="flex items-center text-xs font-black text-red-700 dark:text-red-400 uppercase tracking-wider mb-2">
                        <AlertCircle className="w-4 h-4 mr-1.5" />
                        Allergen Matrix Flagged
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedRecipe.allergens.map(a => (
                          <span
                            key={a}
                            className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded-md border border-red-200 dark:border-red-800 text-xs font-bold text-red-700 dark:text-red-300 shadow-sm"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
              {onDelete && (
                <button
                  onClick={() => {
                    if (confirm(`Delete spec for "${selectedRecipe.name}"?`)) {
                      onDelete(selectedRecipe.id);
                      setSelectedRecipe(null);
                    }
                  }}
                  className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-1.5" /> Delete Spec
                </button>
              )}
              <div className="flex space-x-3 ml-auto">
                <button
                  onClick={() => openEditModal(selectedRecipe)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors shadow-md flex items-center"
                >
                  <Edit3 className="w-4 h-4 mr-1.5" /> Edit Spec
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Recipe Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-50 flex items-center">
                <ChefHat className="w-5 h-5 mr-2 text-indigo-600" />
                {editingRecipe ? 'Edit Recipe Specification' : 'Add New Recipe Specification'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Recipe / Spec Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Espresso Martini, Crispy Pork Belly..."
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Cocktail">Cocktail</option>
                    <option value="Food">Food / Dish</option>
                    <option value="Coffee">Coffee / Barista</option>
                    <option value="Prep">Batch / Prep Item</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Glassware / Plate / Vessel
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Coupe Glass, 10-inch Coupe Plate, Highball..."
                    value={formData.glassware || ''}
                    onChange={e => setFormData({ ...formData, glassware: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Garnish / Presentation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 3 Coffee beans, Dehydrated Orange Wheel..."
                    value={formData.garnish || ''}
                    onChange={e => setFormData({ ...formData, garnish: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Ingredients Builder */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Ingredients Build List
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. 45ml Vodka, 30ml Kahlua, 30ml Fresh Espresso..."
                    value={ingredientInput}
                    onChange={e => setIngredientInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddIngredient();
                      }
                    }}
                    className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-bold"
                  >
                    Add Line
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  {(formData.ingredients || []).map((ing, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 shadow-sm"
                    >
                      {ing}
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(idx)}
                        className="ml-1.5 text-slate-400 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {(!formData.ingredients || formData.ingredients.length === 0) && (
                    <span className="text-xs text-slate-400 italic">No ingredients added yet.</span>
                  )}
                </div>
              </div>

              {/* Method */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Method & Instructions *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Step-by-step prep or build instructions..."
                  value={formData.method || ''}
                  onChange={e => setFormData({ ...formData, method: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Allergens Selector */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                  Allergen Warnings
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ALLERGEN_OPTIONS.map(allergen => {
                    const isSelected = (formData.allergens || []).includes(allergen);
                    return (
                      <button
                        key={allergen}
                        type="button"
                        onClick={() => toggleAllergen(allergen)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors flex items-center space-x-1 ${
                          isSelected
                            ? 'bg-red-600 text-white border-red-600 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 mr-0.5" />}
                        <span>{allergen}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Image URL (Optional)
                </label>
                <div className="relative">
                  <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.image || ''}
                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors shadow-md shadow-indigo-600/20"
                >
                  Save Specification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipesView;
