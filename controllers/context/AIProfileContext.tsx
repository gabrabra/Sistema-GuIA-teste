import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AIProfile } from '../../models/types';

interface AIProfileContextType {
  profiles: AIProfile[];
  getUserProfile: (profileId?: string) => AIProfile | undefined;
  addProfile: (profile: AIProfile) => Promise<void>;
  updateProfile: (id: string, profile: AIProfile) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  isLoading: boolean;
}

const AIProfileContext = createContext<AIProfileContextType | undefined>(undefined);

export const AIProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<AIProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await fetch('/api/ai-profiles');
        if (response.ok) {
          const data = await response.json();
          setProfiles(data);
        }
      } catch (error) {
        console.error('Failed to fetch AI profiles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  const getUserProfile = (profileId?: string) => {
    return profiles.find(p => p.id === profileId) || profiles[0]; // fallback to first profile if not found
  };

  const addProfile = async (profile: AIProfile) => {
    try {
      const response = await fetch('/api/ai-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (response.ok) {
        setProfiles(prev => [...prev, profile]);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add AI profile');
      }
    } catch (error) {
      console.error('Failed to add AI profile:', error);
      throw error;
    }
  };

  const updateProfile = async (id: string, profile: AIProfile) => {
    try {
      const response = await fetch(`/api/ai-profiles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (response.ok) {
        setProfiles(prev => prev.map(p => p.id === id ? profile : p));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update AI profile');
      }
    } catch (error) {
      console.error('Failed to update AI profile:', error);
      throw error;
    }
  };

  const deleteProfile = async (id: string) => {
    try {
      const response = await fetch(`/api/ai-profiles/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setProfiles(prev => prev.filter(p => p.id !== id));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete AI profile');
      }
    } catch (error) {
      console.error('Failed to delete AI profile:', error);
      throw error;
    }
  };

  return (
    <AIProfileContext.Provider value={{ profiles, getUserProfile, addProfile, updateProfile, deleteProfile, isLoading }}>
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
