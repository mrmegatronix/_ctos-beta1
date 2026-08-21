import React from 'react';
import { StockItem } from '../../types';
import { formatDate } from '../../utils';

interface StocktakeSheetProps {
  stock: StockItem[];
}

const StocktakeSheet: React.FC<StocktakeSheetProps> = ({ stock }) => {
  // Group by category, then location
  const grouped = stock.reduce((acc, item) => {
    const cat = item.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, StockItem[]>);

  return (
    <div className="p-8 font-sans text-black bg-white">
      <div className="flex justify-between items-end mb-6 border-b-2 border-black pb-4">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-wider">Stocktake Sheet</h1>
          <p className="text-gray-600 mt-1">Generated: {formatDate(new Date())}</p>
        </div>
        <div className="text-right">
          <p className="font-bold border-b border-black inline-block w-48 text-left mb-2">Staff Name:</p><br/>
          <p className="font-bold border-b border-black inline-block w-48 text-left">Signature:</p>
        </div>
      </div>

      {Object.entries(grouped).sort().map(([category, items]) => (
        <div key={category} className="mb-8 break-inside-avoid">
          <h2 className="text-xl font-bold bg-gray-200 p-2 mb-2 uppercase">{category}</h2>
          <table className="w-full text-left border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 w-1/4">Location/Bin</th>
                <th className="border border-gray-300 p-2 w-1/3">Item Name</th>
                <th className="border border-gray-300 p-2 w-1/6">Size/Unit</th>
                <th className="border border-gray-300 p-2 w-1/6">Expected</th>
                <th className="border border-gray-300 p-2 text-center">Actual Count</th>
              </tr>
            </thead>
            <tbody>
              {items.sort((a, b) => (a.location || '').localeCompare(b.location || '')).map(item => (
                <tr key={item.id} className="border-b border-gray-300">
                  <td className="border border-gray-300 p-2 font-medium">{item.location || '-'}</td>
                  <td className="border border-gray-300 p-2">{item.name}</td>
                  <td className="border border-gray-300 p-2 text-gray-600">{item.volumeMl ? `${item.volumeMl}ml` : item.unit}</td>
                  <td className="border border-gray-300 p-2 text-gray-500">{item.quantity}</td>
                  <td className="border border-gray-300 p-2 bg-gray-50"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      <div className="mt-8 text-xs text-center text-gray-400">
        CTOS Management System - Master Document
      </div>
    </div>
  );
};

export default StocktakeSheet;
