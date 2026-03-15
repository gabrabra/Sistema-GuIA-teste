import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AIProfile } from '../../models/types';

interface AIProfileContextType {
  profiles: AIProfile[];
  getUserProfile: (profileId?: string) => AIProfile | undefined;
}

const AIProfileContext = createContext<AIProfileContextType | undefined>(undefined);

export const AIProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<AIProfile[]>([
    { 
      id: '1', 
      name: 'Básico', 
      responde: { promptsPerDay: 10, maxCharactersPerPrompt: 500 },
      redige: { promptsPerDay: 5, maxCharactersPerPrompt: 1000 }
    },
  ]);

  const getUserProfile = (profileId?: string) => {
    return profiles.find(p => p.id === profileId);
  };

  return (
    <AIProfileContext.Provider value={{ profiles, getUserProfile }}>
      {children}
    </AIProfileContext.Provider>
  );
};

export const useAIProfile = () => {
  const context = useContext(AIProfileContext);
  if (context === undefined) {
    throw new Error('useAIProfile must be used within an AIProfileProvider');
  }
  return context;
};
