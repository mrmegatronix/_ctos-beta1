import React, { useState, useMemo } from 'react';
import { StockItem, StocktakeSession, TeamMember } from '../types';
import { ClipboardList, Search, CheckCircle, AlertTriangle, Play, Save } from 'lucide-react';
import { generateId } from '../utils';

interface StocktakeViewProps {
  items: StockItem[];
  currentUser: TeamMember;
  onCommit: (session: StocktakeSession) => void;
}

const StocktakeView: React.FC<StocktakeViewProps> = ({ items, currentUser, onCommit }) => {
  const [isActive, setIsActive] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState('');

  const filteredItems = useMemo(() => {
    return items.filter(i => i.name.toLowerCase().includes(filter.toLowerCase()) || i.category.toLowerCase().includes(filter.toLowerCase()));
  }, [items, filter]);

  const handleStart = () => {
    setIsActive(true);
    setCounts({}); // reset counts
  };

  const handleCountChange = (id: string, val: string) => {
    setCounts(prev => ({ ...prev, [id]: parseFloat(val) || 0 }));
  };

  const handleCommit = () => {
    const sessionItems = items.map(item => {
      const actual = counts[item.id] !== undefined ? counts[item.id] : item.quantity;
      return {
        stockId: item.id,
        expected: item.quantity,
        actual: actual,
        variance: actual - item.quantity
      };
    });

    const session: StocktakeSession = {
      id: generateId(),
      date: new Date(),
      staffId: currentUser.id,
      status: 'completed',
      items: sessionItems
    };

    onCommit(session);
    setIsActive(false);
    setCounts({});
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm  overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-slate-700  flex justify-between items-center bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm /50">
        <div>
          <h2 className="text-2xl font-bold text-slate-50  flex items-center">
            <ClipboardList className="w-6 h-6 mr-2 text-indigo-500" /> Stocktake
          </h2>
          <p className="text-sm text-slate-400 ">Perform physical inventory counts and record variances.</p>
        </div>
        <div>
          {!isActive ? (
            <button onClick={handleStart} className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg shadow-lg font-medium transition-colors">
              <Play className="w-4 h-4" /> <span>Start Stocktake</span>
            </button>
          ) : (
            <div className="flex space-x-3">
               <button onClick={() => setIsActive(false)} className="px-4 py-2 text-slate-300  hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium">Cancel</button>
               <button onClick={handleCommit} className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg shadow-lg font-medium transition-colors">
                 <Save className="w-4 h-4" /> <span>Commit Counts</span>
               </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Filter items..." 
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700  rounded-lg bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm  text-slate-50  focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm  rounded-xl border border-gray-200 dark:border-slate-700  overflow-hidden shadow-lg">
          <table className="w-full text-left">
            <thead className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm /50 text-xs uppercase text-slate-400  border-b border-gray-200 dark:border-slate-700 ">
              <tr>
                <th className="px-6 py-4 font-semibold">Item Name</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold text-center">System Qty</th>
                <th className="px-6 py-4 font-semibold text-center">Actual Count</th>
                <th className="px-6 py-4 font-semibold text-right">Variance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {filteredItems.map(item => {
                const actual = counts[item.id] !== undefined ? counts[item.id] : (isActive ? '' : item.quantity);
                const variance = isActive && counts[item.id] !== undefined ? counts[item.id] - item.quantity : 0;
                
                return (
                  <tr key={item.id} className={`hover:bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm dark:hover:bg-slate-700/50 transition-colors ${item.isDemo ? 'demo-highlight' : ''}`}>
                    <td className="px-6 py-4 font-medium text-slate-50 ">{item.name}</td>
                    <td className="px-6 py-4 text-slate-300 ">
                      <span className="px-2 py-1 bg-gray-100  rounded text-xs">{item.category}</span>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-400 ">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="number" 
                        disabled={!isActive}
                        value={actual}
                        onChange={(e) => handleCountChange(item.id, e.target.value)}
                        placeholder={item.quantity.toString()}
                        className="w-24 text-center px-3 py-1.5 border border-gray-200 dark:border-slate-700  rounded-md bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm  text-slate-50  focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isActive && counts[item.id] !== undefined ? (
                        <span className={`inline-flex items-center space-x-1 font-bold ${variance === 0 ? 'text-green-500' : 'text-red-500'}`}>
                           {variance === 0 ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                           <span>{variance > 0 ? '+' : ''}{variance}</span>
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StocktakeView;
