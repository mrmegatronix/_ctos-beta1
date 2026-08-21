import React from 'react';

const IncidentReportForm: React.FC = () => {
  return (
    <div className="p-8 font-sans text-black bg-white">
      <div className="flex justify-between items-end mb-6 border-b-2 border-black pb-4">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-wider">Incident Report Form</h1>
          <p className="text-gray-600 mt-1">To be completed immediately after an accident, injury, or security incident.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div className="border border-black p-3">
          <p className="font-bold mb-2">Date of Incident:</p>
          <p className="border-b border-gray-400 w-full mb-2 h-4"></p>
        </div>
        <div className="border border-black p-3">
          <p className="font-bold mb-2">Time of Incident:</p>
          <p className="border-b border-gray-400 w-full mb-2 h-4"></p>
        </div>
        <div className="border border-black p-3 col-span-2">
          <p className="font-bold mb-2">Exact Location of Incident:</p>
          <p className="border-b border-gray-400 w-full mb-2 h-4"></p>
        </div>
      </div>

      <div className="mb-6 break-inside-avoid">
        <h2 className="text-lg font-bold bg-gray-200 p-2 mb-2 uppercase">Person Involved</h2>
        <div className="border border-black p-4 text-sm grid grid-cols-2 gap-4">
          <div>
            <p className="font-bold mb-1">Full Name:</p>
            <p className="border-b border-gray-400 w-full h-5"></p>
          </div>
          <div>
            <p className="font-bold mb-1">Phone Number:</p>
            <p className="border-b border-gray-400 w-full h-5"></p>
          </div>
          <div className="col-span-2 flex space-x-6 mt-2">
            <label className="flex items-center space-x-2"><div className="w-4 h-4 border border-black"></div> <span>Staff</span></label>
            <label className="flex items-center space-x-2"><div className="w-4 h-4 border border-black"></div> <span>Patron / Guest</span></label>
            <label className="flex items-center space-x-2"><div className="w-4 h-4 border border-black"></div> <span>Contractor</span></label>
            <label className="flex items-center space-x-2"><div className="w-4 h-4 border border-black"></div> <span>Other</span></label>
          </div>
        </div>
      </div>

      <div className="mb-6 break-inside-avoid">
        <h2 className="text-lg font-bold bg-gray-200 p-2 mb-2 uppercase">Incident Details</h2>
        <div className="border border-black p-4 text-sm">
          <p className="font-bold mb-2">Describe what happened (Be objective and factual):</p>
          {[...Array(6)].map((_, i) => <p key={i} className="border-b border-gray-400 w-full h-8"></p>)}
        </div>
      </div>

      <div className="mb-6 break-inside-avoid">
        <h2 className="text-lg font-bold bg-gray-200 p-2 mb-2 uppercase">Action Taken</h2>
        <div className="border border-black p-4 text-sm">
          <div className="flex space-x-6 mb-4">
            <label className="flex items-center space-x-2"><div className="w-4 h-4 border border-black"></div> <span>First Aid Applied</span></label>
            <label className="flex items-center space-x-2"><div className="w-4 h-4 border border-black"></div> <span>Ambulance Called</span></label>
            <label className="flex items-center space-x-2"><div className="w-4 h-4 border border-black"></div> <span>Police Called</span></label>
            <label className="flex items-center space-x-2"><div className="w-4 h-4 border border-black"></div> <span>Person Sent Home/To Doctor</span></label>
          </div>
          <p className="font-bold mb-2">Details of action taken:</p>
          {[...Array(3)].map((_, i) => <p key={i} className="border-b border-gray-400 w-full h-8"></p>)}
        </div>
      </div>

      <div className="mt-8 border border-black p-4 break-inside-avoid">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-sm font-bold mb-1">Report Completed By (Name):</p>
            <p className="border-b border-black w-full mb-4 h-5"></p>
            <p className="border-b border-black w-full mb-2 h-6"></p>
            <p className="text-xs uppercase font-bold">Signature</p>
          </div>
          <div>
            <p className="text-sm font-bold mb-1">Manager on Duty (Name):</p>
            <p className="border-b border-black w-full mb-4 h-5"></p>
            <p className="border-b border-black w-full mb-2 h-6"></p>
            <p className="text-xs uppercase font-bold">Signature</p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-xs text-center text-gray-400">
        CTOS Management System - Master Document
      </div>
    </div>
  );
};

export default IncidentReportForm;
