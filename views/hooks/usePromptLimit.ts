import { useState, useEffect } from 'react';

export function usePromptLimit(module: 'responde' | 'redige', maxPrompts: number) {
  const [usedPrompts, setUsedPrompts] = useState(0);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id || 'anonymous';

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const response = await fetch(`/api/usage/${module}`, {
          headers: { 'x-user-id': userId }
        });
        if (response.ok) {
          const data = await response.json();
          setUsedPrompts(data.count);
        }
      } catch (err) {
        console.error('Error fetching usage:', err);
      }
    };
    fetchUsage();
  }, [module, userId]);

  const incrementUsage = () => {
    // The backend now handles the logging and counting, so we just update locally for UI
    setUsedPrompts(prev => prev + 1);
  };

  const hasReachedLimit = usedPrompts >= maxPrompts;

  return { usedPrompts, hasReachedLimit, incrementUsage };
}
