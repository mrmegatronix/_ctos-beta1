
import React, { useState } from 'react';
import { FunctionBooking } from '../types';
import { formatDate, formatTime, generateId } from '../utils';
import { PartyPopper, Users, MapPin, ClipboardList, DollarSign, Plus, X, Lock } from 'lucide-react';

interface FunctionsViewProps {
  functions: FunctionBooking[];
  onSaveFunction: (func: FunctionBooking) => void;
}

const FunctionsView: React.FC<FunctionsViewProps> = ({ functions, onSaveFunction }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFunction, setNewFunction] = useState<Partial<FunctionBooking>>({
      eventName: '',
      clientName: '',
      guests: 20,
      area: 'Private Room',
      depositPaid: false,
      requirements: [],
      status: 'enquiry'
  });
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('');
  const [reqInput, setReqInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newFunction.eventName || !dateStr || !timeStr) return;

      const date = new Date(`${dateStr}T${timeStr}`);
      const booking: FunctionBooking = {
          id: generateId(),
          eventName: newFunction.eventName || 'Untitled Event',
          clientName: newFunction.clientName || 'Unknown Client',
          date: date,
          guests: newFunction.guests || 0,
          area: newFunction.area as any,
          depositPaid: newFunction.depositPaid || false,
          requirements: newFunction.requirements || [],
          status: newFunction.status as any
      };

      onSaveFunction(booking);
      setIsModalOpen(false);
      setNewFunction({
          eventName: '',
          clientName: '',
          guests: 20,
          area: 'Private Room',
          depositPaid: false,
          requirements: [],
          status: 'enquiry'
      });
      setDateStr('');
      setTimeStr('');
  };

  const addRequirement = () => {
      if (reqInput.trim()) {
          setNewFunction(prev => ({
              ...prev,
              requirements: [...(prev.requirements || []), reqInput.trim()]
          }));
          setReqInput('');
      }
  };

  return (
    <div className="flex-1 p-8 overflow-auto custom-scrollbar bg-white dark:bg-slate-900 relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Functions & Private Events</h2>
          <p className="text-gray-500 dark:text-gray-400">Manage private bookings and large groups.</p>
        </div>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Private Function
        </button>
      </div>

      <div className="space-y-6">
        {functions.map(func => (
          <div key={func.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
             <div className="p-6">
               <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
                 <div className="flex items-center space-x-4">
                    <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl">
                      <PartyPopper className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                          {func.eventName}
                          {func.area === 'Private Room' && <Lock className="w-4 h-4 ml-2 text-gray-400" />}
                      </h3>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Client: {func.clientName}</div>
                    </div>
                 </div>
                 <div className="flex items-center space-x-3">
                    <div className="text-right">
                       <div className="font-semibold text-gray-900 dark:text-white">{formatDate(func.date)}</div>
                       <div className="text-sm text-gray-500">{formatTime(func.date)}</div>
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${func.depositPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                       {func.depositPaid ? 'Deposit Paid' : 'Deposit Due'}
                    </div>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center p-3 bg-gray-50 dark:bg-slate-700/30 rounded-lg">
                     <Users className="w-5 h-5 text-gray-400 mr-3" />
                     <span className="text-gray-700 dark:text-gray-200 font-medium">{func.guests} Guests</span>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 dark:bg-slate-700/30 rounded-lg">
                     <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                     <span className="text-gray-700 dark:text-gray-200 font-medium">{func.area}</span>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 dark:bg-slate-700/30 rounded-lg">
                     <DollarSign className="w-5 h-5 text-gray-400 mr-3" />
                     <span className="text-gray-700 dark:text-gray-200 font-medium capitalize">{func.status}</span>
                  </div>
               </div>

               {func.requirements.length > 0 && (
                   <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-lg p-4">
                      <h4 className="text-xs font-bold uppercase text-indigo-500 mb-2 flex items-center">
                        <ClipboardList className="w-4 h-4 mr-1" /> Requirements
                      </h4>
                      <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 grid grid-cols-1 md:grid-cols-2 gap-1">
                         {func.requirements.map((req, i) => (
                           <li key={i}>{req}</li>
                         ))}
                      </ul>
                   </div>
               )}
             </div>
             <div className="bg-gray-50 dark:bg-slate-900/50 px-6 py-3 border-t border-gray-100 dark:border-slate-700 flex justify-end space-x-3">
                <button className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">View Contract</button>
                <button className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800">Manage Booking</button>
             </div>
          </div>
        ))}
      </div>

      {/* New Function Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
                  <div className="flex justify-between items-start mb-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Book Private Function</h3>
                      <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                          <X className="w-5 h-5" />
                      </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Name</label>
                          <input 
                            type="text" 
                            required 
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg outline-none"
                            placeholder="e.g. John's 50th"
                            value={newFunction.eventName}
                            onChange={e => setNewFunction({...newFunction, eventName: e.target.value})}
                          />
                      </div>
                      
                      <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client Name</label>
                          <input 
                            type="text" 
                            required 
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg outline-none"
                            placeholder="e.g. John Doe"
                            value={newFunction.clientName}
                            onChange={e => setNewFunction({...newFunction, clientName: e.target.value})}
                          />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                              <input 
                                type="date" 
                                required 
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg outline-none"
                                value={dateStr}
                                onChange={e => setDateStr(e.target.value)}
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label>
                              <input 
                                type="time" 
                                required 
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg outline-none"
                                value={timeStr}
                                onChange={e => setTimeStr(e.target.value)}
                              />
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Guest Count</label>
                              <input 
                                type="number" 
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg outline-none"
                                value={newFunction.guests}
                                onChange={e => setNewFunction({...newFunction, guests: parseInt(e.target.value)})}
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Area</label>
                              <select 
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg outline-none"
                                value={newFunction.area}
                                onChange={e => setNewFunction({...newFunction, area: e.target.value as any})}
                              >
                                  <option value="Private Room">Private Room</option>
                                  <option value="Garden">Garden</option>
                                  <option value="Main Bar">Main Bar</option>
                              </select>
                          </div>
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Requirements</label>
                          <div className="flex gap-2 mb-2">
                              <input 
                                type="text" 
                                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg outline-none"
                                placeholder="Add requirement (e.g. Projector)"
                                value={reqInput}
                                onChange={e => setReqInput(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                              />
                              <button type="button" onClick={addRequirement} className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg">Add</button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                              {newFunction.requirements?.map((req, i) => (
                                  <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded text-xs flex items-center">
                                      {req}
                                      <button 
                                        type="button" 
                                        onClick={() => setNewFunction(prev => ({...prev, requirements: prev.requirements?.filter((_, idx) => idx !== i)}))}
                                        className="ml-1 text-gray-500 hover:text-red-500"
                                      >
                                          <X className="w-3 h-3" />
                                      </button>
                                  </span>
                              ))}
                          </div>
                      </div>

                      <div className="flex items-center space-x-3 pt-2">
                          <input 
                            type="checkbox" 
                            id="deposit"
                            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            checked={newFunction.depositPaid}
                            onChange={e => setNewFunction({...newFunction, depositPaid: e.target.checked})}
                          />
                          <label htmlFor="deposit" className="text-sm text-gray-700 dark:text-gray-300">Deposit has been paid</label>
                      </div>

                      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100 dark:border-slate-700 mt-6">
                          <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
                          <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save Booking</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default FunctionsView;
