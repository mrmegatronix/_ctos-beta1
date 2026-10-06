import React from 'react';
import { AppMode, CalendarEvent, MaintenanceTask, StockItem, Booking, TeamMember, TVScheduleItem, EntertainmentEvent, AppModule } from '../types';
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
  FileText
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
  tasks?: MaintenanceTask[];
  lowStock?: StockItem[];
  bookings?: Booking[];
  tvSchedule?: TVScheduleItem[];
  onNavigate: (module: AppModule) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ 
  mode, user, events = [], entertainmentEvents = [], tasks = [], lowStock = [], bookings = [], tvSchedule = [], onNavigate 
}) => {
  const today = new Date();
  
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

  // BOH Mode
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
                                   <span className={`text-xs px-2 py-1 rounded font-bold uppercase ml-4 ${task.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
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
