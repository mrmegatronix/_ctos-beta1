import React, { useState } from 'react';
import { StockItem, Supplier } from '../types';
import { AlertTriangle, Package, TrendingDown, ArrowUp, ArrowDown, ArrowRightLeft, X, Plus, Edit2, Printer, Edit3, Scan } from 'lucide-react';
import { StockInfoModal } from './StockInfoModal';
import { FileText, ClipboardList, RefreshCw } from 'lucide-react';
import { BarcodeScanner } from './BarcodeScanner';
import TemplateViewerModal from './TemplateViewerModal';
import LowStockSheet from './templates/LowStockSheet';
import DigitalClock from './DigitalClock';

interface StockViewProps {
  onSaveItem: (item: StockItem) => void;
  items: StockItem[];
  suppliers: Supplier[];
  onUpdateQuantity: (id: string, delta: number) => void;
  filterType?: string;
  groupBy?: string;
}

const StockView: React.FC<StockViewProps> = ({ items, suppliers, onUpdateQuantity, onSaveItem, filterType, groupBy }) => {
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [printFormat, setPrintFormat] = useState<'inventory' | 'stocktake' | 'reorder'>('inventory');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [isInlineEditMode, setIsInlineEditMode] = useState(false);
  const [localEdits, setLocalEdits] = useState<Record<string, StockItem>>({});
  const [showScanner, setShowScanner] = useState(false);
  const [activeTab, setActiveTab] = useState<'All' | 'Food' | 'Beverage'>('All');
  const [isLowStockPrintModalOpen, setIsLowStockPrintModalOpen] = useState(false);

  const handleLocalEdit = (item: StockItem, field: keyof StockItem, value: any) => {
    const current = localEdits[item.id] || item;
    setLocalEdits(prev => ({ ...prev, [item.id]: { ...current, [field]: value } }));
  };

  const handleBlur = (item: StockItem) => {
    if (localEdits[item.id]) {
      onSaveItem(localEdits[item.id]);
    }
  };

  const handleAdd = (barcode?: string) => {
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
      allergens: [],
      barcode: barcode
    });
  };

  const handleScanBarcode = (barcode: string) => {
    setShowScanner(false);
    const existing = items.find(i => i.barcode === barcode);
    if (existing) {
      setEditingItem(existing);
    } else {
      if (confirm(`Barcode ${barcode} not found. Create new item?`)) {
        handleAdd(barcode);
      }
    }
  };


  let displayItems = items;
  if (activeTab !== 'All') {
      displayItems = displayItems.filter(i => (i.productType || '').toLowerCase() === activeTab.toLowerCase());
  } else if (filterType) {
      displayItems = displayItems.filter(i => i.productType === filterType);
  }
  if (groupBy) {
      displayItems = [...displayItems].sort((a, b) => {
          const valA = (groupBy === 'supplier' ? a.supplierId : a.category) || '';
          const valB = (groupBy === 'supplier' ? b.supplierId : b.category) || '';
          return valA.localeCompare(valB);
      });
  }

  const lowStockItems = displayItems.filter(i => i.quantity <= i.minLevel);
  
  // Items to display during print based on selected print format
  const printableItems = printFormat === 'reorder' ? lowStockItems : displayItems;

  // Transfer Modal State
  const [transferItem, setTransferItem] = useState<StockItem | null>(null);
  const [transferQty, setTransferQty] = useState<number>(1);
  const [transferDest, setTransferDest] = useState<string>('Main Bar');

  const handleTransfer = () => {
      if (transferItem && transferQty > 0) {
          onUpdateQuantity(transferItem.id, -transferQty);
          console.log(`Transferred ${transferQty} of ${transferItem.name} to ${transferDest}`);
          setTransferItem(null);
          setTransferQty(1);
      }
  };

  const triggerPrint = (format: 'inventory' | 'stocktake' | 'reorder') => {
      setPrintFormat(format);
      setShowPrintModal(false);
      setTimeout(() => {
          window.print();
      }, 150);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-sm overflow-hidden relative print:bg-white print:text-black print:overflow-visible print:h-auto">
      {isLowStockPrintModalOpen && (
        <TemplateViewerModal title="Low Stock Report" onClose={() => setIsLowStockPrintModalOpen(false)}>
          <LowStockSheet stock={items} />
        </TemplateViewerModal>
      )}
      {/* Printable Header (Visible only when printing) */}
      <div className="hidden print:block px-6 pt-4 pb-2 mb-4 border-b-2 border-gray-800">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-2xl font-black tracking-wider uppercase text-gray-900">CTOS</div>
            <div className="text-base font-bold text-gray-700 mt-0.5">
              {printFormat === 'stocktake' 
                ? '📋 STOCKTAKE PHYSICAL COUNT SHEET' 
                : printFormat === 'reorder' 
                  ? '⚠️ LOW STOCK & REORDER REPORT' 
                  : '📦 STOCK INVENTORY LIST'}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Category: <span className="font-semibold text-gray-900">{filterType || 'All Categories'}</span>
              {groupBy && <span> | Grouping: <span className="font-semibold text-gray-900">{groupBy}</span></span>}
            </div>
          </div>
          <div className="text-right text-xs text-gray-600">
            <div><strong>Date:</strong> {new Date().toLocaleDateString('en-NZ', { dateStyle: 'medium' })} <DigitalClock date={new Date()} /></div>
            <div><strong>Total Listed Items:</strong> {printableItems.length}</div>
            {printFormat === 'inventory' && (
              <div><strong>Total Inventory Value:</strong> ${displayItems.reduce((acc, i) => acc + (i.price * i.quantity), 0).toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            )}
            {printFormat === 'stocktake' && (
              <div className="mt-1 text-[11px] border border-gray-400 px-2 py-1 rounded bg-gray-50 text-left">
                <div>Counted by: ________________________</div>
                <div className="mt-0.5">Checked by: ________________________</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Stats (Hidden during print) */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
        <div className="bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-sm rounded-xl p-4 flex items-center space-x-4">
           <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
             <Package className="w-6 h-6" />
           </div>
           <div>
             <div className="text-sm text-slate-400">Total Items</div>
             <div className="text-2xl font-bold text-white">{displayItems.length}</div>
           </div>
        </div>
        
        <div className="bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-sm rounded-xl p-4 flex items-center space-x-4">
           <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
             <AlertTriangle className="w-6 h-6" />
           </div>
           <div>
             <div className="text-sm text-slate-400">Low Stock Alerts</div>
             <div className="text-2xl font-bold text-white">{lowStockItems.length}</div>
           </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-sm rounded-xl p-4 flex items-center space-x-4">
           <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400">
             <TrendingDown className="w-6 h-6" />
           </div>
           <div>
             <div className="text-sm text-slate-400">Inventory Value</div>
             <div className="text-2xl font-bold text-white">
                ${displayItems.reduce((acc, i) => acc + (i.price * i.quantity), 0).toFixed(0)}
             </div>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar px-6 pb-6 print:overflow-visible print:p-0 print:px-6">
        {/* Action Controls (Hidden during print) */}
        <div className="flex justify-between items-center mb-4 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-bold text-slate-400">Active View:</span>
            
            <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
              <button 
                onClick={() => setActiveTab('All')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${activeTab === 'All' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                All ({items.length})
              </button>
              <button 
                onClick={() => setActiveTab('Food')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${activeTab === 'Food' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                Food
              </button>
              <button 
                onClick={() => setActiveTab('Beverage')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${activeTab === 'Beverage' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                Beverage
              </button>
            </div>
            {lowStockItems.length > 0 && (
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                {lowStockItems.length} Low Stock
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowScanner(true)}
              className="flex items-center space-x-2 px-3.5 py-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 rounded-lg transition-colors font-medium text-sm shadow-sm hover:bg-indigo-200 dark:hover:bg-indigo-800/50"
              title="Scan Barcode to Add/Edit"
            >
              <Scan className="w-4 h-4" />
              <span>Scan Item</span>
            </button>
            <button 
              onClick={() => setIsInlineEditMode(!isInlineEditMode)} 
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-colors font-medium text-sm shadow-sm ${isInlineEditMode ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200'}`}
              title="Toggle Quick Edit"
            >
               <Edit3 className="w-4 h-4" />
               <span>{isInlineEditMode ? 'Exit Quick Edit' : 'Quick Edit'}</span>
            </button>
            <button 
              onClick={() => setShowPrintModal(true)} 
              className="flex items-center space-x-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg transition-colors font-medium text-sm shadow-sm"
              title="Print Stock Sheets"
            >
               <Printer className="w-4 h-4 text-slate-300" />
               <span>Print</span>
            </button>
            <button 
              onClick={() => setIsLowStockPrintModalOpen(true)}
              className="flex items-center space-x-2 px-3.5 py-2 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/50 dark:hover:bg-amber-800/50 text-amber-800 dark:text-amber-200 rounded-lg transition-colors font-medium text-sm shadow-sm"
              title="Print Low Stock Report"
            >
               <AlertTriangle className="w-4 h-4" />
               <span className="hidden sm:inline">Low Stock Report</span>
            </button>
            <button 
              onClick={() => handleAdd()} 
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-lg font-medium text-sm"
            >
               <Plus className="w-4 h-4" />
               <span>Add Item</span>
            </button>
          </div>
        </div>

        {/* Stock Items Table */}
        <div className="bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-sm rounded-xl overflow-hidden print:border-gray-300 print:shadow-none print:rounded-none overflow-x-auto">
          <table className="w-full text-left border-collapse print:text-xs min-w-[900px]">
            <thead className="sticky top-0 z-10 shadow-sm">
              <tr className="bg-gray-50 dark:bg-slate-800 border-b border-white/10 text-xs uppercase text-slate-400 print:bg-gray-100 print:text-gray-900 print:border-b-2 print:border-gray-400">
                <th className="px-4 py-3 font-semibold print:py-1.5 print:px-2 w-[25%] min-w-[250px]">Item Name</th>
                <th className="px-4 py-3 font-semibold print:py-1.5 print:px-2">Status</th>
                <th className="px-4 py-3 font-semibold print:py-1.5 print:px-2">Location/Barcode</th>
                <th className="px-4 py-3 font-semibold print:py-1.5 print:px-2">Size / Unit</th>
                <th className="px-4 py-3 font-semibold print:py-1.5 print:px-2">Supplier</th>
                <th className="px-4 py-3 font-semibold print:py-1.5 print:px-2">Cost</th>
                <th className="px-4 py-3 font-semibold print:py-1.5 print:px-2">Sell</th>
                <th className="px-4 py-3 font-semibold text-center print:py-1.5 print:px-2">Stock</th>
                <th className="px-4 py-3 font-semibold text-center print:py-1.5 print:px-2">Par</th>
                <th className="px-4 py-3 font-semibold text-center text-blue-600 dark:text-blue-400 print:text-gray-900 print:py-1.5 print:px-2">Order</th>
                
                {/* Physical Count Column for Stocktake Count Sheet Printouts */}
                <th className="hidden print:table-cell px-3 py-1.5 font-bold text-center border-l border-gray-300">
                  {printFormat === 'stocktake' ? 'Physical Count' : 'Check'}
                </th>

                <th className="px-4 py-3 font-semibold text-right print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700 print:divide-gray-300">
              {printableItems.length === 0 && (
                 <tr>
                    <td colSpan={10} className="px-6 py-8 text-center text-slate-400 print:text-gray-600">
                       No products found for the selected category. Add items to continue.
                    </td>
                 </tr>
              )}
              {printableItems.map(rawItem => {
                const item = isInlineEditMode && localEdits[rawItem.id] ? localEdits[rawItem.id] : rawItem;
                const orderAmount = Math.max(0, item.minLevel - item.quantity);
                const isLow = item.quantity <= item.minLevel;
                
                return (
                  <tr key={item.id} className={`hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors print:hover:bg-transparent ${item.isDemo ? 'demo-highlight' : ''} ${isLow ? 'bg-red-50/30 dark:bg-red-950/20' : ''}`}>
                    <td className="px-4 py-3 font-medium text-white print:text-gray-900 print:py-1.5 print:px-2 w-[25%] min-w-[250px]">
                      {isInlineEditMode ? (
                        <input 
                          type="text" 
                          className="w-full min-w-[230px] bg-slate-900/60 backdrop-blur-xl border border-gray-300 dark:border-slate-600 rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-indigo-500" 
                          value={item.name} 
                          onChange={(e) => handleLocalEdit(item, 'name', e.target.value)} 
                          onBlur={() => handleBlur(item)} 
                        />
                      ) : (
                        <div className="whitespace-normal break-words max-w-sm">{item.name}</div>
                      )}
                      {!isInlineEditMode && <div className="text-xs text-slate-500 font-normal">{item.category}</div>}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {isInlineEditMode ? (
                        <select
                          className="w-[120px] bg-slate-900/60 backdrop-blur-xl border border-gray-300 dark:border-slate-600 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                          value={item.status || 'In Stock'}
                          onChange={(e) => {
                            handleLocalEdit(item, 'status', e.target.value);
                            onSaveItem({ ...item, status: e.target.value as any });
                          }}
                        >
                          <option value="In Stock">In Stock</option>
                          <option value="Sold Out">Sold Out</option>
                          <option value="Back Order">Back Order</option>
                          <option value="No Longer Stocked">No Longer Stocked</option>
                          <option value="Deprecated">Deprecated</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          item.status === 'Sold Out' ? 'bg-red-100 text-red-700' :
                          item.status === 'Back Order' ? 'bg-amber-100 text-amber-700' :
                          item.status === 'No Longer Stocked' ? 'bg-gray-100 text-gray-700' :
                          item.status === 'Deprecated' ? 'bg-slate-200 text-slate-500 line-through' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {item.status || 'In Stock'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs print:text-gray-700 print:py-1.5 print:px-2">
                      {item.location && <div className="mb-0.5">Loc: {item.location}</div>}
                      {item.barcode && <div>BC: {item.barcode}</div>}
                      {!item.location && !item.barcode && '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300 print:text-gray-800 print:py-1.5 print:px-2">
                      {isInlineEditMode ? (
                        <div className="flex flex-col space-y-1">
                          <input 
                            type="text" 
                            placeholder="Unit (e.g. pcs)"
                            className="w-full bg-slate-900/60 backdrop-blur-xl border border-gray-300 dark:border-slate-600 rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-indigo-500" 
                            value={item.unit || ''} 
                            onChange={(e) => handleLocalEdit(item, 'unit', e.target.value)} 
                            onBlur={() => handleBlur(item)} 
                          />
                          <select
                            className="w-[120px] bg-slate-900/60 backdrop-blur-xl border border-gray-300 dark:border-slate-600 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                            value={item.volumeMl || ''}
                            onChange={(e) => {
                              handleLocalEdit(item, 'volumeMl', e.target.value ? parseInt(e.target.value) : undefined);
                              const updated = { ...item, volumeMl: e.target.value ? parseInt(e.target.value) : undefined };
                              onSaveItem(updated);
                            }}
                          >
                            <option value="">No Size</option>
                            <option value="50000">50,000ml (50L Keg)</option>
                            <option value="30000">30,000ml (30L Keg)</option>
                            <option value="20000">20,000ml (20L Keg)</option>
                            <option value="1140">1140ml</option>
                            <option value="1000">1000ml</option>
                            <option value="750">750ml</option>
                            <option value="700">700ml</option>
                            <option value="500">500ml</option>
                            <option value="425">425ml</option>
                            <option value="330">330ml</option>
                            <option value="250">250ml</option>
                          </select>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <span>{item.unit || '-'}</span>
                          {item.volumeMl && <span className="text-xs text-slate-400">{item.volumeMl}ml</span>}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300 print:text-gray-800 print:py-1.5 print:px-2">
                      {isInlineEditMode ? (
                        <select
                          className="w-full bg-slate-900/60 backdrop-blur-xl border border-gray-300 dark:border-slate-600 rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                          value={item.supplierId || ''}
                          onChange={(e) => {
                            handleLocalEdit(item, 'supplierId', e.target.value);
                            onSaveItem({ ...item, supplierId: e.target.value });
                          }}
                        >
                          <option value="">None</option>
                          {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      ) : (
                        suppliers.find(s => s.id === item.supplierId)?.name || 'Unknown'
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300 print:text-gray-800 print:py-1.5 print:px-2">
                      {isInlineEditMode ? (
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-20 bg-slate-900/60 backdrop-blur-xl border border-gray-300 dark:border-slate-600 rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-indigo-500" 
                          value={item.cost || 0} 
                          onChange={(e) => handleLocalEdit(item, 'cost', parseFloat(e.target.value))} 
                          onBlur={() => handleBlur(item)} 
                        />
                      ) : (
                        `$${(item.cost || 0).toFixed(2)}`
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300 print:text-gray-800 print:py-1.5 print:px-2">
                      {isInlineEditMode ? (
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-20 bg-slate-900/60 backdrop-blur-xl border border-gray-300 dark:border-slate-600 rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-indigo-500" 
                          value={item.price || 0} 
                          onChange={(e) => handleLocalEdit(item, 'price', parseFloat(e.target.value))} 
                          onBlur={() => handleBlur(item)} 
                        />
                      ) : (
                        `$${(item.price || 0).toFixed(2)}`
                      )}
                    </td>
                    <td className="px-4 py-3 font-bold text-center text-white print:text-gray-900 print:py-1.5 print:px-2">
                      {isInlineEditMode ? (
                        <input 
                          type="number" 
                          className="w-16 mx-auto bg-slate-900/60 backdrop-blur-xl border border-gray-300 dark:border-slate-600 rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-indigo-500 text-center" 
                          value={item.quantity} 
                          onChange={(e) => handleLocalEdit(item, 'quantity', parseInt(e.target.value) || 0)} 
                          onBlur={() => handleBlur(item)} 
                        />
                      ) : (
                        item.quantity
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-700 dark:text-slate-300 print:text-gray-800 print:py-1.5 print:px-2">
                      {isInlineEditMode ? (
                        <input 
                          type="number" 
                          className="w-16 mx-auto bg-slate-900/60 backdrop-blur-xl border border-gray-300 dark:border-slate-600 rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-indigo-500 text-center" 
                          value={item.minLevel} 
                          onChange={(e) => handleLocalEdit(item, 'minLevel', parseInt(e.target.value) || 0)} 
                          onBlur={() => handleBlur(item)} 
                        />
                      ) : (
                        item.minLevel
                      )}
                    </td>
                    <td className="px-4 py-3 font-bold text-center text-blue-600 dark:text-blue-400 print:text-gray-900 print:py-1.5 print:px-2">
                      {orderAmount > 0 ? orderAmount : '-'}
                    </td>
                    
                    {/* Blank checkbox / box for physical count printout */}
                    <td className="hidden print:table-cell px-3 py-1.5 text-center border-l border-gray-300">
                      <div className="w-14 h-5 border border-dashed border-gray-400 mx-auto rounded"></div>
                    </td>

                    <td className="px-4 py-3 text-right flex items-center justify-end space-x-2 print:hidden">
                      <button 
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-600 text-slate-400"
                          title="Reduce Stock"
                      >
                          <ArrowDown className="w-4 h-4" />
                      </button>
                      <button 
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-600 text-slate-400"
                          title="Add Stock"
                      >
                          <ArrowUp className="w-4 h-4" />
                      </button>
                      <button 
                          onClick={() => setTransferItem(rawItem)}
                          className="p-1 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 ml-2"
                          title="Transfer to other site"
                      >
                          <ArrowRightLeft className="w-4 h-4" />
                      </button>
                      <button 
                          onClick={() => setEditingItem(rawItem)}
                          className="p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 ml-2"
                          title="Edit Item Info"
                      >
                          <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print Options Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:hidden">
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl w-full max-w-md p-6 shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Print Stock Sheets</h3>
                  <p className="text-xs text-slate-400">Choose a printer-friendly layout format</p>
                </div>
              </div>
              <button onClick={() => setShowPrintModal(false)} className="text-gray-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 my-5">
              <button
                onClick={() => triggerPrint('inventory')}
                className="w-full text-left p-3.5 rounded-xl border border-white/10 hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-900/20 transition-all flex items-start space-x-3 group"
              >
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-sm text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    Full Inventory Stock List
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Complete product listing with cost, sell prices, current stock, par levels, and inventory valuation.
                  </div>
                </div>
              </button>

              <button
                onClick={() => triggerPrint('stocktake')}
                className="w-full text-left p-3.5 rounded-xl border border-white/10 hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-900/20 transition-all flex items-start space-x-3 group"
              >
                <ClipboardList className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-sm text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    Stocktake Physical Count Sheet
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Includes blank physical count boxes and signature lines for paper clipboard stocktakes.
                  </div>
                </div>
              </button>

              <button
                onClick={() => triggerPrint('reorder')}
                className="w-full text-left p-3.5 rounded-xl border border-white/10 hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-900/20 transition-all flex items-start space-x-3 group"
              >
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-sm text-white group-hover:text-amber-600 dark:group-hover:text-amber-400">
                    Low Stock & Reorder Sheet ({lowStockItems.length} items)
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Filters strictly to items below par level for fast ordering and supplier purchasing.
                  </div>
                </div>
              </button>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-white/5 dark:border-slate-700">
              <button 
                onClick={() => setShowPrintModal(false)} 
                className="px-4 py-2 text-sm text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {transferItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-sm  rounded-2xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-slate-50 ">Transfer Stock</h3>
                      <button onClick={() => setTransferItem(null)} className="text-gray-400 hover:text-slate-400">
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  
                  <div className="mb-4 p-3 bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-sm rounded-lg">
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
                            className="w-full px-3 py-2 bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-sm  border border-white/10  rounded-lg outline-none"
                            value={transferQty}
                            onChange={(e) => setTransferQty(parseInt(e.target.value) || 0)}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-200  mb-1">Destination Site</label>
                          <select 
                            className="w-full px-3 py-2 bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-sm  border border-white/10  rounded-lg outline-none"
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

      {showScanner && (
        <BarcodeScanner 
          onScan={handleScanBarcode}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
};

export default StockView;
