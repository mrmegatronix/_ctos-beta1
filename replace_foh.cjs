const fs = require('fs');
const content = fs.readFileSync('components/DashboardView.tsx', 'utf8');

const fohStart = content.indexOf("if (mode === 'FOH') {");
const bohStart = content.indexOf("// BOH Mode");

if (fohStart !== -1 && bohStart !== -1) {
    const newFOH = `if (mode === 'FOH') {
    return (
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between mb-8">
             <div>
                <h1 className="text-3xl font-bold text-white">Front of House</h1>
                <p className="text-gray-500 dark:text-gray-400">Welcome to the floor.</p>
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
             <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl p-6 border border-white/10 shadow-sm cursor-pointer hover:bg-slate-800/60 transition-colors" onClick={() => onNavigate('bookings')}>
                <div className="flex items-center space-x-3 mb-2">
                   <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-lg"><Utensils className="w-5 h-5"/></div>
                   <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Today's Bookings</span>
                </div>
                <div className="text-2xl font-bold text-white">{todaysBookings.length}</div>
             </div>
             <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl p-6 border border-white/10 shadow-sm cursor-pointer hover:bg-slate-800/60 transition-colors" onClick={() => onNavigate('tvschedule')}>
                <div className="flex items-center space-x-3 mb-2">
                   <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-lg"><Tv className="w-5 h-5"/></div>
                   <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Live Sports</span>
                </div>
                <div className="text-2xl font-bold text-white">{todaysTv.length}</div>
             </div>
             <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl p-6 border border-white/10 shadow-sm cursor-pointer hover:bg-slate-800/60 transition-colors" onClick={() => onNavigate('entertainment')}>
                <div className="flex items-center space-x-3 mb-2">
                   <div className="p-2 bg-pink-50 dark:bg-pink-900/30 text-pink-600 rounded-lg"><Music className="w-5 h-5"/></div>
                   <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Entertainment</span>
                </div>
                <div className="text-2xl font-bold text-white">{eventsToday.length}</div>
             </div>
             <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl p-6 border border-white/10 shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                   <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg"><Users className="w-5 h-5"/></div>
                   <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Staff on Shift</span>
                </div>
                <div className="text-2xl font-bold text-white">{staffOnShift.length}</div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
             <div className="lg:col-span-2 space-y-6">
                {/* Bookings */}
                <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl p-6 border border-white/10 shadow-sm">
                   <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-white">Upcoming Bookings</h3>
                      <button onClick={() => onNavigate('bookings')} className="text-sm text-emerald-400 hover:text-emerald-300">View All</button>
                   </div>
                   {todaysBookings.length > 0 ? (
                       <div className="space-y-4">
                           {todaysBookings.map((booking: Booking) => (
                               <div key={booking.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-white/5">
                                   <div className="flex items-center space-x-4">
                                       <div className="w-12 h-12 bg-slate-700/50 rounded-full flex items-center justify-center">
                                           <Users className="w-6 h-6 text-slate-400" />
                                       </div>
                                       <div>
                                           <p className="font-medium text-white">{booking.customerName}</p>
                                           <p className="text-sm text-slate-400">{booking.partySize} guests • {booking.area || 'Main Floor'}</p>
                                       </div>
                                   </div>
                                   <div className="text-right">
                                       <p className="font-bold text-emerald-400">{booking.time}</p>
                                       <p className="text-xs text-slate-500">{booking.status}</p>
                                   </div>
                               </div>
                           ))}
                       </div>
                   ) : <p className="text-slate-500 text-center py-4">No bookings scheduled for today.</p>}
                </div>
                
                {/* Notice Board */}
                <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl p-6 border border-white/10 shadow-sm">
                    <h3 className="text-lg font-bold text-white mb-4">Notice Board</h3>
                    <div className="space-y-3">
                          <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/20 flex justify-between items-center">
                              <div className="flex-1">
                                  <h4 className="text-white font-medium">Specials Menu Updated</h4>
                                  <p className="text-sm text-slate-400 mt-1">Check the Menus module for today's lunch specials.</p>
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
                       <button onClick={() => onNavigate('pos')} className="bg-slate-800/50 hover:bg-slate-700 p-4 rounded-xl border border-white/5 transition-colors flex flex-col items-center text-center">
                           <Monitor className="w-6 h-6 text-blue-400 mb-2" />
                           <span className="text-sm font-medium text-white">POS</span>
                       </button>
                       <button onClick={() => onNavigate('menus')} className="bg-slate-800/50 hover:bg-slate-700 p-4 rounded-xl border border-white/5 transition-colors flex flex-col items-center text-center">
                           <FileText className="w-6 h-6 text-orange-400 mb-2" />
                           <span className="text-sm font-medium text-white">Menus</span>
                       </button>
                       <button onClick={() => onNavigate('incidents')} className="bg-slate-800/50 hover:bg-slate-700 p-4 rounded-xl border border-white/5 transition-colors flex flex-col items-center text-center">
                           <ShieldAlert className="w-6 h-6 text-red-400 mb-2" />
                           <span className="text-sm font-medium text-white">Incidents</span>
                       </button>
                       <button onClick={() => onNavigate('lostfound')} className="bg-slate-800/50 hover:bg-slate-700 p-4 rounded-xl border border-white/5 transition-colors flex flex-col items-center text-center">
                           <Umbrella className="w-6 h-6 text-indigo-400 mb-2" />
                           <span className="text-sm font-medium text-white">Lost Found</span>
                       </button>
                       <button onClick={() => onNavigate('transport')} className="bg-slate-800/50 hover:bg-slate-700 p-4 rounded-xl border border-white/5 transition-colors flex flex-col items-center text-center col-span-2">
                           <Truck className="w-6 h-6 text-emerald-400 mb-2" />
                           <span className="text-sm font-medium text-white">Local Transport / Taxis</span>
                       </button>
                   </div>
                </div>

                {/* Live Sports */}
                <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl p-6 border border-white/10 shadow-sm">
                   <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-white">Live Sports</h3>
                      <button onClick={() => onNavigate('tvschedule')} className="text-sm text-purple-400 hover:text-purple-300">View Guide</button>
                   </div>
                   {todaysTv.length > 0 ? (
                       <div className="space-y-3">
                           {todaysTv.map((tv: TVScheduleItem) => (
                               <div key={tv.id} className="p-3 bg-slate-800/50 rounded-lg border border-white/5">
                                   <p className="font-bold text-white text-sm">{tv.match}</p>
                                   <p className="text-xs text-purple-400 mt-1">{tv.channel} • {formatTime(tv.startTime)}</p>
                               </div>
                           ))}
                       </div>
                   ) : <p className="text-slate-500 text-sm py-4 text-center">No games scheduled today.</p>}
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  `;
    const newContent = content.slice(0, fohStart) + newFOH + content.slice(bohStart);
    fs.writeFileSync('components/DashboardView.tsx', newContent);
}
