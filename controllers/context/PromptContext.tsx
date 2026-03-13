import React, { createContext, useState, useContext } from 'react';

export interface PromptOption {
  id: string;
  iconName: string;
  title: string;
  description: string;
  color: string;
  iconColor: string;
}

interface PromptContextData {
  respondePrompts: PromptOption[];
  redigePrompts: PromptOption[];
  updateRespondePrompts: (prompts: PromptOption[]) => void;
  updateRedigePrompts: (prompts: PromptOption[]) => void;
}

const PromptContext = createContext<PromptContextData>({} as PromptContextData);

const DEFAULT_RESPONDE_PROMPTS: PromptOption[] = [
  { id: 'r1', iconName: 'Baby', title: "Ensine para uma criança", description: "Vou responder a questão da maneira mais didática possível, com exemplos.", color: "bg-green-100 border-green-200 hover:bg-green-200", iconColor: "text-green-700" },
  { id: 'r2', iconName: 'FileQuestion', title: "Elaborar questão da banca", description: "Te ajudo a criar questões da banca, só me dizer qual e a modalidade escolhida.", color: "bg-lime-100 border-lime-200 hover:bg-lime-200", iconColor: "text-lime-700" },
  { id: 'r3', iconName: 'Brain', title: "Regra mental para prova", description: "Vou responder a questão da maneira mais didática possível, com exemplos.", color: "bg-purple-100 border-purple-200 hover:bg-purple-200", iconColor: "text-purple-700" },
  { id: 'r4', iconName: 'Briefcase', title: "Exemplos práticos", description: "Vou te dar exemplos práticos e reais do Serviço Público para você entender.", color: "bg-orange-100 border-orange-200 hover:bg-orange-200", iconColor: "text-orange-700" },
  { id: 'r5', iconName: 'HelpCircle', title: "Não entendeu? Explico", description: "Quer saber o porquê do porquê? Eu te explico nos mínimos detalhes.", color: "bg-rose-100 border-rose-200 hover:bg-rose-200", iconColor: "text-rose-700" },
  { id: 'r6', iconName: 'Scale', title: "Comparativo de conceito", description: "Se ficou em dúvida entre alguns conceitos eu explico de outra forma até você entender.", color: "bg-pink-100 border-pink-200 hover:bg-pink-200", iconColor: "text-pink-700" },
  { id: 'r7', iconName: 'Table2', title: "Tabela Resumo", description: "Para te ajudar a memorizar o conteúdo vou construir uma tabela resumo.", color: "bg-sky-100 border-sky-200 hover:bg-sky-200", iconColor: "text-sky-700" },
  { id: 'r8', iconName: 'Languages', title: "Tradução da linguagem", description: "Simplifico o 'juridiquês' da banca para facilitar tua vida.", color: "bg-yellow-100 border-yellow-200 hover:bg-yellow-200", iconColor: "text-yellow-700" },
  { id: 'r9', iconName: 'Key', title: "Frase chave memorização", description: "Crio os famosos 'mnemônicos' para ajudar a memorizar aquele conteúdo.", color: "bg-violet-100 border-violet-200 hover:bg-violet-200", iconColor: "text-violet-700" }
];

const DEFAULT_REDIGE_PROMPTS: PromptOption[] = [
  { id: 'w1', iconName: 'CheckCheck', title: "Corrigir Gramática", description: "Revise meu texto em busca de erros ortográficos e gramaticais.", color: "bg-green-100 border-green-200 hover:bg-green-200", iconColor: "text-green-700" },
  { id: 'w2', iconName: 'Link', title: "Melhorar Coesão", description: "Sugira conectivos e melhorias para tornar o texto mais fluido.", color: "bg-blue-100 border-blue-200 hover:bg-blue-200", iconColor: "text-blue-700" },
  { id: 'w3', iconName: 'RefreshCw', title: "Sugerir Sinônimos", description: "Encontre sinônimos para evitar repetições de palavras no texto.", color: "bg-purple-100 border-purple-200 hover:bg-purple-200", iconColor: "text-purple-700" },
  { id: 'w4', iconName: 'AlignLeft', title: "Avaliar Estrutura", description: "Analise se a estrutura argumentativa está clara e bem organizada.", color: "bg-orange-100 border-orange-200 hover:bg-orange-200", iconColor: "text-orange-700" },
  { id: 'w5', iconName: 'LayoutTemplate', title: "Esqueleto de Redação", description: "Crie um roteiro estruturado para um tema de redação específico.", color: "bg-rose-100 border-rose-200 hover:bg-rose-200", iconColor: "text-rose-700" },
  { id: 'w6', iconName: 'Maximize2', title: "Expandir Ideia", description: "Desenvolva melhor este parágrafo curto com mais argumentos.", color: "bg-pink-100 border-pink-200 hover:bg-pink-200", iconColor: "text-pink-700" },
  { id: 'w7', iconName: 'Minimize2', title: "Resumir Texto", description: "Sintetize o texto mantendo apenas os pontos principais.", color: "bg-sky-100 border-sky-200 hover:bg-sky-200", iconColor: "text-sky-700" },
  { id: 'w8', iconName: 'Briefcase', title: "Linguagem Formal", description: "Reescreva o texto adequando-o para a norma culta formal.", color: "bg-yellow-100 border-yellow-200 hover:bg-yellow-200", iconColor: "text-yellow-700" },
  { id: 'w9', iconName: 'Lightbulb', title: "Proposta de Intervenção", description: "Gere uma proposta de intervenção detalhada para o problema.", color: "bg-violet-100 border-violet-200 hover:bg-violet-200", iconColor: "text-violet-700" }
];

export const PromptProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [respondePrompts, setRespondePrompts] = useState<PromptOption[]>(() => {
    const saved = localStorage.getItem('@Guia:respondePrompts');
    return saved ? JSON.parse(saved) : DEFAULT_RESPONDE_PROMPTS;
  });

  const [redigePrompts, setRedigePrompts] = useState<PromptOption[]>(() => {
    const saved = localStorage.getItem('@Guia:redigePrompts');
    return saved ? JSON.parse(saved) : DEFAULT_REDIGE_PROMPTS;
  });

  const updateRespondePrompts = (prompts: PromptOption[]) => {
    setRespondePrompts(prompts);
    localStorage.setItem('@Guia:respondePrompts', JSON.stringify(prompts));
  };

  const updateRedigePrompts = (prompts: PromptOption[]) => {
    setRedigePrompts(prompts);
    localStorage.setItem('@Guia:redigePrompts', JSON.stringify(prompts));
  };

  return (
    <PromptContext.Provider value={{ respondePrompts, redigePrompts, updateRespondePrompts, updateRedigePrompts }}>
      {children}
    </PromptContext.Provider>
  );
};

export const usePrompts = () => useContext(PromptContext);
