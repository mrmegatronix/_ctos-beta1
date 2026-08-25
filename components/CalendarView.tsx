import React, { useState } from 'react';
import { CalendarEvent, TeamMember } from '../types';
import ActionToolbar from './ActionToolbar';
import { formatDate, isSameDay, getStartOfWeek, addDays } from '../utils';
import { HOURS } from '../constants';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, LayoutGrid } from 'lucide-react';
import DigitalClock from './DigitalClock';

interface CalendarViewProps {
  events: CalendarEvent[];
  teamMembers: TeamMember[];
  isFohMode: boolean;
  onEditLocation: (event: CalendarEvent) => void;
  onCreateEvent: () => void;
  onSync: () => void;
}

type CalViewMode = 'month' | 'week' | 'schedule';

const CalendarView: React.FC<CalendarViewProps> = ({ events, teamMembers, isFohMode, onEditLocation, onCreateEvent, onSync }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalViewMode>('week');

  const visibleMemberIds = teamMembers.filter(m => m.visible).map(m => m.id);
  const filteredEvents = events.filter(e => e.attendeeIds.length === 0 || e.attendeeIds.some(id => visibleMemberIds.includes(id)));

  // Theme Helpers
  const themeText = isFohMode ? 'text-amber-600' : 'text-indigo-600';
  const themeBg = isFohMode ? 'bg-amber-600' : 'bg-indigo-600';
  const themeLightBg = isFohMode ? 'bg-amber-100' : 'bg-indigo-100';
  const themeBorder = isFohMode ? 'border-amber-500' : 'border-indigo-500';

  // Week Helpers
  const weekStart = getStartOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Navigation
  const handlePrev = () => {
      if (viewMode === 'month') setCurrentDate(addDays(currentDate, -30));
      else if (viewMode === 'week') setCurrentDate(addDays(currentDate, -7));
      else setCurrentDate(addDays(currentDate, -1));
  };
  
  const handleNext = () => {
      if (viewMode === 'month') setCurrentDate(addDays(currentDate, 30));
      else if (viewMode === 'week') setCurrentDate(addDays(currentDate, 7));
      else setCurrentDate(addDays(currentDate, 1));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-sm  overflow-hidden">
      
      {/* Header Toolbar */}
      <div className="p-4 border-b border-white/5  flex-shrink-0">
          <ActionToolbar 
              title="Venue Calendar" 
              onEdit={onCreateEvent} 
              onPrint={() => window.print()}
              onShare={async () => {
                  try {
                      if (navigator.share) {
                          await navigator.share({ title: 'Venue Calendar', text: 'Check out the venue calendar.', url: window.location.href });
                      } else {
                          await navigator.clipboard.writeText(window.location.href);
                          alert('Calendar link copied to clipboard!');
                      }
                  } catch (e) {
                      console.error("Share failed", e);
                  }
              }}
              onSync={onSync}
              isFohMode={isFohMode}
          />
          
          <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-gray-100  rounded-lg p-1">
                      <button onClick={handlePrev} className="p-1 hover:bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-sm dark:hover:bg-slate-700 rounded shadow-lg"><ChevronLeft className="w-5 h-5 text-slate-400" /></button>
                      <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-sm font-medium hover:bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-sm dark:hover:bg-slate-700 rounded shadow-lg">Today</button>
                      <button onClick={handleNext} className="p-1 hover:bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-sm dark:hover:bg-slate-700 rounded shadow-lg"><ChevronRight className="w-5 h-5 text-slate-400" /></button>
                  </div>
                  <h2 className="text-lg font-bold text-slate-50 ">
                      {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </h2>
              </div>
              
              <div className="flex items-center space-x-2 bg-gray-100  rounded-lg p-1">
                  <button onClick={() => setViewMode('schedule')} className={`p-2 rounded-md transition-colors ${viewMode === 'schedule' ? 'bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-sm  shadow-lg text-slate-50 ' : 'text-slate-400 hover:text-slate-200 '}`} title="Schedule View">
                      <List className="w-4 h-4" />
                  </button>
                  <button onClick={() => setViewMode('week')} className={`p-2 rounded-md transition-colors ${viewMode === 'week' ? 'bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-sm  shadow-lg text-slate-50 ' : 'text-slate-400 hover:text-slate-200 '}`} title="Week View">
                      <CalendarIcon className="w-4 h-4" />
                  </button>
                  <button onClick={() => setViewMode('month')} className={`p-2 rounded-md transition-colors ${viewMode === 'month' ? 'bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-sm  shadow-lg text-slate-50 ' : 'text-slate-400 hover:text-slate-200 '}`} title="Month View">
                      <LayoutGrid className="w-4 h-4" />
                  </button>
              </div>
          </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          
          {/* WEEK VIEW */}
          {viewMode === 'week' && (
              <div className="flex min-h-[1000px] w-full min-w-[800px]">
                  <div className="w-14 flex-shrink-0 border-r border-white/10  sticky left-0 z-20 bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-sm ">
                      {HOURS.map(h => <div key={h} className="h-16 relative"><span className="absolute -top-3 right-2 text-xs text-gray-400">{h === 0 ? '12A' : h < 12 ? `${h}A` : h === 12 ? '12P' : `${h-12}P`}</span></div>)}
                  </div>
                  <div className="flex-1 flex relative">
                      {weekDays.map((day, i) => (
                          <div key={i} className="flex-1 border-l border-white/5  relative group first:border-l-0">
                              <div className="sticky top-0 bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-sm  z-10 text-center py-2 border-b border-white/10 ">
                                  <div className="text-xs font-bold uppercase text-slate-400 ">{day.toLocaleDateString('default', { weekday: 'short' })}</div>
                                  <div className={`text-xl font-black mt-1 ${isSameDay(day, new Date()) ? themeText : 'text-slate-50 '}`}>{day.getDate()}</div>
                              </div>
                              {HOURS.map(h => <div key={h} className="h-16 border-b border-gray-50 /20 hover:bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-sm dark:hover:bg-slate-800/50" />)}
                              {filteredEvents.filter(e => isSameDay(e.start, day)).map(e => {
                                  const startHour = e.start.getHours() + e.start.getMinutes() / 60;
                                  const endHour = e.end.getHours() + e.end.getMinutes() / 60;
                                  const height = Math.max((endHour - startHour) * 64, 32);
                                  const top = startHour * 64 + 65; // +65 for robust header
                                  const styleClass = e.source === 'google' 
                                      ? 'bg-green-100 text-green-800 border-green-500 dark:bg-green-900/30 dark:text-green-200' 
                                      : `${themeLightBg} ${themeText} ${themeBorder}`;
                                  
                                  return (
                                      <div key={e.id} onClick={(ev) => { ev.stopPropagation(); onEditLocation(e); }} className={`absolute left-1 right-1 rounded-md p-1 text-xs cursor-pointer shadow-lg overflow-hidden border-l-4 ${styleClass}`} style={{ top: `${top}px`, height: `${height}px` }}>
                                          <div className="font-bold truncate">{e.title}</div>
                                          <div className="truncate opacity-80"><DigitalClock date={e.start} /></div>
                                      </div>
                                  );
                              })}
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {/* SCHEDULE VIEW */}
          {viewMode === 'schedule' && (
              <div className="p-6 max-w-4xl mx-auto space-y-6">
                  {filteredEvents.length === 0 ? (
                      <div className="text-center py-20 text-slate-400">No events scheduled.</div>
                  ) : (
                      filteredEvents.slice().sort((a,b) => a.start.getTime() - b.start.getTime()).map(e => (
                          <div key={e.id} onClick={() => onEditLocation(e)} className="flex items-start p-4 rounded-xl border border-white/5  hover:shadow-xl transition-shadow cursor-pointer bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-sm  group">
                              <div className="w-32 flex-shrink-0 border-r border-white/5  pr-4">
                                  <div className="text-sm font-bold text-slate-400 ">{e.start.toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                                  <div className="text-xl font-black text-slate-50  mt-1"><DigitalClock date={e.start} /></div>
                              </div>
                              <div className="flex-1 pl-6">
                                  <div className="flex justify-between items-start">
                                      <h3 className="text-xl font-bold text-slate-50  group-hover:text-indigo-600 transition-colors">{e.title}</h3>
                                      <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${e.source==='google' ? 'bg-green-100 text-green-700' : themeLightBg + ' ' + themeText}`}>{e.source === 'google' ? 'Google' : 'Internal'}</span>
                                  </div>
                                  {e.description && <p className="text-slate-400  mt-2 line-clamp-2">{e.description}</p>}
                                  <div className="mt-4 flex -space-x-2">
                                      {e.attendeeIds.map(id => {
                                          const member = teamMembers.find(m => m.id === id);
                                          return member ? <img key={id} src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full border-2 border-white " title={member.name} /> : null;
                                      })}
                                  </div>
                              </div>
                          </div>
                      ))
                  )}
              </div>
          )}

          {/* MONTH VIEW (Simplified representation) */}
          {viewMode === 'month' && (
              <div className="p-6">
                 <div className="grid grid-cols-7 gap-px bg-gray-200  border border-white/10  rounded-2xl overflow-hidden shadow-inner">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <div key={day} className="bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-sm  p-3 text-center text-sm font-bold text-slate-400  uppercase tracking-wider">{day}</div>
                    ))}
                    {Array.from({ length: 35 }).map((_, i) => {
                        const date = addDays(weekStart, i - weekStart.getDay() + 1); // rough month generation
                        const isToday = isSameDay(date, new Date());
                        const dayEvents = filteredEvents.filter(e => isSameDay(e.start, date));
                        return (
                           <div key={i} className={`bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-sm  min-h-[120px] p-2 ${isToday ? 'bg-indigo-50/30' : ''}`}>
                               <div className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full mb-2 ${isToday ? themeBg + ' text-white shadow-xl' : 'text-slate-50 '}`}>
                                   {date.getDate()}
                               </div>
                               <div className="space-y-1">
                                   {dayEvents.slice(0, 3).map(e => (
                                       <div key={e.id} onClick={() => onEditLocation(e)} className={`text-xs p-1 rounded font-medium truncate cursor-pointer hover:opacity-80 transition-opacity ${e.source==='google'?'bg-green-100 text-green-700':'bg-gray-100 text-slate-200  '}`}>
                                           <DigitalClock date={e.start} /> {e.title}
                                       </div>
                                   ))}
                                   {dayEvents.length > 3 && <div className="text-xs text-gray-400 font-medium pl-1">+{dayEvents.length - 3} more</div>}
                               </div>
                           </div>
                        )
                    })}
                 </div>
              </div>
          )}
          
      </div>
    </div>
  );
};

export default CalendarView;
