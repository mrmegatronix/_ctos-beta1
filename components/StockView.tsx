
import React, { useState } from 'react';
import { StockItem, Supplier } from '../types';
import { AlertTriangle, Package, TrendingDown, ArrowUp, ArrowDown, ArrowRightLeft, X, Plus, Edit2 } from 'lucide-react';
import { StockInfoModal } from './StockInfoModal';

interface StockViewProps {
  onSaveItem: (item: StockItem) => void;
  items: StockItem[];
  suppliers: Supplier[];
  onUpdateQuantity: (id: string, delta: number) => void;
}

const StockView: React.FC<StockViewProps> = ({ items, suppliers, onUpdateQuantity, onSaveItem }) => {
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);

  const handleAdd = () => {
    setEditingItem({
      id: `stk-${Date.now()}`,
      name: '',
      category: 'General',
      quantity: 0,
      unit: 'pcs',
      minLevel: 0,
      price: 0,
      cost: 0,
      productType: 'Beverage',
      allergens: []
    });
  };

  const lowStockItems = items.filter(i => i.quantity <= i.minLevel);
  
  // Transfer Modal State
  const [transferItem, setTransferItem] = useState<StockItem | null>(null);
  const [transferQty, setTransferQty] = useState<number>(1);
  const [transferDest, setTransferDest] = useState<string>('Main Bar');

  const handleTransfer = () => {
      if (transferItem && transferQty > 0) {
          onUpdateQuantity(transferItem.id, -transferQty);
          // In a real app, we would log this transfer to a separate table
          console.log(`Transferred ${transferQty} of ${transferItem.name} to ${transferDest}`);
          setTransferItem(null);
          setTransferQty(1);
      }
  };

  return (
    <div className="flex-1 flex flex-col h-full glass-panel  overflow-hidden relative">
      {/* Top Stats */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel  rounded-xl p-4 border border-white/10  shadow-lg flex items-center space-x-4">
           <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
             <Package className="w-6 h-6" />
           </div>
           <div>
             <div className="text-sm text-slate-400 ">Total Items</div>
             <div className="text-2xl font-bold text-slate-50 ">{items.length}</div>
           </div>
        </div>
        
        <div className="glass-panel  rounded-xl p-4 border border-white/10  shadow-lg flex items-center space-x-4">
           <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
             <AlertTriangle className="w-6 h-6" />
           </div>
           <div>
             <div className="text-sm text-slate-400 ">Low Stock Alerts</div>
             <div className="text-2xl font-bold text-slate-50 ">{lowStockItems.length}</div>
           </div>
        </div>

        <div className="glass-panel  rounded-xl p-4 border border-white/10  shadow-lg flex items-center space-x-4">
           <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400">
             <TrendingDown className="w-6 h-6" />
           </div>
           <div>
             <div className="text-sm text-slate-400 ">Inventory Value</div>
             <div className="text-2xl font-bold text-slate-50 ">
                ${items.reduce((acc, i) => acc + (i.price * i.quantity), 0).toFixed(0)}
             </div>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar px-6 pb-6">
        <div className="flex justify-end mb-4">
          <button onClick={handleAdd} className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-lg">
             <Plus className="w-5 h-5" />
             <span>Add Stock Item</span>
          </button>
        </div>
        <div className="glass-panel  rounded-xl border border-white/10  overflow-hidden shadow-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="glass-panel /50 border-b border-white/10  text-xs uppercase text-slate-400 ">
                <th className="px-6 py-4 font-semibold">Item Name</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Quantity</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {items.map(item => (
                <tr key={item.id} className={`hover:glass-panel dark:hover:bg-slate-700/50 transition-colors ${item.isDemo ? 'demo-highlight' : ''}`}>
                  <td className="px-6 py-4 font-medium text-slate-50 ">{item.name}</td>
                  <td className="px-6 py-4 text-slate-300 ">
                    <span className="px-2 py-1 rounded bg-gray-100  text-xs">{item.category}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-50  font-medium">
                    {item.quantity} <span className="text-gray-400 text-xs ml-1">{item.unit}</span>
                  </td>
                  <td className="px-6 py-4">
                    {item.quantity <= item.minLevel ? (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                        Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        In Stock
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end space-x-2">
                    <button 
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-600 text-slate-400 "
                        title="Reduce Stock"
                    >
                        <ArrowDown className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-600 text-slate-400 "
                        title="Add Stock"
                    >
                        <ArrowUp className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setTransferItem(item)}
                        className="p-1 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 ml-2"
                        title="Transfer to other site"
                    >
                        <ArrowRightLeft className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setEditingItem(item)}
                        className="p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 ml-2"
                        title="Edit Item Info"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transfer Modal */}
      {transferItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="glass-panel  rounded-2xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-slate-50 ">Transfer Stock</h3>
                      <button onClick={() => setTransferItem(null)} className="text-gray-400 hover:text-slate-400">
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  
                  <div className="mb-4 p-3 glass-panel /50 rounded-lg">
                      <div className="text-sm text-slate-400 ">Item</div>
                      <div className="font-semibold text-slate-50 ">{transferItem.name}</div>
                      <div className="text-xs text-slate-400 mt-1">Current Stock: {transferItem.quantity} {transferItem.unit}</div>
                  </div>

                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-200  mb-1">Transfer Quantity</label>
                          <input 
                            type="number" 
                            min="1"
                            max={transferItem.quantity}
                            className="w-full px-3 py-2 glass-panel  border border-white/20  rounded-lg outline-none"
                            value={transferQty}
                            onChange={(e) => setTransferQty(parseInt(e.target.value) || 0)}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-200  mb-1">Destination Site</label>
                          <select 
                            className="w-full px-3 py-2 glass-panel  border border-white/20  rounded-lg outline-none"
                            value={transferDest}
                            onChange={(e) => setTransferDest(e.target.value)}
                          >
                              <option value="Main Bar">Main Bar</option>
                              <option value="Garden Bar">Garden Bar</option>
                              <option value="Kitchen Store">Kitchen Store</option>
                              <option value="Offsite Storage">Offsite Storage</option>
                          </select>
                      </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-6">
                      <button onClick={() => setTransferItem(null)} className="px-4 py-2 text-slate-300  hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
                      <button 
                        onClick={handleTransfer}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        disabled={transferQty > transferItem.quantity || transferQty <= 0}
                      >
                          Confirm Transfer
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <StockInfoModal 
          item={editingItem} 
          suppliers={suppliers}
          onClose={() => setEditingItem(null)}
          onSave={(item) => {
            onSaveItem(item);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
};

export default StockView;
