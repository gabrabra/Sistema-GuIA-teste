import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
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
  const [horasSemanaMeta, setHorasSemanaMeta] = useState<number>(0); 
  const [diasDisponiveis, setDiasDisponiveis] = useState<string[]>([]);
  const [horasEstudadasHoje, setHorasEstudadasHoje] = useState<number>(0);
  const [historicoEstudos, setHistoricoEstudos] = useState<HistoricoEstudo[]>(INITIAL_HISTORY);
  
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [currentSessionSeconds, setCurrentSessionSeconds] = useState(0);

  // Fetch initial data
  useEffect(() => {
    fetchWithAuth('/api/disciplinas')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) setDisciplinas(data);
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
          setMaterias(prev => {
            let changed = false;
            const newMaterias = prev.map(m => {
              if (m.id === disciplina.materiaId) {
                return {
                  ...m,
                  assuntos: m.assuntos.map(a => {
                    if (a.nome === topico && !a.dataEstudo) {
                      changed = true;
                      return { ...a, dataEstudo: new Date().toISOString() };
                    }
                    return a;
                  })
                };
              }
              return m;
            });

            if (changed) {
              const updatedMateria = newMaterias.find(m => m.id === disciplina.materiaId);
              if (updatedMateria) {
                fetchWithAuth(`/api/materias/${updatedMateria.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(updatedMateria)
                }).catch(err => console.error('Failed to update materia', err));
              }
            }
            return newMaterias;
          });
        }
      }
    }
    setIsTimerRunning(true);
  }, [disciplinas]);

  const pausarCronometro = useCallback(() => {
    setIsTimerRunning(false);
    
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
    }

    setActiveSubjectId(null);
    setActiveTopic(null);
    setCurrentSessionSeconds(0);
  }, [activeSubjectId, activeTopic, currentSessionSeconds]);

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
          updatedMateria = newMateria;
          return newMateria;
        }
        return m;
      });
      return newMaterias;
    });

    if (updatedMateria) {
      try {
        const response = await fetchWithAuth(`/api/materias/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedMateria)
        });
        if (!response.ok) throw new Error('Failed to update materia');
      } catch (err) {
        console.error('Failed to update materia', err);
      }
    }
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
          updatedMateria = newMateria;
          return newMateria;
        }
        return m;
      });
      return newMaterias;
    });

    if (updatedMateria) {
      try {
        const response = await fetchWithAuth(`/api/materias/${materiaId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedMateria)
        });
        if (!response.ok) throw new Error('Failed to add assunto');
      } catch (err) {
        console.error('Failed to add assunto', err);
      }
    }
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
          updatedMateria = newMateria;
          return newMateria;
        }
        return m;
      });
      return newMaterias;
    });

    if (updatedMateria) {
      try {
        const response = await fetchWithAuth(`/api/materias/${materiaId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedMateria)
        });
        if (!response.ok) throw new Error('Failed to update assunto');
      } catch (err) {
        console.error('Failed to update assunto', err);
        // Rollback or notify user
      }
    }
  }, [fetchWithAuth]);

  const deleteAssunto = useCallback(async (materiaId: string, assuntoId: string) => {
    let updatedMateria: Materia | undefined;

    setMaterias(prev => {
      const newMaterias = prev.map(m => {
        if (m.id === materiaId) {
          const newMateria = {
            ...m,
            assuntos: m.assuntos.filter(a => a.id !== assuntoId)
          };
          updatedMateria = newMateria;
          return newMateria;
        }
        return m;
      });
      return newMaterias;
    });

    if (updatedMateria) {
      try {
        const response = await fetchWithAuth(`/api/materias/${materiaId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedMateria)
        });
        if (!response.ok) throw new Error('Failed to delete assunto');
      } catch (err) {
        console.error('Failed to delete assunto', err);
        // Rollback or notify user
      }
    }
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