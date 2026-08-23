import React, { useState } from 'react';
import { StockItem, EODSalesData } from '../types';
import { generateId } from '../utils';
import { Calendar as CalendarIcon, Check, Plus, AlertCircle, Trash2 } from 'lucide-react';
import { db } from '../services/database';

interface EODSalesViewProps {
  stockItems: StockItem[];
  onSalesSubmitted: (data: EODSalesData) => void;
}

const EODSalesView: React.FC<EODSalesViewProps> = ({ stockItems, onSalesSubmitted }) => {
  const [date, setDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [salesLines, setSalesLines] = useState<{ stockId: string; quantity: number }[]>([
      { stockId: '', quantity: 0 }
  ]);

  const handleAddLine = () => {
      setSalesLines([...salesLines, { stockId: '', quantity: 0 }]);
  };

  const handleRemoveLine = (index: number) => {
      const newLines = [...salesLines];
      newLines.splice(index, 1);
      setSalesLines(newLines);
  };

  const handleLineChange = (index: number, field: 'stockId' | 'quantity', value: any) => {
      const newLines = [...salesLines];
      newLines[index] = { ...newLines[index], [field]: value };
      setSalesLines(newLines);
  };

  const handleSubmit = () => {
      // Filter out empty lines
      const validLines = salesLines.filter(line => line.stockId && line.quantity > 0);
      if (validLines.length === 0) return;

      const salesData: EODSalesData = {
          id: generateId(),
          date: new Date(date),
          staffId: 'admin',
          itemsSold: validLines
      };

      onSalesSubmitted(salesData);
      
      // Reset
      setSalesLines([{ stockId: '', quantity: 0 }]);
      alert('EOD Sales Data Submitted successfully. Stock quantities have been updated.');
  };

  return (
    <div className="flex-1 p-8 overflow-auto custom-scrollbar bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-sm">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">End of Day Sales Entry</h2>
        <p className="text-slate-400 mt-2">Enter items sold today to automatically decrement stock quantities.</p>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg p-6 max-w-4xl">
        
        <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-white/10">
            <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sales Date</label>
                <div className="relative">
                    <CalendarIcon className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                    <input 
                        type="date"
                        className="pl-10 pr-4 py-2 bg-slate-950 text-white border border-white/10 rounded-lg text-sm outline-none text-white w-full md:w-64"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>
            </div>
            <div className="flex items-center text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-lg mt-5">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Quantities entered here will be directly subtracted from inventory counts.</span>
            </div>
        </div>

        <div className="space-y-4 mb-6">
            <div className="flex text-sm font-semibold text-slate-400 px-2 uppercase tracking-wider">
                <div className="flex-[3]">Product</div>
                <div className="flex-1">Quantity Sold</div>
                <div className="w-10"></div>
            </div>
            
            {salesLines.map((line, idx) => (
                <div key={idx} className="flex space-x-4 items-center">
                    <div className="flex-[3]">
                        <select 
                            className="w-full px-3 py-2 bg-slate-950 text-white border border-white/10 rounded-lg text-sm outline-none text-white"
                            value={line.stockId}
                            onChange={(e) => handleLineChange(idx, 'stockId', e.target.value)}
                        >
                            <option value="">Select a product...</option>
                            {stockItems.map(item => (
                                <option key={item.id} value={item.id}>
                                    {item.name} ({item.unit}) - Current Stock: {item.quantity}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1">
                        <input 
                            type="number"
                            min="1"
                            placeholder="Qty"
                            className="w-full px-3 py-2 bg-slate-950 text-white border border-white/10 rounded-lg text-sm outline-none text-white"
                            value={line.quantity || ''}
                            onChange={(e) => handleLineChange(idx, 'quantity', parseInt(e.target.value) || 0)}
                        />
                    </div>
                    <div className="w-10 flex justify-center">
                        <button 
                            onClick={() => handleRemoveLine(idx)}
                            disabled={salesLines.length === 1}
                            className="p-2 text-slate-400 hover:text-red-500 disabled:opacity-50 transition-colors"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            ))}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-white/10">
            <button 
                onClick={handleAddLine}
                className="flex items-center px-4 py-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors text-sm font-medium"
            >
                <Plus className="w-4 h-4 mr-2" /> Add Another Line
            </button>
            
            <button 
                onClick={handleSubmit}
                className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md font-medium"
            >
                <Check className="w-4 h-4 mr-2" /> Process Sales & Update Stock
            </button>
        </div>
      </div>
    </div>
  );
};

export default EODSalesView;
