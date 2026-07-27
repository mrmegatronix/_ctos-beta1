import React, { useState } from 'react';
import { PurchaseOrder, Supplier, StockItem } from '../types';
import { ShoppingCart, Plus, Send, CheckCircle, Package } from 'lucide-react';
import { generateId, formatDate } from '../utils';

interface OrderingViewProps {
  orders: PurchaseOrder[];
  suppliers: Supplier[];
  stockItems: StockItem[];
  onSaveOrder: (order: PurchaseOrder) => void;
}

const OrderingView: React.FC<OrderingViewProps> = ({ orders, suppliers, stockItems, onSaveOrder }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newOrder, setNewOrder] = useState<Partial<PurchaseOrder>>({ status: 'draft', items: [], date: new Date() });

  const handleAddItem = () => {
    setNewOrder({
      ...newOrder,
      items: [...(newOrder.items || []), { stockId: '', quantity: 1, unitPrice: 0 }]
    });
  };

  const handleUpdateItem = (index: number, field: string, value: any) => {
    const items = [...(newOrder.items || [])];
    items[index] = { ...items[index], [field]: value };
    
    // Auto-fill price if stockId changed
    if (field === 'stockId') {
      const stock = stockItems.find(s => s.id === value);
      if (stock) {
        items[index].unitPrice = stock.price;
      }
    }
    
    setNewOrder({ ...newOrder, items });
  };

  const handleSave = (status: 'draft' | 'sent') => {
    if (!newOrder.supplierId) return;
    
    const total = (newOrder.items || []).reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    
    onSaveOrder({
      id: newOrder.id || generateId(),
      supplierId: newOrder.supplierId,
      date: newOrder.date || new Date(),
      status: status,
      items: newOrder.items || [],
      total
    });
    
    setIsCreating(false);
    setNewOrder({ status: 'draft', items: [], date: new Date() });
  };

  const getSupplierName = (id: string) => suppliers.find(s => s.id === id)?.name || 'Unknown Supplier';
  const getStockName = (id: string) => stockItems.find(s => s.id === id)?.name || 'Unknown Item';

  return (
    <div className="flex-1 p-8 overflow-auto custom-scrollbar glass-panel ">
       <div className="mb-6 flex justify-between items-center">
         <div>
             <h2 className="text-2xl font-bold text-slate-50  flex items-center">
                <ShoppingCart className="w-6 h-6 mr-2 text-indigo-500" /> Purchase Orders
             </h2>
             <p className="text-slate-400 ">Manage supplier orders and restocks.</p>
         </div>
         {!isCreating && (
             <button onClick={() => setIsCreating(true)} className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                <Plus className="w-4 h-4" /> <span>Create Order</span>
             </button>
         )}
       </div>

       {isCreating ? (
         <div className="glass-panel  rounded-xl border border-white/10  p-6 shadow-lg mb-8">
            <h3 className="text-lg font-bold text-slate-50  mb-4">New Purchase Order</h3>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-medium text-slate-200  mb-1">Supplier</label>
                    <select 
                      className="w-full px-3 py-2 border border-white/20  rounded-lg glass-panel  text-slate-50 "
                      value={newOrder.supplierId || ''}
                      onChange={(e) => setNewOrder({...newOrder, supplierId: e.target.value})}
                    >
                        <option value="">Select a supplier...</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-slate-200 ">Order Items</label>
                    <button onClick={handleAddItem} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center">
                        <Plus className="w-3 h-3 mr-1" /> Add Line Item
                    </button>
                </div>
                
                <div className="space-y-3">
                    {(newOrder.items || []).map((item, idx) => (
                        <div key={idx} className="flex gap-4 items-center">
                            <select 
                              className="flex-1 px-3 py-2 border border-white/20  rounded-lg glass-panel  text-slate-50  text-sm"
                              value={item.stockId}
                              onChange={(e) => handleUpdateItem(idx, 'stockId', e.target.value)}
                            >
                                <option value="">Select Item...</option>
                                {stockItems.map(s => <option key={s.id} value={s.id}>{s.name} ({s.unit})</option>)}
                            </select>
                            <div className="w-24">
                                <input 
                                  type="number" 
                                  placeholder="Qty" 
                                  min="1"
                                  className="w-full px-3 py-2 border border-white/20  rounded-lg glass-panel  text-slate-50  text-sm"
                                  value={item.quantity}
                                  onChange={(e) => handleUpdateItem(idx, 'quantity', parseInt(e.target.value) || 0)}
                                />
                            </div>
                            <div className="w-32 relative">
                                <span className="absolute left-3 top-2 text-slate-400 text-sm">$</span>
                                <input 
                                  type="number" 
                                  placeholder="Price" 
                                  step="0.01"
                                  className="w-full pl-7 pr-3 py-2 border border-white/20  rounded-lg glass-panel  text-slate-50  text-sm"
                                  value={item.unitPrice}
                                  onChange={(e) => handleUpdateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                                />
                            </div>
                            <div className="w-24 text-right font-medium text-slate-50  text-sm">
                                ${(item.quantity * item.unitPrice).toFixed(2)}
                            </div>
                        </div>
                    ))}
                    {(!newOrder.items || newOrder.items.length === 0) && (
                        <div className="p-4 border border-dashed border-white/20  rounded-lg text-center text-slate-400 text-sm">
                            No items added yet.
                        </div>
                    )}
                </div>
                
                {newOrder.items && newOrder.items.length > 0 && (
                    <div className="mt-4 text-right text-lg font-bold text-slate-50 ">
                        Total: ${(newOrder.items || []).reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toFixed(2)}
                    </div>
                )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 ">
                <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-slate-300  font-medium hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">Cancel</button>
                <button onClick={() => handleSave('draft')} className="px-4 py-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors flex items-center">
                    <Package className="w-4 h-4 mr-2" /> Save Draft
                </button>
                <button onClick={() => handleSave('sent')} className="px-6 py-2 bg-indigo-600 text-white font-medium hover:bg-indigo-700 rounded-lg transition-colors flex items-center">
                    <Send className="w-4 h-4 mr-2" /> Send Order
                </button>
            </div>
         </div>
       ) : null}

       <div className="glass-panel  rounded-xl border border-white/10  overflow-hidden shadow-lg">
          <table className="w-full text-left">
             <thead className="glass-panel /50 text-xs uppercase text-slate-400 ">
                 <tr>
                     <th className="px-6 py-4 font-semibold">Date</th>
                     <th className="px-6 py-4 font-semibold">Supplier</th>
                     <th className="px-6 py-4 font-semibold">Items</th>
                     <th className="px-6 py-4 font-semibold">Total</th>
                     <th className="px-6 py-4 font-semibold">Status</th>
                     <th className="px-6 py-4 font-semibold text-right">Action</th>
                 </tr>
             </thead>
             <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                 {orders.map(order => (
                     <tr key={order.id} className={`hover:glass-panel dark:hover:bg-slate-700/50 transition-colors ${order.isDemo ? 'demo-highlight' : ''}`}>
                         <td className="px-6 py-4 text-sm text-slate-300 ">{formatDate(order.date)}</td>
                         <td className="px-6 py-4 font-medium text-slate-50 ">{getSupplierName(order.supplierId)}</td>
                         <td className="px-6 py-4 text-sm text-slate-400">{order.items.length} items</td>
                         <td className="px-6 py-4 text-sm font-bold text-slate-50 ">${order.total.toFixed(2)}</td>
                         <td className="px-6 py-4">
                             <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold uppercase ${
                                 order.status === 'received' ? 'bg-green-100 text-green-700' :
                                 order.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                                 'bg-gray-100 text-slate-200  '
                             }`}>
                                 {order.status}
                             </span>
                         </td>
                         <td className="px-6 py-4 text-right">
                             {order.status === 'sent' && (
                                 <button 
                                     onClick={() => onSaveOrder({...order, status: 'received'})}
                                     className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center justify-end w-full"
                                 >
                                     <CheckCircle className="w-4 h-4 mr-1" /> Mark Received
                                 </button>
                             )}
                             {order.status === 'draft' && (
                                 <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Edit</button>
                             )}
                         </td>
                     </tr>
                 ))}
                 {orders.length === 0 && (
                     <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No purchase orders found.</td></tr>
                 )}
             </tbody>
          </table>
       </div>
    </div>
  );
};

export default OrderingView;
