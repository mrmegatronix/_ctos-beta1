import React from 'react';
import { TeamMember } from '../types';
import { Mail, Phone, MapPin, UserCircle } from 'lucide-react';

interface StaffDirectoryProps {
  staff: TeamMember[];
}

const StaffDirectory: React.FC<StaffDirectoryProps> = ({ staff }) => {
  return (
    <div className="flex-1 p-8 overflow-auto custom-scrollbar bg-white dark:bg-slate-900">
       <div className="mb-6 flex justify-between items-center">
         <div>
             <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Staff Directory</h2>
             <p className="text-gray-500 dark:text-gray-400">Contact information and roles.</p>
         </div>
         <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            Add Staff
         </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {staff.map(member => (
           <div key={member.id} className={`bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group ${member.isDemo ? 'demo-highlight' : ''}`}>
             
             {/* Decorative Background */}
             <div className={`absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-${member.color}-50 to-transparent dark:from-${member.color}-900/20`}></div>
             
             <div className="relative z-10">
                <img src={member.avatar} className="w-20 h-20 rounded-full border-4 border-white dark:border-slate-800 shadow-sm mx-auto mb-3 object-cover" alt={member.name} />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{member.name}</h3>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium bg-${member.color}-100 text-${member.color}-800 dark:bg-${member.color}-900/30 dark:text-${member.color}-300 mt-1`}>
                    {member.role || 'Staff'}
                </span>
             </div>

             <div className="mt-6 w-full space-y-3 relative z-10">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-700/50 p-2 rounded-lg">
                    <Mail className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="truncate">{member.email || 'No email'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-700/50 p-2 rounded-lg">
                    <Phone className="w-4 h-4 mr-3 text-gray-400" />
                    <span>{member.phone || 'No phone'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-700/50 p-2 rounded-lg text-left">
                    <MapPin className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{member.address || 'No address'}</span>
                </div>
             </div>
             
             <div className="mt-6 flex gap-2 w-full">
                <button className="flex-1 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                    View Roster
                </button>
                <button className="flex-1 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                    Edit Profile
                </button>
             </div>
           </div>
         ))}
       </div>
    </div>
  );
};

export default StaffDirectory;