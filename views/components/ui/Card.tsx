import React from 'react';
import { useTheme } from '../../../controllers/context/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, action }) => {
  const { themeClasses } = useTheme();
  
  return (
    <div className={`${themeClasses.cardBg} rounded-2xl p-6 shadow-sm border ${themeClasses.borderColor} ${className} transition-colors duration-300`}>
      {(title || action) && (
        <div className="flex justify-between items-center mb-4">
          {title && <h3 className={`text-lg font-bold ${themeClasses.text}`}>{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
