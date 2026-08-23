import React, { useState } from 'react';
import { Booking } from '../types';
import { formatTime } from '../utils';
import { Users, Phone, Clock, CheckCircle, Clock as ClockIcon, XCircle, Globe, Mail, Maximize2 } from 'lucide-react';
import { fetchEmailBookings } from '../services/googleService';

interface BookingsViewProps {
  bookings: Booking[];
  onSaveBooking?: (booking: Booking) => void;
  onDeleteBooking?: (id: string) => void;
}

const BookingsView: React.FC<BookingsViewProps> = ({ bookings, onSaveBooking }) => {
  const [checkingEmail, setCheckingEmail] = useState(false);

  const handleCheckEmail = async () => {
      setCheckingEmail(true);
      try {
          const newBookings = await fetchEmailBookings();
          if (onSaveBooking) {
              newBookings.forEach(booking => onSaveBooking(booking));
          }
          if (newBookings.length === 0) {
              alert("No new bookings found in email.");
          } else {
              alert(`Found ${newBookings.length} new bookings!`);
          }
      } catch (e) {
          alert("Error checking emails. Ensure you are logged into Google.");
      }
      setCheckingEmail(false);
  };

  const today = new Date();
  const todaysBookings = bookings.filter(b => {
    const d = new Date(b.date || b.time);
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
  });

  return (
    <div className="flex-1 flex flex-col p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <div>
            <h2 className="text-2xl font-bold text-slate-50 flex items-center">
                <Globe className="w-6 h-6 mr-3 text-indigo-500" />
                Table Reservations
            </h2>
            <p className="text-slate-400">Manage bookings via NowBookIt.</p>
        </div>
        <div className="flex items-center space-x-4">
           <button 
              onClick={handleCheckEmail}
              disabled={checkingEmail}
              className="flex items-center px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors shadow text-sm font-medium disabled:opacity-50"
           >
              <Mail className="w-4 h-4 mr-2" />
              {checkingEmail ? 'Checking...' : 'Check Emails for Manual Bookings'}
           </button>
           <a 
              href="https://admin.nowbookit.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow text-sm font-medium"
           >
               <Maximize2 className="w-4 h-4 mr-2" />
               Open Full Screen
           </a>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Left Pane: Today's Bookings List */}
        <div className="w-1/3 bg-white/5 dark:bg-slate-800/50 backdrop-blur-md rounded-xl border border-white/10 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-slate-900/50">
             <h3 className="text-lg font-bold text-white flex items-center">
                <Users className="w-5 h-5 mr-2 text-indigo-400" />
                Today's Bookings ({todaysBookings.length})
             </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
             {todaysBookings.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                   No bookings for today.
                </div>
             ) : (
                todaysBookings.sort((a,b) => new Date(a.time).getTime() - new Date(b.time).getTime()).map(booking => (
                   <div key={booking.id} className="bg-white/10 p-4 rounded-lg border border-white/5 hover:bg-white/15 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                         <div className="font-semibold text-white">{booking.name}</div>
                         <div className="flex items-center text-indigo-400 font-bold bg-indigo-500/20 px-2 py-1 rounded text-sm">
                            <ClockIcon className="w-3 h-3 mr-1" />
                            {formatTime(booking.time)}
                         </div>
                      </div>
                      <div className="flex items-center text-sm text-slate-300 mb-1">
                         <Users className="w-4 h-4 mr-2 opacity-70" />
                         {booking.guests} Guests
                      </div>
                      {booking.contact && (
                         <div className="flex items-center text-sm text-slate-300 mb-1">
                            <Phone className="w-4 h-4 mr-2 opacity-70" />
                            {booking.contact}
                         </div>
                      )}
                      <div className="mt-3 flex justify-end space-x-2">
                         <button className="px-3 py-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded text-xs font-medium transition-colors flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" /> Arrived
                         </button>
                      </div>
                   </div>
                ))
             )}
          </div>
        </div>

        {/* Right Pane: NowBookIt Widget */}
        <div className="flex-1 bg-white rounded-xl overflow-hidden shadow-lg border border-white/10">
            <iframe 
                src="https://admin.nowbookit.com" 
                title="NowBookIt Reservations"
                className="w-full h-full border-none"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            />
        </div>
      </div>
    </div>
  );
};

export default BookingsView;