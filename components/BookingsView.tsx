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

  return (
    <div className="flex-1 flex flex-col p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-4">
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
              href="https://bookings.nowbookit.com/?accountid=d7034cd3-cfde-4556-a98c-ea943ec35ef4&venueid=13703&theme=light&colors=hex,000000" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow text-sm font-medium"
           >
               <Maximize2 className="w-4 h-4 mr-2" />
               Open Full Screen
           </a>
        </div>
      </div>

      <div className="flex-1 w-full bg-white rounded-xl overflow-hidden shadow-lg border border-white/10">
          <iframe 
              src="https://bookings.nowbookit.com/?accountid=d7034cd3-cfde-4556-a98c-ea943ec35ef4&venueid=13703&theme=light&colors=hex,000000" 
              title="NowBookIt Reservations"
              className="w-full h-full border-none"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          />
      </div>
    </div>
  );
};

export default BookingsView;