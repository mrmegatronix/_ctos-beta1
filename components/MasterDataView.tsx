import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, Database, Package, Users, Coffee } from 'lucide-react';
import { StockItem, TeamMember, Menu, MenuItem } from '../types';

interface MasterDataViewProps {
  stock: StockItem[];
  staff: TeamMember[];
  menus: Menu[];
  onSaveStock: (stock: StockItem[]) => Promise<void>;
  onSaveStaff: (staff: TeamMember[]) => Promise<void>;
  onSaveMenus: (menus: Menu[]) => Promise<void>;
}

const MasterDataView: React.FC<MasterDataViewProps> = ({ stock, staff, menus, onSaveStock, onSaveStaff, onSaveMenus }) => {
  const [activeTab, setActiveTab] = useState<'stock' | 'staff' | 'menus'>('stock');
  
  // Local mutable state for the grid
  const [localStock, setLocalStock] = useState<StockItem[]>([]);
  const [localStaff, setLocalStaff] = useState<TeamMember[]>([]);
  const [localMenuItems, setLocalMenuItems] = useState<(MenuItem & { menuId: string, menuTitle: string })[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    // Only reset if no unsaved changes to prevent wiping out user edits if a sync happens in background
    if (!hasUnsavedChanges) {
      setLocalStock([...(stock || [])]);
      setLocalStaff([...(staff || [])]);
      
      const flatMenuItems = (menus || []).flatMap(menu => 
        (menu.items || []).map(item => ({
          ...item,
          menuId: menu.id,
          menuTitle: menu.title
        }))
      );
      setLocalMenuItems(flatMenuItems);
    }
  }, [stock, staff, menus, hasUnsavedChanges]);

  const handleStockChange = (index: number, field: keyof StockItem, value: any) => {
    const updated = [...localStock];
    (updated[index] as any)[field] = value;
    setLocalStock(updated);
    setHasUnsavedChanges(true);
  };

  const handleStaffChange = (index: number, field: keyof TeamMember, value: any) => {
    const updated = [...localStaff];
    (updated[index] as any)[field] = value;
    setLocalStaff(updated);
    setHasUnsavedChanges(true);
  };

  const handleMenuChange = (index: number, field: keyof MenuItem, value: any) => {
    const updated = [...localMenuItems];
    (updated[index] as any)[field] = value;
    setLocalMenuItems(updated);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (activeTab === 'stock') {
        await onSaveStock(localStock);
      } else if (activeTab === 'staff') {
        await onSaveStaff(localStaff);
      } else if (activeTab === 'menus') {
        const updatedMenus = [...menus];
        localMenuItems.forEach(localItem => {
          const menuIndex = updatedMenus.findIndex(m => m.id === localItem.menuId);
          if (menuIndex !== -1) {
            const itemIndex = updatedMenus[menuIndex].items.findIndex(i => i.id === localItem.id);
            if (itemIndex !== -1) {
               const { menuId, menuTitle, ...rest } = localItem;
               updatedMenus[menuIndex].items[itemIndex] = rest as MenuItem;
            }
          }
        });
        await onSaveMenus(updatedMenus);
      }
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error(err);
      alert('Error saving data');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 backdrop-blur-xl">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white leading-tight">Master Data Editor</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Direct database access via spreadsheet interface</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {hasUnsavedChanges && (
            <div className="flex items-center space-x-1.5 text-amber-600 dark:text-amber-400 text-sm font-medium animate-pulse">
              <AlertCircle className="w-4 h-4" />
              <span>Unsaved Changes</span>
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isSaving}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Tab Changes'}</span>
          </button>
        </div>
      </div>

      <div className="flex px-4 pt-4 border-b border-gray-200 dark:border-white/10 space-x-6 flex-shrink-0">
        <button
          onClick={() => setActiveTab('stock')}
          className={`flex items-center space-x-2 pb-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'stock' 
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' 
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Stock Database</span>
        </button>
        <button
          onClick={() => setActiveTab('menus')}
          className={`flex items-center space-x-2 pb-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'menus' 
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' 
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Coffee className="w-4 h-4" />
          <span>Menu Items (Sales)</span>
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`flex items-center space-x-2 pb-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'staff' 
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' 
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Staff Directory</span>
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-[#0B0F19] p-4">
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-lg shadow-sm border border-gray-200 dark:border-white/10 overflow-hidden h-full flex flex-col">
          {activeTab === 'stock' ? (
            <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1 relative">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-100 dark:bg-slate-900 text-slate-400 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-3 font-semibold border-b dark:border-white/5 border-r dark:border-white/5 min-w-[300px]">Name</th>
                    <th className="px-4 py-3 font-semibold border-b dark:border-white/5 border-r dark:border-white/5 w-40">Category</th>
                    <th className="px-4 py-3 font-semibold border-b dark:border-white/5 border-r dark:border-white/5 w-32">Status</th>
                    <th className="px-4 py-3 font-semibold border-b dark:border-white/5 border-r dark:border-white/5 w-24">Qty</th>
                    <th className="px-4 py-3 font-semibold border-b dark:border-white/5 border-r dark:border-white/5 w-32">Unit</th>
                    <th className="px-4 py-3 font-semibold border-b dark:border-white/5 border-r dark:border-white/5 w-24">Vol (ml)</th>
                    <th className="px-4 py-3 font-semibold border-b dark:border-white/5 border-r dark:border-white/5 w-24">Par</th>
                    <th className="px-4 py-3 font-semibold border-b dark:border-white/5 border-r dark:border-white/5 w-24">Cost</th>
                    <th className="px-4 py-3 font-semibold border-b dark:border-white/5">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-white/5 relative z-0">
                  {localStock.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                      <td className="p-0 border-r dark:border-white/5">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleStockChange(index, 'name', e.target.value)}
                          className="w-full px-4 py-3 bg-transparent border-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 outline-none text-white font-medium"
                        />
                      </td>
                      <td className="p-0 border-r dark:border-white/5">
                        <input
                          type="text"
                          value={item.category}
                          onChange={(e) => handleStockChange(index, 'category', e.target.value)}
                          className="w-full px-4 py-3 bg-transparent border-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 outline-none text-white"
                        />
                      </td>
                      <td className="p-0 border-r dark:border-white/5">
                        <select
                          value={item.status || 'In Stock'}
                          onChange={(e) => handleStockChange(index, 'status', e.target.value)}
                          className="w-full px-4 py-3 bg-transparent border-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 outline-none text-white appearance-none"
                        >
                          <option value="In Stock" className="bg-slate-900 text-white">In Stock</option>
                          <option value="Sold Out" className="bg-slate-900 text-white">Sold Out</option>
                          <option value="Back Order" className="bg-slate-900 text-white">Back Order</option>
                          <option value="Deprecated" className="bg-slate-900 text-white">Deprecated</option>
                          <option value="No Longer Stocked" className="bg-slate-900 text-white">No Longer Stocked</option>
                        </select>
                      </td>
                      <td className="p-0 border-r dark:border-white/5">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleStockChange(index, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-3 bg-transparent border-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 outline-none text-white text-center"
                        />
                      </td>
                      <td className="p-0 border-r dark:border-white/5">
                        <select
                          value={item.unit || 'Bottle'}
                          onChange={(e) => handleStockChange(index, 'unit', e.target.value)}
                          className="w-full px-4 py-3 bg-transparent border-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 outline-none text-white appearance-none"
                        >
                          <option value="Bottle" className="bg-slate-900">Bottle</option>
                          <option value="Keg" className="bg-slate-900">Keg</option>
                          <option value="Can" className="bg-slate-900">Can</option>
                          <option value="Each" className="bg-slate-900">Each</option>
                          <option value="Portion" className="bg-slate-900">Portion</option>
                          <option value="Gram" className="bg-slate-900">Gram</option>
                          <option value="Kg" className="bg-slate-900">Kg</option>
                        </select>
                      </td>
                      <td className="p-0 border-r dark:border-white/5">
                        <input
                          type="number"
                          value={item.volumeMl || ''}
                          onChange={(e) => handleStockChange(index, 'volumeMl', parseInt(e.target.value) || undefined)}
                          className="w-full px-4 py-3 bg-transparent border-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 outline-none text-white text-center"
                          placeholder="-"
                        />
                      </td>
                      <td className="p-0 border-r dark:border-white/5">
                        <input
                          type="number"
                          value={item.minLevel}
                          onChange={(e) => handleStockChange(index, 'minLevel', parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-3 bg-transparent border-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 outline-none text-white text-center"
                        />
                      </td>
                      <td className="p-0 border-r dark:border-white/5">
                        <input
                          type="number"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => handleStockChange(index, 'price', parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-3 bg-transparent border-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 outline-none text-white text-right"
                        />
                      </td>
                      <td className="p-0">
                        <input
                          type="text"
                          value={item.location || ''}
                          onChange={(e) => handleStockChange(index, 'location', e.target.value)}
                          className="w-full px-4 py-3 bg-transparent border-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 outline-none text-white"
                          placeholder="Storage Area..."
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : activeTab === 'menus' ? (
            <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1 relative">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-100 dark:bg-slate-900 text-slate-400 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-3 font-semibold border-b dark:border-white/5 border-r dark:border-white/5 w-48">Menu</th>
                    <th className="px-4 py-3 font-semibold border-b dark:border-white/5 border-r dark:border-white/5 min-w-[300px]">Item Name</th>
                    <th className="px-4 py-3 font-semibold border-b dark:border-white/5 border-r dark:border-white/5 w-24">Price</th>
                    <th className="px-4 py-3 font-semibold border-b dark:border-white/5 border-r dark:border-white/5 w-48">Linked Stock Item ID</th>
                    <th className="px-4 py-3 font-semibold border-b dark:border-white/5 w-32">Deduct (ml)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-white/5 relative z-0">
                  {localMenuItems.map((item, index) => (
                    <tr key={`${item.menuId}-${item.id}`} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-4 py-3 border-r dark:border-white/5 text-gray-500">
                        {item.menuTitle}
                      </td>
                      <td className="p-0 border-r dark:border-white/5">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleMenuChange(index, 'name', e.target.value)}
                          className="w-full px-4 py-3 bg-transparent border-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 outline-none text-white font-medium"
                        />
                      </td>
                      <td className="p-0 border-r dark:border-white/5">
                        <input
                          type="number"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => handleMenuChange(index, 'price', parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-3 bg-transparent border-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 outline-none text-white text-right"
                        />
                      </td>
                      <td className="p-0 border-r dark:border-white/5">
                        <input
                          type="text"
                          value={item.stockItemId || ''}
                          onChange={(e) => handleMenuChange(index, 'stockItemId', e.target.value)}
                          className="w-full px-4 py-3 bg-transparent border-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 outline-none text-white text-xs font-mono"
                          placeholder="stock-xyz"
                        />
                      </td>
                      <td className="p-0">
                        <input
                          type="number"
                          value={item.deductionMl || ''}
                          onChange={(e) => handleMenuChange(index, 'deductionMl', parseInt(e.target.value) || undefined)}
                          className="w-full px-4 py-3 bg-transparent border-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 outline-none text-white text-center"
                          placeholder="-"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1 relative">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-100 dark:bg-slate-900 text-slate-400 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-3 font-semibold border-b dark:border-white/5 border-r dark:border-white/5 w-64">Name</th>
                    <th className="px-4 py-3 font-semibold border-b dark:border-white/5 border-r dark:border-white/5 w-48">Role</th>
                    <th className="px-4 py-3 font-semibold border-b dark:border-white/5 border-r dark:border-white/5 w-32">PIN</th>
                    <th className="px-4 py-3 font-semibold border-b dark:border-white/5 border-r dark:border-white/5 w-64">Email</th>
                    <th className="px-4 py-3 font-semibold border-b dark:border-white/5">Phone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-white/5 relative z-0">
                  {localStaff.map((member, index) => (
                    <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                      <td className="p-0 border-r dark:border-white/5">
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => handleStaffChange(index, 'name', e.target.value)}
                          className="w-full px-4 py-3 bg-transparent border-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 outline-none text-white"
                        />
                      </td>
                      <td className="p-0 border-r dark:border-white/5">
                        <input
                          type="text"
                          value={member.role}
                          onChange={(e) => handleStaffChange(index, 'role', e.target.value)}
                          className="w-full px-4 py-3 bg-transparent border-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 outline-none text-white"
                        />
                      </td>
                      <td className="p-0 border-r dark:border-white/5">
                        <input
                          type="text"
                          value={member.pinCode}
                          onChange={(e) => handleStaffChange(index, 'pinCode', e.target.value)}
                          className="w-full px-4 py-3 bg-transparent border-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 outline-none text-white font-mono"
                        />
                      </td>
                      <td className="p-0 border-r dark:border-white/5">
                        <input
                          type="text"
                          value={member.email || ''}
                          onChange={(e) => handleStaffChange(index, 'email', e.target.value)}
                          className="w-full px-4 py-3 bg-transparent border-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 outline-none text-white"
                        />
                      </td>
                      <td className="p-0">
                        <input
                          type="text"
                          value={member.phone || ''}
                          onChange={(e) => handleStaffChange(index, 'phone', e.target.value)}
                          className="w-full px-4 py-3 bg-transparent border-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 outline-none text-white"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MasterDataView;
