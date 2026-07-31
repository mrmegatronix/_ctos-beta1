import React from 'react';
import { MaintenanceTask } from '../types';
import { formatDate } from '../utils';
import { Wrench, CheckCircle2, Clock, AlertCircle, Calendar } from 'lucide-react';

interface MaintenanceViewProps {
  tasks: MaintenanceTask[];
  onUpdateStatus: (id: string, status: MaintenanceTask['status']) => void;
}

const MaintenanceView: React.FC<MaintenanceViewProps> = ({ tasks, onUpdateStatus }) => {
  const getPriorityColor = (priority: MaintenanceTask['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'medium': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default: return 'bg-gray-100 text-slate-100';
    }
  };

  const getStatusIcon = (status: MaintenanceTask['status']) => {
      switch (status) {
          case 'completed': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
          case 'in-progress': return <Clock className="w-5 h-5 text-blue-500" />;
          case 'pending': return <AlertCircle className="w-5 h-5 text-amber-500" />;
      }
  };

  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="flex-1 p-8 overflow-auto custom-scrollbar glass-panel ">
      <div className="mb-8 flex justify-between items-center">
         <div>
             <h2 className="text-2xl font-bold text-slate-50 ">Maintenance Log</h2>
             <p className="text-slate-400 ">Track repairs and equipment services.</p>
         </div>
         <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center space-x-2">
            <Wrench className="w-4 h-4" />
            <span>Report Issue</span>
         </button>
      </div>

      <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 mb-6 rounded-r">
        <div className="flex items-center">
          <AlertCircle className="w-6 h-6 mr-3" />
          <h3 className="font-bold">Under Construction</h3>
        </div>
        <p className="mt-1 text-sm">This module is currently being built. Data entered here will not be permanently saved yet.</p>
      </div>

      <div className="space-y-8">
        {/* Active Tasks */}
        <section>
            <h3 className="text-lg font-semibold text-slate-100  mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-indigo-500" />
                Active Issues
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {pendingTasks.map(task => (
                    <div key={task.id} className="glass-panel  border border-white/10  rounded-xl p-5 shadow-lg hover:shadow-xl transition-all">
                        <div className="flex justify-between items-start mb-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${getPriorityColor(task.priority)}`}>
                                {task.priority} Priority
                            </span>
                            <div className="text-xs text-gray-400  flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {formatDate(task.createdAt)}
                            </div>
                        </div>
                        <h4 className="text-lg font-bold text-slate-50  mb-2">{task.title}</h4>
                        <p className="text-sm text-slate-300  mb-4">{task.description}</p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 ">
                             <div className="flex items-center space-x-2 text-sm text-slate-400 ">
                                {getStatusIcon(task.status)}
                                <span className="capitalize font-medium">{task.status.replace('-', ' ')}</span>
                             </div>
                             <div className="flex space-x-2">
                                {task.status === 'pending' && (
                                    <button 
                                        onClick={() => onUpdateStatus(task.id, 'in-progress')}
                                        className="text-xs font-medium px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                    >
                                        Start Work
                                    </button>
                                )}
                                <button 
                                    onClick={() => onUpdateStatus(task.id, 'completed')}
                                    className="text-xs font-medium px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                                >
                                    Mark Complete
                                </button>
                             </div>
                        </div>
                    </div>
                ))}
                {pendingTasks.length === 0 && (
                    <div className="col-span-full p-8 text-center glass-panel /50 rounded-xl border border-dashed border-white/20 ">
                        <p className="text-slate-400 ">No active maintenance issues. Good job!</p>
                    </div>
                )}
            </div>
        </section>

        {/* Completed History */}
        <section>
            <h3 className="text-lg font-semibold text-slate-100  mb-4 flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" />
                Recently Completed
            </h3>
            <div className="glass-panel  rounded-xl border border-white/10  overflow-hidden">
                <table className="w-full text-left">
                    <thead className="glass-panel /50 text-xs uppercase text-slate-400 ">
                        <tr>
                            <th className="px-6 py-3 font-semibold">Task</th>
                            <th className="px-6 py-3 font-semibold">Priority</th>
                            <th className="px-6 py-3 font-semibold">Completed Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                        {completedTasks.map(task => (
                            <tr key={task.id} className="hover:glass-panel dark:hover:bg-slate-700/50 transition-colors">
                                <td className="px-6 py-3">
                                    <div className="text-sm font-medium text-slate-50 ">{task.title}</div>
                                </td>
                                <td className="px-6 py-3">
                                     <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getPriorityColor(task.priority)}`}>
                                        {task.priority}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-sm text-slate-400 ">
                                    {task.dueDate ? formatDate(task.dueDate) : formatDate(task.createdAt)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
      </div>
    </div>
  );
};

export default MaintenanceView;