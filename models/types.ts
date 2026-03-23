export interface Permission {
  id: string;
  name: string;
  description: string;
  module: 'dashboard' | 'planeja' | 'ciclo' | 'responde' | 'redige' | 'configuracoes';
}

export interface Role {
  id: string;
  name: string;
  permissions: string[]; // List of Permission IDs
}

export interface AIProfile {
  id: string;
  name: string;
  periodicity: 'daily' | 'weekly' | 'monthly';
  responde: {
    promptsPerPeriod: number;
    maxCharactersPerPrompt: number;
  };
  redige: {
    promptsPerPeriod: number;
    maxCharactersPerPrompt: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  roleId: string;
  status: 'active' | 'inactive';
  createdAt: string;
  aiProfileId?: string;
}

export interface Assunto {
  id: string;
  nome: string;
  concluido: boolean;
  dataEstudo?: string; // ISO string of when it was first studied
  revisoesConcluidas?: string[]; // '24h', '7d', '30d', etc.
}

export interface Materia {
  id: string;
  nome: string;
  assuntos: Assunto[];
  isGlobal?: boolean;
}

export interface SessaoEstudo {
  id: string;
  data: string; // ISO string
  segundos: number;
  assunto: string;
}

export interface Disciplina {
  id: string;
  nome: string;
  peso: number;
  horasSemanaMeta: number;
  horasEstudadasTotal: number;
  horasEstudadasHoje: number;
  concluida: boolean;
  materiaId?: string; // Link to the repository Materia
  historico: SessaoEstudo[];
}

export interface HistoricoEstudo {
  data: string; // YYYY-MM-DD
  segundos: number;
}

export interface Payment {
  id: string;
  userId: string;
  planName: string;
  amount: number;
  status: 'active' | 'canceled' | 'past_due';
  startDate: string; // ISO string
  nextBillingDate: string; // ISO string
  paymentMethodLast4: string;
  subscriberName: string;
}

export interface Concurso {
  id?: string;
  userId: string;
  orgao: string;
  nome: string;
  possuiEdital: boolean;
  dataProva: string | null;
  horasSemanaMeta?: number;
  diasDisponiveis?: string[];
}

export interface StudyContextType {
  // State
  concursoSelecionado: Concurso | null;
  disciplinas: Disciplina[];
  materias: Materia[]; // Repository of subjects/topics
  horasSemanaMeta: number;
  diasDisponiveis: string[];
  horasEstudadasHoje: number; // em segundos
  historicoEstudos: HistoricoEstudo[];
  isTimerRunning: boolean;
  activeSubjectId: string | null;
  activeTopic: string | null;
  currentSessionSeconds: number;
  isPauseModalOpen: boolean;
  isFinishModalOpen: boolean;

  // Actions
  setConcursoSelecionado: (c: Concurso) => void;
  deleteConcurso: () => void;
  setDisciplinas: (d: Disciplina[]) => void;
  setMaterias: (m: Materia[]) => void;
  addMateria: (nome: string, id?: string) => void;
  updateMateria: (id: string, nome: string) => void;
  deleteMateria: (id: string) => void;
  addAssunto: (materiaId: string, nome: string) => void;
  updateAssunto: (materiaId: string, assuntoId: string, updates: Partial<Assunto>) => void;
  deleteAssunto: (materiaId: string, assuntoId: string) => void;
  setMetaSemanal: (horas: number, dias: string[]) => void;
  iniciarCronometro: (disciplinaId?: string, topico?: string) => void;
  pausarCronometro: () => void;
  salvarSessaoEstudo: (concluido: boolean) => void;
  excluirSessaoEstudo: (disciplinaId: string, sessaoId: string) => void;
  setIsPauseModalOpen: (open: boolean) => void;
  setIsFinishModalOpen: (open: boolean) => void;
  adicionarHorasManualmente: (disciplinaId: string, minutos: number, topico?: string) => void;
  resetarDia: () => void;
}
