import React, { useState, useEffect } from 'react';
import { Calculator, Check, Save } from 'lucide-react';
import { DetailedCashUpRecord, Denominations, DenominationCounts, TillReconciliation, SafeCounts } from '../types';

const INITIAL_DENOMINATIONS: DenominationCounts = {
  '100': 0, '50': 0, '20': 0, '10': 0, '5': 0, '2': 0, '1': 0, '0.5': 0, '0.2': 0, '0.1': 0
};

const DENOM_VALUES: { [key in Denominations]: number } = {
  '100': 100, '50': 50, '20': 20, '10': 10, '5': 5, '2': 2, '1': 1, '0.5': 0.5, '0.2': 0.2, '0.1': 0.1
};

const DENOM_KEYS: Denominations[] = ['100', '50', '20', '10', '5', '2', '1', '0.5', '0.2', '0.1'];

const DEFAULT_RECORD: DetailedCashUpRecord = {
  id: '',
  date: new Date().toISOString().split('T')[0],
  tills: {
    fb1: { expectedFloat: 500, counts: { open: { ...INITIAL_DENOMINATIONS }, close: { ...INITIAL_DENOMINATIONS } } },
    fb2: { expectedFloat: 700, counts: { open: { ...INITIAL_DENOMINATIONS }, close: { ...INITIAL_DENOMINATIONS } } },
    fb3: { expectedFloat: 300, counts: { open: { ...INITIAL_DENOMINATIONS }, close: { ...INITIAL_DENOMINATIONS } } },
    gaming: { expectedFloat: 5000, counts: { open: { ...INITIAL_DENOMINATIONS }, close: { ...INITIAL_DENOMINATIONS } } },
    tab: { expectedFloat: 1000, counts: { open: { ...INITIAL_DENOMINATIONS }, close: { ...INITIAL_DENOMINATIONS } } },
    crt: { expectedFloat: 40000, counts: { open: { ...INITIAL_DENOMINATIONS }, close: { ...INITIAL_DENOMINATIONS } } },
  },
  safes: {
    officeOpen: { counts: { denominations: { ...INITIAL_DENOMINATIONS }, looseNotes: 0, looseCoins: 0, pettyCash: 0, hoppers: 0, gamingTill: 0, banking: 0 }, float: 2000, expectedTotal: 2500 },
    gaming: { counts: { denominations: { ...INITIAL_DENOMINATIONS }, looseNotes: 0, looseCoins: 0, pettyCash: 0, hoppers: 0, gamingTill: 0, banking: 0 }, float: 0, expectedTotal: 50000 },
    tabOffice: { counts: { denominations: { ...INITIAL_DENOMINATIONS }, looseNotes: 0, looseCoins: 0, pettyCash: 0, hoppers: 0, gamingTill: 0, banking: 0 }, float: 0, expectedTotal: 3000 },
  },
  notes: {
    day: '',
    night: ''
  }
};

