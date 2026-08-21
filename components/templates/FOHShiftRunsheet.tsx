import React from 'react';
import { formatDate } from '../../utils';

const FOHShiftRunsheet: React.FC = () => {
  return (
    <div className="p-8 font-sans text-black bg-white">
      <div className="flex justify-between items-end mb-6 border-b-2 border-black pb-4">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-wider">FOH Shift Runsheet</h1>
          <p className="text-gray-600 mt-1">Daily Operations Checklist</p>
        </div>
        <div className="text-right">
          <p className="font-bold border-b border-black inline-block w-48 text-left mb-2">Date: {formatDate(new Date())}</p><br/>
          <p className="font-bold border-b border-black inline-block w-48 text-left">Duty Manager:</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-6">
        <div className="break-inside-avoid">
          <h2 className="text-lg font-bold bg-gray-200 p-2 mb-2 uppercase">Opening Duties</h2>
          <table className="w-full text-left border-collapse border border-gray-300 text-sm mb-4">
            <tbody>
              {[
                "Turn on all lights and AV systems",
                "Unlock front doors and check signage",
                "Count floats and enter into POS",
                "Check bathrooms are stocked and clean",
                "Wipe down bar and tables",
                "Check reservations for the day",
                "Print fresh menus if required",
                "Check tap beer lines and gas"
              ].map((task, i) => (
                <tr key={i}>
                  <td className="border border-gray-300 p-2 w-10 text-center"><div className="w-5 h-5 border border-black mx-auto rounded-sm"></div></td>
                  <td className="border border-gray-300 p-2">{task}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-right text-xs font-bold">Opened By: ____________________</p>
        </div>

        <div className="break-inside-avoid">
          <h2 className="text-lg font-bold bg-gray-200 p-2 mb-2 uppercase">Mid-Shift / Handover</h2>
          <table className="w-full text-left border-collapse border border-gray-300 text-sm mb-4">
            <tbody>
              {[
                "Empty all bins",
                "Wipe down all tables and menus",
                "Restock bar fridges (rotate stock)",
                "Restock glasswash area",
                "Check bathrooms (TP, soap, paper towels)",
                "Communicate 86'd items to night staff",
                "Brief night staff on large bookings"
              ].map((task, i) => (
                <tr key={i}>
                  <td className="border border-gray-300 p-2 w-10 text-center"><div className="w-5 h-5 border border-black mx-auto rounded-sm"></div></td>
                  <td className="border border-gray-300 p-2">{task}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-right text-xs font-bold">Handover By: ____________________</p>
        </div>
      </div>

      <div className="break-inside-avoid mb-6">
        <h2 className="text-lg font-bold bg-gray-200 p-2 mb-2 uppercase">Closing Duties</h2>
        <div className="grid grid-cols-2 gap-4">
          <table className="w-full text-left border-collapse border border-gray-300 text-sm">
            <tbody>
              {[
                "Lock all doors and windows",
                "Turn off AV, TVs, and music",
                "Cash up tills and finalize EOD in POS",
                "Wipe down bar, coffee machine, tables",
                "Empty all bins to outside skips",
                "Sweep and mop all FOH floors",
              ].map((task, i) => (
                <tr key={i}>
                  <td className="border border-gray-300 p-2 w-10 text-center"><div className="w-5 h-5 border border-black mx-auto rounded-sm"></div></td>
                  <td className="border border-gray-300 p-2">{task}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <table className="w-full text-left border-collapse border border-gray-300 text-sm">
            <tbody>
              {[
                "Restock fridges for tomorrow",
                "Clean bathrooms (mirrors, toilets, floors)",
                "Turn off lights and set alarm",
                "Drop safe keys in lockbox",
                "Check all taps are closed",
                "Submit Incident Reports (if any)",
              ].map((task, i) => (
                <tr key={i}>
                  <td className="border border-gray-300 p-2 w-10 text-center"><div className="w-5 h-5 border border-black mx-auto rounded-sm"></div></td>
                  <td className="border border-gray-300 p-2">{task}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-right text-xs font-bold mt-4">Closed By: ____________________</p>
      </div>

      <div className="break-inside-avoid">
        <h2 className="text-lg font-bold bg-gray-200 p-2 mb-2 uppercase">Shift Notes / Issues to Report</h2>
        <div className="border border-black min-h-[100px] p-2 text-sm"></div>
      </div>

      <div className="mt-8 text-xs text-center text-gray-400">
        CTOS Management System - Master Document
      </div>
    </div>
  );
};

export default FOHShiftRunsheet;
