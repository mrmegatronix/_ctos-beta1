import React from 'react';

const TimeclockView: React.FC = () => {
  const getClockUrl = () => {
    if (window.location.protocol === 'file:') {
      return '../../_ct-CLOCK/index.html';
    }
    // Use relative path so it works with any base URL (GH Pages, local server, etc.)
    return './_ct-CLOCK/index.html';
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <iframe 
        src={getClockUrl()} 
        className="w-full h-full border-none flex-1"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        title="CT Clock Integration"
      />
    </div>
  );
};

export default TimeclockView;
