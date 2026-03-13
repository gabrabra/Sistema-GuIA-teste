import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeColor = 'pastel' | 'blue' | 'pink' | 'red' | 'green' | 'white' | 'black';
export type ThemeIntensity = 'light' | 'medium' | 'dark';

interface Theme {
  bg: string;
  text: string;
  cardBg: string;
  borderColor: string;
  sidebarBg: string;
  sidebarBorder: string;
  sidebarText: string;
  sidebarActiveBg: string;
  sidebarActiveText: string;
}

const colorMap: Record<string, Record<ThemeIntensity, { bg: string, border: string, activeBg: string }>> = {
  pastel: {
    light: { bg: 'bg-orange-50', border: 'border-orange-100', activeBg: 'bg-orange-50' },
    medium: { bg: 'bg-orange-100', border: 'border-orange-200', activeBg: 'bg-orange-100' },
    dark: { bg: 'bg-orange-200', border: 'border-orange-300', activeBg: 'bg-orange-200' },
  },
  blue: {
    light: { bg: 'bg-blue-50', border: 'border-blue-100', activeBg: 'bg-blue-50' },
    medium: { bg: 'bg-blue-100', border: 'border-blue-200', activeBg: 'bg-blue-100' },
    dark: { bg: 'bg-blue-200', border: 'border-blue-300', activeBg: 'bg-blue-200' },
  },
  pink: {
    light: { bg: 'bg-pink-50', border: 'border-pink-100', activeBg: 'bg-pink-50' },
    medium: { bg: 'bg-pink-100', border: 'border-pink-200', activeBg: 'bg-pink-100' },
    dark: { bg: 'bg-pink-200', border: 'border-pink-300', activeBg: 'bg-pink-200' },
  },
  red: {
    light: { bg: 'bg-red-50', border: 'border-red-100', activeBg: 'bg-red-50' },
    medium: { bg: 'bg-red-100', border: 'border-red-200', activeBg: 'bg-red-100' },
    dark: { bg: 'bg-red-200', border: 'border-red-300', activeBg: 'bg-red-200' },
  },
  green: {
    light: { bg: 'bg-green-50', border: 'border-green-100', activeBg: 'bg-green-50' },
    medium: { bg: 'bg-green-100', border: 'border-green-200', activeBg: 'bg-green-100' },
    dark: { bg: 'bg-green-200', border: 'border-green-300', activeBg: 'bg-green-200' },
  }
};

const textColors: Record<string, string> = {
  pastel: 'text-orange-600',
  blue: 'text-blue-600',
  pink: 'text-pink-600',
  red: 'text-red-600',
  green: 'text-green-600',
};

export const getTheme = (color: ThemeColor, intensity: ThemeIntensity): Theme => {
  if (color === 'white') {
    return { 
      bg: 'bg-gray-50', 
      text: 'text-gray-900', 
      cardBg: 'bg-white', 
      borderColor: 'border-gray-200',
      sidebarBg: 'bg-white',
      sidebarBorder: 'border-gray-200',
      sidebarText: 'text-gray-500',
      sidebarActiveBg: 'bg-gray-100',
      sidebarActiveText: 'text-gray-900'
    };
  }
  if (color === 'black') {
    return { 
      bg: 'bg-gray-950', 
      text: 'text-gray-100', 
      cardBg: 'bg-gray-900', 
      borderColor: 'border-gray-800',
      sidebarBg: 'bg-gray-900',
      sidebarBorder: 'border-gray-800',
      sidebarText: 'text-gray-400',
      sidebarActiveBg: 'bg-gray-800',
      sidebarActiveText: 'text-white'
    };
  }

  const mapped = colorMap[color][intensity];
  const activeText = textColors[color];

  return {
    bg: mapped.bg,
    text: 'text-gray-900',
    cardBg: 'bg-white',
    borderColor: mapped.border,
    sidebarBg: 'bg-white',
    sidebarBorder: mapped.border,
    sidebarText: 'text-gray-500',
    sidebarActiveBg: mapped.activeBg,
    sidebarActiveText: activeText
  };
};

interface ThemeContextType {
  currentTheme: ThemeColor;
  setTheme: (theme: ThemeColor) => void;
  intensity: ThemeIntensity;
  setIntensity: (intensity: ThemeIntensity) => void;
  themeClasses: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeColor>('white');
  const [intensity, setCurrentIntensity] = useState<ThemeIntensity>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') as ThemeColor;
    const savedIntensity = localStorage.getItem('app-theme-intensity') as ThemeIntensity;
    if (savedTheme) {
      setCurrentTheme(savedTheme);
    }
    if (savedIntensity) {
      setCurrentIntensity(savedIntensity);
    }
  }, []);

  const setTheme = (theme: ThemeColor) => {
    setCurrentTheme(theme);
    localStorage.setItem('app-theme', theme);
  };

  const setIntensity = (newIntensity: ThemeIntensity) => {
    setCurrentIntensity(newIntensity);
    localStorage.setItem('app-theme-intensity', newIntensity);
  };

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      setTheme,
      intensity,
      setIntensity,
      themeClasses: getTheme(currentTheme, intensity)
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
