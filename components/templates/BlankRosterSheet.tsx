import React from 'react';
import { formatDate } from '../../utils';

const BlankRosterSheet: React.FC = () => {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="p-8 font-sans text-black bg-white">
      {/* Printer Friendly Header */}
      <div className="flex justify-between items-end mb-6 border-b-2 border-black pb-4">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-wider">Weekly Staff Roster</h1>
          <p className="text-gray-600 mt-1">Week Commencing: ___ / ___ / ______</p>
        </div>
        <div className="text-right">
          <p className="font-bold border-b border-black inline-block w-48 text-left mb-2">Generated: {formatDate(new Date())}</p><br/>
          <p className="font-bold border-b border-black inline-block w-48 text-left">Manager:</p>
        </div>
      </div>

      {/* Roster Grid */}
      <table className="w-full text-left border-collapse border-2 border-black text-sm mb-8">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-black p-3 w-48 font-bold uppercase">Staff Name</th>
            <th className="border border-black p-3 w-24 font-bold uppercase text-center">Role</th>
            {daysOfWeek.map(day => (
              <th key={day} className="border border-black p-3 font-bold uppercase text-center w-32">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 15 }).map((_, index) => (
            <tr key={index} className="h-16">
              <td className="border border-black p-2 relative">
                <div className="absolute inset-0 bg-transparent"></div>
              </td>
              <td className="border border-black p-2 relative"></td>
              {daysOfWeek.map(day => (
                <td key={day} className="border border-black p-2 relative">
                  <div className="flex flex-col h-full justify-between">
                    <span className="text-[10px] text-gray-400 border-b border-dashed border-gray-300 pb-4">In:</span>
                    <span className="text-[10px] text-gray-400 pt-4">Out:</span>
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Notes Section */}
      <div className="break-inside-avoid mb-6">
        <h2 className="text-lg font-bold bg-gray-200 p-2 mb-2 uppercase border border-black border-b-0">Manager Notes / Shift Requirements</h2>
        <div className="border border-black min-h-[120px] p-2 text-sm bg-gray-50"></div>
      </div>

      <div className="mt-8 text-xs text-center text-gray-400">
        CTOS Management System - Master Document
      </div>
    </div>
  );
};

export default BlankRosterSheet;