const CashUpView: React.FC = () => {
  const [record, setRecord] = useState<DetailedCashUpRecord>(DEFAULT_RECORD);

  const handleTillChange = (tillKey: keyof DetailedCashUpRecord['tills'], type: 'open' | 'close', denom: Denominations, value: string) => {
    const num = parseInt(value) || 0;
    setRecord(prev => ({
      ...prev,
      tills: {
        ...prev.tills,
        [tillKey]: {
          ...prev.tills[tillKey],
          counts: {
            ...prev.tills[tillKey].counts,
            [type]: {
              ...prev.tills[tillKey].counts[type],
              [denom]: num
            }
          }
        }
      }
    }));
  };

  const handleSafeChange = (safeKey: keyof DetailedCashUpRecord['safes'], field: keyof SafeCounts | string, value: string, denom?: Denominations) => {
    const num = parseFloat(value) || 0;
    setRecord(prev => {
      const updatedSafe = { ...prev.safes[safeKey] };
      if (denom) {
        updatedSafe.counts.denominations = { ...updatedSafe.counts.denominations, [denom]: num };
      } else {
        (updatedSafe.counts as any)[field] = num;
      }
      return {
        ...prev,
        safes: { ...prev.safes, [safeKey]: updatedSafe }
      };
    });
  };

  const calculateTillTotal = (till: TillReconciliation, type: 'open' | 'close') => {
    return DENOM_KEYS.reduce((acc, key) => acc + (till.counts[type][key] * DENOM_VALUES[key]), 0);
  };

  const calculateSafeTotal = (safe: { counts: SafeCounts }) => {
    const denomTotal = DENOM_KEYS.reduce((acc, key) => acc + (safe.counts.denominations[key] * DENOM_VALUES[key]), 0);
    const { looseNotes, looseCoins, pettyCash, hoppers = 0, gamingTill = 0, banking = 0 } = safe.counts;
    return denomTotal + looseNotes + looseCoins + pettyCash + hoppers + gamingTill + banking;
  };

  const formatMoney = (val: number) => `$${val.toFixed(2)}`;

  const renderTillTable = (title: string, tillKey: keyof DetailedCashUpRecord['tills']) => {
    const till = record.tills[tillKey];
    const totalOpen = calculateTillTotal(till, 'open');
    const totalClose = calculateTillTotal(till, 'close');
    const varOpen = totalOpen - till.expectedFloat;
    const varClose = totalClose - (tillKey === 'crt' ? -till.expectedFloat : till.expectedFloat); // special case CRT template has float at +40,000 for close?

    return (
      <div className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700 shadow-lg flex-1 min-w-[320px]">
        <div className="bg-slate-800/80 px-4 py-2 border-b border-gray-200 dark:border-slate-700 text-center font-bold text-slate-100">{title}</div>
        <table className="w-full text-sm">
          <thead className="bg-slate-700/50 text-slate-300">
            <tr>
              <th className="px-2 py-1 text-left w-1/4">Denomination</th>
              <th className="px-2 py-1 text-center" colSpan={2}>OPEN</th>
              <th className="px-2 py-1 text-center" colSpan={2}>CLOSE</th>
            </tr>
            <tr className="text-xs bg-slate-800/50">
              <th className="px-2 py-1 text-left"></th>
              <th className="px-2 py-1 text-center">Count</th>
              <th className="px-2 py-1 text-right">$value</th>
              <th className="px-2 py-1 text-center">Count</th>
              <th className="px-2 py-1 text-right">$value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {DENOM_KEYS.map(d => (
              <tr key={d} className="hover:bg-slate-700/30">
                <td className="px-2 py-1 font-mono text-slate-400">${d}</td>
                <td className="px-1 py-1">
                  <input type="number" min="0" className="w-full bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded px-2 py-1 text-center text-slate-200 focus:outline-none focus:border-indigo-500" 
                    value={till.counts.open[d] || ''} onChange={e => handleTillChange(tillKey, 'open', d, e.target.value)} />
                </td>
                <td className="px-2 py-1 text-right text-slate-300 font-mono">{formatMoney(till.counts.open[d] * DENOM_VALUES[d])}</td>
                <td className="px-1 py-1">
                  <input type="number" min="0" className="w-full bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded px-2 py-1 text-center text-slate-200 focus:outline-none focus:border-indigo-500" 
                    value={till.counts.close[d] || ''} onChange={e => handleTillChange(tillKey, 'close', d, e.target.value)} />
                </td>
                <td className="px-2 py-1 text-right text-slate-300 font-mono">{formatMoney(till.counts.close[d] * DENOM_VALUES[d])}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-900/80 font-bold border-t-2 border-gray-200 dark:border-slate-700">
            <tr>
              <td className="px-2 py-2 text-slate-300">TOTAL</td>
              <td colSpan={2} className="px-2 py-2 text-right text-emerald-400 font-mono">{formatMoney(totalOpen)}</td>
              <td colSpan={2} className="px-2 py-2 text-right text-emerald-400 font-mono">{formatMoney(totalClose)}</td>
            </tr>
            <tr className="bg-slate-800/80">
              <td className="px-2 py-2 text-slate-400">+/-</td>
              <td colSpan={2} className={`px-2 py-2 text-right font-mono ${varOpen < 0 ? 'text-rose-400' : 'text-slate-200'}`}>{formatMoney(varOpen)}</td>
              <td colSpan={2} className={`px-2 py-2 text-right font-mono ${varClose < 0 ? 'text-rose-400' : 'text-slate-200'}`}>{formatMoney(varClose)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  };

  const renderSafeTable = (title: string, safeKey: keyof DetailedCashUpRecord['safes'], hideLeftCol?: boolean) => {
    const safe = record.safes[safeKey];
    const total = calculateSafeTotal(safe);
    const variance = total - safe.expectedTotal;
    
    // the layout from the template is a bit weird, it has denominations on the right side and loose notes on the left for Office Open.
    // We will standardise it into a vertical list.

    return (
      <div className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700 shadow-lg flex-1 min-w-[320px]">
        <div className="bg-slate-800/80 px-4 py-2 border-b border-gray-200 dark:border-slate-700 text-center font-bold text-slate-100">{title}</div>
        <div className="p-4 flex flex-col md:flex-row gap-4">
            
            {/* Left Col - Extras */}
            <div className="flex-1 space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Loose notes</span>
                    <input type="number" className="w-24 bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded px-2 py-1 text-right text-slate-200 focus:outline-none" 
                           value={safe.counts.looseNotes || ''} onChange={e => handleSafeChange(safeKey, 'looseNotes', e.target.value)} />
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Loose Coins</span>
                    <input type="number" className="w-24 bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded px-2 py-1 text-right text-slate-200 focus:outline-none" 
                           value={safe.counts.looseCoins || ''} onChange={e => handleSafeChange(safeKey, 'looseCoins', e.target.value)} />
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Petty Cash/Sub</span>
                    <input type="number" className="w-24 bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded px-2 py-1 text-right text-slate-200 focus:outline-none" 
                           value={safe.counts.pettyCash || ''} onChange={e => handleSafeChange(safeKey, 'pettyCash', e.target.value)} />
                </div>

                {safeKey === 'gaming' && (
                    <>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-400">CRT</span>
                            <input type="number" className="w-24 bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded px-2 py-1 text-right text-slate-200 focus:outline-none" />
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-400">Hoppers</span>
                            <input type="number" className="w-24 bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded px-2 py-1 text-right text-slate-200 focus:outline-none" 
                                value={safe.counts.hoppers || ''} onChange={e => handleSafeChange(safeKey, 'hoppers', e.target.value)} />
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-400">Gaming Till</span>
                            <input type="number" className="w-24 bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded px-2 py-1 text-right text-slate-200 focus:outline-none" 
                                value={safe.counts.gamingTill || ''} onChange={e => handleSafeChange(safeKey, 'gamingTill', e.target.value)} />
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-400">Banking</span>
                            <input type="number" className="w-24 bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded px-2 py-1 text-right text-slate-200 focus:outline-none" 
                                value={safe.counts.banking || ''} onChange={e => handleSafeChange(safeKey, 'banking', e.target.value)} />
                        </div>
                    </>
                )}
                
                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-slate-700">
                    <div className="flex justify-between items-center font-bold">
                        <span className="text-slate-300">Total</span>
                        <span className="text-emerald-400 font-mono">{formatMoney(total)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-slate-400">Variance</span>
                        <span className={`font-mono font-bold ${variance < 0 ? 'text-rose-500 bg-rose-500/10 px-2 py-1 rounded' : 'text-slate-200'}`}>
                            {formatMoney(variance)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Right Col - Denoms (Only top 6 for safes usually, but we'll show all to be safe, filter > $2 in template) */}
            <div className="flex-1 space-y-1 border-l border-gray-200 dark:border-slate-700 pl-4">
                {['100', '50', '20', '10', '5', '2', '1', '0.5', '0.2', '0.1'].filter(d => safeKey === 'officeOpen' ? true : parseFloat(d) >= 5).map(d => (
                    <div key={d} className="flex justify-between items-center">
                        <span className="text-sm text-slate-400 font-mono">${d}</span>
                        <input type="number" className="w-20 bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded px-2 py-1 text-center text-slate-200 focus:outline-none" 
                            value={safe.counts.denominations[d as Denominations] || ''} onChange={e => handleSafeChange(safeKey, 'denominations', e.target.value, d as Denominations)} />
                    </div>
                ))}
            </div>

        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
           <h3 className="text-xl font-bold text-slate-50 flex items-center">
              <Calculator className="w-6 h-6 mr-3 text-indigo-400" /> End of Day Cash Up
           </h3>
           <div className="flex space-x-4 items-center">
               <span className="text-slate-400">Date:</span>
               <input type="date" className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-50 outline-none" 
                      value={record.date} onChange={e => setRecord({...record, date: e.target.value})} />
               <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all flex items-center">
                   <Save className="w-4 h-4 mr-2" /> Save Draft
               </button>
           </div>
       </div>

       {/* TILLS */}
       <div className="space-y-4">
           <h4 className="text-lg font-semibold text-slate-200 border-b border-gray-200 dark:border-slate-700 pb-2">1. Tills (F&B / Gaming / TAB)</h4>
           
           <div className="flex flex-wrap gap-4">
               {renderTillTable("F&B Till 1", "fb1")}
               {renderTillTable("F&B Till 2", "fb2")}
               {renderTillTable("F&B Till 3", "fb3")}
           </div>
           
           <div className="flex flex-wrap gap-4 mt-4">
               {renderTillTable("Gaming Till", "gaming")}
               {renderTillTable("TAB", "tab")}
               {renderTillTable("CRT / Ticket Machine", "crt")}
           </div>
       </div>

       {/* SAFES */}
       <div className="space-y-4 mt-8">
           <h4 className="text-lg font-semibold text-slate-200 border-b border-gray-200 dark:border-slate-700 pb-2">2. Safes</h4>
           <div className="flex flex-wrap gap-4">
               {renderSafeTable("SAFE COUNT Office - OPEN", "officeOpen")}
               {renderSafeTable("GAMING SAFE", "gaming")}
               {renderSafeTable("TAB OFFICE SAFE", "tabOffice")}
           </div>
       </div>

       {/* NOTES */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
           <div className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-lg">
               <label className="block text-sm font-bold text-slate-200 mb-2">DAY NOTES:</label>
               <textarea rows={4} className="w-full bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-lg p-3 text-slate-200 outline-none focus:border-indigo-500" 
                         value={record.notes.day} onChange={e => setRecord({...record, notes: {...record.notes, day: e.target.value}})}></textarea>
           </div>
           <div className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-lg">
               <label className="block text-sm font-bold text-slate-200 mb-2">NIGHT NOTES:</label>
               <textarea rows={4} className="w-full bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-lg p-3 text-slate-200 outline-none focus:border-indigo-500" 
                         value={record.notes.night} onChange={e => setRecord({...record, notes: {...record.notes, night: e.target.value}})}></textarea>
           </div>
       </div>

    </div>
  );
};

export default CashUpView;
