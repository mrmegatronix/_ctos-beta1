import React, { useState } from 'react';
import { TeamMember, StaffRole, AccessLevel, isMasterAdmin, isAdminOrAbove } from '../types';
import { 
  Mail, Phone, MapPin, UserCircle, Crown, Shield, Users, 
  Plus, Edit2, Trash2, X, Check, KeyRound, Lock, Sparkles 
} from 'lucide-react';

interface StaffDirectoryProps {
  staff: TeamMember[];
  onSaveStaff?: (member: TeamMember) => Promise<void> | void;
  onDeleteStaff?: (id: string) => Promise<void> | void;
  currentUser?: TeamMember | null;
}

const ROLES: { role: StaffRole; accessLevel: AccessLevel; label: string; description: string }[] = [
  { 
    role: 'Master Admin', 
    accessLevel: 'master-admin', 
    label: 'Master Admin (Creator)', 
    description: 'Full root privileges, system settings, database control & role appointment' 
  },
  { 
    role: 'Duty Manager', 
    accessLevel: 'admin', 
    label: 'Duty Manager (Admin)', 
    description: 'Manages FOH/BOH, rosters, data import, financial data & confidential records' 
  },
  { 
    role: 'Front of House', 
    accessLevel: 'standard', 
    label: 'Front of House (Staff)', 
    description: 'Timeclock, POS terminal, menus, TV guide, incident & maintenance logs' 
  },
  { 
    role: 'Head Chef', 
    accessLevel: 'admin', 
    label: 'Head Chef (Kitchen Admin)', 
    description: 'Kitchen management, recipes, stock ordering & BOH operations' 
  },
  { 
    role: 'Chef', 
    accessLevel: 'standard', 
    label: 'Chef (Kitchen Staff)', 
    description: 'Kitchen hub, recipe books, prep lists & maintenance' 
  },
  { 
    role: 'Kitchen Hand', 
    accessLevel: 'standard', 
    label: 'Kitchen Hand (Staff)', 
    description: 'Kitchen operations, timeclock & task logs' 
  }
];

const COLORS = ['#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#F59E0B', '#14B8A6'];

