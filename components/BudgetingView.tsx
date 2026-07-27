import React, { useState } from 'react';
import { BudgetTracker } from '../types';
import { TrendingUp, DollarSign, Percent, Target, Save } from 'lucide-react';
import { generateId } from '../utils';

interface BudgetingViewProps {
  budgets: BudgetTracker[];
  onSaveBudget: (budget: BudgetTracker) => void;
}

const BudgetingView: React.FC<BudgetingViewProps> = ({ budgets, onSaveBudget }) => {
  const currentPeriod = new Date().toISOString().substring(0, 7); // e.g. "2026-06"
  const existingBudget = budgets.find(b => b.period === currentPeriod);
  
  const [budget, setBudget] = useState<Partial<BudgetTracker>>(existingBudget || {
    period: currentPeriod,
    targetRevenue: 50000,
    targetCogs: 15000,
    targetLabour: 12500,
    actualRevenue: 0,
    actualCogs: 0,
    actualLabour: 0
  });

  const handleSave = () => {
    onSaveBudget({
      id: existingBudget?.id || generateId(),
      period: budget.period || currentPeriod,
      targetRevenue: budget.targetRevenue || 0,
      targetCogs: budget.targetCogs || 0,
      targetLabour: budget.targetLabour || 0,
      actualRevenue: budget.actualRevenue || 0,
      actualCogs: budget.actualCogs || 0,
      actualLabour: budget.actualLabour || 0
    });
  };

  const cogsPercent = budget.targetRevenue ? (budget.targetCogs! / budget.targetRevenue!) * 100 : 0;
  const labourPercent = budget.targetRevenue ? (budget.targetLabour! / budget.targetRevenue!) * 100 : 0;

  const actualCogsPercent = budget.actualRevenue ? (budget.actualCogs! / budget.actualRevenue!) * 100 : 0;
  const actualLabourPercent = budget.actualRevenue ? (budget.actualLabour! / budget.actualRevenue!) * 100 : 0;

  const revProgress = budget.targetRevenue ? Math.min(100, (budget.actualRevenue! / budget.targetRevenue!) * 100) : 0;

  return (
    <div className="flex-1 p-8 overflow-auto custom-scrollbar glass-panel ">
       <div className="mb-6 flex justify-between items-center">
         <div>
             <h2 className="text-2xl font-bold text-slate-50  flex items-center">
                <TrendingUp className="w-6 h-6 mr-2 text-indigo-500" /> Budget & Targets
             </h2>
             <p className="text-slate-400 ">Set financial targets and track performance for {currentPeriod}.</p>
         </div>
         <button onClick={handleSave} className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            <Save className="w-4 h-4" /> <span>Save Targets</span>
         </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <div className="glass-panel  p-6 rounded-xl border border-white/10  shadow-lg">
               <div className="flex items-center justify-between mb-4">
                   <h3 className="font-bold text-slate-200  flex items-center">
                       <DollarSign className="w-5 h-5 mr-1 text-emerald-500" /> Revenue Target
                   </h3>
               </div>
               <div className="flex items-end mb-2">
                   <span className="text-3xl font-bold text-slate-50  mr-2">
                       $<input type="number" value={budget.targetRevenue} onChange={e => setBudget({...budget, targetRevenue: parseFloat(e.target.value) || 0})} className="bg-transparent border-b border-white/20  w-32 focus:outline-none focus:border-indigo-500" />
                   </span>
               </div>
               <div className="w-full bg-gray-100  rounded-full h-2.5 mt-4">
                   <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${revProgress}%` }}></div>
               </div>
               <p className="text-sm text-slate-400 mt-2">Actual: ${budget.actualRevenue?.toFixed(2) || '0.00'} ({revProgress.toFixed(1)}%)</p>
           </div>

           <div className="glass-panel  p-6 rounded-xl border border-white/10  shadow-lg">
               <div className="flex items-center justify-between mb-4">
                   <h3 className="font-bold text-slate-200  flex items-center">
                       <Target className="w-5 h-5 mr-1 text-rose-500" /> COGS Target
                   </h3>
               </div>
               <div className="flex items-end mb-2">
                   <span className="text-3xl font-bold text-slate-50  mr-2">
                       $<input type="number" value={budget.targetCogs} onChange={e => setBudget({...budget, targetCogs: parseFloat(e.target.value) || 0})} className="bg-transparent border-b border-white/20  w-32 focus:outline-none focus:border-rose-500" />
                   </span>
               </div>
               <p className="text-sm font-medium text-rose-600 dark:text-rose-400 mt-2">Target: {cogsPercent.toFixed(1)}% of Revenue</p>
               <p className="text-sm text-slate-400 mt-1">Actual: ${budget.actualCogs?.toFixed(2) || '0.00'} ({actualCogsPercent.toFixed(1)}%)</p>
           </div>

           <div className="glass-panel  p-6 rounded-xl border border-white/10  shadow-lg">
               <div className="flex items-center justify-between mb-4">
                   <h3 className="font-bold text-slate-200  flex items-center">
                       <Percent className="w-5 h-5 mr-1 text-blue-500" /> Labour Target
                   </h3>
               </div>
               <div className="flex items-end mb-2">
                   <span className="text-3xl font-bold text-slate-50  mr-2">
                       $<input type="number" value={budget.targetLabour} onChange={e => setBudget({...budget, targetLabour: parseFloat(e.target.value) || 0})} className="bg-transparent border-b border-white/20  w-32 focus:outline-none focus:border-blue-500" />
                   </span>
               </div>
               <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-2">Target: {labourPercent.toFixed(1)}% of Revenue</p>
               <p className="text-sm text-slate-400 mt-1">Actual: ${budget.actualLabour?.toFixed(2) || '0.00'} ({actualLabourPercent.toFixed(1)}%)</p>
           </div>
       </div>

       <div className="glass-panel  rounded-xl border border-white/10  p-6 shadow-lg">
           <h3 className="font-bold text-slate-50  mb-4">Manual Actuals Entry</h3>
           <p className="text-sm text-slate-400 mb-6">In a fully integrated environment, these values would pull automatically from Finance and Timesheets. For now, you can enter them manually here.</p>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                  <label className="block text-sm font-medium text-slate-200  mb-1">Actual Revenue</label>
                  <input type="number" value={budget.actualRevenue} onChange={e => setBudget({...budget, actualRevenue: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border border-white/20  rounded-lg glass-panel  text-slate-50 " />
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-200  mb-1">Actual COGS</label>
                  <input type="number" value={budget.actualCogs} onChange={e => setBudget({...budget, actualCogs: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border border-white/20  rounded-lg glass-panel  text-slate-50 " />
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-200  mb-1">Actual Labour</label>
                  <input type="number" value={budget.actualLabour} onChange={e => setBudget({...budget, actualLabour: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border border-white/20  rounded-lg glass-panel  text-slate-50 " />
              </div>
           </div>
       </div>
    </div>
  );
};

export default BudgetingView;
