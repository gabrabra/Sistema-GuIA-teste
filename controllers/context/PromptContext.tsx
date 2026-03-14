import React, { createContext, useState, useContext, useEffect } from 'react';

export interface PromptOption {
  id: string;
  iconName: string;
  title: string;
  description: string;
  promptContent: string;
  color: string;
  iconColor: string;
  category?: string;
}

interface PromptContextData {
  respondePrompts: PromptOption[];
  redigePrompts: PromptOption[];
  updateRespondePrompts: (prompts: PromptOption[]) => void;
  updateRedigePrompts: (prompts: PromptOption[]) => void;
}

const PromptContext = createContext<PromptContextData>({} as PromptContextData);

export const PromptProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [respondePrompts, setRespondePrompts] = useState<PromptOption[]>([]);
  const [redigePrompts, setRedigePrompts] = useState<PromptOption[]>([]);

  useEffect(() => {
    fetch('/api/prompts')
      .then(res => res.ok ? res.json() : [])
      .then((data: PromptOption[]) => {
        if (Array.isArray(data)) {
          setRespondePrompts(data.filter(p => p.category === 'responde'));
          setRedigePrompts(data.filter(p => p.category === 'redige'));
        }
      })
      .catch(err => console.error('Failed to fetch prompts', err));
  }, []);

  const syncPrompts = async (prompts: PromptOption[], category: string) => {
    try {
      // For simplicity in this migration, we'll just delete all for the category and re-insert
      // A more robust approach would be to diff and send individual PUT/POST/DELETE requests
      // But since the UI passes the whole array, we'll do it this way.
      
      // Delete existing
      const existingRes = await fetch('/api/prompts');
      const existing = await existingRes.json();
      
      if (Array.isArray(existing)) {
        const categoryExisting = existing.filter(p => p.category === category);
        
        for (const p of categoryExisting) {
          await fetch(`/api/prompts/${p.id}`, { method: 'DELETE' });
        }
      }

      // Insert new
      for (const p of prompts) {
        await fetch('/api/prompts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...p, category })
        });
      }
    } catch (err) {
      console.error('Failed to sync prompts', err);
    }
  };

  const updateRespondePrompts = (prompts: PromptOption[]) => {
    setRespondePrompts(prompts);
    syncPrompts(prompts, 'responde');
  };

  const updateRedigePrompts = (prompts: PromptOption[]) => {
    setRedigePrompts(prompts);
    syncPrompts(prompts, 'redige');
  };

  return (
    <PromptContext.Provider value={{ respondePrompts, redigePrompts, updateRespondePrompts, updateRedigePrompts }}>
      {children}
    </PromptContext.Provider>
  );
};

export const usePrompts = () => useContext(PromptContext);
