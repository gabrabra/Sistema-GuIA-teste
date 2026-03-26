import React from 'react';
import { Sparkles } from 'lucide-react';
import { ChatKit, useChatKit } from '@openai/chatkit-react';
import { usePromptLimit } from '../hooks/usePromptLimit';
import { useAIProfile } from '../../controllers/context/AIProfileContext';

export const Responde: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const { getUserProfile } = useAIProfile();
  const profile = getUserProfile(user.aiProfileId);
  const maxPrompts = profile?.responde.promptsPerPeriod || 10;
  
  const { usedPrompts, hasReachedLimit, incrementUsage } = usePromptLimit('responde', maxPrompts);

  const { control } = useChatKit({
    api: {
      async getClientSecret() {
        // hasReachedLimit check removed for test mode
        
        const res = await fetch('/api/chatkit/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.id
          },
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Falha ao iniciar sessão de chat');
        }

        const { client_secret } = await res.json();
        // incrementUsage() removed for test mode
        return client_secret;
      },
    },
  });

  return (
    <div className="h-full flex flex-col gap-4 relative bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
      <header className="shrink-0 flex justify-between items-center mb-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Sparkles className="text-purple-600" /> Guia Responde
          </h2>
          <p className="text-gray-500 text-sm">
            Tira-dúvidas inteligente conectado ao seu workflow oficial.
          </p>
        </div>
        <div className="text-right">
             <span className={`text-xs font-medium px-2 py-1 rounded-full ${hasReachedLimit ? 'bg-red-100 text-red-600' : 'bg-purple-100 text-purple-600'}`}>
              {usedPrompts}/{maxPrompts} prompts usados
            </span>
        </div>
      </header>

      <div className="flex-1 min-h-[500px] rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 relative">
        <ChatKit 
          control={control} 
          className="absolute inset-0 h-full w-full"
        />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .chatkit-container {
          --chatkit-primary-color: #9333ea; /* Purple 600 */
          --chatkit-bg-color: transparent;
          font-family: 'Inter', sans-serif;
        }
        /* Customizing ChatKit internally if needed via CSS variables */
      `}} />
    </div>
  );
};
