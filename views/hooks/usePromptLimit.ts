import { useState, useEffect } from 'react';

export function usePromptLimit(module: 'responde' | 'redige', maxPrompts: number) {
  const [usedPrompts, setUsedPrompts] = useState(0);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id || 'anonymous';

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const key = `ai_usage_${userId}_${module}_${today}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      setUsedPrompts(parseInt(stored, 10));
    } else {
      setUsedPrompts(0);
    }
  }, [module, userId]);

  const incrementUsage = () => {
    const today = new Date().toISOString().split('T')[0];
    const key = `ai_usage_${userId}_${module}_${today}`;
    const newCount = usedPrompts + 1;
    localStorage.setItem(key, newCount.toString());
    setUsedPrompts(newCount);
  };

  const hasReachedLimit = usedPrompts >= maxPrompts;

  return { usedPrompts, hasReachedLimit, incrementUsage };
}