const StaffDirectory: React.FC<StaffDirectoryProps> = ({ 
  staff, 
  onSaveStaff, 
  onDeleteStaff, 
  currentUser 
}) => {
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

  const isUserMaster = isMasterAdmin(currentUser);
  const isUserAdmin = isAdminOrAbove(currentUser);

  const handleAddNew = () => {
    const newMember: TeamMember = {
      id: `staff-${Date.now()}`,
      name: '',
      role: 'Front of House',
      accessLevel: 'standard',
      pinCode: `${Math.floor(1000 + Math.random() * 9000)}`,
      avatar: '',
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      visible: true,
      email: '',
      phone: '',
      address: ''
    };
    setEditingMember(newMember);
    setIsNew(true);
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember({ ...member });
    setIsNew(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember || !editingMember.name.trim()) return;

    // Determine access level based on selected role
    const matchedRole = ROLES.find(r => r.role === editingMember.role);
    const finalMember: TeamMember = {
      ...editingMember,
      accessLevel: matchedRole?.accessLevel || editingMember.accessLevel || 'standard'
    };

    if (onSaveStaff) {
      await onSaveStaff(finalMember);
    }
    setEditingMember(null);
    setIsNew(false);
  };

  const handleDelete = async (member: TeamMember) => {
    if (isMasterAdmin(member)) {
      alert('Master Admin root account cannot be deleted.');
      return;
    }
    if (confirm(`Are you sure you want to remove ${member.name} from the staff directory?`)) {
      if (onDeleteStaff) {
        await onDeleteStaff(member.id);
      }
    }
  };

  const filteredStaff = staff.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (m.email && m.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (m.role && m.role.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = filterRole === 'all' || 
      (filterRole === 'master' && isMasterAdmin(m)) ||
      (filterRole === 'admin' && m.accessLevel === 'admin') ||
      (filterRole === 'standard' && (m.accessLevel === 'standard' || !m.accessLevel));
    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex-1 p-6 md:p-8 overflow-auto custom-scrollbar bg-slate-950 text-white/50">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Staff & Access Directory</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
              {staff.length} Active Accounts
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Manage team members, 4-digit PIN credentials, and RBAC privilege levels.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {isUserAdmin && (
            <button 
              onClick={handleAddNew}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Staff Member</span>
            </button>
          )}
        </div>
      </div>

      {/* Role Hierarchy Legend & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start space-x-3">
          <div className="p-2 bg-amber-500 text-slate-950 rounded-xl">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-black text-amber-600 dark:text-amber-400">Master Admin</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Root privileges, settings, permissions & database controls. Permanent owner.
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-start space-x-3">
          <div className="p-2 bg-indigo-600 text-white rounded-xl">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-black text-indigo-600 dark:text-indigo-400">Duty Managers (Admin)</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Rosters, timesheet sign-offs, data imports, confidential & financial reports.
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-500/10 border border-slate-500/20 flex items-start space-x-3">
          <div className="p-2 bg-slate-600 text-white rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-black text-slate-700 dark:text-slate-300">Front / Back of House</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Timeclock punch, POS terminal, menus, recipes, stocktakes & task logs.
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="mb-6 flex flex-col md:flex-row gap-3">
        <input 
          type="text"
          placeholder="Search staff by name, role, email..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="flex space-x-2">
          {['all', 'master', 'admin', 'standard'].map(filter => (
            <button
              key={filter}
              onClick={() => setFilterRole(filter)}
              className={`px-3 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                filterRole === filter
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-900/60 backdrop-blur-xl border border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
              }`}
            >
              {filter === 'all' ? 'All Roles' : filter}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredStaff.map(member => {
          const isMaster = isMasterAdmin(member);
          const isAdmin = member.accessLevel === 'admin' || member.role === 'Duty Manager' || member.role === 'Admin';
          
          return (
            <div 
              key={member.id} 
              className={`bg-slate-900/60 backdrop-blur-xl rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between shadow-sm hover:shadow-md relative overflow-hidden ${
                isMaster 
                  ? 'border-amber-400/60 dark:border-amber-500/40 ring-1 ring-amber-400/30' 
                  : isAdmin 
                    ? 'border-indigo-300 dark:border-indigo-700/50' 
                    : 'border-white/10'
              }`}
            >
              {/* Header Ribbon for Master Admin */}
              {isMaster && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-400 text-slate-950 text-[10px] font-black uppercase px-3 py-0.5 rounded-bl-xl shadow-sm flex items-center space-x-1">
                  <Crown className="w-3 h-3" />
                  <span>Master Root</span>
                </div>
              )}

              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="relative">
                    <img 
                      src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`} 
                      className={`w-13 h-13 rounded-2xl border-2 object-cover ${
                        isMaster ? 'border-amber-500 shadow-md shadow-amber-500/20' : 'border-slate-200 dark:border-slate-600'
                      }`}
                      alt={member.name} 
                    />
                    <div 
                      className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800"
                      style={{ backgroundColor: member.color || '#6366F1' }}
                    />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                      <span>{member.name}</span>
                    </h3>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-black ${
                        isMaster 
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300' 
                          : isAdmin
                            ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        {isMaster ? <Crown className="w-3 h-3" /> : isAdmin ? <Shield className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                        <span>{member.role || 'Staff'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info List */}
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-950 text-white/40 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">PIN Code:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-900/60 backdrop-blur-xl px-2 py-0.5 rounded border border-white/10 tracking-widest">
                      ••••
                    </span>
                  </div>
                  <div className="flex items-center justify-between truncate">
                    <span className="text-slate-400">Email:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate ml-2">
                      {member.email || 'None'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Phone:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {member.phone || 'None'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleEdit(member)}
                  className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-700/60 dark:hover:bg-indigo-900/30 text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 rounded-lg text-xs font-bold transition-colors flex items-center justify-center space-x-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                {isUserMaster && !isMaster && (
                  <button
                    onClick={() => handleDelete(member)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                    title="Remove Staff"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Add Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-black">{isNew ? 'Add Team Member' : `Edit ${editingMember.name}`}</h3>
              </div>
              <button 
                onClick={() => setEditingMember(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input 
                  type="text" 
                  required
                  value={editingMember.name} 
                  onChange={e => setEditingMember({ ...editingMember, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-xl text-slate-100 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Robert Smith"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Role & Access Level
                  </label>
                  <select 
                    value={editingMember.role}
                    disabled={!isUserMaster && isMasterAdmin(editingMember)}
                    onChange={e => {
                      const selectedRole = e.target.value as StaffRole;
                      const roleConfig = ROLES.find(r => r.role === selectedRole);
                      setEditingMember({ 
                        ...editingMember, 
                        role: selectedRole,
                        accessLevel: roleConfig?.accessLevel || 'standard'
                      });
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-xl text-slate-100 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                  >
                    {ROLES.map(r => (
                      <option 
                        key={r.role} 
                        value={r.role}
                        disabled={r.role === 'Master Admin' && !isUserMaster}
                      >
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    4-Digit PIN Code
                  </label>
                  <input 
                    type="text" 
                    maxLength={4}
                    required
                    value={editingMember.pinCode} 
                    onChange={e => setEditingMember({ ...editingMember, pinCode: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-xl text-slate-100 text-sm font-mono font-bold focus:ring-2 focus:ring-indigo-500 tracking-widest text-center"
                    placeholder="1234"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input 
                  type="email" 
                  value={editingMember.email || ''} 
                  onChange={e => setEditingMember({ ...editingMember, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-xl text-slate-100 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                  placeholder="name@coasterstavern.co.nz"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Contact Phone
                  </label>
                  <input 
                    type="text" 
                    value={editingMember.phone || ''} 
                    onChange={e => setEditingMember({ ...editingMember, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-xl text-slate-100 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                    placeholder="(03) 352 0210"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Color Tag
                  </label>
                  <div className="flex items-center space-x-2 pt-1">
                    {COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setEditingMember({ ...editingMember, color: c })}
                        className={`w-6 h-6 rounded-full transition-transform ${editingMember.color === c ? 'scale-125 ring-2 ring-indigo-500' : 'opacity-70 hover:opacity-100'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-white/10 transition-colors transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDirectory;