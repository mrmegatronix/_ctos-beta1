import React, { useState, useEffect } from 'react';
import { AppMode, CalendarEvent, MaintenanceTask, StockItem, Booking, TeamMember, TVScheduleItem, EntertainmentEvent, AppModule, RosterShift, IncidentReport } from '../types';
import { formatDate, formatTime } from '../utils';
import { 
  Users, 
  Calendar as CalendarIcon, 
  DollarSign, 
  TrendingUp, 
  Layout, 
  AlertTriangle, 
  Package, 
  Bell, 
  BookOpen,
  Utensils,
  Music,
  Tv,
  Boxes,
  Monitor,
  ShieldAlert,
  Umbrella,
  Calendar,
  Truck,
  Mail,
  Contact,
  ClipboardList,
  FileText,
  Clock,
  Globe
} from 'lucide-react';
import WeatherWidget from './WeatherWidget';

interface DashboardViewProps {
  mode: AppMode;
  user: TeamMember;
  events: CalendarEvent[];
  entertainmentEvents?: EntertainmentEvent[];
  tasks: MaintenanceTask[];
  lowStock: StockItem[];
  bookings: Booking[];
  tvSchedule: TVScheduleItem[];
  shifts?: RosterShift[];
  incidents?: IncidentReport[];
  recipesCount?: number;
  onNavigate: (module: AppModule) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ 
  mode, user, events = [], entertainmentEvents = [], tasks = [], lowStock = [], bookings = [], tvSchedule = [], shifts = [], incidents = [], recipesCount = 0, onNavigate 
}) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const today = now;
  
  const todaysEvents = events.filter(e => 
    new Date(e.start).getDate() === today.getDate() && 
    new Date(e.start).getMonth() === today.getMonth()
  );

  const upcomingBands = entertainmentEvents.filter(e => {
    const d = new Date(e.date);
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
  });
  
  const todaysBookings = bookings.filter(b => {
    const d = new Date(b.date || b.time);
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
  });

  const todaysTv = tvSchedule.filter(item => {
    const d = new Date(item.startTime);
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
  });

  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const todaysShifts = shifts.filter(s => {
    const d = new Date(s.start);
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
  });
  const totalCoversToday = todaysBookings.reduce((sum, b) => sum + ((b as any).partySize || b.guests || 2), 0);
  const openIncidents = incidents.filter(i => i.status !== 'resolved');

  if (mode === 'OFFICE') {
    return (
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between mb-8">
             <div>
                <h1 className="text-3xl font-bold text-white">Office Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400">Welcome back, {user.name}.</p>
             </div>
             <div className="flex flex-col items-end gap-3">
                <div className="text-sm font-medium text-gray-200 bg-slate-900/60 backdrop-blur-xl px-4 py-2 rounded-lg border border-white/10 shadow-lg">
                    {today.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
             </div>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl p-6 border border-white/10 shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                   <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg"><Utensils className="w-5 h-5"/></div>
                   <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Today's Bookings</span>
                </div>
                <div className="text-2xl font-bold text-white">{todaysBookings.length}</div>
             </div>
             <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl p-6 border border-white/10 shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                   <div className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 rounded-lg"><AlertTriangle className="w-5 h-5"/></div>
                   <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Low Stock Alerts</span>
                </div>
                <div className="text-2xl font-bold text-white">{lowStock.length}</div>
             </div>
             <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl p-6 border border-white/10 shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                   <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-lg"><ClipboardList className="w-5 h-5"/></div>
                   <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Tasks</span>
                </div>
                <div className="text-2xl font-bold text-white">{pendingTasks.length}</div>
             </div>
             <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl p-6 border border-white/10 shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                   <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg"><CalendarIcon className="w-5 h-5"/></div>
                   <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Events Today</span>
                </div>
                <div className="text-2xl font-bold text-white">{todaysEvents.length}</div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Main Content Area */}
             <div className="lg:col-span-2 space-y-6">
                 {/* Google Workspace & Tools Links */}
                 <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl border border-white/10 shadow-sm overflow-hidden">
                     <div className="px-6 py-4 border-b border-white/10">
                         <h3 className="font-semibold text-white">Workspace & Applications</h3>
                     </div>
                     <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <button onClick={() => onNavigate('calendar')} className="flex flex-col items-center p-4 border border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                            <Calendar className="w-8 h-8 text-blue-500 mb-2" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Calendar</span>
                        </button>
                        <button onClick={() => onNavigate('email')} className="flex flex-col items-center p-4 border border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                            <Mail className="w-8 h-8 text-red-500 mb-2" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</span>
                        </button>
                        <button onClick={() => onNavigate('contacts')} className="flex flex-col items-center p-4 border border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                            <Contact className="w-8 h-8 text-indigo-500 mb-2" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Contacts</span>
                        </button>
                        <button onClick={() => onNavigate('finance')} className="flex flex-col items-center p-4 border border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                            <DollarSign className="w-8 h-8 text-emerald-500 mb-2" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Finance</span>
                        </button>
                     </div>
                 </div>

                 {/* Financial Summary */}
                 <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl border border-white/10 shadow-sm overflow-hidden p-6">
                     <h3 className="font-semibold text-white mb-4 flex items-center"><DollarSign className="w-5 h-5 mr-2 text-emerald-500"/> Financial Summary (Today)</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                           <p className="text-sm text-emerald-400 font-medium">Gross Sales</p>
                           <p className="text-2xl font-bold text-white">$4,250.00</p>
                        </div>
                        <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                           <p className="text-sm text-indigo-400 font-medium">Net Sales</p>
                           <p className="text-2xl font-bold text-white">$3,695.65</p>
                        </div>
                     </div>
                 </div>

                 {/* System Alerts */}
                 <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl border border-white/10 shadow-sm overflow-hidden">
                     <div className="px-6 py-4 border-b border-white/10">
                         <h3 className="font-semibold text-white">Action Required</h3>
                     </div>
                     <div className="divide-y divide-gray-100 dark:divide-slate-700">
                         {lowStock.length > 0 && (
                            <div className="p-4 flex items-center justify-between">
                               <div className="flex items-center space-x-3">
                                  <AlertTriangle className="w-5 h-5 text-red-500" />
                                  <div>
                                     <p className="font-medium text-white">{lowStock.length} Items Low on Stock</p>
                                     <p className="text-sm text-gray-500">Requires purchasing or transfer</p>
                                  </div>
                               </div>
                               <button onClick={() => onNavigate('stock')} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View Items</button>
                            </div>
                         )}
                         {pendingTasks.length > 0 && (
                            <div className="p-4 flex items-center justify-between">
                               <div className="flex items-center space-x-3">
                                  <ClipboardList className="w-5 h-5 text-amber-500" />
                                  <div>
                                     <p className="font-medium text-white">{pendingTasks.length} Pending Maintenance Tasks</p>
                                     <p className="text-sm text-gray-500">Includes {pendingTasks.filter(t => t.priority === 'high').length} high priority tasks</p>
                                  </div>
                               </div>
                               <button onClick={() => onNavigate('maintenance')} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View Tasks</button>
                            </div>
                         )}
                         {lowStock.length === 0 && pendingTasks.length === 0 && (
                            <div className="p-8 text-center text-gray-500">All clear. No urgent actions required.</div>
                         )}
                     </div>
                 </div>
             </div>

             {/* Right Sidebar: Schedule */}
             <div className="space-y-6">
                <WeatherWidget />
                
                <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl border border-white/10 shadow-sm p-6">
                    <h3 className="font-semibold text-white mb-4">Staff on Shift</h3>
                    <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                           <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs">JD</div>
                           <div><p className="text-sm text-white font-medium">John Doe</p><p className="text-xs text-slate-400">Duty Manager</p></div>
                        </div>
                        <div className="flex items-center space-x-3">
                           <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs">SJ</div>
                           <div><p className="text-sm text-white font-medium">Sarah Jenkins</p><p className="text-xs text-slate-400">Barista</p></div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl border border-white/10 shadow-sm p-6">
                    <h3 className="font-semibold text-white mb-4">Today's Schedule</h3>
                    <div className="space-y-4">
                        {todaysEvents.map(event => (
                            <div key={event.id} className="flex space-x-3">
                                <div className="text-xs font-bold text-gray-500 pt-1 w-12">{formatTime(event.start)}</div>
                                <div className="flex-1 bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg border-l-2 border-indigo-500">
                                    <p className="font-medium text-sm text-white">{event.title}</p>
                                </div>
                            </div>
                        ))}
                        {upcomingBands.map(band => (
                            <div key={band.id} className="flex space-x-3">
                                <div className="text-xs font-bold text-gray-500 pt-1 w-12">{formatTime(band.date)}</div>
                                <div className="flex-1 bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg border-l-2 border-purple-500">
                                    <p className="font-medium text-sm text-white">{band.title}</p>
                                    <p className="text-xs text-purple-600 dark:text-purple-400">Live Music</p>
                                </div>
                            </div>
                        ))}
                        {todaysEvents.length === 0 && upcomingBands.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4">No events scheduled.</p>
                        )}
                    </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'FOH') {
    const staffOnShiftCount = todaysShifts.length > 0
      ? todaysShifts.length
      : todaysEvents.filter(e => e.type === 'shift').length;

    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto overflow-x-hidden">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Service Command Header */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-xl p-5 rounded-2xl border border-emerald-500/20 shadow-lg">
             <div className="min-w-0">
                <div className="flex items-center space-x-3">
                   <h1 className="text-2xl sm:text-3xl font-bold text-white whitespace-nowrap truncate">Service Hub</h1>
                   <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                     {user.role}
                   </span>
                </div>
                <p className="text-sm text-slate-400 mt-0.5 whitespace-nowrap truncate">Front of House Operations • Welcome, {user.name}</p>
             </div>
             <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                 <div className="w-56 sm:w-64 flex-shrink-0">
                     <WeatherWidget />
                 </div>
                 <div className="flex items-center space-x-3 bg-slate-950/60 px-4 py-2.5 rounded-xl border border-white/10 shadow-inner whitespace-nowrap">
                     <Clock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                     <span className="font-mono font-bold text-lg text-white">
                       {today.getHours().toString().padStart(2, '0')}
                       <span className="animate-[pulse_1s_ease-in-out_infinite]">:</span>
                       {today.getMinutes().toString().padStart(2, '0')}
                       <span className="animate-[pulse_1s_ease-in-out_infinite]">:</span>
                       {today.getSeconds().toString().padStart(2, '0')}
                     </span>
                     <span className="h-4 w-px bg-white/10"></span>
                     <span className="text-xs sm:text-sm font-medium text-slate-300">
                       {today.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                     </span>
                 </div>
             </div>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
             <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-sm cursor-pointer hover:bg-slate-800/60 hover:border-emerald-500/30 transition-all" onClick={() => onNavigate('bookings')}>
                <div className="flex items-center justify-between mb-3">
                   <div className="p-2.5 bg-emerald-500/15 text-emerald-400 rounded-xl"><Utensils className="w-5 h-5"/></div>
                   <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md whitespace-nowrap">{totalCoversToday} Covers</span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white">{todaysBookings.length}</div>
                <div className="text-xs sm:text-sm font-medium text-slate-400 mt-1 whitespace-nowrap truncate">Today's Bookings</div>
             </div>
             <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-sm cursor-pointer hover:bg-slate-800/60 hover:border-purple-500/30 transition-all" onClick={() => onNavigate('tvschedule')}>
                <div className="flex items-center justify-between mb-3">
                   <div className="p-2.5 bg-purple-500/15 text-purple-400 rounded-xl"><Tv className="w-5 h-5"/></div>
                   <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md whitespace-nowrap">Live TV</span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white">{todaysTv.length}</div>
                <div className="text-xs sm:text-sm font-medium text-slate-400 mt-1 whitespace-nowrap truncate">Sports Fixtures</div>
             </div>
             <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-sm cursor-pointer hover:bg-slate-800/60 hover:border-pink-500/30 transition-all" onClick={() => onNavigate('entertainment')}>
                <div className="flex items-center justify-between mb-3">
                   <div className="p-2.5 bg-pink-500/15 text-pink-400 rounded-xl"><Music className="w-5 h-5"/></div>
                   <span className="text-xs font-semibold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-md whitespace-nowrap">Tonight</span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white">{upcomingBands.length > 0 ? upcomingBands.length : todaysEvents.length}</div>
                <div className="text-xs sm:text-sm font-medium text-slate-400 mt-1 whitespace-nowrap truncate">Entertainment</div>
             </div>
             <div className={`bg-slate-900/60 backdrop-blur-xl rounded-2xl p-5 border shadow-sm cursor-pointer hover:bg-slate-800/60 transition-all ${lowStock.length > 0 ? 'border-amber-500/40' : 'border-white/10'}`} onClick={() => onNavigate('menus')}>
                <div className="flex items-center justify-between mb-3">
                   <div className={`p-2.5 rounded-xl ${lowStock.length > 0 ? 'bg-amber-500/15 text-amber-400' : 'bg-blue-500/15 text-blue-400'}`}><AlertTriangle className="w-5 h-5"/></div>
                   <span className={`text-xs font-semibold px-2 py-0.5 rounded-md whitespace-nowrap ${lowStock.length > 0 ? 'text-amber-300 bg-amber-500/15' : 'text-emerald-300 bg-emerald-500/15'}`}>
                     {lowStock.length > 0 ? 'Check Menus' : 'All Clear'}
                   </span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white">{lowStock.length}</div>
                <div className="text-xs sm:text-sm font-medium text-slate-400 mt-1 whitespace-nowrap truncate">86'd / Low Stock</div>
             </div>
          </div>

          {/* Main 1080p Service Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
             {/* Left 8 Columns: Live Floor Feed */}
             <div className="lg:col-span-8 space-y-6">
                {/* Upcoming Bookings */}
                <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-sm">
                   <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center space-x-2.5">
                        <Utensils className="w-5 h-5 text-emerald-400" />
                        <h2 className="text-lg font-bold text-white whitespace-nowrap">Upcoming Bookings</h2>
                      </div>
                      <button onClick={() => onNavigate('bookings')} className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 whitespace-nowrap">View All →</button>
                   </div>
                   {todaysBookings.length > 0 ? (
                       <div className="space-y-3">
                           {todaysBookings.slice(0, 5).map((booking: Booking) => (
                               <div key={booking.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-white/5 hover:border-emerald-500/20 transition-colors gap-4">
                                   <div className="flex items-center space-x-4 min-w-0">
                                       <div className="w-11 h-11 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                           <Users className="w-5 h-5 text-emerald-400" />
                                       </div>
                                       <div className="min-w-0">
                                           <p className="font-semibold text-white truncate">{booking.customerName}</p>
                                           <p className="text-xs sm:text-sm text-slate-400 truncate">{(booking as any).partySize || booking.guests || 2} guests • {(booking as any).area || booking.table || 'Main Floor'}</p>
                                       </div>
                                   </div>
                                   <div className="text-right flex-shrink-0">
                                       <p className="font-bold text-emerald-400 whitespace-nowrap">{booking.time instanceof Date ? formatTime(booking.time) : String(booking.time)}</p>
                                       <span className="inline-block text-[11px] uppercase font-bold tracking-wider text-slate-400 bg-slate-900/70 px-2 py-0.5 rounded mt-1 whitespace-nowrap">{booking.status}</span>
                                   </div>
                               </div>
                           ))}
                       </div>
                   ) : (
                       <div className="p-8 text-center text-slate-500 bg-slate-800/30 rounded-xl border border-white/5">No bookings scheduled for today.</div>
                   )}
                </div>

                {/* Entertainment & Live Sports Spotlight */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center space-x-2">
                           <Music className="w-5 h-5 text-pink-400" />
                           <h2 className="text-base font-bold text-white whitespace-nowrap">Tonight's Entertainment</h2>
                         </div>
                         <button onClick={() => onNavigate('entertainment')} className="text-xs font-semibold text-pink-400 hover:text-pink-300 whitespace-nowrap">Schedule</button>
                      </div>
                      {upcomingBands.length > 0 ? (
                          <div className="space-y-3">
                              {upcomingBands.slice(0, 3).map((band: EntertainmentEvent) => (
                                  <div key={band.id} className="p-3 bg-slate-800/50 rounded-xl border border-white/5">
                                      <p className="font-semibold text-white text-sm truncate">{band.title}</p>
                                      <p className="text-xs text-pink-400 mt-1 whitespace-nowrap">{formatTime(band.date)} • Live Act</p>
                                  </div>
                              ))}
                          </div>
                      ) : <p className="text-slate-500 text-sm bg-slate-800/30 p-4 rounded-xl text-center border border-white/5">No live acts scheduled tonight.</p>}
                   </div>

                   <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center space-x-2">
                           <Tv className="w-5 h-5 text-purple-400" />
                           <h2 className="text-base font-bold text-white whitespace-nowrap">Live Sports</h2>
                         </div>
                         <button onClick={() => onNavigate('tvschedule')} className="text-xs font-semibold text-purple-400 hover:text-purple-300 whitespace-nowrap">View Guide</button>
                      </div>
                      {todaysTv.length > 0 ? (
                          <div className="space-y-3">
                              {todaysTv.slice(0, 3).map((tv: TVScheduleItem) => (
                                  <div key={tv.id} className="p-3 bg-slate-800/50 rounded-xl border border-white/5">
                                      <p className="font-semibold text-white text-sm truncate">{tv.match}</p>
                                      <p className="text-xs text-purple-400 mt-1 whitespace-nowrap truncate">{tv.channel} • {formatTime(tv.startTime)}</p>
                                  </div>
                              ))}
                          </div>
                      ) : <p className="text-slate-500 text-sm bg-slate-800/30 p-4 rounded-xl text-center border border-white/5">No games scheduled today.</p>}
                   </div>
                </div>

                {/* 86'd / Low Stock Alerts & Service Notices */}
                <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center space-x-2">
                         <Bell className="w-5 h-5 text-amber-400" />
                         <h2 className="text-lg font-bold text-white whitespace-nowrap">Floor Briefings & 86'd Alerts</h2>
                       </div>
                    </div>
                    <div className="space-y-3">
                          {lowStock.length > 0 && (
                            <div className="p-4 bg-amber-900/20 rounded-xl border border-amber-500/30 flex justify-between items-center gap-4">
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-amber-300 font-semibold text-sm">Low / 86'd Stock Warning ({lowStock.length} items)</h4>
                                    <p className="text-xs text-slate-300 mt-1 truncate">
                                      {lowStock.slice(0, 4).map(i => `${i.name} (${i.quantity} ${i.unit})`).join(' • ')}
                                    </p>
                                </div>
                                <span className="text-[11px] px-2.5 py-1 rounded-md font-bold uppercase bg-amber-500/20 text-amber-300 whitespace-nowrap flex-shrink-0">86 Alert</span>
                            </div>
                          )}
                          <div className="p-4 bg-emerald-900/15 rounded-xl border border-emerald-500/20 flex justify-between items-center gap-4">
                              <div className="min-w-0 flex-1">
                                  <h4 className="text-white font-medium text-sm">Specials & Allergens Updated</h4>
                                  <p className="text-xs text-slate-400 mt-1 truncate">Check Menus & Allergens before taking table orders for today's specials.</p>
                              </div>
                              <button onClick={() => onNavigate('menus')} className="text-xs px-3 py-1.5 rounded-lg font-bold uppercase bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors whitespace-nowrap flex-shrink-0">Open Menus</button>
                          </div>
                    </div>
                </div>
             </div>

             {/* Right 4 Columns: Touch-First Service Dock */}
             <div className="lg:col-span-4 space-y-6">
                <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-sm">
                   <h3 className="text-lg font-bold text-white mb-4 whitespace-nowrap">Service Dock</h3>
                   <div className="grid grid-cols-2 gap-3">
                       <button onClick={() => onNavigate('timeclock')} className="bg-emerald-500/10 hover:bg-emerald-500/20 min-h-[88px] p-4 rounded-xl border border-emerald-500/20 transition-colors flex flex-col items-center justify-center text-center">
                           <Clock className="w-6 h-6 text-emerald-400 mb-2" />
                           <span className="text-xs sm:text-sm font-semibold text-white whitespace-nowrap">Timeclock</span>
                       </button>
                       <button onClick={() => onNavigate('bookings')} className="bg-slate-800/50 hover:bg-slate-700 min-h-[88px] p-4 rounded-xl border border-white/5 transition-colors flex flex-col items-center justify-center text-center">
                           <Utensils className="w-6 h-6 text-teal-400 mb-2" />
                           <span className="text-xs sm:text-sm font-semibold text-white whitespace-nowrap">Bookings</span>
                       </button>
                       <button onClick={() => onNavigate('menus')} className="bg-slate-800/50 hover:bg-slate-700 min-h-[88px] p-4 rounded-xl border border-white/5 transition-colors flex flex-col items-center justify-center text-center">
                           <FileText className="w-6 h-6 text-orange-400 mb-2" />
                           <span className="text-xs sm:text-sm font-semibold text-white whitespace-nowrap">Menus</span>
                       </button>
                       <button onClick={() => onNavigate('pos')} className="bg-slate-800/50 hover:bg-slate-700 min-h-[88px] p-4 rounded-xl border border-white/5 transition-colors flex flex-col items-center justify-center text-center">
                           <Monitor className="w-6 h-6 text-blue-400 mb-2" />
                           <span className="text-xs sm:text-sm font-semibold text-white whitespace-nowrap">POS</span>
                       </button>
                       <button onClick={() => onNavigate('incidents')} className="bg-slate-800/50 hover:bg-slate-700 min-h-[88px] p-4 rounded-xl border border-white/5 transition-colors flex flex-col items-center justify-center text-center">
                           <ShieldAlert className="w-6 h-6 text-red-400 mb-2" />
                           <span className="text-xs sm:text-sm font-semibold text-white whitespace-nowrap">Incidents</span>
                       </button>
                       <button onClick={() => onNavigate('lostfound')} className="bg-slate-800/50 hover:bg-slate-700 min-h-[88px] p-4 rounded-xl border border-white/5 transition-colors flex flex-col items-center justify-center text-center">
                           <Umbrella className="w-6 h-6 text-indigo-400 mb-2" />
                           <span className="text-xs sm:text-sm font-semibold text-white whitespace-nowrap">Lost Found</span>
                       </button>
                       <button onClick={() => onNavigate('tvschedule')} className="bg-slate-800/50 hover:bg-slate-700 min-h-[88px] p-4 rounded-xl border border-white/5 transition-colors flex flex-col items-center justify-center text-center">
                           <Tv className="w-6 h-6 text-purple-400 mb-2" />
                           <span className="text-xs sm:text-sm font-semibold text-white whitespace-nowrap">TV Guide</span>
                       </button>
                       <button onClick={() => onNavigate('transport')} className="bg-slate-800/50 hover:bg-slate-700 min-h-[88px] p-4 rounded-xl border border-white/5 transition-colors flex flex-col items-center justify-center text-center">
                           <Truck className="w-6 h-6 text-amber-400 mb-2" />
                           <span className="text-xs sm:text-sm font-semibold text-white whitespace-nowrap">Transport</span>
                       </button>
                   </div>
                </div>

                {/* Shift & Venue Status */}
                <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-sm space-y-4">
                   <div className="flex items-center justify-between">
                      <h3 className="font-bold text-white whitespace-nowrap">Shift & Venue Status</h3>
                      <button onClick={() => onNavigate('venueinfo')} className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 whitespace-nowrap">
                        <Globe className="w-3.5 h-3.5" />
                        <span>Venue Info</span>
                      </button>
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => onNavigate('roster')} className="p-3.5 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-white/5 text-left transition-colors">
                         <p className="text-xs text-slate-400 whitespace-nowrap">Staff on Shift</p>
                         <p className="text-xl font-bold text-white mt-0.5">{staffOnShiftCount}</p>
                      </button>
                      <button onClick={() => onNavigate('incidents')} className="p-3.5 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-white/5 text-left transition-colors">
                         <p className="text-xs text-slate-400 whitespace-nowrap">Open Incidents</p>
                         <p className={`text-xl font-bold mt-0.5 ${openIncidents.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{openIncidents.length}</p>
                      </button>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // BOH Mode
  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto overflow-x-hidden">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Kitchen Command Header */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-xl p-5 rounded-2xl border border-amber-500/20 shadow-lg">
             <div className="min-w-0">
                <div className="flex items-center space-x-3">
                   <h1 className="text-2xl sm:text-3xl font-bold text-white whitespace-nowrap truncate">Kitchen Hub</h1>
                   <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                     {user.role}
                   </span>
                </div>
                <p className="text-sm text-slate-400 mt-0.5 whitespace-nowrap truncate">Back of House Operations • Welcome, {user.name}</p>
             </div>
             <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                 <div className="w-56 sm:w-64 flex-shrink-0">
                     <WeatherWidget />
                 </div>
                 <div className="flex items-center space-x-3 bg-slate-950/60 px-4 py-2.5 rounded-xl border border-white/10 shadow-inner whitespace-nowrap">
                     <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                     <span className="font-mono font-bold text-lg text-white">
                       {today.getHours().toString().padStart(2, '0')}
                       <span className="animate-[pulse_1s_ease-in-out_infinite]">:</span>
                       {today.getMinutes().toString().padStart(2, '0')}
                       <span className="animate-[pulse_1s_ease-in-out_infinite]">:</span>
                       {today.getSeconds().toString().padStart(2, '0')}
                     </span>
                     <span className="h-4 w-px bg-white/10"></span>
                     <span className="text-xs sm:text-sm font-medium text-slate-300">
                       {today.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                     </span>
                 </div>
             </div>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
             <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-sm cursor-pointer hover:bg-slate-800/60 hover:border-amber-500/30 transition-all" onClick={() => onNavigate('maintenance')}>
                <div className="flex items-center justify-between mb-3">
                   <div className="p-2.5 bg-amber-500/15 text-amber-400 rounded-xl"><ClipboardList className="w-5 h-5"/></div>
                   <span className="text-xs font-semibold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md whitespace-nowrap">Prep & Maint</span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white">{pendingTasks.length}</div>
                <div className="text-xs sm:text-sm font-medium text-slate-400 mt-1 whitespace-nowrap truncate">Pending Tasks</div>
             </div>
             <div className={`bg-slate-900/60 backdrop-blur-xl rounded-2xl p-5 border shadow-sm cursor-pointer hover:bg-slate-800/60 transition-all ${lowStock.length > 0 ? 'border-red-500/40' : 'border-white/10'}`} onClick={() => onNavigate('stock')}>
                <div className="flex items-center justify-between mb-3">
                   <div className="p-2.5 bg-red-500/15 text-red-400 rounded-xl"><AlertTriangle className="w-5 h-5"/></div>
                   <span className={`text-xs font-semibold px-2 py-0.5 rounded-md whitespace-nowrap ${lowStock.length > 0 ? 'text-red-300 bg-red-500/15' : 'text-emerald-300 bg-emerald-500/15'}`}>
                     {lowStock.length > 0 ? 'Order Needed' : 'Stock OK'}
                   </span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white">{lowStock.length}</div>
                <div className="text-xs sm:text-sm font-medium text-slate-400 mt-1 whitespace-nowrap truncate">Low Stock Alerts</div>
             </div>
             <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-sm cursor-pointer hover:bg-slate-800/60 hover:border-emerald-500/30 transition-all" onClick={() => onNavigate('bookings')}>
                <div className="flex items-center justify-between mb-3">
                   <div className="p-2.5 bg-emerald-500/15 text-emerald-400 rounded-xl"><Utensils className="w-5 h-5"/></div>
                   <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md whitespace-nowrap">{totalCoversToday} Covers</span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white">{todaysBookings.length}</div>
                <div className="text-xs sm:text-sm font-medium text-slate-400 mt-1 whitespace-nowrap truncate">Bookings Today</div>
             </div>
             <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-sm cursor-pointer hover:bg-slate-800/60 hover:border-blue-500/30 transition-all" onClick={() => onNavigate('recipes')}>
                <div className="flex items-center justify-between mb-3">
                   <div className="p-2.5 bg-blue-500/15 text-blue-400 rounded-xl"><BookOpen className="w-5 h-5"/></div>
                   <span className="text-xs font-semibold text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded-md whitespace-nowrap">Specs</span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white">{recipesCount}</div>
                <div className="text-xs sm:text-sm font-medium text-slate-400 mt-1 whitespace-nowrap truncate">Active Recipes</div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
             <div className="lg:col-span-8 space-y-6">
                {/* Prep & Maintenance Tasks */}
                <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center space-x-2.5">
                           <ClipboardList className="w-5 h-5 text-amber-400" />
                           <h2 className="text-lg font-bold text-white whitespace-nowrap">Prep & Maintenance Tasks</h2>
                        </div>
                        <button onClick={() => onNavigate('maintenance')} className="text-sm font-semibold text-amber-400 hover:text-amber-300 whitespace-nowrap">View All →</button>
                    </div>
                    {pendingTasks.length > 0 ? (
                       <div className="space-y-3">
                           {pendingTasks.slice(0, 5).map((task: MaintenanceTask) => (
                               <div key={task.id} className="p-4 bg-slate-800/50 rounded-xl border border-white/5 flex justify-between items-center gap-4">
                                   <div className="flex-1 min-w-0">
                                       <h4 className="text-white font-semibold truncate">{task.title}</h4>
                                       <p className="text-xs sm:text-sm text-slate-400 mt-1 truncate">{task.description}</p>
                                   </div>
                                   <span className={`text-[11px] px-2.5 py-1 rounded-md font-bold uppercase whitespace-nowrap flex-shrink-0 ${task.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                       {task.priority}
                                   </span>
                               </div>
                           ))}
                       </div>
                    ) : (
                        <div className="p-8 text-center text-slate-500 bg-slate-800/30 rounded-xl border border-white/5">All caught up!</div>
                    )}
                </div>

                {/* Kitchen Notices & Allergen Matrix Quick Link */}
                <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-sm">
                    <h2 className="text-lg font-bold text-white mb-4 whitespace-nowrap">Kitchen Notices & Allergens</h2>
                    <div className="space-y-3">
                        <div className="p-4 bg-amber-900/15 rounded-xl border border-amber-500/25 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                            <div className="min-w-0 flex-1">
                                <h4 className="text-white font-semibold text-sm">Chef Allergen Matrix</h4>
                                <p className="text-xs text-slate-300 mt-1">Verify Gluten, Dairy, Garlic, Onion, Nuts & 86'd status across all dishes.</p>
                            </div>
                            <button onClick={() => onNavigate('menus')} className="text-xs px-3.5 py-2 rounded-lg font-bold uppercase bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors whitespace-nowrap self-start sm:self-center flex-shrink-0">
                                Open Allergen Matrix
                            </button>
                        </div>
                        <div className="p-4 bg-blue-900/15 rounded-xl border border-blue-500/20 flex justify-between items-center gap-4">
                            <div className="min-w-0 flex-1">
                                <h4 className="text-white font-medium text-sm">Recipe Specs & Costing</h4>
                                <p className="text-xs text-slate-400 mt-1 truncate">Check Recipes for updated portion yields and GP% specs.</p>
                            </div>
                            <button onClick={() => onNavigate('recipes')} className="text-xs px-3 py-1.5 rounded-lg font-bold uppercase bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors whitespace-nowrap flex-shrink-0">Recipes</button>
                        </div>
                    </div>
                </div>
             </div>

             <div className="lg:col-span-4 space-y-6">
                {/* Kitchen Dock */}
                <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-sm">
                   <h3 className="text-lg font-bold text-white mb-4 whitespace-nowrap">Kitchen Dock</h3>
                   <div className="grid grid-cols-2 gap-3">
                       <button onClick={() => onNavigate('timeclock')} className="bg-amber-500/10 hover:bg-amber-500/20 min-h-[88px] p-4 rounded-xl border border-amber-500/20 transition-colors flex flex-col items-center justify-center text-center">
                           <Clock className="w-6 h-6 text-amber-400 mb-2" />
                           <span className="text-xs sm:text-sm font-semibold text-white whitespace-nowrap">Timeclock</span>
                       </button>
                       <button onClick={() => onNavigate('menus')} className="bg-slate-800/50 hover:bg-slate-700 min-h-[88px] p-4 rounded-xl border border-white/5 transition-colors flex flex-col items-center justify-center text-center">
                           <FileText className="w-6 h-6 text-orange-400 mb-2" />
                           <span className="text-xs sm:text-sm font-semibold text-white whitespace-nowrap">Allergens</span>
                       </button>
                       <button onClick={() => onNavigate('recipes')} className="bg-slate-800/50 hover:bg-slate-700 min-h-[88px] p-4 rounded-xl border border-white/5 transition-colors flex flex-col items-center justify-center text-center">
                           <BookOpen className="w-6 h-6 text-blue-400 mb-2" />
                           <span className="text-xs sm:text-sm font-semibold text-white whitespace-nowrap">Recipes</span>
                       </button>
                       <button onClick={() => onNavigate('stock')} className="bg-slate-800/50 hover:bg-slate-700 min-h-[88px] p-4 rounded-xl border border-white/5 transition-colors flex flex-col items-center justify-center text-center">
                           <Boxes className="w-6 h-6 text-emerald-400 mb-2" />
                           <span className="text-xs sm:text-sm font-semibold text-white whitespace-nowrap">Stock</span>
                       </button>
                       <button onClick={() => onNavigate('stocktake')} className="bg-slate-800/50 hover:bg-slate-700 min-h-[88px] p-4 rounded-xl border border-white/5 transition-colors flex flex-col items-center justify-center text-center">
                           <ClipboardList className="w-6 h-6 text-amber-400 mb-2" />
                           <span className="text-xs sm:text-sm font-semibold text-white whitespace-nowrap">Stocktake</span>
                       </button>
                       <button onClick={() => onNavigate('ordering')} className="bg-slate-800/50 hover:bg-slate-700 min-h-[88px] p-4 rounded-xl border border-white/5 transition-colors flex flex-col items-center justify-center text-center">
                           <Truck className="w-6 h-6 text-indigo-400 mb-2" />
                           <span className="text-xs sm:text-sm font-semibold text-white whitespace-nowrap">Ordering</span>
                       </button>
                       <button onClick={() => onNavigate('maintenance')} className="bg-slate-800/50 hover:bg-slate-700 min-h-[88px] p-4 rounded-xl border border-white/5 transition-colors flex flex-col items-center justify-center text-center">
                           <AlertTriangle className="w-6 h-6 text-red-400 mb-2" />
                           <span className="text-xs sm:text-sm font-semibold text-white whitespace-nowrap">Maintenance</span>
                       </button>
                       <button onClick={() => onNavigate('documents')} className="bg-slate-800/50 hover:bg-slate-700 min-h-[88px] p-4 rounded-xl border border-white/5 transition-colors flex flex-col items-center justify-center text-center">
                           <BookOpen className="w-6 h-6 text-slate-400 mb-2" />
                           <span className="text-xs sm:text-sm font-semibold text-white whitespace-nowrap">Docs</span>
                       </button>
                   </div>
                </div>

                {/* Low Stock Widget */}
                <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-white whitespace-nowrap">Low Stock Alerts</h3>
                        <button onClick={() => onNavigate('stock')} className="text-xs font-semibold text-red-400 hover:text-red-300 whitespace-nowrap">View Inventory</button>
                    </div>
                    {lowStock.length > 0 ? (
                        <div className="space-y-2.5">
                            {lowStock.slice(0, 5).map((item: StockItem) => (
                                <div key={item.id} className="p-3 bg-slate-800/50 rounded-xl border border-red-500/20 flex items-center justify-between gap-2">
                                    <p className="font-medium text-white text-sm truncate">{item.name}</p>
                                    <span className="text-xs text-red-400 font-bold whitespace-nowrap flex-shrink-0">{item.quantity} {item.unit}</span>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-slate-500 text-sm bg-slate-800/30 p-4 rounded-xl text-center border border-white/5">Stock levels good.</p>}
                </div>
             </div>
          </div>
        </div>
    </div>
  );
};

export default DashboardView;
