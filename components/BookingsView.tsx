import React from 'react';
import { Booking } from '../types';
import { formatTime } from '../utils';
import { Users, Phone, Clock, CheckCircle, Clock as ClockIcon, XCircle, Globe } from 'lucide-react';

interface BookingsViewProps {
  bookings: Booking[];
}

const BookingsView: React.FC<BookingsViewProps> = ({ bookings }) => {
  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'seated': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: Booking['status']) => {
      switch (status) {
          case 'confirmed': return <CheckCircle className="w-4 h-4" />;
          case 'seated': return <Users className="w-4 h-4" />;
          case 'pending': return <ClockIcon className="w-4 h-4" />;
          default: return <XCircle className="w-4 h-4" />;
      }
  };

  return (
    <div className="flex-1 p-8 overflow-auto custom-scrollbar bg-white dark:bg-slate-900">
      <div className="flex justify-between items-end mb-6">
        <div>
           {/* Header is handled by ActionToolbar in App.tsx now, but we keep subtext here or rely on the grid */}
           <p className="text-gray-500 dark:text-gray-400 flex items-center">
             <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span> Connected to NowBookIt
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bookings.map(booking => (
          <div key={booking.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${getStatusColor(booking.status)}`}>
                 {getStatusIcon(booking.status)}
                 <span className="capitalize">{booking.status}</span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">{formatTime(booking.time)}</div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{booking.customerName}</h3>
            
            <div className="space-y-2 mt-4">
              <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                <Users className="w-4 h-4 mr-2" />
                <span>{booking.guests} Guests</span>
                <span className="mx-2 text-gray-300 dark:text-slate-600">|</span>
                <span className="font-medium">Table {booking.table}</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                <Phone className="w-4 h-4 mr-2" />
                <span>{booking.phone}</span>
              </div>
              {booking.source === 'nowbookit' && (
                 <div className="flex items-center text-indigo-600 dark:text-indigo-400 text-xs mt-1">
                    <Globe className="w-3 h-3 mr-1" /> NowBookIt Confirmed
                 </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 flex space-x-2">
                <button className="flex-1 py-1.5 text-xs font-medium bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors">
                    Edit
                </button>
                {booking.status === 'confirmed' && (
                    <button className="flex-1 py-1.5 text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                        Seat
                    </button>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingsView;