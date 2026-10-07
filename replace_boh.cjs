const fs = require('fs');
const content = fs.readFileSync('components/DashboardView.tsx', 'utf8');

const bohStart = content.indexOf("// BOH Mode");

if (bohStart !== -1) {
    const newBOH = `// BOH Mode
  return (
    <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between mb-8">
             <div>
                <h1 className="text-3xl font-bold text-white">Kitchen Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400">Back of House Operations</p>
             </div>
             <div className="flex items-center space-x-6">
                 <div className="w-64">
                     <WeatherWidget />
                 </div>
                 <div className="text-sm font-medium text-gray-200 bg-slate-900/60 backdrop-blur-xl px-4 py-2 rounded-lg border border-white/10 shadow-lg">
                     {today.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                 </div>
             </div>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl p-6 border border-white/10 shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                   <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-lg"><ClipboardList className="w-5 h-5"/></div>
                   <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Prep</span>
                </div>
                <div className="text-2xl font-bold text-white">{pendingTasks.length}</div>
             </div>
             <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl p-6 border border-white/10 shadow-sm cursor-pointer hover:bg-slate-800/60 transition-colors" onClick={() => onNavigate('stock')}>
                <div className="flex items-center space-x-3 mb-2">
                   <div className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 rounded-lg"><AlertTriangle className="w-5 h-5"/></div>
                   <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Low Stock Alerts</span>
                </div>
                <div className="text-2xl font-bold text-white">{lowStock.length}</div>
             </div>
             <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl p-6 border border-white/10 shadow-sm cursor-pointer hover:bg-slate-800/60 transition-colors" onClick={() => onNavigate('bookings')}>
                <div className="flex items-center space-x-3 mb-2">
                   <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-lg"><Utensils className="w-5 h-5"/></div>
                   <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Bookings Today</span>
                </div>
                <div className="text-2xl font-bold text-white">{todaysBookings.length}</div>
             </div>
             <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl p-6 border border-white/10 shadow-sm cursor-pointer hover:bg-slate-800/60 transition-colors" onClick={() => onNavigate('recipes')}>
                <div className="flex items-center space-x-3 mb-2">
                   <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg"><BookOpen className="w-5 h-5"/></div>
                   <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Recipes</span>
                </div>
                <div className="text-2xl font-bold text-white">24</div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
             <div className="lg:col-span-2 space-y-6">
                {/* High priority tasks */}
                <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl p-6 border border-white/10 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-white">Prep & Maintenance Tasks</h2>
                    </div>
                    {pendingTasks.length > 0 ? (
                       <div className="space-y-3">
                           {pendingTasks.map((task: MaintenanceTask) => (
                               <div key={task.id} className="p-4 bg-slate-800/50 rounded-lg border border-white/5 flex justify-between items-center">
                                   <div className="flex-1">
                                       <h4 className="text-white font-medium">{task.title}</h4>
                                       <p className="text-sm text-slate-400 mt-1">{task.description}</p>
                                   </div>
                                   <span className={\`text-xs px-2 py-1 rounded font-bold uppercase ml-4 \${task.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}\`}>
                                       {task.priority}
                                   </span>
                               </div>
                           ))}
                       </div>
                    ) : (
                        <div className="p-8 text-center text-slate-500 bg-slate-800/30 rounded-lg border border-white/5">All caught up!</div>
                    )}
                </div>

                {/* Kitchen Notices */}
                <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl p-6 border border-white/10 shadow-sm">
                    <h2 className="text-lg font-bold text-white mb-4">Kitchen Notices</h2>
                    <div className="space-y-3">
                        <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/20 flex justify-between items-center">
                            <div className="flex-1">
                                <h4 className="text-white font-medium">New Menu Items</h4>
                                <p className="text-sm text-slate-400 mt-1">Check the recipes module for the updated winter menu specs.</p>
                            </div>
                            <span className="text-xs px-2 py-1 rounded font-bold uppercase ml-4 bg-blue-500/20 text-blue-400">Notice</span>
                        </div>
                    </div>
                </div>
             </div>

             <div className="space-y-6">
                {/* Quick Actions */}
                <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl p-6 border border-white/10 shadow-sm">
                   <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
                   <div className="grid grid-cols-2 gap-3">
                       <button onClick={() => onNavigate('recipes')} className="bg-slate-800/50 hover:bg-slate-700 p-4 rounded-xl border border-white/5 transition-colors flex flex-col items-center text-center">
                           <BookOpen className="w-6 h-6 text-blue-400 mb-2" />
                           <span className="text-sm font-medium text-white">Recipes</span>
                       </button>
                       <button onClick={() => onNavigate('stock')} className="bg-slate-800/50 hover:bg-slate-700 p-4 rounded-xl border border-white/5 transition-colors flex flex-col items-center text-center">
                           <Boxes className="w-6 h-6 text-emerald-400 mb-2" />
                           <span className="text-sm font-medium text-white">Stock</span>
                       </button>
                       <button onClick={() => onNavigate('stocktake')} className="bg-slate-800/50 hover:bg-slate-700 p-4 rounded-xl border border-white/5 transition-colors flex flex-col items-center text-center">
                           <ClipboardList className="w-6 h-6 text-amber-400 mb-2" />
                           <span className="text-sm font-medium text-white">Stocktake</span>
                       </button>
                       <button onClick={() => onNavigate('ordering')} className="bg-slate-800/50 hover:bg-slate-700 p-4 rounded-xl border border-white/5 transition-colors flex flex-col items-center text-center">
                           <Truck className="w-6 h-6 text-indigo-400 mb-2" />
                           <span className="text-sm font-medium text-white">Ordering</span>
                       </button>
                       <button onClick={() => onNavigate('menus')} className="bg-slate-800/50 hover:bg-slate-700 p-4 rounded-xl border border-white/5 transition-colors flex flex-col items-center text-center">
                           <FileText className="w-6 h-6 text-orange-400 mb-2" />
                           <span className="text-sm font-medium text-white">Menus</span>
                       </button>
                       <button onClick={() => onNavigate('documents')} className="bg-slate-800/50 hover:bg-slate-700 p-4 rounded-xl border border-white/5 transition-colors flex flex-col items-center text-center">
                           <BookOpen className="w-6 h-6 text-slate-400 mb-2" />
                           <span className="text-sm font-medium text-white">Docs</span>
                       </button>
                   </div>
                </div>

                {/* Low Stock Widget */}
                <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl p-6 border border-white/10 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-white">Low Stock Alerts</h3>
                        <button onClick={() => onNavigate('stock')} className="text-sm text-red-400 hover:text-red-300">View Inventory</button>
                    </div>
                    {lowStock.length > 0 ? (
                        <div className="space-y-3">
                            {lowStock.slice(0,5).map((item: StockItem) => (
                                <div key={item.id} className="p-3 bg-slate-800/50 rounded-lg border border-red-500/20">
                                    <p className="font-medium text-white text-sm">{item.name}</p>
                                    <p className="text-xs text-red-400 font-bold mt-1">Only {item.quantity} {item.unit} left</p>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-slate-500 text-sm bg-slate-800/30 p-4 rounded-lg text-center border border-white/5">Stock levels good.</p>}
                </div>
             </div>
          </div>
        </div>
    </div>
  );
};

export default DashboardView;
`;
    const newContent = content.slice(0, bohStart) + newBOH;
    fs.writeFileSync('components/DashboardView.tsx', newContent);
}
