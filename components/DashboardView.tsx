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
  ClipboardList
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
  onNavigate: (module: AppModule) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ 
  mode, user, events, entertainmentEvents = [], tasks, lowStock, bookings, tvSchedule, onNavigate 
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Office Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400">Welcome back, {user.name}.</p>
             </div>
             <div className="flex flex-col items-end gap-3">
                <div className="text-sm font-medium text-gray-500 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
                    {today.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div className="w-64">
                    <WeatherWidget />
                </div>
             </div>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                   <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg"><Utensils className="w-5 h-5"/></div>
                   <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Today's Bookings</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{todaysBookings.length}</div>
             </div>
             <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                   <div className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 rounded-lg"><AlertTriangle className="w-5 h-5"/></div>
                   <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Low Stock Alerts</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{lowStock.length}</div>
             </div>
             <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                   <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-lg"><ClipboardList className="w-5 h-5"/></div>
                   <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Tasks</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{pendingTasks.length}</div>
             </div>
             <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                   <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg"><CalendarIcon className="w-5 h-5"/></div>
                   <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Events Today</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{todaysEvents.length}</div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Main Content Area */}
             <div className="lg:col-span-2 space-y-6">
                 {/* Google Workspace & Tools Links */}
                 <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
                     <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                         <h3 className="font-semibold text-gray-900 dark:text-white">Workspace & Applications</h3>
                     </div>
                     <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <button onClick={() => onNavigate('calendar')} className="flex flex-col items-center p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                            <Calendar className="w-8 h-8 text-blue-500 mb-2" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Calendar</span>
                        </button>
                        <button onClick={() => onNavigate('email')} className="flex flex-col items-center p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                            <Mail className="w-8 h-8 text-red-500 mb-2" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</span>
                        </button>
                        <button onClick={() => onNavigate('contacts')} className="flex flex-col items-center p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                            <Contact className="w-8 h-8 text-indigo-500 mb-2" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Contacts</span>
                        </button>
                        <button onClick={() => onNavigate('finance')} className="flex flex-col items-center p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                            <DollarSign className="w-8 h-8 text-emerald-500 mb-2" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Finance</span>
                        </button>
                     </div>
                 </div>

                 {/* System Alerts */}
                 <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
                     <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                         <h3 className="font-semibold text-gray-900 dark:text-white">Action Required</h3>
                     </div>
                     <div className="divide-y divide-gray-100 dark:divide-slate-700">
                         {lowStock.length > 0 && (
                            <div className="p-4 flex items-center justify-between">
                               <div className="flex items-center space-x-3">
                                  <AlertTriangle className="w-5 h-5 text-red-500" />
                                  <div>
                                     <p className="font-medium text-gray-900 dark:text-white">{lowStock.length} Items Low on Stock</p>
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
                                     <p className="font-medium text-gray-900 dark:text-white">{pendingTasks.length} Pending Maintenance Tasks</p>
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
                
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Today's Schedule</h3>
                    <div className="space-y-4">
                        {todaysEvents.map(event => (
                            <div key={event.id} className="flex space-x-3">
                                <div className="text-xs font-bold text-gray-500 pt-1 w-12">{formatTime(event.start)}</div>
                                <div className="flex-1 bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg border-l-2 border-indigo-500">
                                    <p className="font-medium text-sm text-gray-900 dark:text-white">{event.title}</p>
                                </div>
                            </div>
                        ))}
                        {upcomingBands.map(band => (
                            <div key={band.id} className="flex space-x-3">
                                <div className="text-xs font-bold text-gray-500 pt-1 w-12">{formatTime(band.date)}</div>
                                <div className="flex-1 bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg border-l-2 border-purple-500">
                                    <p className="font-medium text-sm text-gray-900 dark:text-white">{band.title}</p>
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
         <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center mb-8 relative">
               <div className="absolute right-0 top-0 w-64 text-left">
                  <WeatherWidget />
               </div>
               <h1 className="text-4xl font-bold text-white mb-2">Front of House</h1>
               <p className="text-slate-400">Select a terminal or module to begin service.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <button onClick={() => onNavigate('browser')} className="bg-slate-800 hover:bg-slate-700 p-8 rounded-2xl border border-slate-700 transition-all flex flex-col items-center justify-center text-center group">
                   <Monitor className="w-12 h-12 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                   <h3 className="text-xl font-bold text-white mb-1">Point of Sale</h3>
                   <p className="text-sm text-slate-400">Launch Till System</p>
               </button>
               <button onClick={() => onNavigate('bookings')} className="bg-slate-800 hover:bg-slate-700 p-8 rounded-2xl border border-slate-700 transition-all flex flex-col items-center justify-center text-center group">
                   <Utensils className="w-12 h-12 text-emerald-500 mb-4 group-hover:scale-110 transition-transform" />
                   <h3 className="text-xl font-bold text-white mb-1">Bookings</h3>
                   <p className="text-sm text-slate-400">{todaysBookings.length} Today</p>
               </button>
               <button onClick={() => onNavigate('tvschedule')} className="bg-slate-800 hover:bg-slate-700 p-8 rounded-2xl border border-slate-700 transition-all flex flex-col items-center justify-center text-center group">
                   <Tv className="w-12 h-12 text-purple-500 mb-4 group-hover:scale-110 transition-transform" />
                   <h3 className="text-xl font-bold text-white mb-1">Live Sports</h3>
                   <p className="text-sm text-slate-400">{todaysTv.length} Games</p>
               </button>
               <button onClick={() => onNavigate('entertainment')} className="bg-slate-800 hover:bg-slate-700 p-8 rounded-2xl border border-slate-700 transition-all flex flex-col items-center justify-center text-center group">
                   <Music className="w-12 h-12 text-pink-500 mb-4 group-hover:scale-110 transition-transform" />
                   <h3 className="text-xl font-bold text-white mb-1">Entertainment</h3>
                   <p className="text-sm text-slate-400">Gig Guide & Events</p>
               </button>
            </div>
         </div>
      </div>
    );
  }

  // BOH Mode
  return (
    <div className="flex-1 p-8 overflow-auto">
         <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-6 mb-8">
               <h1 className="text-4xl font-bold text-white">Kitchen Dashboard</h1>
               <div className="flex items-center space-x-6">
                   <div className="w-64">
                       <WeatherWidget />
                   </div>
                   <div className="text-slate-400 text-lg">{today.toLocaleDateString()}</div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="md:col-span-2 space-y-6">
                  {/* High priority tasks */}
                  <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                      <h2 className="text-xl font-bold text-white mb-4 flex items-center"><ClipboardList className="w-6 h-6 mr-2 text-amber-500"/> Prep & Maintenance</h2>
                      {pendingTasks.length > 0 ? (
                         <div className="space-y-3">
                             {pendingTasks.map(task => (
                                 <div key={task.id} className="p-4 bg-slate-900 rounded-lg border border-slate-700 flex justify-between items-center">
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
                          <div className="p-8 text-center text-slate-500 bg-slate-900 rounded-lg">All caught up!</div>
                      )}
                  </div>
               </div>

               <div className="space-y-6">
                   <button onClick={() => onNavigate('recipes')} className="w-full bg-slate-800 hover:bg-slate-700 p-6 rounded-xl border border-slate-700 transition-colors flex items-center space-x-4">
                       <div className="p-4 bg-blue-500/20 rounded-lg text-blue-400"><BookOpen className="w-8 h-8" /></div>
                       <div className="text-left">
                          <h3 className="text-xl font-bold text-white">Recipes</h3>
                          <p className="text-sm text-slate-400">View Specs & Prep</p>
                       </div>
                   </button>
                   <button onClick={() => onNavigate('stock')} className="w-full bg-slate-800 hover:bg-slate-700 p-6 rounded-xl border border-slate-700 transition-colors flex items-center space-x-4">
                       <div className="p-4 bg-emerald-500/20 rounded-lg text-emerald-400"><Boxes className="w-8 h-8" /></div>
                       <div className="text-left">
                          <h3 className="text-xl font-bold text-white">Stock</h3>
                          <p className="text-sm text-slate-400">Inventory Management</p>
                       </div>
                   </button>
               </div>
            </div>
         </div>
    </div>
  );
};

export default DashboardView;
