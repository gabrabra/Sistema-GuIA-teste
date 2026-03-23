import React, { useState, useRef, useEffect } from 'react';
import { usePrompts } from '../../controllers/context/PromptContext';
import { useAIProfile } from '../../controllers/context/AIProfileContext';
import { usePromptLimit } from '../hooks/usePromptLimit';
import * as Icons from 'lucide-react';
import { 
  PenTool, Sparkles, Eraser, AlignLeft, Maximize2, Minimize2, 
  Lightbulb, CheckCheck, RefreshCw, Link, Briefcase, LayoutTemplate, 
  Paperclip, X
} from 'lucide-react';

export const Redige: React.FC = () => {
  const { redigePrompts } = usePrompts();
  const { getUserProfile } = useAIProfile();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const profile = getUserProfile(user.aiProfileId);
  const maxChars = profile?.redige.maxCharactersPerPrompt || 1000;
  const maxPrompts = profile?.redige.promptsPerPeriod || 10;
  
  const { usedPrompts, hasReachedLimit, incrementUsage } = usePromptLimit('redige', maxPrompts);

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    if (hasReachedLimit) {
      setMessages(prev => [...prev, { role: 'ai', text: `Você atingiu o limite de ${maxPrompts} prompts do seu período para o Guia Redige.` }]);
      return;
    }
    
    setMessages(prev => [...prev, { role: 'user', text: text }]);
    setInput('');
    setIsLoading(true);
    incrementUsage();

    try {
      const response = await fetch('/api/redige', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({ message: text }),
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error(`Server returned ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        const errorMsg = data.details ? `${data.error}: ${data.details}` : (data.error || 'Network response was not ok');
        throw new Error(errorMsg);
      }

      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: data.response || 'Desculpe, não consegui processar sua solicitação.' 
      }]);
    } catch (error: any) {
      console.error('Error calling Guia Redige:', error);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: `Ocorreu um erro: ${error.message || 'Falha ao conectar'}. Verifique as chaves de API.` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptClick = (prompt: any) => {
    setInput(prompt.promptContent || '');
  };

  const handleClearChat = () => {
    setMessages([]);
    setInput('');
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="h-full flex flex-col gap-4 relative">
      <header className="shrink-0 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <PenTool className="text-blue-600" /> Guia Redige
          </h2>
          {!hasMessages && <p className="text-gray-500 text-sm">Ferramentas de escrita para sua aprovação</p>}
        </div>
        
        {hasMessages && (
          <button 
            onClick={handleClearChat}
            className="p-2 bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 rounded-full transition-colors"
            title="Limpar conversa"
          >
            <X size={20} />
          </button>
        )}
      </header>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {!hasMessages ? (
          /* Prompts Grid - Responsive layout */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 h-full overflow-y-auto pb-2 pr-1 custom-scrollbar">
            {redigePrompts.map((prompt, idx) => {
              const IconComponent = (Icons as any)[prompt.iconName] || Icons.HelpCircle;
              return (
                <button
                  key={idx}
                  onClick={() => handlePromptClick(prompt)}
                  aria-label={`Usar prompt: ${prompt.title}`}
                  className={`flex flex-col items-start p-2.5 rounded-lg border transition-all duration-300 text-left w-full hover:scale-[1.01] hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 ${prompt.color}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 w-full">
                    <div className={`p-1 rounded bg-white/60 shrink-0 ${prompt.iconColor}`}>
                      <IconComponent size={14} aria-hidden="true" />
                    </div>
                    <h3 className="font-bold text-gray-800 text-xs lg:text-[13px] leading-tight truncate">{prompt.title}</h3>
                  </div>
                  <p className="text-[11px] lg:text-xs text-gray-600 leading-tight line-clamp-2">{prompt.description}</p>
                </button>
              );
            })}
          </div>
        ) : (
          /* Chat History */
          <div 
            className="h-full overflow-y-auto pr-2 custom-scrollbar space-y-6 pb-4"
            role="log"
            aria-live="polite"
            aria-atomic="false"
          >
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-5 rounded-3xl ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-200' 
                    : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none shadow-sm'
                }`}>
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start" aria-label="Carregando resposta" role="status">
                <div className="bg-white border border-gray-100 p-4 rounded-3xl rounded-bl-none flex gap-2 shadow-sm">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100" />
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area - Fixed at Bottom */}
      <div className="bg-white p-2 rounded-3xl border-2 border-blue-100 focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-50 transition-all shadow-sm shrink-0">
        <textarea
          value={input || ''}
          onChange={e => {
            if (e.target.value.length <= maxChars) {
              setInput(e.target.value);
            }
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={`Cole seu texto aqui. Limite: ${maxChars} caracteres.`}
          aria-label="Texto para o GuIA Redige"
          className="w-full p-3 min-h-[160px] max-h-72 bg-transparent border-none outline-none resize-none text-gray-700 placeholder-gray-400 focus:ring-0"
          rows={6}
          maxLength={maxChars}
        />
        <div className="flex justify-between items-center px-2 pb-1">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400" aria-live="polite">{input.length}/{maxChars} caracteres</span>
            <span className={`text-xs ${hasReachedLimit ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
              {usedPrompts}/{maxPrompts} prompts no período
            </span>
          </div>
          <button 
            onClick={() => handleSend()} 
            disabled={isLoading || !input.trim() || hasReachedLimit}
            aria-label="Enviar texto"
            className="bg-blue-200 text-blue-800 hover:bg-blue-600 hover:text-white px-6 py-2 rounded-xl font-bold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
          >
            ENVIAR
          </button>
        </div>
      </div>
    </div>
  );
};
