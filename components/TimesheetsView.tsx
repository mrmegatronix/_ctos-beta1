import React, { useState } from 'react';
import { FileText, Save, CheckCircle, AlertCircle, Calendar as CalendarIcon, Users, Clock } from 'lucide-react';
import { TeamMember, TimesheetEntry, RosterShift } from '../types';
import { formatTime } from '../utils';

interface TimesheetsViewProps {
  staff: TeamMember[];
  shifts: RosterShift[];
  onSave: (entry: TimesheetEntry) => void;
}

const TimesheetsView: React.FC<TimesheetsViewProps> = ({ staff, shifts, onSave }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState<Record<string, number>>({});

  const shiftsForDay = shifts.filter(s => 
    new Date(s.start).toISOString().split('T')[0] === selectedDate
  );

  const handleHourChange = (staffId: string, hours: string) => {
    setEntries(prev => ({ ...prev, [staffId]: parseFloat(hours) || 0 }));
  };

  const calculateRosteredHours = (start: Date, end: Date) => {
    const diff = (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60);
    return Math.round(diff * 10) / 10;
  };

  return (
    <div className="flex h-full flex-col p-6 space-y-6 bg-slate-50 dark:bg-slate-900/50 overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Staff Timesheets</h2>
          <p className="text-sm text-gray-500">Verify worked hours against the rostered schedule</p>
        </div>
        <div className="flex space-x-3">
            <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
            </div>
            <button className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors shadow-lg">
                <Save className="w-4 h-4" />
                <span>Save All Entries</span>
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/80 border-b border-gray-100 dark:border-slate-700">
              <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Staff Member</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Rostered Shift</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Rostered Hrs</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Actual Hours</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
            {staff.filter(s => s.visible).map(member => {
              const shift = shiftsForDay.find(s => s.staffId === member.id);
              const rosteredHrs = shift ? calculateRosteredHours(shift.start, shift.end) : 0;
              const actualHrs = entries[member.id] || 0;
              const variance = actualHrs - rosteredHrs;
              
              return (
                <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full bg-${member.color}-100 flex items-center justify-center`}>
                        <img src={member.avatar} alt={member.name} className="w-6 h-6 rounded-full" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center">
                            {member.name}
                            {member.isDemo && <span className="ml-2 text-[8px] bg-lime-300 text-lime-900 px-1 py-0.5 rounded font-black uppercase">Demo</span>}
                        </div>
                        <div className="text-xs text-gray-500">{member.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {shift ? (
                      <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center space-x-2">
                        <Clock className="w-3.5 h-3.5 opacity-50" />
                        <span>{formatTime(shift.start)} - {formatTime(shift.end)}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">No shift rostered</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-medium text-gray-500">{rosteredHrs || '-'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                        <input 
                            type="number" 
                            step="0.5"
                            placeholder="0.0"
                            className="w-20 px-3 py-1 text-center bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-md text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                            onChange={(e) => handleHourChange(member.id, e.target.value)}
                        />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {actualHrs > 0 ? (
                        <div className={`flex items-center space-x-1 text-xs font-bold ${Math.abs(variance) < 0.1 ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {Math.abs(variance) < 0.1 ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            <span>{Math.abs(variance) < 0.1 ? 'Matched' : `${variance > 0 ? '+' : ''}${variance}h variance`}</span>
                        </div>
                    ) : (
                        <span className="text-[10px] text-gray-400 uppercase font-semibold">Pending Entry</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                        className="text-indigo-600 hover:text-indigo-700 text-xs font-bold uppercase tracking-wider"
                        onClick={() => actualHrs > 0 && onSave({
                            id: `ts-${Date.now()}-${member.id}`,
                            staffId: member.id,
                            date: new Date(selectedDate),
                            hoursWorked: actualHrs,
                            isVerified: true
                        })}
                    >
                        Verify
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 flex items-center space-x-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
                <div className="text-2xl font-bold dark:text-white">{staff.length}</div>
                <div className="text-xs text-gray-500 uppercase font-bold tracking-tight">Total Staff</div>
            </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 flex items-center space-x-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Clock className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
                <div className="text-2xl font-bold dark:text-white">
                    {(Object.values(entries) as number[]).reduce((sum: number, val: number) => sum + val, 0).toFixed(1)}
                </div>
                <div className="text-xs text-gray-500 uppercase font-bold tracking-tight">Total Hours Today</div>
            </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 flex items-center space-x-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <FileText className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
                <div className="text-2xl font-bold dark:text-white">
                    {shiftsForDay.length}
                </div>
                <div className="text-xs text-gray-500 uppercase font-bold tracking-tight">Rostered Shifts</div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TimesheetsView;
