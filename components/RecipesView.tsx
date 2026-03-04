
import React, { useState } from 'react';
import { Recipe } from '../types';
import { Search, ChefHat, Martini, Coffee, AlertCircle, Info, X } from 'lucide-react';

interface RecipesViewProps {
  recipes: Recipe[];
}

const RecipesView: React.FC<RecipesViewProps> = ({ recipes }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const filtered = recipes.filter(r => {
      const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.ingredients.some(i => i.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = categoryFilter === 'All' || r.category === categoryFilter;
      return matchesSearch && matchesCategory;
  });

  const getIcon = (cat: string) => {
      switch(cat) {
          case 'Cocktail': return <Martini className="w-5 h-5" />;
          case 'Food': return <ChefHat className="w-5 h-5" />;
          case 'Coffee': return <Coffee className="w-5 h-5" />;
          default: return <Info className="w-5 h-5" />;
      }
  };

  return (
    <div className="flex-1 p-8 overflow-auto custom-scrollbar bg-white dark:bg-slate-900">
       <div className="flex items-center justify-between mb-8 gap-4">
           <div className="flex-1">
               <div className="flex items-center space-x-4 mb-4">
                   <button 
                       onClick={() => setCategoryFilter('All')} 
                       className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${categoryFilter === 'All' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'}`}
                   >
                       All Specs
                   </button>
                   <button 
                       onClick={() => setCategoryFilter('Cocktail')} 
                       className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center space-x-2 ${categoryFilter === 'Cocktail' ? 'bg-pink-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'}`}
                   >
                       <Martini className="w-4 h-4" />
                       <span>Cocktails</span>
                   </button>
                   <button 
                       onClick={() => setCategoryFilter('Food')} 
                       className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center space-x-2 ${categoryFilter === 'Food' ? 'bg-orange-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'}`}
                   >
                       <ChefHat className="w-4 h-4" />
                       <span>Meals</span>
                   </button>
                   <button 
                       onClick={() => setCategoryFilter('Coffee')} 
                       className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center space-x-2 ${categoryFilter === 'Coffee' ? 'bg-amber-700 text-white shadow-lg' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'}`}
                   >
                       <Coffee className="w-4 h-4" />
                       <span>Coffee</span>
                   </button>
               </div>
               <p className="text-gray-500 dark:text-gray-400">Standard operating procedures for food and drinks.</p>
           </div>
           
           <div className="relative w-full md:w-80">
               <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
               <input 
                  type="text" 
                  placeholder="Search by name or ingredient..." 
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-lg shadow-inner"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
               />
           </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {filtered.map(recipe => (
               <div 
                  key={recipe.id} 
                  onClick={() => setSelectedRecipe(recipe)}
                  className="group bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition-all hover:border-indigo-300 dark:hover:border-indigo-700"
               >
                   <div className="h-48 bg-gray-200 dark:bg-slate-700 relative overflow-hidden">
                       {recipe.image ? (
                           <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                       ) : (
                           <div className="w-full h-full flex items-center justify-center text-gray-400">
                               {getIcon(recipe.category)}
                           </div>
                       )}
                       <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 p-2 rounded-full shadow-sm text-gray-700 dark:text-gray-200 backdrop-blur-sm">
                           {getIcon(recipe.category)}
                       </div>
                   </div>
                   <div className="p-5">
                       <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{recipe.name}</h3>
                       <div className="flex flex-wrap gap-2 mb-4">
                           {recipe.allergens?.map(a => (
                               <span key={a} className="px-2 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-600 text-[10px] font-bold uppercase rounded">
                                   {a}
                               </span>
                           ))}
                           {recipe.glassware && (
                               <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-[10px] font-bold uppercase rounded">
                                   {recipe.glassware}
                               </span>
                           )}
                       </div>
                       <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                           {recipe.method}
                       </p>
                   </div>
               </div>
           ))}
       </div>

       {/* Detail Modal */}
       {selectedRecipe && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
               <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95">
                   <div className="relative h-64 flex-shrink-0 bg-gray-200">
                        {selectedRecipe.image && (
                            <img src={selectedRecipe.image} className="w-full h-full object-cover" alt="" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <button onClick={() => setSelectedRecipe(null)} className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                        <div className="absolute bottom-6 left-6 text-white">
                            <div className="flex items-center space-x-2 mb-2 opacity-90">
                                {getIcon(selectedRecipe.category)}
                                <span className="text-sm font-medium uppercase tracking-wider">{selectedRecipe.category}</span>
                            </div>
                            <h2 className="text-3xl font-bold">{selectedRecipe.name}</h2>
                        </div>
                   </div>

                   <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div>
                               <h4 className="text-sm font-bold uppercase text-gray-500 dark:text-gray-400 mb-4 tracking-wider">Ingredients</h4>
                               <ul className="space-y-3">
                                   {selectedRecipe.ingredients.map((ing, i) => (
                                       <li key={i} className="flex items-center text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-slate-700 pb-2">
                                           <span className="w-2 h-2 rounded-full bg-indigo-500 mr-3"></span>
                                           {ing}
                                       </li>
                                   ))}
                               </ul>

                               {selectedRecipe.garnish && (
                                   <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                                       <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase block mb-1">Garnish</span>
                                       <span className="text-amber-900 dark:text-amber-100 font-medium">{selectedRecipe.garnish}</span>
                                   </div>
                               )}
                           </div>
                           
                           <div>
                               <h4 className="text-sm font-bold uppercase text-gray-500 dark:text-gray-400 mb-4 tracking-wider">Method</h4>
                               <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                   {selectedRecipe.method}
                               </p>

                               {selectedRecipe.allergens && selectedRecipe.allergens.length > 0 && (
                                   <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl">
                                       <div className="flex items-center text-red-600 dark:text-red-400 font-bold mb-2">
                                           <AlertCircle className="w-5 h-5 mr-2" />
                                           Allergen Warning
                                       </div>
                                       <div className="flex flex-wrap gap-2">
                                           {selectedRecipe.allergens.map(a => (
                                               <span key={a} className="px-2 py-1 bg-white dark:bg-slate-800 rounded border border-red-200 dark:border-red-800 text-sm font-medium text-red-700 dark:text-red-300">
                                                   {a}
                                               </span>
                                           ))}
                                       </div>
                                   </div>
                               )}
                           </div>
                       </div>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};

export default RecipesView;
