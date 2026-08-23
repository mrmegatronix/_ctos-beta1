import React from 'react';
import { StockItem } from '../../types';
import { formatDate } from '../../utils';

interface LowStockSheetProps {
  stock: StockItem[];
}

const LowStockSheet: React.FC<LowStockSheetProps> = ({ stock }) => {
  const lowStockItems = stock.filter(item => item.quantity <= item.minLevel);
  
  // Sort by category, then by name
  lowStockItems.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto text-black print:p-0 print:max-w-none print:w-full">
      <div className="flex justify-between items-end border-b-2 border-slate-800 pb-4 mb-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wider text-slate-900">Low Stock Report</h1>
          <p className="text-slate-600 font-medium mt-1">Generated: {formatDate(new Date())}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Action Required</p>
          <p className="text-xl font-bold text-red-600">{lowStockItems.length} Items Below Min Level</p>
        </div>
      </div>

      {lowStockItems.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
          <p className="text-lg text-slate-500 font-medium">No items currently below their minimum stock levels.</p>
        </div>
      ) : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b-2 border-slate-800">
              <th className="py-3 px-4 font-bold text-slate-800 uppercase text-xs tracking-wider">Item Name</th>
              <th className="py-3 px-4 font-bold text-slate-800 uppercase text-xs tracking-wider">Category</th>
              <th className="py-3 px-4 font-bold text-slate-800 uppercase text-xs tracking-wider text-center">Current Qty</th>
              <th className="py-3 px-4 font-bold text-slate-800 uppercase text-xs tracking-wider text-center">Min Level</th>
              <th className="py-3 px-4 font-bold text-slate-800 uppercase text-xs tracking-wider text-center text-red-600">Shortfall</th>
              <th className="py-3 px-4 font-bold text-slate-800 uppercase text-xs tracking-wider border-l-2 border-slate-200">Re-Order Qty</th>
            </tr>
          </thead>
          <tbody>
            {lowStockItems.map((item, index) => (
              <tr key={item.id} className={`border-b border-slate-200 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                <td className="py-3 px-4 font-semibold">{item.name}</td>
                <td className="py-3 px-4 text-slate-600 text-sm">{item.category}</td>
                <td className="py-3 px-4 text-center font-medium">{item.quantity} {item.unit}</td>
                <td className="py-3 px-4 text-center text-slate-500">{item.minLevel} {item.unit}</td>
                <td className="py-3 px-4 text-center font-bold text-red-600">
                  {item.minLevel - item.quantity > 0 ? `-${item.minLevel - item.quantity} ${item.unit}` : '0'}
                </td>
                <td className="py-3 px-4 border-l-2 border-slate-200">
                  {/* Empty space for manual filling if printed */}
                  <div className="w-full h-full border-b border-dotted border-slate-400"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      <div className="mt-12 pt-4 border-t border-slate-300 flex justify-between text-sm text-slate-500">
        <div>CTOS Inventory Management</div>
        <div>Page 1 of 1</div>
      </div>
    </div>
  );
};

export default LowStockSheet;
