import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { StudyContextType, Concurso, Disciplina, HistoricoEstudo, Materia } from '../../models/types';

const StudyContext = createContext<StudyContextType | undefined>(undefined);

// Initial Empty Data
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
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id;

  const fetchWithAuth = useCallback((url: string, options: RequestInit = {}) => {
    const headers = {
      ...options.headers,
      'x-user-id': userId
    };
    return fetch(url, { ...options, headers });
  }, [userId]);

  const [concursoSelecionado, setConcursoSelecionadoState] = useState<Concurso | null>(null);

  useEffect(() => {
    if (userId) {
      fetchWithAuth('/api/concursos')
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          if (Array.isArray(data) && data.length > 0) setConcursoSelecionadoState(data[0]);
        })
        .catch(err => console.error('Failed to fetch concurso', err));
    }
  }, [userId, fetchWithAuth]);

  const setConcursoSelecionado = useCallback((c: Concurso | null) => {
    if (c && !c.id) {
      c.id = crypto.randomUUID();
    }
    setConcursoSelecionadoState(c);
    if (c && userId) {
      fetchWithAuth('/api/concursos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...c, userId })
      }).catch(err => console.error('Failed to save concurso', err));
    }
  }, [userId, fetchWithAuth]);

  const deleteConcurso = useCallback(async () => {
    if (concursoSelecionado?.id && userId) {
      try {
        await fetchWithAuth(`/api/concursos/${concursoSelecionado.id}`, {
          method: 'DELETE'
        });
        setConcursoSelecionadoState(null);
        setDisciplinas([]); // Clear associated disciplinas
      } catch (err) {
        console.error('Failed to delete concurso', err);
      }
    }
  }, [concursoSelecionado, userId, fetchWithAuth]);

  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const disciplinasRef = useRef(disciplinas);
  const materiasRef = useRef(materias);

  useEffect(() => {
    disciplinasRef.current = disciplinas;
  }, [disciplinas]);

  useEffect(() => {
    materiasRef.current = materias;
  }, [materias]);
  const [horasSemanaMeta, setHorasSemanaMeta] = useState<number>(0); 
  const [diasDisponiveis, setDiasDisponiveis] = useState<string[]>([]);
  const [horasEstudadasHoje, setHorasEstudadasHoje] = useState<number>(0);
  const [historicoEstudos, setHistoricoEstudos] = useState<HistoricoEstudo[]>(INITIAL_HISTORY);
  
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [currentSessionSeconds, setCurrentSessionSeconds] = useState(0);
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchWithAuth('/api/disciplinas')
      .then(res => res.ok ? res.json() : [])
      .then(async (data) => {
        if (Array.isArray(data)) {
          const now = new Date();
          let needsUpdate = false;
          const updatedDisciplinas = data.map(d => {
            if (d.horasEstudadasHoje > 0 && d.historico && d.historico.length > 0) {
              const lastSession = new Date(d.historico[d.historico.length - 1].data);
              const diffInHours = (now.getTime() - lastSession.getTime()) / (1000 * 60 * 60);
              if (diffInHours >= 24) {
                needsUpdate = true;
                return { ...d, horasEstudadasHoje: 0 };
              }
            }
            return d;
          });
          
          const newTotalHorasHoje = updatedDisciplinas.reduce((sum, d) => sum + d.horasEstudadasHoje, 0);
          setHorasEstudadasHoje(newTotalHorasHoje);
          setDisciplinas(updatedDisciplinas);
          
          if (needsUpdate) {
            // Sync updated disciplines back to the server
            for (const d of updatedDisciplinas) {
              await fetchWithAuth(`/api/disciplinas/${d.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(d)
              });
            }
          }
        }
      })
      .catch(err => console.error('Failed to fetch disciplinas', err));

    fetchWithAuth('/api/materias')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) setMaterias(data);
      })
      .catch(err => console.error('Failed to fetch materias', err));
  }, []);

  // Timer Logic
  useEffect(() => {
    let interval: any;
    let lastTick = Date.now();

    if (isTimerRunning) {
      interval = setInterval(() => {
        const now = Date.now();
        const deltaMs = now - lastTick;
        const deltaSeconds = Math.floor(deltaMs / 1000);
        
        if (deltaSeconds > 0) {
          setHorasEstudadasHoje((prev) => prev + deltaSeconds);
          setCurrentSessionSeconds((prev) => prev + deltaSeconds);
          
          if (activeSubjectId) {
            setDisciplinas((prevDisciplinas) => 
              prevDisciplinas.map((d) => 
                d.id === activeSubjectId 
                  ? { ...d, horasEstudadasHoje: d.horasEstudadasHoje + deltaSeconds, horasEstudadasTotal: d.horasEstudadasTotal + deltaSeconds }
                  : d
              )
            );
          }
          lastTick += deltaSeconds * 1000;
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
    }
    setIsTimerRunning(true);
  }, [disciplinas]);

  const pausarCronometro = useCallback(() => {
    setIsTimerRunning(false);
    setIsPauseModalOpen(true);
  }, []);

  const adicionarHorasManualmente = useCallback((disciplinaId: string, minutos: number, topico?: string) => {
    const segundos = minutos * 60;
    setHorasEstudadasHoje((prev) => prev + segundos);
    setDisciplinas((prev) => {
      const newDisciplinas = prev.map(d => {
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
      });

      const updatedDisciplina = newDisciplinas.find(d => d.id === disciplinaId);
      if (updatedDisciplina) {
          fetchWithAuth(`/api/disciplinas/${updatedDisciplina.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatedDisciplina)
          }).catch(err => console.error('Failed to update disciplina', err));
      }

      return newDisciplinas;
    });
  }, []);

  const setMetaSemanal = useCallback((horas: number, dias: string[]) => {
    setHorasSemanaMeta(horas);
    setDiasDisponiveis(dias);
  }, []);

  const resetarDia = () => {
    setHorasEstudadasHoje(0);
    setDisciplinas(prev => {
      const newDisciplinas = prev.map(d => ({ ...d, horasEstudadasHoje: 0 }));
      // Sync all to backend
      newDisciplinas.forEach(d => {
        fetchWithAuth(`/api/disciplinas/${d.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(d)
        }).catch(err => console.error('Failed to update disciplina', err));
      });
      return newDisciplinas;
    });
  };

  const addMateria = useCallback((nome: string, id?: string) => {
    const novaMateria: Materia = {
      id: id || crypto.randomUUID(),
      nome,
      assuntos: []
    };
    setMaterias(prev => [...prev, novaMateria]);
    fetchWithAuth('/api/materias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novaMateria)
    }).catch(err => console.error('Failed to create materia', err));
  }, []);

  const updateMateria = useCallback(async (id: string, nome: string) => {
    let updatedMateria: Materia | undefined;
    setMaterias(prev => {
      const newMaterias = prev.map(m => {
        if (m.id === id) {
          const newMateria = { ...m, nome };
          return newMateria;
        }
        return m;
      });
      
      updatedMateria = newMaterias.find(m => m.id === id);
      
      if (updatedMateria) {
        fetchWithAuth(`/api/materias/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedMateria)
        }).catch(err => {
          console.error('Failed to update materia', err);
        });
      }
      
      return newMaterias;
    });
  }, [fetchWithAuth]);

  const deleteMateria = useCallback(async (id: string) => {
    setMaterias(prev => prev.filter(m => m.id !== id));
    try {
      const response = await fetchWithAuth(`/api/materias/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete materia');
    } catch (err) {
      console.error('Failed to delete materia', err);
    }
  }, [fetchWithAuth]);

  const addAssunto = useCallback(async (materiaId: string, nome: string) => {
    let updatedMateria: Materia | undefined;
    setMaterias(prev => {
      const newMaterias = prev.map(m => {
        if (m.id === materiaId) {
          const newMateria = {
            ...m,
            assuntos: [...m.assuntos, { id: crypto.randomUUID(), nome, concluido: false, revisoesConcluidas: [] }]
          };
          return newMateria;
        }
        return m;
      });
      
      updatedMateria = newMaterias.find(m => m.id === materiaId);
      
      if (updatedMateria) {
        fetchWithAuth(`/api/materias/${materiaId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedMateria)
        }).catch(err => {
          console.error('Failed to add assunto', err);
        });
      }
      
      return newMaterias;
    });
  }, [fetchWithAuth]);

  const updateAssunto = useCallback(async (materiaId: string, assuntoId: string, updates: Partial<Materia['assuntos'][0]>) => {
    let updatedMateria: Materia | undefined;
    
    setMaterias(prev => {
      const newMaterias = prev.map(m => {
        if (m.id === materiaId) {
          const newMateria = {
            ...m,
            assuntos: m.assuntos.map(a => a.id === assuntoId ? { ...a, ...updates } : a)
          };
          return newMateria;
        }
        return m;
      });
      
      updatedMateria = newMaterias.find(m => m.id === materiaId);
      
      // Make the API call asynchronously without blocking the state update
      if (updatedMateria) {
        fetchWithAuth(`/api/materias/${materiaId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedMateria)
        }).catch(err => {
          console.error('Failed to update assunto', err);
        });
      }
      
      return newMaterias;
    });
  }, [fetchWithAuth]);

  const salvarSessaoEstudo = useCallback((concluido: boolean) => {
    if (activeSubjectId && currentSessionSeconds > 0) {
        setDisciplinas(prev => {
            const newDisciplinas = prev.map(d => {
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
            });

            const updatedDisciplina = newDisciplinas.find(d => d.id === activeSubjectId);
            if (updatedDisciplina) {
                fetchWithAuth(`/api/disciplinas/${updatedDisciplina.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedDisciplina)
                }).catch(err => console.error('Failed to update disciplina', err));
            }

            return newDisciplinas;
        });

        // Mark topic as finished if requested
        if (concluido && activeTopic) {
            const disciplina = disciplinasRef.current.find(d => d.id === activeSubjectId);
            if (disciplina?.materiaId) {
                const materia = materiasRef.current.find(m => m.id === disciplina.materiaId);
                const assunto = materia?.assuntos.find(a => a.nome === activeTopic);
                if (assunto) {
                    updateAssunto(disciplina.materiaId, assunto.id, { 
                        concluido: true,
                        dataEstudo: assunto.dataEstudo || new Date().toISOString()
                    });
                }
            }
        }
    }

    setActiveSubjectId(null);
    setActiveTopic(null);
    setCurrentSessionSeconds(0);
    setIsFinishModalOpen(false);
  }, [activeSubjectId, activeTopic, currentSessionSeconds, updateAssunto, fetchWithAuth]);

  const deleteAssunto = useCallback(async (materiaId: string, assuntoId: string) => {
    let updatedMateria: Materia | undefined;

    setMaterias(prev => {
      const newMaterias = prev.map(m => {
        if (m.id === materiaId) {
          const newMateria = {
            ...m,
            assuntos: m.assuntos.filter(a => a.id !== assuntoId)
          };
          return newMateria;
        }
        return m;
      });
      
      updatedMateria = newMaterias.find(m => m.id === materiaId);
      
      if (updatedMateria) {
        fetchWithAuth(`/api/materias/${materiaId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedMateria)
        }).catch(err => {
          console.error('Failed to delete assunto', err);
        });
      }
      
      return newMaterias;
    });
  }, [fetchWithAuth]);

  const updateDisciplinas = useCallback(async (newDisciplinas: Disciplina[]) => {
    setDisciplinas(newDisciplinas);
    try {
      const existingRes = await fetchWithAuth('/api/disciplinas');
      const existing = await existingRes.json();
      
      if (Array.isArray(existing)) {
        for (const d of existing) {
          await fetchWithAuth(`/api/disciplinas/${d.id}`, { method: 'DELETE' });
        }
      }
      
      for (const d of newDisciplinas) {
        await fetchWithAuth('/api/disciplinas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(d)
        });
      }
    } catch (err) {
      console.error('Failed to sync disciplinas', err);
    }
  }, [fetchWithAuth]);

  const updateMaterias = useCallback(async (newMaterias: Materia[]) => {
    setMaterias(newMaterias);
    try {
      const existingRes = await fetchWithAuth('/api/materias');
      const existing = await existingRes.json();
      
      if (Array.isArray(existing)) {
        for (const m of existing) {
          await fetchWithAuth(`/api/materias/${m.id}`, { method: 'DELETE' });
        }
      }
      
      for (const m of newMaterias) {
        await fetchWithAuth('/api/materias', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(m)
        });
      }
    } catch (err) {
      console.error('Failed to sync materias', err);
    }
  }, [fetchWithAuth]);

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
      isPauseModalOpen,
      isFinishModalOpen,
      setConcursoSelecionado,
      deleteConcurso,
      setDisciplinas: updateDisciplinas,
      setMaterias: updateMaterias,
      addMateria,
      updateMateria,
      deleteMateria,
      addAssunto,
      updateAssunto,
      deleteAssunto,
      setMetaSemanal,
      iniciarCronometro,
      pausarCronometro,
      salvarSessaoEstudo,
      setIsPauseModalOpen,
      setIsFinishModalOpen,
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