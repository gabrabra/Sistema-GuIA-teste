import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  color?: string;
  height?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  color = 'bg-blue-600', 
  height = 'h-2' 
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${height}`}>
      <div 
        className={`${color} transition-all duration-500 ease-out h-full rounded-full`} 
        style={{ width: `${clampedProgress}%` }}
      />
    </div>
  );
};
