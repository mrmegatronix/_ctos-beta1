
import React, { useState } from 'react';
import { RosterShift, TeamMember, LeaveRequest } from '../types';
import { formatTime, isSameDay, generateId } from '../utils';
import { CalendarDays, Plus, Printer } from 'lucide-react';

interface RosterViewProps {
  shifts: RosterShift[];
  teamMembers: TeamMember[];
  weekDays: Date[];
  onAddShift: (day: Date, memberId: string, startTime: string, endTime: string, role: string) => void;
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
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [shiftDay, setShiftDay] = useState<Date | null>(null);
  const [shiftMember, setShiftMember] = useState<string | null>(null);
  const [shiftStart, setShiftStart] = useState('12:00');
  const [shiftEnd, setShiftEnd] = useState('20:00');
  const [shiftRole, setShiftRole] = useState('Bar Staff');

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

  const openShiftModal = (day: Date, memberId: string) => {
      setShiftDay(day);
      setShiftMember(memberId);
      setShowShiftModal(true);
  };

  const submitShift = (e: React.FormEvent) => {
      e.preventDefault();
      if (shiftDay && shiftMember) {
          onAddShift(shiftDay, shiftMember, shiftStart, shiftEnd, shiftRole);
      }
      setShowShiftModal(false);
  };

  const isManager = currentUser.role === 'Admin' || currentUser.role === 'Duty Manager';

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-sm print:bg-white print:border-none print:shadow-none">
      
