import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { usePrompts } from '../../controllers/context/PromptContext';
import { useAIProfile } from '../../controllers/context/AIProfileContext';
import * as Icons from 'lucide-react';
import { 
  Send, Sparkles, BookOpen, Baby, Brain, Table2, Languages, 
  Paperclip, FileQuestion, Briefcase, HelpCircle, Scale, Key, X
} from 'lucide-react';

export const Responde: React.FC = () => {
  const { respondePrompts } = usePrompts();
  const { getUserProfile } = useAIProfile();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const profile = getUserProfile(user.aiProfileId);
  const maxChars = profile?.responde.maxCharactersPerPrompt || 1000;

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

  const handleSend = (text: string = input) => {
    if (!text.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', text: text }]);
    setInput('');
    setIsLoading(true);

    // Mock Response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: 'Essa é uma resposta simulada do GuIA. Estou processando sua solicitação baseada no contexto do seu estudo para concurso público. Como posso detalhar mais?' 
      }]);
      setIsLoading(false);
    }, 1500);
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
            <Sparkles className="text-purple-600" /> Guia Responde
          </h2>
          {!hasMessages && <p className="text-gray-500 text-sm">Sugestões de Prompts que podem te ajudar</p>}
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
            {respondePrompts.map((prompt, idx) => {
              const IconComponent = (Icons as any)[prompt.iconName] || Icons.HelpCircle;
              return (
                <button
                  key={idx}
                  onClick={() => handlePromptClick(prompt)}
                  aria-label={`Usar prompt: ${prompt.title}`}
                  className={`flex flex-col items-start p-2.5 rounded-lg border transition-all duration-300 text-left w-full hover:scale-[1.01] hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-1 ${prompt.color}`}
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
                    ? 'bg-purple-600 text-white rounded-br-none shadow-md shadow-purple-200' 
                    : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none shadow-sm'
                }`}>
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start" aria-label="Carregando resposta" role="status">
                <div className="bg-white border border-gray-100 p-4 rounded-3xl rounded-bl-none flex gap-2 shadow-sm">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100" />
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area - Fixed at Bottom */}
      <div className="bg-white p-2 rounded-3xl border-2 border-purple-100 focus-within:border-purple-300 focus-within:ring-4 focus-within:ring-purple-50 transition-all shadow-sm shrink-0">
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
          placeholder={`Posso te ajudar. Limite: ${maxChars} caracteres.`}
          aria-label="Mensagem para o GuIA"
          className="w-full p-3 min-h-[160px] max-h-72 bg-transparent border-none outline-none resize-none text-gray-700 placeholder-gray-400 focus:ring-0"
          rows={6}
          maxLength={maxChars}
        />
        <div className="flex justify-between items-center px-2 pb-1">
          <span className="text-xs text-gray-400" aria-live="polite">{input.length}/{maxChars}</span>
          <button 
            onClick={() => handleSend()} 
            disabled={isLoading || !input.trim()}
            aria-label="Enviar mensagem"
            className="bg-purple-200 text-purple-800 hover:bg-purple-600 hover:text-white px-6 py-2 rounded-xl font-bold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-1"
          >
            ENVIAR
          </button>
        </div>
      </div>
    </div>
  );
};
