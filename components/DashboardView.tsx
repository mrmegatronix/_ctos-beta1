
import React from 'react';
import { AppMode, AppModule, CalendarEvent, MaintenanceTask, StockItem, Booking, TeamMember, TVScheduleItem } from '../types';
import { formatDate, formatTime } from '../utils';
import { 
  Users, 
  Calendar as CalendarIcon, 
  ClipboardList, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Layout, 
  ArrowRight, 
  AlertTriangle, 
  Package, 
  CheckCircle2, 
  Bell, 
  Search,
  BookOpen,
  Utensils,
  Music,
  Tv,
  Boxes,
  Monitor
} from 'lucide-react';

interface DashboardViewProps {
  mode: AppMode;
  user: TeamMember;
  events: CalendarEvent[];
  tasks: MaintenanceTask[];
  lowStock: StockItem[];
  bookings: Booking[];
  tvSchedule: TVScheduleItem[];
  onNavigate: (module: AppModule) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ 
  mode, user, events, tasks, lowStock, bookings, tvSchedule, onNavigate 
}) => {
  const today = new Date();
  const todaysEvents = events.filter(e => 
    new Date(e.start).getDate() === today.getDate() && 
    new Date(e.start).getMonth() === today.getMonth()
  );
  
  // Sort bookings by time
  const upcomingBookings = [...bookings]
    .filter(b => new Date(b.time).getDate() === today.getDate())
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  // Filter TV Schedule for Today and Tomorrow, sorted by time
  const upcomingTV = tvSchedule
    .filter(item => new Date(item.startTime) >= new Date(today.setHours(0,0,0,0)))
    .sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 3); // Top 3

  if (mode === 'FOH') {
    return (
      <div className="flex-1 p-6 bg-slate-100 dark:bg-slate-900 overflow-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
             <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
               Welcome back, <span className="text-amber-600 dark:text-amber-500">{user.name}</span>
             </h1>
             <p className="text-slate-500 dark:text-slate-400">Ready for service? Here is what's happening today.</p>
          </header>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
             <button onClick={() => onNavigate('browser')} className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-lg hover:scale-105 transition-all border-b-4 border-amber-500 flex flex-col items-center justify-center text-center group h-32">
                 <div className="p-3 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 mb-2 group-hover:bg-amber-100">
                    <Monitor className="w-6 h-6" />
                 </div>
                 <span className="font-bold text-sm text-slate-800 dark:text-white">POS System</span>
             </button>
             
             <button onClick={() => onNavigate('bookings')} className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-lg hover:scale-105 transition-all border-b-4 border-blue-500 flex flex-col items-center justify-center text-center group h-32">
                 <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 mb-2 group-hover:bg-blue-100">
                    <Utensils className="w-6 h-6" />
                 </div>
                 <span className="font-bold text-sm text-slate-800 dark:text-white">Reservations</span>
             </button>

             <button onClick={() => onNavigate('tvschedule')} className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-lg hover:scale-105 transition-all border-b-4 border-sky-500 flex flex-col items-center justify-center text-center group h-32">
                 <div className="p-3 rounded-full bg-sky-50 dark:bg-sky-900/20 text-sky-600 mb-2 group-hover:bg-sky-100">
                    <Tv className="w-6 h-6" />
                 </div>
                 <span className="font-bold text-sm text-slate-800 dark:text-white">TV Schedule</span>
             </button>

             <button onClick={() => onNavigate('recipes')} className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-lg hover:scale-105 transition-all border-b-4 border-pink-500 flex flex-col items-center justify-center text-center group h-32">
                 <div className="p-3 rounded-full bg-pink-50 dark:bg-pink-900/20 text-pink-600 mb-2 group-hover:bg-pink-100">
                    <BookOpen className="w-6 h-6" />
                 </div>
                 <span className="font-bold text-sm text-slate-800 dark:text-white">Recipes</span>
             </button>

             <button onClick={() => onNavigate('incidents')} className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-lg hover:scale-105 transition-all border-b-4 border-red-500 flex flex-col items-center justify-center text-center group h-32">
                 <div className="p-3 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 mb-2 group-hover:bg-red-100">
                    <ShieldAlert className="w-6 h-6" />
                 </div>
                 <span className="font-bold text-sm text-slate-800 dark:text-white">Incident Log</span>
             </button>

             <button onClick={() => onNavigate('lostfound')} className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-lg hover:scale-105 transition-all border-b-4 border-purple-500 flex flex-col items-center justify-center text-center group h-32">
                 <div className="p-3 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 mb-2 group-hover:bg-purple-100">
                    <Umbrella className="w-6 h-6" />
                 </div>
                 <span className="font-bold text-sm text-slate-800 dark:text-white">Lost & Found</span>
             </button>

             <button onClick={() => onNavigate('entertainment')} className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-lg hover:scale-105 transition-all border-b-4 border-purple-600 flex flex-col items-center justify-center text-center group h-32">
                 <div className="p-3 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 mb-2 group-hover:bg-purple-100">
                    <Music className="w-6 h-6" />
                 </div>
                 <span className="font-bold text-sm text-slate-800 dark:text-white">Band Calendar</span>
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {/* Today's Briefing */}
             <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                   <Clock className="w-5 h-5 mr-2 text-amber-500" />
                   Upcoming Bookings
                </h2>
                <div className="space-y-4">
                   {upcomingBookings.length === 0 ? (
                       <p className="text-slate-500">No bookings for the rest of the day.</p>
                   ) : (
                       upcomingBookings.slice(0, 5).map(b => (
                           <div key={b.id} className={`flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl ${b.isDemo ? 'demo-highlight' : ''}`}>
                               <div className="flex items-center space-x-3">
                                   <div className="font-bold text-slate-900 dark:text-white">{formatTime(b.time)}</div>
                                   <div>
                                       <div className="font-semibold text-slate-800 dark:text-slate-200">{b.customerName}</div>
                                       <div className="text-xs text-slate-500">{b.guests} Guests • Table {b.table}</div>
                                   </div>
                               </div>
                               <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${b.status === 'seated' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                   {b.status}
                               </span>
                           </div>
                       ))
                   )}
                </div>
             </div>

             {/* Live Sport */}
             <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                 <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                   <Tv className="w-5 h-5 mr-2 text-sky-500" />
                   Live Sport Today
                </h2>
                <div className="space-y-3">
                    {upcomingTV.length === 0 ? (
                         <p className="text-slate-500">No major sport scheduled.</p>
                    ) : (
                        upcomingTV.map(tv => (
                            <div key={tv.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border-l-4 border-sky-500">
                                <div className="flex justify-between items-start">
                                    <span className="text-xs font-bold uppercase text-sky-600 dark:text-sky-400">{tv.sport}</span>
                                    <span className="text-xs font-mono text-slate-500">{formatTime(new Date(tv.startTime))}</span>
                                </div>
                                <div className="font-bold text-slate-900 dark:text-white text-sm my-1">{tv.match}</div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500">{tv.channel}</span>
                                    {tv.notes && <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">{tv.notes}</span>}
                                </div>
                            </div>
                        ))
                    )}
                    <button onClick={() => onNavigate('tvschedule')} className="w-full text-center text-sm text-sky-600 hover:text-sky-700 font-medium mt-2">View Full Schedule</button>
                </div>
             </div>

             {/* Stock Summary Widget */}
             <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                 <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                   <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                   Stock Summary
                </h2>
                <div className="space-y-3">
                    {lowStock.length === 0 ? (
                         <p className="text-slate-500 text-sm">All inventory levels are healthy.</p>
                    ) : (
                        lowStock.slice(0, 6).map(item => (
                            <div key={item.id} className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-900/10 rounded-lg">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.name}</span>
                                <span className="text-xs font-bold text-red-600 dark:text-red-400">{item.quantity} {item.unit}</span>
                            </div>
                        ))
                    )}
                    <button onClick={() => onNavigate('stock')} className="w-full text-center text-sm text-amber-600 hover:text-amber-700 font-medium mt-2">Inventory Management</button>
                </div>
             </div>

             {/* Bar Notices */}
             <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-6 border border-amber-100 dark:border-amber-900/50">
                <h2 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-4">Daily Notices</h2>
                <ul className="space-y-3">
                    <li className="text-amber-800/50 dark:text-amber-200/50 italic text-sm">No new notices for today.</li>
                </ul>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // BOH MODE DASHBOARD
  if (mode === 'BOH') {
    return (
      <div className="flex-1 p-6 bg-orange-50/30 dark:bg-slate-900 overflow-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
             <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
               Kitchen Dashboard: <span className="text-orange-600 dark:text-orange-500">{user.name}</span>
             </h1>
             <p className="text-slate-500 dark:text-slate-400">Back of house operations and prep list.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {/* Kitchen Schedule */}
             <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                   <Clock className="w-5 h-5 mr-2 text-orange-500" />
                   Preparation & Service Schedule
                </h2>
                <div className="space-y-4">
                   <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border-l-4 border-orange-500">
                      <div className="font-bold text-orange-900 dark:text-orange-200">Lunch Service</div>
                      <div className="text-sm text-orange-700 dark:text-orange-300">12:00 PM - 3:00 PM</div>
                   </div>
                   <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl border-l-4 border-slate-400">
                      <div className="font-bold text-slate-900 dark:text-slate-100">Dinner Prep</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">3:00 PM - 5:00 PM</div>
                   </div>
                   <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl border-l-4 border-slate-400">
                      <div className="font-bold text-slate-900 dark:text-slate-100">Dinner Service</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">5:00 PM - 9:00 PM</div>
                   </div>
                </div>
             </div>

             {/* Quick Links */}
             <div className="space-y-4">
                <button onClick={() => onNavigate('recipes')} className="w-full p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all flex items-center space-x-4">
                   <div className="p-4 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-xl">
                      <BookOpen className="w-8 h-8" />
                   </div>
                   <div className="text-left">
                      <div className="font-bold text-lg text-slate-900 dark:text-white">Meal Recipes</div>
                      <div className="text-sm text-slate-500">View prep guides</div>
                   </div>
                </button>
                <button onClick={() => onNavigate('stock')} className="w-full p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all flex items-center space-x-4">
                   <div className="p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                      <Boxes className="w-8 h-8" />
                   </div>
                   <div className="text-left">
                      <div className="font-bold text-lg text-slate-900 dark:text-white">Kitchen Stock</div>
                      <div className="text-sm text-slate-500">Inventory levels</div>
                   </div>
                </button>
                <div className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-900/50">
                    <h3 className="font-bold text-amber-900 dark:text-amber-100 mb-2">Equipment Status</h3>
                    <div className="flex items-center text-sm text-green-600 font-medium">
                       <CheckCircle2 className="w-4 h-4 mr-2" /> All clear
                    </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // OFFICE MODE DASHBOARD
  return (
    <div className="flex-1 p-8 bg-gray-50 dark:bg-slate-900 overflow-auto custom-scrollbar">
       <div className="max-w-6xl mx-auto">
          <header className="flex justify-between items-center mb-8">
             <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Office Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400">Overview of venue operations.</p>
             </div>
             <div className="flex space-x-2">
                 <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm">
                    New Event
                 </button>
             </div>
          </header>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
             <div onClick={() => onNavigate('finance')} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm cursor-pointer hover:border-indigo-300 transition-colors">
                 <div className="flex items-center justify-between mb-4">
                     <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg">
                         <DollarSign className="w-6 h-6" />
                     </div>
                 </div>
                 <div className="text-2xl font-bold text-gray-900 dark:text-white">$0.00</div>
                 <div className="text-sm text-gray-500">Weekly Revenue</div>
             </div>

             <div onClick={() => onNavigate('bookings')} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm cursor-pointer hover:border-blue-300 transition-colors">
                 <div className="flex items-center justify-between mb-4">
                     <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                         <Users className="w-6 h-6" />
                     </div>
                     <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-full">Today</span>
                 </div>
                 <div className="text-2xl font-bold text-gray-900 dark:text-white">{bookings.length}</div>
                 <div className="text-sm text-gray-500">Total Bookings</div>
             </div>

             <div onClick={() => onNavigate('incidents')} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm cursor-pointer hover:border-red-300 transition-colors">
                 <div className="flex items-center justify-between mb-4">
                     <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg">
                         <ShieldAlert className="w-6 h-6" />
                     </div>
                 </div>
                 <div className="text-2xl font-bold text-gray-900 dark:text-white">Safe</div>
                 <div className="text-sm text-gray-500">Incident Log Status</div>
             </div>

             <div onClick={() => onNavigate('maintenance')} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm cursor-pointer hover:border-amber-300 transition-colors">
                 <div className="flex items-center justify-between mb-4">
                     <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-lg">
                         <Wrench className="w-6 h-6" />
                     </div>
                     <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Pending</span>
                 </div>
                 <div className="text-2xl font-bold text-gray-900 dark:text-white">{tasks.filter(t => t.status !== 'completed').length}</div>
                 <div className="text-sm text-gray-500">Maintenance Issues</div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* Left Column: Calendar & Events */}
             <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-indigo-500" /> Today's Schedule
                        </h3>
                        <button onClick={() => onNavigate('calendar')} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center">
                            View Calendar <ArrowRight className="w-4 h-4 ml-1" />
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        {todaysEvents.length === 0 ? (
                             <div className="text-center py-8 text-gray-400">No events scheduled for today.</div>
                        ) : (
                            todaysEvents.map(event => (
                                <div key={event.id} className={`flex items-start p-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors border-l-4 border-indigo-500 bg-gray-50/50 dark:bg-slate-800 ${event.isDemo ? 'demo-highlight' : ''}`}>
                                    <div className="min-w-[80px] font-bold text-gray-900 dark:text-white">{formatTime(event.start)}</div>
                                    <div>
                                        <div className="font-semibold text-gray-900 dark:text-white">{event.title}</div>
                                        {event.description && <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{event.description}</div>}
                                        <div className="mt-2 flex -space-x-2">
                                            {event.attendeeIds.slice(0,3).map(id => (
                                                <div key={id} className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white dark:border-slate-800 overflow-hidden">
                                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`} alt="" />
                                                </div>
                                            ))}
                                            {event.attendeeIds.length > 3 && (
                                                <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] text-gray-600">
                                                    +{event.attendeeIds.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
                     <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Stock Alerts</h3>
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                             <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-slate-900/50">
                                 <tr>
                                     <th className="px-4 py-3 rounded-l-lg">Item</th>
                                     <th className="px-4 py-3">Current</th>
                                     <th className="px-4 py-3 rounded-r-lg">Status</th>
                                 </tr>
                             </thead>
                             <tbody>
                                 {lowStock.slice(0,5).map(item => (
                                     <tr key={item.id} className={`border-b border-gray-100 dark:border-slate-700/50 last:border-0 ${item.isDemo ? 'demo-highlight' : ''}`}>
                                         <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{item.name}</td>
                                         <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{item.quantity} {item.unit}</td>
                                         <td className="px-4 py-3 text-red-600 font-bold text-xs">Low Stock</td>
                                     </tr>
                                 ))}
                                 {lowStock.length === 0 && (
                                     <tr>
                                         <td colSpan={3} className="px-4 py-4 text-center text-gray-500">Stock levels are healthy.</td>
                                     </tr>
                                 )}
                             </tbody>
                        </table>
                     </div>
                </div>
             </div>

             {/* Right Column: Maintenance & Actions */}
             <div className="space-y-6">
                 <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
                     <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Pending Maintenance</h3>
                     <div className="space-y-3">
                         {tasks.filter(t => t.status !== 'completed').slice(0,4).map(task => (
                             <div key={task.id} className={`p-3 border border-gray-100 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900/30 ${task.isDemo ? 'demo-highlight' : ''}`}>
                                 <div className="flex justify-between items-start mb-1">
                                     <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${task.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{task.priority}</span>
                                     <span className="text-xs text-gray-400">{formatDate(task.createdAt)}</span>
                                 </div>
                                 <div className="font-medium text-sm text-gray-900 dark:text-white line-clamp-1">{task.title}</div>
                             </div>
                         ))}
                         <button onClick={() => onNavigate('maintenance')} className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800">
                             View All Tasks
                         </button>
                     </div>
                 </div>

                 <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 text-white shadow-lg">
                     <h3 className="font-bold text-lg mb-2">Need Help?</h3>
                     <p className="text-indigo-100 text-sm mb-4">Ask the AI assistant to summarize your day or schedule meetings.</p>
                     <div className="text-xs bg-white/20 p-2 rounded mb-2">
                        "Draft a roster for next week"
                     </div>
                 </div>
             </div>
          </div>
       </div>
    </div>
  );
};

export default DashboardView;
