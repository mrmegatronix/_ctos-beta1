import React from 'react';

interface DigitalClockProps {
  date: Date | string | number;
  showSeconds?: boolean;
  className?: string;
}

const DigitalClock: React.FC<DigitalClockProps> = ({ date, showSeconds = false, className = '' }) => {
  const d = new Date(date);
  
  // Format hours and minutes with leading zero if needed
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  
  if (showSeconds) {
    const seconds = d.getSeconds().toString().padStart(2, '0');
    return (
      <span className={`inline-flex items-center ${className}`}>
        <span>{hours}</span>
        <span className="animate-[pulse_1s_ease-in-out_infinite] mx-[1px] -translate-y-[1px]">:</span>
        <span>{minutes}</span>
        <span className="animate-[pulse_1s_ease-in-out_infinite] mx-[1px] -translate-y-[1px]">:</span>
        <span>{seconds}</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center ${className}`}>
      <span>{hours}</span>
      <span className="animate-[pulse_1s_ease-in-out_infinite] mx-[1px] -translate-y-[1px]">:</span>
      <span>{minutes}</span>
    </span>
  );
};

export default DigitalClock;
