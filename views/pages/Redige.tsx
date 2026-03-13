import React, { useState, useRef, useEffect } from 'react';
import { 
  PenTool, Sparkles, Eraser, AlignLeft, Maximize2, Minimize2, 
  Lightbulb, CheckCheck, RefreshCw, Link, Briefcase, LayoutTemplate, 
  Paperclip, X
} from 'lucide-react';

interface PromptOption {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  iconColor: string;
}

const PROMPT_OPTIONS: PromptOption[] = [
  {
    icon: CheckCheck,
    title: "Corrigir Gramática",
    description: "Revise meu texto em busca de erros ortográficos e gramaticais.",
    color: "bg-green-100 border-green-200 hover:bg-green-200",
    iconColor: "text-green-700"
  },
  {
    icon: Link,
    title: "Melhorar Coesão",
    description: "Sugira conectivos e melhorias para tornar o texto mais fluido.",
    color: "bg-blue-100 border-blue-200 hover:bg-blue-200",
    iconColor: "text-blue-700"
  },
  {
    icon: RefreshCw,
    title: "Sugerir Sinônimos",
    description: "Encontre sinônimos para evitar repetições de palavras no texto.",
    color: "bg-purple-100 border-purple-200 hover:bg-purple-200",
    iconColor: "text-purple-700"
  },
  {
    icon: AlignLeft,
    title: "Avaliar Estrutura",
    description: "Analise se a estrutura argumentativa está clara e bem organizada.",
    color: "bg-orange-100 border-orange-200 hover:bg-orange-200",
    iconColor: "text-orange-700"
  },
  {
    icon: LayoutTemplate,
    title: "Esqueleto de Redação",
    description: "Crie um roteiro estruturado para um tema de redação específico.",
    color: "bg-rose-100 border-rose-200 hover:bg-rose-200",
    iconColor: "text-rose-700"
  },
  {
    icon: Maximize2,
    title: "Expandir Ideia",
    description: "Desenvolva melhor este parágrafo curto com mais argumentos.",
    color: "bg-pink-100 border-pink-200 hover:bg-pink-200",
    iconColor: "text-pink-700"
  },
  {
    icon: Minimize2,
    title: "Resumir Texto",
    description: "Sintetize o texto mantendo apenas os pontos principais.",
    color: "bg-sky-100 border-sky-200 hover:bg-sky-200",
    iconColor: "text-sky-700"
  },
  {
    icon: Briefcase,
    title: "Linguagem Formal",
    description: "Reescreva o texto adequando-o para a norma culta formal.",
    color: "bg-yellow-100 border-yellow-200 hover:bg-yellow-200",
    iconColor: "text-yellow-700"
  },
  {
    icon: Lightbulb,
    title: "Proposta de Intervenção",
    description: "Gere uma proposta de intervenção detalhada para o problema.",
    color: "bg-violet-100 border-violet-200 hover:bg-violet-200",
    iconColor: "text-violet-700"
  }
];

export const Redige: React.FC = () => {
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
        text: 'Entendido. Vou analisar seu texto com foco na escrita discursiva. Como posso ajudar a aprimorar sua redação hoje?' 
      }]);
      setIsLoading(false);
    }, 1500);
  };

  const handlePromptClick = (prompt: PromptOption) => {
    const text = `${prompt.title}: `;
    setInput(text);
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 h-full overflow-y-auto pb-2 pr-1 custom-scrollbar">
            {PROMPT_OPTIONS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handlePromptClick(prompt)}
                className={`flex flex-col items-start p-4 rounded-2xl border transition-all duration-300 text-left w-full min-h-[140px] hover:scale-[1.01] hover:shadow-md ${prompt.color}`}
              >
                <div className={`p-2 rounded-xl bg-white/60 mb-2 ${prompt.iconColor}`}>
                  <prompt.icon size={20} />
                </div>
                <h3 className="font-bold text-gray-800 mb-1 text-sm lg:text-base">{prompt.title}</h3>
                <p className="text-xs lg:text-sm text-gray-600 leading-relaxed line-clamp-3">{prompt.description}</p>
              </button>
            ))}
          </div>
        ) : (
          /* Chat History */
          <div className="h-full overflow-y-auto pr-2 custom-scrollbar space-y-6 pb-4">
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
              <div className="flex justify-start">
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
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Cole seu texto aqui para correção ou peça ajuda para escrever..."
          className="w-full p-3 max-h-32 bg-transparent border-none outline-none resize-none text-gray-700 placeholder-gray-400"
          rows={2}
        />
        <div className="flex justify-between items-center px-2 pb-1">
          <button className="text-gray-400 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-colors">
            <Paperclip size={20} />
          </button>
          <button 
            onClick={() => handleSend()} 
            disabled={isLoading || !input.trim()}
            className="bg-blue-200 text-blue-800 hover:bg-blue-600 hover:text-white px-6 py-2 rounded-xl font-bold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ENVIAR
          </button>
        </div>
      </div>
    </div>
  );
};