      {/* Printable Header */}
      <div className="hidden print:block p-4 border-b-2 border-slate-900 mb-2">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">CT-OS STAFF ROSTER</h1>
            <p className="text-sm font-semibold text-slate-700 mt-0.5">
              Week of {weekDays[0]?.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} – {weekDays[weekDays.length - 1]?.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <div className="text-right text-xs text-slate-600 space-y-0.5">
            <div><strong>Printed:</strong> {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            <div><strong>Staff Rostered:</strong> {teamMembers.length} | <strong>Total Shifts:</strong> {shifts.length}</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 py-2 flex justify-between items-center bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-sm border-b border-white/10 print:hidden">
          <div className="text-sm text-slate-400">
              Week of {weekDays[0]?.toDateString()}
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => window.print()}
              className="flex items-center space-x-2 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors shadow-sm font-medium"
              title="Print Roster Schedule"
            >
                <Printer className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Print Roster</span>
            </button>
            <button 
              onClick={() => setShowLeaveModal(true)}
              className="flex items-center space-x-2 text-sm bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
            >
                <CalendarDays className="w-4 h-4" />
                <span>Request Leave</span>
            </button>
          </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar p-6 print:p-2 print:overflow-visible">
        <div className="min-w-[1000px] print:min-w-full border rounded-xl border-white/10 print:border-slate-400 overflow-hidden">
          {/* Header Row */}
          <div className="grid grid-cols-8 bg-slate-900/60 backdrop-blur-xl print:bg-slate-100 border-b border-white/10 print:border-slate-400">
            <div className="p-4 print:p-2 font-semibold text-slate-200 print:text-slate-900 border-r border-white/10 print:border-slate-400">Staff Member</div>
            {weekDays.map((day, i) => (
              <div key={i} className="p-4 print:p-2 text-center border-r border-white/10 print:border-slate-400 last:border-none">
                <div className="text-xs uppercase text-slate-400 print:text-slate-600 mb-1">
                   {new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(day)}
                </div>
                <div className="font-bold text-slate-50 print:text-slate-900">
                   {day.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* Staff Rows */}
          {teamMembers.map((member) => (
            <div key={member.id} className="grid grid-cols-8 border-b border-white/5 print:border-slate-300 bg-slate-900/60 backdrop-blur-xl print:bg-white border-white/10 shadow-sm hover:bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-sm dark:hover:bg-slate-800/50 transition-colors print:break-inside-avoid">
              <div className="p-4 print:p-2 flex items-center space-x-3 border-r border-white/5 print:border-slate-300">
                <img src={member.avatar} className="w-8 h-8 rounded-full print:w-6 print:h-6" alt="" />
                <div>
                    <div className="font-medium text-sm text-slate-50 print:text-slate-900">{member.name}</div>
                    <div className="text-xs text-slate-400 print:text-slate-600">{member.role}</div>
                </div>
              </div>
              
              {weekDays.map((day, i) => {
                const dayShifts = shifts.filter(s => s.staffId === member.id && isSameDay(s.start, day));
                const onLeave = leaveRequests.find(l => l.staffId === member.id && day >= new Date(l.start.setHours(0,0,0,0)) && day <= new Date(l.end.setHours(23,59,59,999)));

                return (
                  <div 
                    key={i} 
                    className={`p-2 print:p-1.5 border-r border-white/5 print:border-slate-300 last:border-none min-h-[80px] print:min-h-[60px] relative group ${onLeave ? 'bg-orange-50/50 dark:bg-orange-900/10 print:bg-amber-50' : ''}`}
                    onClick={() => isManager && !onLeave && openShiftModal(day, member.id)}
                  >
                     {isManager && !onLeave && (
                         <div className="absolute inset-0 bg-indigo-50/0 group-hover:bg-indigo-50/50 dark:group-hover:bg-indigo-900/10 cursor-pointer transition-colors flex items-center justify-center print:hidden">
                            <span className="opacity-0 group-hover:opacity-100 text-indigo-600 dark:text-indigo-400 font-bold text-xl">+</span>
                         </div>
                     )}

                     {onLeave && (
                         <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1 pointer-events-none">
                             <span className="text-xs font-bold text-orange-600 dark:text-orange-400 print:text-amber-800 uppercase tracking-wider">Leave</span>
                             <span className="text-[10px] text-orange-500 print:text-amber-700 hidden group-hover:block print:block">{onLeave.reason}</span>
                         </div>
                     )}

                     {dayShifts.map(shift => (
                         <div key={shift.id} className={`relative z-10 bg-indigo-100 dark:bg-indigo-900/50 print:bg-indigo-50 border border-indigo-200 dark:border-indigo-700 print:border-indigo-300 rounded p-1.5 print:p-1 mb-1 text-xs shadow-lg print:shadow-none ${shift.isDemo ? 'demo-highlight' : ''}`}>
                             <div className="font-semibold text-indigo-800 dark:text-indigo-200 print:text-indigo-950">{formatTime(shift.start)} - {formatTime(shift.end)}</div>
                             <div className="text-indigo-600 dark:text-indigo-300 print:text-indigo-800 truncate">{shift.role}</div>
                         </div>
                     ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Printable Footer / Sign-off */}
        <div className="hidden print:flex justify-between items-center mt-6 pt-4 border-t-2 border-slate-400 text-xs text-slate-700">
          <div>
            <strong>Duty Manager Sign-off:</strong> ___________________________
          </div>
          <div>
            <strong>Date:</strong> __________________
          </div>
          <div>
            <em>All shift swaps must be submitted and approved at least 24 hours in advance.</em>
          </div>
        </div>
      </div>

      {/* Leave Request Modal */}
      {showLeaveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-sm  rounded-2xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95 duration-200">
                  <h3 className="text-lg font-bold text-slate-50  mb-4">Request Leave</h3>
                  <form onSubmit={submitLeave} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-200  mb-1">Start Date</label>
                          <input 
                            type="date" 
                            required 
                            className="w-full px-3 py-2 bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-sm  border border-white/10  rounded-lg text-slate-50 "
                            value={leaveStart}
                            onChange={e => setLeaveStart(e.target.value)}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-200  mb-1">End Date</label>
                          <input 
                            type="date" 
                            required 
                            className="w-full px-3 py-2 bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-sm  border border-white/10  rounded-lg text-slate-50 "
                            value={leaveEnd}
                            onChange={e => setLeaveEnd(e.target.value)}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-200  mb-1">Reason</label>
                          <textarea 
                            className="w-full px-3 py-2 bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-sm  border border-white/10  rounded-lg text-slate-50 "
                            placeholder="e.g. Family Holiday"
                            value={leaveReason}
                            onChange={e => setLeaveReason(e.target.value)}
                          ></textarea>
                      </div>
                      <div className="flex justify-end space-x-3 pt-4">
                          <button type="button" onClick={() => setShowLeaveModal(false)} className="px-4 py-2 text-slate-300  hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
                          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Submit Request</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Add Shift Modal */}
      {showShiftModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-sm rounded-2xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95 duration-200">
                  <h3 className="text-lg font-bold text-slate-50 mb-4">Add Shift</h3>
                  <form onSubmit={submitShift} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-slate-200 mb-1">Start Time</label>
                              <input 
                                type="time" 
                                required 
                                className="w-full px-3 py-2 bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-sm border border-white/10 rounded-lg text-slate-50"
                                value={shiftStart}
                                onChange={e => setShiftStart(e.target.value)}
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-200 mb-1">End Time</label>
                              <input 
                                type="time" 
                                required 
                                className="w-full px-3 py-2 bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-sm border border-white/10 rounded-lg text-slate-50"
                                value={shiftEnd}
                                onChange={e => setShiftEnd(e.target.value)}
                              />
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-200 mb-1">Role / Area</label>
                          <select 
                            className="w-full px-3 py-2 bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-sm border border-white/10 rounded-lg text-slate-50 bg-slate-800"
                            value={shiftRole}
                            onChange={e => setShiftRole(e.target.value)}
                          >
                              <option>Duty Manager</option>
                              <option>Bar Staff</option>
                              <option>Front of House</option>
                              <option>Kitchen Hand</option>
                              <option>Chef</option>
                              <option>Security</option>
                          </select>
                      </div>
                      <div className="flex justify-end space-x-3 pt-4">
                          <button type="button" onClick={() => setShowShiftModal(false)} className="px-4 py-2 text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
                          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Add Shift</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default RosterView;
