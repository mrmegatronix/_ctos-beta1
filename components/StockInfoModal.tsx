import React, { useState } from 'react';
import { StockItem, Supplier } from '../types';
import { X, Image as ImageIcon, Scan } from 'lucide-react';
import { BarcodeScanner } from './BarcodeScanner';

interface StockInfoModalProps {
  item: StockItem;
  suppliers: Supplier[];
  onClose: () => void;
  onSave: (item: StockItem) => void;
}

export const StockInfoModal: React.FC<StockInfoModalProps> = ({ item, suppliers, onClose, onSave }) => {
  const [formData, setFormData] = useState<StockItem>({ ...item });
  const [allergenInput, setAllergenInput] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  const handleChange = (field: keyof StockItem, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddAllergen = () => {
    if (allergenInput.trim() && !formData.allergens?.includes(allergenInput.trim())) {
      setFormData(prev => ({
        ...prev,
        allergens: [...(prev.allergens || []), allergenInput.trim()]
      }));
      setAllergenInput('');
    }
  };

  const handleRemoveAllergen = (allergen: string) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens?.filter(a => a !== allergen) || []
    }));
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
        <div className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm rounded-2xl w-full max-w-4xl p-6 shadow-xl animate-in zoom-in-95 duration-200 my-8">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-bold text-slate-50">{item.id.startsWith('stk-') ? 'Add New Item' : 'Edit Stock Item'}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-slate-200">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Image and Basic Info */}
            <div className="space-y-4">
              <div className="w-full h-48 bg-slate-800 rounded-xl flex flex-col items-center justify-center overflow-hidden border border-slate-700 relative">
                {formData.image ? (
                  <img src={formData.image} alt={formData.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-slate-500">
                    <ImageIcon className="w-12 h-12 mb-2" />
                    <span>No Image Provided</span>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Image URL</label>
                <input 
                  type="text" 
                  value={formData.image || ''}
                  onChange={(e) => handleChange('image', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg outline-none text-slate-200"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Name *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg outline-none text-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                  <input 
                    type="text" 
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg outline-none text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Product Type</label>
                  <select
                    value={formData.productType || 'Beverage'}
                    onChange={(e) => handleChange('productType', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg outline-none text-slate-200"
                  >
                    <option value="Beverage">Beverage</option>
                    <option value="Food">Food</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Location / Bin</label>
                  <input 
                    type="text" 
                    value={formData.location || ''}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="e.g. Main Fridge"
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg outline-none text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Expiry Date</label>
                  <input 
                    type="date" 
                    value={formData.expiryDate ? new Date(formData.expiryDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleChange('expiryDate', e.target.value ? new Date(e.target.value) : undefined)}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg outline-none text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Barcode</label>
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    value={formData.barcode || ''}
                    onChange={(e) => handleChange('barcode', e.target.value)}
                    placeholder="Scan or type barcode"
                    className="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg outline-none text-slate-200"
                  />
                  <button 
                    onClick={() => setShowScanner(true)}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center space-x-2"
                  >
                    <Scan className="w-4 h-4" />
                    <span>Scan</span>
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea 
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg outline-none text-slate-200 h-24"
                />
              </div>
            </div>

            {/* Right Column: Pricing, Inventory, Suppliers, Allergens */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Price ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={formData.price || 0}
                    onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg outline-none text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Cost ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={formData.cost || 0}
                    onChange={(e) => handleChange('cost', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg outline-none text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Quantity</label>
                  <input 
                    type="number" 
                    value={formData.quantity}
                    onChange={(e) => handleChange('quantity', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg outline-none text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Min Level</label>
                  <input 
                    type="number" 
                    value={formData.minLevel}
                    onChange={(e) => handleChange('minLevel', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg outline-none text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Unit</label>
                  <input 
                    type="text" 
                    value={formData.unit}
                    onChange={(e) => handleChange('unit', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg outline-none text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Bottle/Item Size (ml)</label>
                  <select
                    value={formData.volumeMl || ''}
                    onChange={(e) => handleChange('volumeMl', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg outline-none text-slate-200"
                  >
                    <option value="">Not Applicable</option>
                    <option value="50000">50,000ml (50L Keg)</option>
                    <option value="1000">1000ml (1L)</option>
                    <option value="750">750ml</option>
                    <option value="700">700ml</option>
                    <option value="500">500ml</option>
                    <option value="330">330ml</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Linked Supplier</label>
                <select
                  value={formData.supplierId || ''}
                  onChange={(e) => handleChange('supplierId', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg outline-none text-slate-200"
                >
                  <option value="">No Supplier Selected</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Allergens</label>
                <div className="flex space-x-2 mb-2">
                  <input 
                    type="text" 
                    value={allergenInput}
                    onChange={(e) => setAllergenInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddAllergen()}
                    placeholder="e.g. Nuts, Dairy"
                    className="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg outline-none text-slate-200"
                  />
                  <button 
                    onClick={handleAddAllergen}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 font-medium"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.allergens?.map(allergen => (
                    <span key={allergen} className="px-2 py-1 bg-red-900/30 text-red-300 border border-red-800/50 rounded-md text-sm flex items-center">
                      {allergen}
                      <button onClick={() => handleRemoveAllergen(allergen)} className="ml-2 hover:text-red-100">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {(!formData.allergens || formData.allergens.length === 0) && (
                    <span className="text-slate-500 text-sm">No allergens listed</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-3 pt-4 border-t border-slate-700">
            <button onClick={onClose} className="px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-lg">Cancel</button>
            <button 
              onClick={() => {
                if (!formData.name) {
                  alert('Name is required');
                  return;
                }
                onSave(formData);
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Save Item Info
            </button>
          </div>
        </div>
      </div>

      {showScanner && (
        <BarcodeScanner 
          onScan={(barcode) => {
            handleChange('barcode', barcode);
            setShowScanner(false);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  );
};
