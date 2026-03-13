import React, { createContext, useContext, useState, useEffect } from 'react';

interface MenuVisibility {
  dashboard: boolean;
  planeja: boolean;
  ciclo: boolean;
  revisoes: boolean;
  responde: boolean;
  redige: boolean;
  produtos: boolean;
}

interface MenuContextType {
  menuVisibility: MenuVisibility;
  toggleMenuVisibility: (key: keyof MenuVisibility) => void;
}

const defaultVisibility: MenuVisibility = {
  dashboard: true,
  planeja: true,
  ciclo: true,
  revisoes: true,
  responde: true,
  redige: true,
  produtos: true,
};

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [menuVisibility, setMenuVisibility] = useState<MenuVisibility>(() => {
    const saved = localStorage.getItem('menuVisibility');
    return saved ? JSON.parse(saved) : defaultVisibility;
  });

  useEffect(() => {
    localStorage.setItem('menuVisibility', JSON.stringify(menuVisibility));
  }, [menuVisibility]);

  const toggleMenuVisibility = (key: keyof MenuVisibility) => {
    setMenuVisibility(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <MenuContext.Provider value={{ menuVisibility, toggleMenuVisibility }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) throw new Error('useMenu must be used within MenuProvider');
  return context;
};
