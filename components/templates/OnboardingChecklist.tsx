import React from 'react';

const OnboardingChecklist: React.FC = () => {
  const sections = [
    {
      title: "Pre-Commencement",
      tasks: ["Contract signed and returned", "Bank details provided", "Tax file number / IRD number submitted", "Uniform size requested"]
    },
    {
      title: "First Day - Admin & Tour",
      tasks: ["Venue tour and fire exits located", "Introduced to key team members", "Clock-in system (CTOS) PIN assigned & explained", "Staff handbook provided"]
    },
    {
      title: "Health & Safety",
      tasks: ["Emergency procedures explained", "Location of first aid kits", "Hazard reporting process explained", "Safe lifting techniques demonstrated"]
    },
    {
      title: "Role Specific Training",
      tasks: ["POS system basic training", "Menu tasting / knowledge session", "Opening and closing procedures reviewed", "Shadowing senior staff member for 1 shift"]
    }
  ];

  return (
    <div className="p-8 font-sans text-black bg-white">
      <div className="flex justify-between items-end mb-6 border-b-2 border-black pb-4">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-wider">New Hire Onboarding</h1>
          <p className="text-gray-600 mt-1">Staff Induction Checklist</p>
        </div>
        <div className="text-right text-sm">
          <p className="font-bold mb-2">Employee Name: <span className="border-b border-black inline-block w-48"></span></p>
          <p className="font-bold mb-2">Role: <span className="border-b border-black inline-block w-48"></span></p>
          <p className="font-bold">Start Date: <span className="border-b border-black inline-block w-48"></span></p>
        </div>
      </div>

      <p className="mb-6 text-sm italic">
        Both the manager and employee must initial each section once completed. This document is to be kept in the employee's file.
      </p>

      {sections.map((section, idx) => (
        <div key={idx} className="mb-6 break-inside-avoid">
          <h2 className="text-lg font-bold bg-gray-200 p-2 mb-2 uppercase flex justify-between">
            <span>{section.title}</span>
            <span className="text-xs font-normal self-center">Mgr Initial ___ Emp Initial ___</span>
          </h2>
          <table className="w-full text-left border-collapse border border-gray-300 text-sm">
            <tbody>
              {section.tasks.map((task, taskIdx) => (
                <tr key={taskIdx}>
                  <td className="border border-gray-300 p-2 w-10 text-center">
                    <div className="w-5 h-5 border border-black mx-auto rounded-sm"></div>
                  </td>
                  <td className="border border-gray-300 p-2">{task}</td>
                </tr>
              ))}
              <tr>
                <td className="border border-gray-300 p-2 w-10 text-center">
                  <div className="w-5 h-5 border border-black mx-auto rounded-sm"></div>
                </td>
                <td className="border border-gray-300 p-2 text-gray-400 italic">Other: _________________________</td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}

      <div className="mt-8 border border-black p-4 break-inside-avoid">
        <h3 className="font-bold uppercase mb-4">Sign Off</h3>
        <p className="text-sm mb-6">I confirm that I have received all training and information listed above, and understand my responsibilities.</p>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="border-b border-black w-full mb-2 h-6"></p>
            <p className="text-xs uppercase font-bold">Employee Signature</p>
          </div>
          <div>
            <p className="border-b border-black w-full mb-2 h-6"></p>
            <p className="text-xs uppercase font-bold">Manager Signature</p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-xs text-center text-gray-400">
        CTOS Management System - Master Document
      </div>
    </div>
  );
};

export default OnboardingChecklist;
