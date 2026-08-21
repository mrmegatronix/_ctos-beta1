import React from 'react';

const LostAndFoundLog: React.FC = () => {
  return (
    <div className="p-8 font-sans text-black bg-white flex flex-col h-[297mm]">
      <div className="flex justify-between items-end mb-6 border-b-2 border-black pb-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-wider">Lost & Found Log</h1>
          <p className="text-gray-600 mt-1">Record all items handed in or reported lost by patrons.</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <table className="w-full text-left border-collapse border border-black text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-black p-2 w-24">Date</th>
              <th className="border border-black p-2 w-24">Item #</th>
              <th className="border border-black p-2 w-1/3">Description of Item</th>
              <th className="border border-black p-2 w-32">Location Found</th>
              <th className="border border-black p-2 w-32">Staff Initials</th>
              <th className="border border-black p-2 text-center">Claimed By (Sign & Date)</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(18)].map((_, i) => (
              <tr key={i}>
                <td className="border border-black p-2 h-14"></td>
                <td className="border border-black p-2 h-14"></td>
                <td className="border border-black p-2 h-14"></td>
                <td className="border border-black p-2 h-14"></td>
                <td className="border border-black p-2 h-14"></td>
                <td className="border border-black p-2 h-14 bg-gray-50"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 text-xs text-center text-gray-400 shrink-0">
        CTOS Management System - Master Document
      </div>
    </div>
  );
};

export default LostAndFoundLog;
