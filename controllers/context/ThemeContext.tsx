import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeColor = 'pastel' | 'blue' | 'pink' | 'red' | 'green' | 'white' | 'black';

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

export const themes: Record<ThemeColor, Theme> = {
  pastel: { 
    bg: 'bg-orange-50', 
    text: 'text-gray-900', 
    cardBg: 'bg-white', 
    borderColor: 'border-orange-100',
    sidebarBg: 'bg-white',
    sidebarBorder: 'border-orange-100',
    sidebarText: 'text-gray-500',
    sidebarActiveBg: 'bg-orange-50',
    sidebarActiveText: 'text-orange-600'
  },
  blue: { 
    bg: 'bg-blue-50', 
    text: 'text-gray-900', 
    cardBg: 'bg-white', 
    borderColor: 'border-blue-100',
    sidebarBg: 'bg-white',
    sidebarBorder: 'border-blue-100',
    sidebarText: 'text-gray-500',
    sidebarActiveBg: 'bg-blue-50',
    sidebarActiveText: 'text-blue-600'
  },
  pink: { 
    bg: 'bg-pink-50', 
    text: 'text-gray-900', 
    cardBg: 'bg-white', 
    borderColor: 'border-pink-100',
    sidebarBg: 'bg-white',
    sidebarBorder: 'border-pink-100',
    sidebarText: 'text-gray-500',
    sidebarActiveBg: 'bg-pink-50',
    sidebarActiveText: 'text-pink-600'
  },
  red: { 
    bg: 'bg-red-50', 
    text: 'text-gray-900', 
    cardBg: 'bg-white', 
    borderColor: 'border-red-100',
    sidebarBg: 'bg-white',
    sidebarBorder: 'border-red-100',
    sidebarText: 'text-gray-500',
    sidebarActiveBg: 'bg-red-50',
    sidebarActiveText: 'text-red-600'
  },
  green: { 
    bg: 'bg-green-50', 
    text: 'text-gray-900', 
    cardBg: 'bg-white', 
    borderColor: 'border-green-100',
    sidebarBg: 'bg-white',
    sidebarBorder: 'border-green-100',
    sidebarText: 'text-gray-500',
    sidebarActiveBg: 'bg-green-50',
    sidebarActiveText: 'text-green-600'
  },
  white: { 
    bg: 'bg-gray-50', 
    text: 'text-gray-900', 
    cardBg: 'bg-white', 
    borderColor: 'border-gray-200',
    sidebarBg: 'bg-white',
    sidebarBorder: 'border-gray-200',
    sidebarText: 'text-gray-500',
    sidebarActiveBg: 'bg-gray-100',
    sidebarActiveText: 'text-gray-900'
  },
  black: { 
    bg: 'bg-gray-950', 
    text: 'text-gray-100', 
    cardBg: 'bg-gray-900', 
    borderColor: 'border-gray-800',
    sidebarBg: 'bg-gray-900',
    sidebarBorder: 'border-gray-800',
    sidebarText: 'text-gray-400',
    sidebarActiveBg: 'bg-gray-800',
    sidebarActiveText: 'text-white'
  },
};

interface ThemeContextType {
  currentTheme: ThemeColor;
  setTheme: (theme: ThemeColor) => void;
  themeClasses: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeColor>('white');

  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') as ThemeColor;
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  const setTheme = (theme: ThemeColor) => {
    setCurrentTheme(theme);
    localStorage.setItem('app-theme', theme);
  };

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      setTheme,
      themeClasses: themes[currentTheme]
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
