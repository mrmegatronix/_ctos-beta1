import React, { useState, useMemo, useEffect } from 'react';
import { StockItem, StocktakeSession, TeamMember } from '../types';
import { ClipboardList, Search, CheckCircle, AlertTriangle, Play, Save, Smartphone, X, Scan, Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { generateId } from '../utils';
import { BarcodeScanner } from './BarcodeScanner';
import TemplateViewerModal from './TemplateViewerModal';
import StocktakeSheet from './templates/StocktakeSheet';

interface StocktakeViewProps {
  items: StockItem[];
  currentUser: TeamMember;
  onCommit: (session: StocktakeSession) => void;
}

const StocktakeView: React.FC<StocktakeViewProps> = ({ items, currentUser, onCommit }) => {
  const [isActive, setIsActive] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState('');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Load progress on mount
  useEffect(() => {
    const saved = localStorage.getItem('ctos_stocktake_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCounts(parsed);
        setIsActive(true); // Automatically activate if a draft exists
      } catch (e) {
        console.error("Failed to load stocktake draft", e);
      }
    }
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter(i => 
      i.name.toLowerCase().includes(filter.toLowerCase()) || 
      i.category.toLowerCase().includes(filter.toLowerCase()) ||
      (i.barcode && i.barcode.includes(filter))
    );
  }, [items, filter]);

  const handleStart = () => {
    setIsActive(true);
    setCounts({});
  };

  const handleCountChange = (id: string, val: string) => {
    setCounts(prev => ({ ...prev, [id]: parseFloat(val) || 0 }));
  };

  const handleSaveProgress = () => {
    localStorage.setItem('ctos_stocktake_draft', JSON.stringify(counts));
    alert("Progress saved locally.");
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
    localStorage.removeItem('ctos_stocktake_draft');
  };

  const qrUrl = window.location.origin + '?module=stocktake&autologin=true';

  return (
    <>
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-200 dark:border-slate-700 flex flex-col md:flex-row md:justify-between md:items-center bg-white dark:bg-slate-800 shadow-sm space-y-4 md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 flex items-center">
              <ClipboardList className="w-6 h-6 mr-2 text-indigo-500" /> Stocktake
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Perform physical inventory counts and record variances.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => setIsQrModalOpen(true)}
              className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white px-4 py-2.5 rounded-lg shadow-sm font-medium transition-colors"
            >
              <Smartphone className="w-4 h-4" /> <span>Mobile Stocktake</span>
            </button>
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white px-4 py-2.5 rounded-lg shadow-sm font-medium transition-colors"
            >
              <Printer className="w-4 h-4" /> <span>Print Sheet</span>
            </button>

            {!isActive ? (
              <button onClick={handleStart} className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg shadow-lg font-medium transition-colors">
                <Play className="w-4 h-4" /> <span>Start Stocktake</span>
              </button>
            ) : (
              <>
                <button onClick={handleSaveProgress} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors font-medium">Save Progress</button>
                <button onClick={() => setIsActive(false)} className="px-4 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium">Cancel</button>
                <button onClick={handleCommit} className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg shadow-lg font-medium transition-colors">
                  <Save className="w-4 h-4" /> <span className="hidden md:inline">Commit & Update Stock</span><span className="md:hidden">Commit</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="p-4 md:p-6 overflow-y-auto">
          <div className="flex items-center space-x-3 max-w-xl mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Filter items by name, category, or barcode..." 
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <button 
              onClick={() => setShowScanner(true)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg transition-colors font-medium shadow-sm"
            >
              <Scan className="w-5 h-5" />
              <span className="hidden sm:inline">Scan Item</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-lg overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-gray-50 dark:bg-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400 border-b border-gray-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 font-semibold">Item Name</th>
                  <th className="px-6 py-4 font-semibold">Location</th>
                  <th className="px-6 py-4 font-semibold text-center">System Qty</th>
                  <th className="px-6 py-4 font-semibold text-center w-32">Actual Count</th>
                  <th className="px-6 py-4 font-semibold text-right">Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {filteredItems.map(item => {
                  const actual = counts[item.id] !== undefined ? counts[item.id] : (isActive ? '' : item.quantity);
                  const variance = isActive && counts[item.id] !== undefined ? counts[item.id] - item.quantity : 0;
                  
                  return (
                    <tr key={item.id} className={`hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${item.isDemo ? 'demo-highlight' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-slate-50">{item.name}</div>
                        <div className="text-xs text-slate-500 mt-1">{item.category} {item.barcode && ` • ${item.barcode}`}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        {item.location ? (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded text-xs">{item.location}</span>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-slate-500 dark:text-slate-400">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input 
                          type="number" 
                          disabled={!isActive}
                          value={actual}
                          onChange={(e) => handleCountChange(item.id, e.target.value)}
                          placeholder={item.quantity.toString()}
                          className="w-24 text-center px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
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
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No items found matching the filter or barcode.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isQrModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-xl relative animate-in zoom-in-95 duration-200 text-center">
              <button 
                onClick={() => setIsQrModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-slate-900 dark:hover:text-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
              <Smartphone className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Mobile Stocktake</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                Scan this QR code with a mobile device to perform stocktake directly from your phone.
              </p>
              <div className="bg-white p-4 rounded-xl inline-block mx-auto border border-gray-200">
                <QRCodeSVG value={qrUrl} size={200} />
              </div>
              <p className="mt-6 text-xs text-slate-500 break-all bg-gray-100 dark:bg-slate-900 p-2 rounded">
                {qrUrl}
              </p>
            </div>
          </div>
        )}
      
        {isPrintModalOpen && (
          <TemplateViewerModal title="Stocktake Sheet" onClose={() => setIsPrintModalOpen(false)}>
            <StocktakeSheet stock={items} />
          </TemplateViewerModal>
        )}

        {showScanner && (
          <BarcodeScanner 
            onScan={(barcode) => {
              setFilter(barcode);
              setShowScanner(false);
              // If we aren't active, activate stocktake automatically so they can type immediately
              if (!isActive) {
                handleStart();
              }
            }}
            onClose={() => setShowScanner(false)}
          />
        )}
      </div>
    </>
  );
};

export default StocktakeView;
