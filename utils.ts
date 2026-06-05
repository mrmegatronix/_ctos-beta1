export const formatDate = (date: Date | string): string => {
  try {
    return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(date));
  } catch (e) { return String(date); }
};

export const formatTime = (date: Date | string): string => {
  try {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(date));
  } catch (e) { return String(date); }
};

export const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const isSameDay = (d1: Date, d2: Date): boolean => {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

export const getEventsForDay = (events: any[], day: Date) => {
  return events.filter(e => isSameDay(new Date(e.start), day));
};

export const generateId = () => Math.random().toString(36).substr(2, 9);
