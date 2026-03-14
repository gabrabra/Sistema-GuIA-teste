import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useTheme } from './ThemeContext';

interface UserSettings {
  concursoObjetivo: string | null;
  preferences: Record<string, any>;
}

interface UserSettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  isLoading: boolean;
}

const UserSettingsContext = createContext<UserSettingsContextType | undefined>(undefined);

export const UserSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>({
    concursoObjetivo: null,
    preferences: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const { setTheme, setIntensity } = useTheme();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id;

  const fetchWithAuth = useCallback((url: string, options: RequestInit = {}) => {
    const headers = {
      ...options.headers,
      'x-user-id': userId
    };
    return fetch(url, { ...options, headers });
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchWithAuth('/api/user-settings')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            setSettings({
              concursoObjetivo: data.concursoObjetivo,
              preferences: data.preferences || {}
            });
            if (data.theme) setTheme(data.theme);
            if (data.themeIntensity) setIntensity(data.themeIntensity);
          }
        })
        .catch(err => console.error('Failed to fetch user settings', err))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [userId, fetchWithAuth, setTheme, setIntensity]);

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    if (userId) {
      try {
        await fetchWithAuth('/api/user-settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedSettings)
        });
      } catch (err) {
        console.error('Failed to update user settings', err);
      }
    }
  };

  return (
    <UserSettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </UserSettingsContext.Provider>
  );
};

export const useUserSettings = () => {
  const context = useContext(UserSettingsContext);
  if (context === undefined) {
    throw new Error('useUserSettings must be used within a UserSettingsProvider');
  }
  return context;
};
