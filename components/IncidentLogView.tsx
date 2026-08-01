
import React, { useState } from 'react';
import { IncidentReport, TeamMember } from '../types';
import { formatDate, generateId } from '../utils';
import { AlertTriangle, ShieldAlert, Plus, Save } from 'lucide-react';

interface IncidentLogViewProps {
  incidents: IncidentReport[];
  staff: TeamMember[];
  currentUser: TeamMember;
  onSave: (report: IncidentReport) => void;
}

const IncidentLogView: React.FC<IncidentLogViewProps> = ({ incidents, staff, currentUser, onSave }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newReport, setNewReport] = useState<Partial<IncidentReport>>({
      type: 'Intoxication',
      policeCalled: false,
      date: new Date()
  });

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newReport.description || !newReport.actionTaken) return;

      const report: IncidentReport = {
          id: generateId(),
          date: newReport.date || new Date(),
          staffId: currentUser.id,
          type: newReport.type as any,
          description: newReport.description,
          actionTaken: newReport.actionTaken,
          witnesses: newReport.witnesses,
          policeCalled: newReport.policeCalled || false
      };

      onSave(report);
      setIsFormOpen(false);
      setNewReport({ type: 'Intoxication', policeCalled: false, date: new Date() });
  };

  const getStaffName = (id: string) => staff.find(s => s.id === id)?.name || 'Unknown';

  return (
    <div className="flex-1 p-8 overflow-auto custom-scrollbar bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm ">
       <div className="flex justify-between items-center mb-8">
         <div>
             <h2 className="text-2xl font-bold text-slate-50  flex items-center">
                 <ShieldAlert className="w-6 h-6 mr-3 text-red-600" />
                 Incident & Refusal Log
             </h2>
             <p className="text-slate-400 ">Legal logbook for intoxications, accidents, and security incidents.</p>
         </div>
         <button 
           onClick={() => setIsFormOpen(true)}
           className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center"
         >
            <Plus className="w-4 h-4 mr-2" />
            Log New Incident
         </button>
       </div>

      <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 mb-6 rounded-r">
        <div className="flex items-center">
          <AlertTriangle className="w-6 h-6 mr-3" />
          <h3 className="font-bold">Under Construction</h3>
        </div>
        <p className="mt-1 text-sm">This module is currently being built. Data entered here will not be permanently saved yet.</p>
      </div>

       {isFormOpen && (
           <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl p-6 mb-8 animate-in slide-in-from-top-4">
               <h3 className="font-bold text-lg text-red-800 dark:text-red-200 mb-4">New Incident Report</h3>
               <form onSubmit={handleSubmit} className="space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <div>
                           <label className="block text-sm font-medium text-slate-200  mb-1">Type</label>
                           <select 
                             className="w-full px-3 py-2 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm  border border-gray-200 dark:border-slate-700  rounded-lg outline-none"
                             value={newReport.type}
                             onChange={e => setNewReport({...newReport, type: e.target.value as any})}
                           >
                               <option value="Intoxication">Intoxication (Refusal of Service)</option>
                               <option value="Aggression">Aggression / Fight</option>
                               <option value="Injury">Injury / Accident</option>
                               <option value="Theft">Theft</option>
                               <option value="Other">Other</option>
                           </select>
                       </div>
                       <div>
                           <label className="block text-sm font-medium text-slate-200  mb-1">Date & Time</label>
                           <input 
                             type="datetime-local"
                             required
                             className="w-full px-3 py-2 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm  border border-gray-200 dark:border-slate-700  rounded-lg outline-none"
                             onChange={e => setNewReport({...newReport, date: new Date(e.target.value)})}
                           />
                       </div>
                       <div className="flex items-center pt-6">
                           <input 
                             type="checkbox" 
                             id="police"
                             className="w-5 h-5 text-red-600 rounded"
                             checked={newReport.policeCalled}
                             onChange={e => setNewReport({...newReport, policeCalled: e.target.checked})}
                           />
                           <label htmlFor="police" className="ml-2 text-sm font-medium text-slate-50 ">Police / Ambulance Called</label>
                       </div>
                   </div>
                   
                   <div>
                       <label className="block text-sm font-medium text-slate-200  mb-1">Description of Incident</label>
                       <textarea 
                         rows={3}
                         className="w-full px-3 py-2 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm  border border-gray-200 dark:border-slate-700  rounded-lg outline-none"
                         placeholder="Describe what happened, who was involved, physical descriptions..."
                         value={newReport.description || ''}
                         onChange={e => setNewReport({...newReport, description: e.target.value})}
                       />
                   </div>

                   <div>
                       <label className="block text-sm font-medium text-slate-200  mb-1">Action Taken</label>
                       <textarea 
                         rows={2}
                         className="w-full px-3 py-2 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm  border border-gray-200 dark:border-slate-700  rounded-lg outline-none"
                         placeholder="What did you do? (e.g. Refused service, offered water, asked to leave)"
                         value={newReport.actionTaken || ''}
                         onChange={e => setNewReport({...newReport, actionTaken: e.target.value})}
                       />
                   </div>

                   <div className="flex justify-end space-x-3">
                       <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-slate-300 hover:bg-gray-200 rounded-lg">Cancel</button>
                       <button type="submit" className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 flex items-center">
                           <Save className="w-4 h-4 mr-2" /> Submit Report
                       </button>
                   </div>
               </form>
           </div>
       )}

       <div className="space-y-4">
           {incidents.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(incident => (
               <div key={incident.id} className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm  border-l-4 border-red-500 rounded-r-xl p-6 shadow-lg">
                   <div className="flex justify-between items-start mb-2">
                       <div>
                           <span className="font-bold text-red-600 uppercase tracking-wide text-sm mr-3">{incident.type}</span>
                           <span className="text-slate-400 text-sm">{formatDate(new Date(incident.date))} at {new Date(incident.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                       </div>
                       <div className="text-sm font-medium text-slate-400">
                           Reported by: <span className="text-slate-50 ">{getStaffName(incident.staffId)}</span>
                       </div>
                   </div>
                   
                   <p className="text-slate-100  mb-4">{incident.description}</p>
                   
                   <div className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm /30 p-3 rounded-lg text-sm text-slate-300 ">
                       <span className="font-bold text-slate-50  mr-2">Action Taken:</span>
                       {incident.actionTaken}
                   </div>

                   {incident.policeCalled && (
                       <div className="mt-2 inline-flex items-center px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-xs font-bold uppercase">
                           <AlertTriangle className="w-3 h-3 mr-1" /> Emergency Services Contacted
                       </div>
                   )}
               </div>
           ))}
       </div>
    </div>
  );
};

export default IncidentLogView;
