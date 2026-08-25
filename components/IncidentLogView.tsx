import React, { useState } from 'react';
import { IncidentReport, TeamMember } from '../types';
import { formatDate, generateId } from '../utils';
import { AlertTriangle, ShieldAlert, Plus, Save, Trash2, Printer, Search, Filter, PhoneCall, CheckCircle } from 'lucide-react';
import DigitalClock from './DigitalClock';

interface IncidentLogViewProps {
  incidents: IncidentReport[];
  staff: TeamMember[];
  currentUser: TeamMember;
  onSave: (report: IncidentReport) => void;
  onDelete?: (id: string) => void;
}

const IncidentLogView: React.FC<IncidentLogViewProps> = ({ incidents, staff, currentUser, onSave, onDelete }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [newReport, setNewReport] = useState<Partial<IncidentReport>>({
    type: 'Intoxication',
    policeCalled: false,
    date: new Date(),
    description: '',
    actionTaken: '',
    witnesses: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReport.description || !newReport.actionTaken) return;

    const report: IncidentReport = {
      id: `inc-${generateId()}`,
      date: newReport.date ? new Date(newReport.date) : new Date(),
      staffId: currentUser.id,
      type: (newReport.type as any) || 'Other',
      description: newReport.description,
      actionTaken: newReport.actionTaken,
      witnesses: newReport.witnesses || '',
      policeCalled: newReport.policeCalled || false
    };

    onSave(report);
    setIsFormOpen(false);
    setNewReport({ type: 'Intoxication', policeCalled: false, date: new Date(), description: '', actionTaken: '', witnesses: '' });
  };

  const getStaffName = (id: string) => staff.find(s => s.id === id)?.name || 'Unknown Staff';

  const filteredIncidents = incidents
    .filter(inc => {
      if (filterType !== 'All' && inc.type !== filterType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const descMatch = inc.description?.toLowerCase().includes(q);
        const actionMatch = inc.actionTaken?.toLowerCase().includes(q);
        const witnessMatch = inc.witnesses?.toLowerCase().includes(q);
        const reporterMatch = getStaffName(inc.staffId).toLowerCase().includes(q);
        return descMatch || actionMatch || witnessMatch || reporterMatch;
      }
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="flex h-full flex-col p-6 space-y-6 bg-slate-950 text-white overflow-y-auto relative custom-scrollbar">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full mix-blend-screen z-0 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full mix-blend-screen z-0 pointer-events-none"></div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <ShieldAlert className="w-7 h-7 mr-3 text-red-600 dark:text-red-400" />
            Incident & Refusal Compliance Register
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Official statutory log for alcohol service refusals, security disputes, and health & safety incidents.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-2 text-sm bg-slate-900/60 backdrop-blur-xl border border-white/10 text-slate-700 dark:text-slate-200 px-3.5 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm font-medium"
            title="Print Compliance Register"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Register</span>
          </button>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-700 transition-colors flex items-center shadow-lg shadow-red-600/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Log New Incident
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold uppercase text-slate-400">Filter:</span>
          <div className="flex flex-wrap gap-1.5">
            {['All', 'Intoxication', 'Aggression', 'Injury', 'Theft', 'Other'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  filterType === type
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search records..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-950 text-white border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-slate-100"
          />
        </div>
      </div>

      {/* Form Drawer / Modal */}
      {isFormOpen && (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-red-200 dark:border-red-900/40 rounded-2xl p-6 mb-8 shadow-xl animate-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-lg text-red-700 dark:text-red-300 flex items-center">
              <ShieldAlert className="w-5 h-5 mr-2" />
              New Compliance / Incident Report
            </h3>
            <span className="text-xs font-medium text-slate-400">
              Duty Manager: <strong>{currentUser.name}</strong>
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Incident Classification
                </label>
                <select
                  className="w-full px-3.5 py-2.5 bg-slate-950 text-white border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-sm text-slate-100"
                  value={newReport.type}
                  onChange={e => setNewReport({ ...newReport, type: e.target.value as any })}
                >
                  <option value="Intoxication">Intoxication (Service Refusal / SCAB)</option>
                  <option value="Aggression">Aggression / Disorderly Conduct</option>
                  <option value="Injury">Physical Injury / Medical Event</option>
                  <option value="Theft">Theft / Property Damage</option>
                  <option value="Other">Other Regulatory / Security Incident</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Date & Time of Incident
                </label>
                <input
                  type="datetime-local"
                  required
                  defaultValue={new Date().toISOString().slice(0, 16)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 text-white border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-sm text-slate-100"
                  onChange={e => setNewReport({ ...newReport, date: new Date(e.target.value) })}
                />
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="police"
                    className="w-5 h-5 text-red-600 rounded border-slate-300 focus:ring-red-500"
                    checked={newReport.policeCalled}
                    onChange={e => setNewReport({ ...newReport, policeCalled: e.target.checked })}
                  />
                  <span className="ml-2.5 text-sm font-bold text-red-600 dark:text-red-400 flex items-center">
                    <PhoneCall className="w-4 h-4 mr-1.5 inline" />
                    Police / Emergency Services Notified
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Detailed Circumstances & Patron Description
              </label>
              <textarea
                rows={3}
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 text-white border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-sm text-slate-100"
                placeholder="Detail time, location in venue, patron physical description, indicators of intoxication (speech, coordination, behavior), and statements made..."
                value={newReport.description || ''}
                onChange={e => setNewReport({ ...newReport, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Actions Taken by Staff
                </label>
                <textarea
                  rows={2}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 text-white border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-sm text-slate-100"
                  placeholder="e.g. Refused service under Sale & Supply of Alcohol Act, provided water, requested to leave, taxi ordered, CCTV timestamp noted..."
                  value={newReport.actionTaken || ''}
                  onChange={e => setNewReport({ ...newReport, actionTaken: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Witnesses & Assisting Staff
                </label>
                <textarea
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-slate-950 text-white border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-sm text-slate-100"
                  placeholder="Names of assisting staff members or patron witnesses..."
                  value={newReport.witnesses || ''}
                  onChange={e => setNewReport({ ...newReport, witnesses: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition-colors flex items-center shadow-md shadow-red-600/20"
              >
                <Save className="w-4 h-4 mr-2" /> Submit Statutory Report
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Incidents List */}
      <div className="space-y-4">
        {filteredIncidents.length === 0 ? (
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center text-slate-400">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-500 opacity-60" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Incidents Logged</h3>
            <p className="text-sm mt-1">All compliance records are up to date.</p>
          </div>
        ) : (
          filteredIncidents.map(incident => {
            const incDate = incident.date instanceof Date ? incident.date : new Date(incident.date);
            return (
              <div
                key={incident.id}
                className="bg-slate-900/60 backdrop-blur-xl border border-white/10 border-l-4 border-l-red-500 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 pb-3 border-b border-slate-100 dark:border-slate-700/60">
                  <div className="flex items-center space-x-3">
                    <span className="px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                      {incident.type}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {formatDate(incDate)} at <DigitalClock date={incDate} />
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-xs text-slate-400">
                      Logged by: <span className="font-bold text-slate-800 dark:text-slate-200">{getStaffName(incident.staffId)}</span>
                    </div>
                    {onDelete && (
                      <button
                        onClick={() => {
                          if (confirm("Delete this incident record?")) {
                            onDelete(incident.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 rounded-md transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-slate-800 dark:text-slate-200 text-sm font-medium mb-4 leading-relaxed">
                  {incident.description}
                </p>

                <div className="bg-slate-950 text-white/50 border border-slate-100 dark:border-slate-800 p-3.5 rounded-xl text-xs space-y-1.5">
                  <div className="text-slate-700 dark:text-slate-300">
                    <span className="font-bold text-slate-900 dark:text-slate-100 mr-2">Action Taken:</span>
                    {incident.actionTaken}
                  </div>
                  {incident.witnesses && (
                    <div className="text-slate-600 dark:text-slate-400">
                      <span className="font-bold text-slate-800 dark:text-slate-200 mr-2">Witnesses:</span>
                      {incident.witnesses}
                    </div>
                  )}
                </div>

                {incident.policeCalled && (
                  <div className="mt-3 inline-flex items-center px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> Emergency Services Contacted
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default IncidentLogView;
