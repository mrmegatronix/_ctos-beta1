
import React, { useState } from 'react';
import { RosterShift, TeamMember, LeaveRequest } from '../types';
import { formatTime, isSameDay, generateId } from '../utils';
import { CalendarDays, Plus } from 'lucide-react';

interface RosterViewProps {
  shifts: RosterShift[];
  teamMembers: TeamMember[];
  weekDays: Date[];
  onAddShift: (day: Date, memberId: string) => void;
  leaveRequests: LeaveRequest[];
  onRequestLeave: (req: LeaveRequest) => void;
  currentUser: TeamMember;
}

const RosterView: React.FC<RosterViewProps> = ({ 
    shifts, teamMembers, weekDays, onAddShift, leaveRequests, onRequestLeave, currentUser 
}) => {
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');
  const [leaveReason, setLeaveReason] = useState('');

  const submitLeave = (e: React.FormEvent) => {
      e.preventDefault();
      onRequestLeave({
          id: generateId(),
          staffId: currentUser.id,
          start: new Date(leaveStart),
          end: new Date(leaveEnd),
          reason: leaveReason,
          status: 'pending'
      });
      setShowLeaveModal(false);
      setLeaveStart('');
      setLeaveEnd('');
      setLeaveReason('');
  };

  const isManager = currentUser.role === 'Admin' || currentUser.role === 'Duty Manager';

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-slate-900">
      
      {/* Controls */}
      <div className="px-6 py-2 flex justify-between items-center bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
          <div className="text-sm text-gray-500 dark:text-gray-400">
              Week of {weekDays[0].toDateString()}
          </div>
          <button 
            onClick={() => setShowLeaveModal(true)}
            className="flex items-center space-x-2 text-sm bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
          >
              <CalendarDays className="w-4 h-4" />
              <span>Request Leave</span>
          </button>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar p-6">
        <div className="min-w-[1000px] border rounded-xl border-gray-200 dark:border-slate-700 overflow-hidden">
          {/* Header Row */}
          <div className="grid grid-cols-8 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
            <div className="p-4 font-semibold text-gray-700 dark:text-gray-200 border-r border-gray-200 dark:border-slate-700">Staff Member</div>
            {weekDays.map((day, i) => (
              <div key={i} className="p-4 text-center border-r border-gray-200 dark:border-slate-700 last:border-none">
                <div className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-1">
                   {new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(day)}
                </div>
                <div className="font-bold text-gray-900 dark:text-white">
                   {day.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* Staff Rows */}
          {teamMembers.map((member) => (
            <div key={member.id} className="grid grid-cols-8 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="p-4 flex items-center space-x-3 border-r border-gray-100 dark:border-slate-800">
                <img src={member.avatar} className="w-8 h-8 rounded-full" alt="" />
                <div>
                    <div className="font-medium text-sm text-gray-900 dark:text-white">{member.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{member.role}</div>
                </div>
              </div>
              
              {weekDays.map((day, i) => {
                const dayShifts = shifts.filter(s => s.staffId === member.id && isSameDay(s.start, day));
                const onLeave = leaveRequests.find(l => l.staffId === member.id && day >= new Date(l.start.setHours(0,0,0,0)) && day <= new Date(l.end.setHours(23,59,59,999)));

                return (
                  <div 
                    key={i} 
                    className={`p-2 border-r border-gray-100 dark:border-slate-800 last:border-none min-h-[80px] relative group ${onLeave ? 'bg-orange-50/50 dark:bg-orange-900/10' : ''}`}
                    onClick={() => isManager && !onLeave && onAddShift(day, member.id)}
                  >
                     {isManager && !onLeave && (
                         <div className="absolute inset-0 bg-indigo-50/0 group-hover:bg-indigo-50/50 dark:group-hover:bg-indigo-900/10 cursor-pointer transition-colors flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 text-indigo-600 dark:text-indigo-400 font-bold text-xl">+</span>
                         </div>
                     )}

                     {onLeave && (
                         <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1 pointer-events-none">
                             <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Leave</span>
                             <span className="text-[10px] text-orange-500 hidden group-hover:block">{onLeave.reason}</span>
                         </div>
                     )}

                     {dayShifts.map(shift => (
                         <div key={shift.id} className={`relative z-10 bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-700 rounded p-1.5 mb-1 text-xs shadow-sm ${shift.isDemo ? 'demo-highlight' : ''}`}>
                             <div className="font-semibold text-indigo-800 dark:text-indigo-200">{formatTime(shift.start)} - {formatTime(shift.end)}</div>
                             <div className="text-indigo-600 dark:text-indigo-300 truncate">{shift.role}</div>
                         </div>
                     ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Leave Request Modal */}
      {showLeaveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95 duration-200">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Request Leave</h3>
                  <form onSubmit={submitLeave} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                          <input 
                            type="date" 
                            required 
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white"
                            value={leaveStart}
                            onChange={e => setLeaveStart(e.target.value)}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                          <input 
                            type="date" 
                            required 
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white"
                            value={leaveEnd}
                            onChange={e => setLeaveEnd(e.target.value)}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</label>
                          <textarea 
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white"
                            placeholder="e.g. Family Holiday"
                            value={leaveReason}
                            onChange={e => setLeaveReason(e.target.value)}
                          ></textarea>
                      </div>
                      <div className="flex justify-end space-x-3 pt-4">
                          <button type="button" onClick={() => setShowLeaveModal(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
                          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Submit Request</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default RosterView;
