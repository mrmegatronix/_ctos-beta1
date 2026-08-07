import React, { useState } from 'react';
import { MaintenanceTask } from '../types';
import { formatDate, generateId } from '../utils';
import { Wrench, CheckCircle2, Clock, AlertCircle, Calendar, Plus, Trash2, Search, Filter, Save, AlertTriangle, UserCheck } from 'lucide-react';

interface MaintenanceViewProps {
  tasks: MaintenanceTask[];
  onUpdateStatus: (id: string, status: MaintenanceTask['status']) => void;
  onSaveTask?: (task: MaintenanceTask) => void;
  onDeleteTask?: (id: string) => void;
}

const MaintenanceView: React.FC<MaintenanceViewProps> = ({ tasks, onUpdateStatus, onSaveTask, onDeleteTask }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [newTask, setNewTask] = useState<Partial<MaintenanceTask>>({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    assignedTo: '',
    dueDate: undefined
  });

  const getPriorityColor = (priority: MaintenanceTask['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const getStatusIcon = (status: MaintenanceTask['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !newTask.description) return;

    const task: MaintenanceTask = {
      id: `maint-${generateId()}`,
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority || 'medium',
      status: 'pending',
      assignedTo: newTask.assignedTo || '',
      dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
      createdAt: new Date()
    };

    if (onSaveTask) {
      onSaveTask(task);
    }
    setIsFormOpen(false);
    setNewTask({ title: '', description: '', priority: 'medium', status: 'pending', assignedTo: '', dueDate: undefined });
  };

  const filteredTasks = tasks.filter(t => {
    if (filterPriority !== 'All' && t.priority !== filterPriority.toLowerCase()) return false;
    if (filterStatus === 'active' && t.status === 'completed') return false;
    if (filterStatus === 'completed' && t.status !== 'completed') return false;
    if (filterStatus === 'pending' && t.status !== 'pending') return false;
    if (filterStatus === 'in-progress' && t.status !== 'in-progress') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = t.title?.toLowerCase().includes(q);
      const descMatch = t.description?.toLowerCase().includes(q);
      const assignMatch = t.assignedTo?.toLowerCase().includes(q);
      return titleMatch || descMatch || assignMatch;
    }
    return true;
  });

  const pendingTasks = filteredTasks.filter(t => t.status !== 'completed');
  const completedTasks = filteredTasks.filter(t => t.status === 'completed');

  const totalUrgent = tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length;

  return (
    <div className="flex-1 p-8 overflow-auto custom-scrollbar bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 flex items-center">
              <Wrench className="w-7 h-7 mr-3 text-indigo-600 dark:text-indigo-400" />
              Venue Maintenance & Repairs
            </h2>
            {totalUrgent > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700 animate-pulse">
                {totalUrgent} Urgent Issues
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track equipment servicing, preventative maintenance, health & safety fixtures, and contractors.
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center space-x-2 shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Report New Issue</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Status:</span>
            <div className="flex gap-1">
              {[
                { id: 'all', label: 'All' },
                { id: 'active', label: 'Active' },
                { id: 'pending', label: 'Pending' },
                { id: 'in-progress', label: 'In Progress' },
                { id: 'completed', label: 'Done' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilterStatus(tab.id)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    filterStatus === tab.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-1.5 pl-2 border-l border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Priority:</span>
            {['All', 'High', 'Medium', 'Low'].map(p => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`px-2 py-0.5 text-xs font-semibold rounded-lg transition-colors ${
                  filterPriority === p
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {/* New Maintenance Task Modal */}
      {isFormOpen && (
        <div className="bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-900/40 rounded-2xl p-6 mb-8 shadow-xl animate-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-lg text-indigo-700 dark:text-indigo-300 flex items-center">
              <Wrench className="w-5 h-5 mr-2" />
              Create Maintenance Work Order
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Issue Summary / Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Glycol cellar cooler leaking, Glasswasher motor error 04..."
                value={newTask.title || ''}
                onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Priority Level
              </label>
              <select
                value={newTask.priority}
                onChange={e => setNewTask({ ...newTask, priority: e.target.value as any })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-800 dark:text-slate-100"
              >
                <option value="high">High (Urgent / Trade Impairment)</option>
                <option value="medium">Medium (Requires prompt repair)</option>
                <option value="low">Low (Cosmetic / Routine Service)</option>
              </select>
            </div>

            <div className="col-span-1 md:col-span-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Detailed Description & Troubleshooting Steps
              </label>
              <textarea
                rows={3}
                required
                placeholder="Specify exact location, symptoms, make & model of appliance, and any contractor contacts called..."
                value={newTask.description || ''}
                onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Assigned Contractor / Staff
              </label>
              <input
                type="text"
                placeholder="e.g. Apex Refrigeration / Alex S."
                value={newTask.assignedTo || ''}
                onChange={e => setNewTask({ ...newTask, assignedTo: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Target Resolution Due Date
              </label>
              <input
                type="date"
                onChange={e => setNewTask({ ...newTask, dueDate: e.target.value ? new Date(e.target.value) : undefined })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="flex items-end justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors shadow-md shadow-indigo-600/20 flex items-center"
              >
                <Save className="w-4 h-4 mr-2" /> Log Work Order
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Task Sections */}
      <div className="space-y-8">
        {/* Active Tasks */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-indigo-500" />
              Active Work Orders ({pendingTasks.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pendingTasks.map(task => {
              const createdDate = task.createdAt instanceof Date ? task.createdAt : new Date(task.createdAt);
              return (
                <div
                  key={task.id}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider border ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority} Priority
                      </span>
                      <div className="flex items-center space-x-3 text-xs text-slate-400">
                        <span className="flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1" />
                          {formatDate(createdDate)}
                        </span>
                        {onDeleteTask && (
                          <button
                            onClick={() => {
                              if (confirm('Delete this maintenance task?')) {
                                onDeleteTask(task.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1.5">{task.title}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">{task.description}</p>

                    {task.assignedTo && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-3 flex items-center">
                        <UserCheck className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                        Assigned to: <strong className="ml-1 text-slate-800 dark:text-slate-200">{task.assignedTo}</strong>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700/60 mt-2">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                      {getStatusIcon(task.status)}
                      <span className="capitalize">{task.status.replace('-', ' ')}</span>
                    </div>

                    <div className="flex space-x-2">
                      {task.status === 'pending' && (
                        <button
                          onClick={() => onUpdateStatus(task.id, 'in-progress')}
                          className="text-xs font-bold px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-xl hover:bg-blue-100 transition-colors"
                        >
                          Start Work
                        </button>
                      )}
                      <button
                        onClick={() => onUpdateStatus(task.id, 'completed')}
                        className="text-xs font-bold px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl hover:bg-emerald-100 transition-colors flex items-center"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mark Fixed
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {pendingTasks.length === 0 && (
              <div className="col-span-full p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2 opacity-60" />
                <h4 className="font-bold text-slate-800 dark:text-slate-200">All Equipment Operational</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">No active maintenance work orders.</p>
              </div>
            )}
          </div>
        </section>

        {/* Completed History */}
        {completedTasks.length > 0 && (
          <section>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-500" />
              Completed History ({completedTasks.length})
            </h3>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-xs uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-3.5">Task Description</th>
                    <th className="px-6 py-3.5">Priority</th>
                    <th className="px-6 py-3.5">Assigned To</th>
                    <th className="px-6 py-3.5">Logged Date</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {completedTasks.map(task => {
                    const cDate = task.createdAt instanceof Date ? task.createdAt : new Date(task.createdAt);
                    return (
                      <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{task.title}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{task.description}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300">
                          {task.assignedTo || 'Venue Staff'}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {formatDate(cDate)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => onUpdateStatus(task.id, 'pending')}
                              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 px-2 py-1 rounded"
                            >
                              Reopen
                            </button>
                            {onDeleteTask && (
                              <button
                                onClick={() => {
                                  if (confirm('Delete record?')) {
                                    onDeleteTask(task.id);
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-red-600 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default MaintenanceView;