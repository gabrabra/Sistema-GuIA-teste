import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { StudyContextType, Concurso, Disciplina, HistoricoEstudo, Materia } from '../../models/types';

const StudyContext = createContext<StudyContextType | undefined>(undefined);

// Initial Empty Data
const INITIAL_DISCIPLINAS: Disciplina[] = [];
const INITIAL_MATERIAS: Materia[] = [];

const INITIAL_CONCURSO: Concurso | null = null;

const INITIAL_HISTORY: HistoricoEstudo[] = [
  { data: 'Dom', segundos: 0 },
  { data: 'Seg', segundos: 0 },
  { data: 'Ter', segundos: 0 },
  { data: 'Qua', segundos: 0 },
  { data: 'Qui', segundos: 0 },
  { data: 'Sex', segundos: 0 },
  { data: 'Sab', segundos: 0 },
];

export const StudyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [concursoSelecionado, setConcursoSelecionado] = useState<Concurso | null>(INITIAL_CONCURSO);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>(INITIAL_DISCIPLINAS);
  const [materias, setMaterias] = useState<Materia[]>(INITIAL_MATERIAS);
  const [horasSemanaMeta, setHorasSemanaMeta] = useState<number>(0); 
  const [diasDisponiveis, setDiasDisponiveis] = useState<string[]>([]);
  const [horasEstudadasHoje, setHorasEstudadasHoje] = useState<number>(0);
  const [historicoEstudos, setHistoricoEstudos] = useState<HistoricoEstudo[]>(INITIAL_HISTORY);
  
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [currentSessionSeconds, setCurrentSessionSeconds] = useState(0);

  // Timer Logic
  useEffect(() => {
    let interval: any;

    if (isTimerRunning) {
      interval = setInterval(() => {
        setHorasEstudadasHoje((prev) => prev + 1);
        setCurrentSessionSeconds((prev) => prev + 1);
        
        if (activeSubjectId) {
          setDisciplinas((prevDisciplinas) => 
            prevDisciplinas.map((d) => 
              d.id === activeSubjectId 
                ? { ...d, horasEstudadasHoje: d.horasEstudadasHoje + 1, horasEstudadasTotal: d.horasEstudadasTotal + 1 }
                : d
            )
          );
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isTimerRunning, activeSubjectId]);

  const iniciarCronometro = useCallback((disciplinaId?: string, topico?: string) => {
    if (disciplinaId) {
      setActiveSubjectId(disciplinaId);
      setActiveTopic(topico || null);
      setCurrentSessionSeconds(0);

      // Set dataEstudo to today if it's the first time studying this topic
      if (topico) {
        const disciplina = disciplinas.find(d => d.id === disciplinaId);
        if (disciplina?.materiaId) {
          setMaterias(prev => prev.map(m => {
            if (m.id === disciplina.materiaId) {
              return {
                ...m,
                assuntos: m.assuntos.map(a => {
                  if (a.nome === topico && !a.dataEstudo) {
                    return { ...a, dataEstudo: new Date().toISOString() };
                  }
                  return a;
                })
              };
            }
            return m;
          }));
        }
      }
    }
    setIsTimerRunning(true);
  }, [disciplinas]);

  const pausarCronometro = useCallback(() => {
    setIsTimerRunning(false);
    
    if (activeSubjectId && currentSessionSeconds > 0) {
        setDisciplinas(prev => prev.map(d => {
            if (d.id === activeSubjectId) {
                const newHistory = {
                    id: crypto.randomUUID(),
                    data: new Date().toISOString(),
                    segundos: currentSessionSeconds,
                    assunto: activeTopic || 'Estudo Livre'
                };
                return {
                    ...d,
                    historico: [...(d.historico || []), newHistory]
                };
            }
            return d;
        }));
    }

    setActiveSubjectId(null);
    setActiveTopic(null);
    setCurrentSessionSeconds(0);
  }, [activeSubjectId, activeTopic, currentSessionSeconds]);

  const adicionarHorasManualmente = useCallback((disciplinaId: string, minutos: number, topico?: string) => {
    const segundos = minutos * 60;
    setHorasEstudadasHoje((prev) => prev + segundos);
    setDisciplinas((prev) => 
      prev.map(d => {
        if (d.id === disciplinaId) {
            const newHistory = {
                id: crypto.randomUUID(),
                data: new Date().toISOString(),
                segundos: segundos,
                assunto: topico || 'Estudo Manual'
            };
            return { 
                ...d, 
                horasEstudadasHoje: d.horasEstudadasHoje + segundos, 
                horasEstudadasTotal: d.horasEstudadasTotal + segundos,
                historico: [...(d.historico || []), newHistory]
            };
        }
        return d;
      })
    );
  }, []);

  const setMetaSemanal = useCallback((horas: number, dias: string[]) => {
    setHorasSemanaMeta(horas);
    setDiasDisponiveis(dias);
  }, []);

  const resetarDia = () => {
    setHorasEstudadasHoje(0);
    setDisciplinas(prev => prev.map(d => ({ ...d, horasEstudadasHoje: 0 })));
  };

  const addMateria = useCallback((nome: string, id?: string) => {
    const novaMateria: Materia = {
      id: id || crypto.randomUUID(),
      nome,
      assuntos: []
    };
    setMaterias(prev => [...prev, novaMateria]);
  }, []);

  const addAssunto = useCallback((materiaId: string, nome: string) => {
    setMaterias(prev => prev.map(m => {
      if (m.id === materiaId) {
        return {
          ...m,
          assuntos: [...m.assuntos, { id: crypto.randomUUID(), nome, concluido: false, revisoesConcluidas: [] }]
        };
      }
      return m;
    }));
  }, []);

  const updateAssunto = useCallback((materiaId: string, assuntoId: string, updates: Partial<Materia['assuntos'][0]>) => {
    setMaterias(prev => prev.map(m => {
      if (m.id === materiaId) {
        return {
          ...m,
          assuntos: m.assuntos.map(a => a.id === assuntoId ? { ...a, ...updates } : a)
        };
      }
      return m;
    }));
  }, []);

  const deleteAssunto = useCallback((materiaId: string, assuntoId: string) => {
    setMaterias(prev => prev.map(m => {
      if (m.id === materiaId) {
        return {
          ...m,
          assuntos: m.assuntos.filter(a => a.id !== assuntoId)
        };
      }
      return m;
    }));
  }, []);

  return (
    <StudyContext.Provider value={{
      concursoSelecionado,
      disciplinas,
      materias,
      horasSemanaMeta,
      diasDisponiveis,
      horasEstudadasHoje,
      historicoEstudos,
      isTimerRunning,
      activeSubjectId,
      activeTopic,
      currentSessionSeconds,
      setConcursoSelecionado,
      setDisciplinas,
      setMaterias,
      addMateria,
      addAssunto,
      updateAssunto,
      deleteAssunto,
      setMetaSemanal,
      iniciarCronometro,
      pausarCronometro,
      adicionarHorasManualmente,
      resetarDia
    }}>
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (context === undefined) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};