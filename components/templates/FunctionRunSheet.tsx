import React from 'react';
import { formatDate } from '../../utils';

const FunctionRunSheet: React.FC = () => {
  return (
    <div className="p-8 font-sans text-black bg-white">
      <div className="flex justify-between items-start mb-6 border-b-2 border-black pb-4">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-wider">Function Run Sheet</h1>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4 text-sm">
            <p><span className="font-bold">Client Name:</span> <span className="border-b border-black inline-block w-40"></span></p>
            <p><span className="font-bold">Date:</span> <span className="border-b border-black inline-block w-40"></span></p>
            <p><span className="font-bold">Function Type:</span> <span className="border-b border-black inline-block w-40"></span></p>
            <p><span className="font-bold">Pax (Guests):</span> <span className="border-b border-black inline-block w-40"></span></p>
          </div>
        </div>
        <div className="text-right border border-black p-3">
          <p className="font-bold uppercase text-lg mb-2">Duty Manager</p>
          <p className="border-b border-black w-48 mb-4 h-4"></p>
          <p className="font-bold uppercase text-sm mb-1">Key Staff</p>
          <p className="border-b border-black w-48 mb-2 h-4"></p>
          <p className="border-b border-black w-48 mb-2 h-4"></p>
        </div>
      </div>

      <div className="mb-6 break-inside-avoid">
        <h2 className="text-xl font-bold bg-gray-200 p-2 mb-2 uppercase">Timeline & Running Order</h2>
        <table className="w-full text-left border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 w-24">Time</th>
              <th className="border border-gray-300 p-2 w-1/4">Action / Flow</th>
              <th className="border border-gray-300 p-2">Details & Notes</th>
              <th className="border border-gray-300 p-2 w-24 text-center">Completed</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(10)].map((_, i) => (
              <tr key={i}>
                <td className="border border-gray-300 p-2 h-10"></td>
                <td className="border border-gray-300 p-2 h-10"></td>
                <td className="border border-gray-300 p-2 h-10"></td>
                <td className="border border-gray-300 p-2 h-10 text-center"><div className="w-5 h-5 border border-black mx-auto rounded-sm"></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-6 break-inside-avoid">
        <div>
          <h2 className="text-xl font-bold bg-gray-200 p-2 mb-2 uppercase">Food & Beverage Notes</h2>
          <div className="border border-gray-300 min-h-[150px] p-2 text-sm text-gray-500 italic">
            Dietary requirements, bar tab limits, special requests...
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold bg-gray-200 p-2 mb-2 uppercase">Setup & AV Requirements</h2>
          <div className="border border-gray-300 min-h-[150px] p-2 text-sm text-gray-500 italic">
            Room layout, microphones, projector, decorations...
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-xs text-center text-gray-400">
        CTOS Management System - Master Document
      </div>
    </div>
  );
};

export default FunctionRunSheet;
