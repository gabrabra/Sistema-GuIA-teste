export const formatTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  // const s = seconds % 60; // Omit seconds usually for compact view, unless specified
  
  const hDisplay = h < 10 ? `0${h}` : h;
  const mDisplay = m < 10 ? `0${m}` : m;
  
  return `${hDisplay}h${mDisplay}min`;
};

export const formatTimeWithSeconds = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  
  const hDisplay = h < 10 ? `0${h}` : h;
  const mDisplay = m < 10 ? `0${m}` : m;
  const sDisplay = s < 10 ? `0${s}` : s;
  
  return `${hDisplay}:${mDisplay}:${sDisplay}`;
};

export const calculateDaysRemaining = (targetDate: string | null): number => {
  if (!targetDate) return 0;
  const now = new Date();
  const target = new Date(targetDate);
  const diffTime = Math.abs(target.getTime() - now.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  return target.getTime() < now.getTime() ? 0 : diffDays;
};
