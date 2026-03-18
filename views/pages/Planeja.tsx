import React, { useState } from 'react';
import { useStudy } from '../../controllers/context/StudyContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Check, ChevronLeft, ChevronRight, Save, Plus, Settings, Layers, FileText, Upload, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../controllers/context/ThemeContext';

export const Planeja: React.FC = () => {
  const { 
    concursoSelecionado, 
    deleteConcurso, 
    setConcursoSelecionado, 
    setDisciplinas, 
    setMetaSemanal, 
    materias,
    horasSemanaMeta,
    diasDisponiveis,
    disciplinas
  } = useStudy();
  const navigate = useNavigate();
  const { themeClasses } = useTheme();
  const [step, setStep] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [concurso, setConcurso] = useState({ orgao: '', nome: '', possuiEdital: true, dataProva: '' });
  const [selectedMateriaIds, setSelectedMateriaIds] = useState<string[]>([]);
  const [disciplineConfig, setDisciplineConfig] = useState<Record<string, { peso: number | string, horas: number | string }>>({});
  const [availability, setAvailability] = useState({ totalHoras: 20, dias: [] as string[] });
  const [error, setError] = useState<string | null>(null);

  // Edital Modal State
  const [isEditalModalOpen, setIsEditalModalOpen] = useState(false);
  const [editalContent, setEditalContent] = useState('');

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteConcurso();
    setIsDeleting(false);
    setStep(1);
    setConcurso({ orgao: '', nome: '', possuiEdital: true, dataProva: '' });
    setSelectedMateriaIds([]);
    setDisciplineConfig({});
    setAvailability({ totalHoras: 20, dias: [] });
    setError(null);
    setIsEditing(false);
  };

  const handleEdit = () => {
    if (!concursoSelecionado) return;
    
    setConcurso({
      orgao: concursoSelecionado.orgao || '',
      nome: concursoSelecionado.nome || '',
      possuiEdital: concursoSelecionado.possuiEdital || false,
      dataProva: concursoSelecionado.dataProva || ''
    });

    const uniqueMateriaIds = Array.from(new Set(disciplinas.map(d => d.materiaId)));
    setSelectedMateriaIds(uniqueMateriaIds);

    const newConfig: Record<string, { peso: number | string, horas: number | string }> = {};
    uniqueMateriaIds.forEach((id: string) => {
      const disciplina = disciplinas.find(d => d.materiaId === id);
      if (disciplina) {
        newConfig[id] = { 
          peso: disciplina.peso, 
          horas: disciplina.horasSemanaMeta * disciplina.peso 
        };
      }
    });
    setDisciplineConfig(newConfig);
    
    setAvailability({ totalHoras: horasSemanaMeta, dias: diasDisponiveis });
    
    setIsEditing(true);
    setStep(1);
  };

  if (concursoSelecionado && step === 1 && !isDeleting && !isEditing) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className={`text-2xl font-bold ${themeClasses.text}`}>Guia Planeja</h2>
        </div>
        <Card className="p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Layers size={32} />
          </div>
          <h3 className={`text-2xl font-semibold ${themeClasses.text}`}>Você já possui um planejamento ativo</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Atualmente você está estudando para o concurso <strong>{concursoSelecionado.orgao ? `${concursoSelecionado.orgao} - ` : ''}{concursoSelecionado.nome}</strong>. 
            Deseja excluir este planejamento e começar um novo? Esta ação apagará seu ciclo atual.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button variant="outline" onClick={() => navigate('/')}>
              Voltar ao Dashboard
            </Button>
            <Button variant="secondary" onClick={handleEdit}>
              <Settings size={18} className="mr-2" />
              Editar Planejamento
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white border-transparent"
            >
              <Trash2 size={18} className="mr-2" />
              Excluir e Começar Novo
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const handleNext = () => {
    setError(null);
    if (step === 1 && !concurso.orgao.trim()) {
      setError('Por favor, informe o órgão do concurso.');
      return;
    }
    if (step === 1 && !concurso.nome.trim()) {
      setError('Por favor, informe o nome do concurso (cargo).');
      return;
    }
    if (step === 1 && concurso.possuiEdital && !concurso.dataProva) {
      setError('Por favor, informe a data da prova, já que o edital já saiu.');
      return;
    }
    if (step === 2 && selectedMateriaIds.length === 0) {
      setError('Por favor, selecione pelo menos uma matéria.');
      return;
    }
    setStep(prev => prev + 1);
  };
  const handleBack = () => {
    setError(null);
    setStep(prev => prev - 1);
  };

  const toggleMateria = (id: string) => {
    setError(null);
    if (selectedMateriaIds.includes(id)) {
      setSelectedMateriaIds(prev => prev.filter(d => d !== id));
      const newConfig = { ...disciplineConfig };
      delete newConfig[id];
      setDisciplineConfig(newConfig);
    } else {
      setSelectedMateriaIds(prev => [...prev, id]);
      setDisciplineConfig(prev => ({ ...prev, [id]: { peso: 1, horas: 2 } }));
    }
  };

  const handleFinish = () => {
    setError(null);
    if (availability.dias.length === 0 || availability.totalHoras <= 0) {
      setError('Por favor, defina sua disponibilidade semanal.');
      return;
    }

    setConcursoSelecionado({
      id: concursoSelecionado?.id,
      orgao: concurso.orgao,
      nome: concurso.nome,
      possuiEdital: concurso.possuiEdital,
      dataProva: concurso.dataProva || null,
      horasSemanaMeta: availability.totalHoras,
      diasDisponiveis: availability.dias
    });

    setIsEditing(false);

    // 1. Prepare pool of subjects with their counts based on weight
    let pool: { id: string, count: number, originalMateria: any }[] = [];
    
    selectedMateriaIds.forEach(id => {
      const configPeso = disciplineConfig[id]?.peso;
      const peso = configPeso === '' || configPeso === undefined ? 1 : Number(configPeso);
      // Ensure at least 1, handle decimals by flooring
      const count = Math.max(1, Math.floor(peso)); 
      const materia = materias.find(m => m.id === id);
      
      if (materia) {
        pool.push({
          id: id,
          count: count,
          originalMateria: materia
        });
      }
    });

    // 2. Interleaved distribution algorithm
    const newDisciplinas: any[] = [];
    let lastAddedId: string | null = null;
    
    const totalItems = pool.reduce((acc, item) => acc + item.count, 0);

    for (let i = 0; i < totalItems; i++) {
        // Sort pool: 
        // Priority 1: Items that are NOT the last added one (to maximize interleaving)
        // Priority 2: Items with highest remaining count (to avoid leftovers at the end)
        
        pool.sort((a, b) => {
            if (a.count === 0) return 1;
            if (b.count === 0) return -1;
            
            // If one is the last added, deprioritize it
            const aIsLast = a.id === lastAddedId;
            const bIsLast = b.id === lastAddedId;
            
            if (aIsLast && !bIsLast) return 1;
            if (!aIsLast && bIsLast) return -1;
            
            // Otherwise sort by count descending
            return b.count - a.count;
        });

        // Pick the best candidate
        const candidate = pool.find(p => p.count > 0);

        if (candidate) {
            const configPeso = disciplineConfig[candidate.id]?.peso;
            const configHoras = disciplineConfig[candidate.id]?.horas;
            const pesoTotal = Math.max(1, configPeso === '' || configPeso === undefined ? 1 : Number(configPeso));
            const horasTotal = configHoras === '' || configHoras === undefined ? 2 : Number(configHoras);
            
            // Split the weekly goal among the blocks
            const horasPorBloco = horasTotal / pesoTotal;

            newDisciplinas.push({
                id: `cycle-${i}-${candidate.id}`,
                nome: candidate.originalMateria.nome,
                peso: pesoTotal,
                horasSemanaMeta: horasPorBloco,
                horasEstudadasTotal: 0,
                horasEstudadasHoje: 0,
                concluida: false,
                materiaId: candidate.id
            });

            candidate.count--;
            lastAddedId = candidate.id;
        }
    }

    setDisciplinas(newDisciplinas);
    setMetaSemanal(availability.totalHoras, availability.dias);
    
    // Small delay to ensure state propagation before navigation
    setTimeout(() => {
      navigate('/ciclo');
    }, 100);
  };

  const handleProcessEdital = () => {
    // Mock processing logic
    alert('Edital anexado! Em uma versão completa, o sistema analisaria o texto para sugerir disciplinas.');
    setIsEditalModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-bold ${themeClasses.text}`}>Guia Planeja</h2>
        <div className="flex gap-2 flex-1 max-w-[150px] sm:max-w-[200px] ml-4">
           <span className={`h-2 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
           <span className={`h-2 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
           <span className={`h-2 flex-1 rounded-full transition-colors ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
        </div>
      </div>

      <Card>
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className={`text-xl font-semibold mb-4 ${themeClasses.text}`}>Informações do Concurso</h3>
            
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${themeClasses.text}`}>Órgão</label>
              <input 
                type="text" 
                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none ${themeClasses.bg === 'bg-gray-950' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                placeholder="Ex: Tribunal de Justiça"
                value={concurso.orgao}
                onChange={e => {
                  setConcurso({...concurso, orgao: e.target.value});
                  setError(null);
                }}
              />
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${themeClasses.text}`}>Nome do Concurso (Cargo)</label>
              <input 
                type="text" 
                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none ${themeClasses.bg === 'bg-gray-950' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                placeholder="Ex: Técnico Judiciário"
                value={concurso.nome}
                onChange={e => {
                  setConcurso({...concurso, nome: e.target.value});
                  setError(null);
                }}
              />
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${themeClasses.text}`}>O edital já saiu?</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="edital" 
                    checked={concurso.possuiEdital} 
                    onChange={() => {
                      setConcurso({...concurso, possuiEdital: true});
                      setError(null);
                    }}
                    className="text-blue-600" 
                  />
                  <span className={themeClasses.text}>Sim</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="edital" 
                    checked={!concurso.possuiEdital} 
                    onChange={() => {
                      setConcurso({...concurso, possuiEdital: false, dataProva: ''});
                      setError(null);
                    }}
                    className="text-blue-600" 
                  />
                  <span className={themeClasses.text}>Não</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-medium ${themeClasses.text} ${!concurso.possuiEdital ? 'opacity-50' : ''}`}>Data da Prova</label>
              <input 
                type="date" 
                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none ${themeClasses.bg === 'bg-gray-950' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'} ${!concurso.possuiEdital ? 'opacity-50 cursor-not-allowed' : ''}`}
                value={concurso.dataProva}
                onChange={e => {
                  setConcurso({...concurso, dataProva: e.target.value});
                  setError(null);
                }}
                disabled={!concurso.possuiEdital}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-semibold ${themeClasses.text}`}>Disciplinas e Pesos</h3>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditalModalOpen(true)} className="text-sm py-1">
                  <FileText size={16} className="mr-2" />
                  Anexar Edital
                </Button>
                <Button variant="outline" onClick={() => navigate('/configuracoes/materias')} className="text-sm py-1">
                  <Settings size={16} className="mr-2" />
                  Gerenciar Matérias
                </Button>
              </div>
            </div>
            
            {materias.length === 0 ? (
              <div 
                onClick={() => navigate('/configuracoes/materias')}
                className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors group"
              >
                <div className="bg-gray-50 group-hover:bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 transition-colors">
                  <Layers size={32} />
                </div>
                <p className="text-gray-500 mb-4">Nenhuma matéria cadastrada no sistema.</p>
                <div className="text-blue-600 font-medium flex items-center justify-center gap-2">
                  <Plus size={18} /> Cadastrar Matérias
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
                {materias.map(materia => (
                  <div key={materia.id} className={`p-4 border rounded-xl transition-all ${selectedMateriaIds.includes(materia.id) ? 'border-blue-500 bg-blue-50/10' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <input 
                        type="checkbox" 
                        checked={selectedMateriaIds.includes(materia.id)}
                        onChange={() => toggleMateria(materia.id)}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <span className={`font-medium ${themeClasses.text}`}>{materia.nome}</span>
                    </div>
                    
                    {selectedMateriaIds.includes(materia.id) && (
                      <div className="grid grid-cols-2 gap-2 pl-8">
                         <div>
                           <label className="text-xs text-gray-500">Peso</label>
                           <input 
                             type="number" 
                             className={`w-full p-2 text-sm border rounded-lg ${themeClasses.bg === 'bg-gray-950' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                             value={disciplineConfig[materia.id]?.peso ?? 1}
                             onChange={(e) => setDisciplineConfig({
                               ...disciplineConfig, 
                               [materia.id]: { ...disciplineConfig[materia.id], peso: e.target.value === '' ? '' : Number(e.target.value) }
                             })}
                           />
                         </div>
                         <div>
                           <label className="text-xs text-gray-500">Horas/Sem</label>
                           <input 
                             type="number" 
                             className={`w-full p-2 text-sm border rounded-lg ${themeClasses.bg === 'bg-gray-950' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                             value={disciplineConfig[materia.id]?.horas ?? 2}
                             onChange={(e) => setDisciplineConfig({
                               ...disciplineConfig, 
                               [materia.id]: { ...disciplineConfig[materia.id], horas: e.target.value === '' ? '' : Number(e.target.value) }
                             })}
                           />
                         </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className={`text-xl font-semibold mb-4 ${themeClasses.text}`}>Disponibilidade</h3>
            
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${themeClasses.text}`}>Quantas horas você pode estudar por semana?</label>
              <input 
                type="number" 
                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none ${themeClasses.bg === 'bg-gray-950' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                value={availability.totalHoras}
                onChange={e => {
                  setAvailability({...availability, totalHoras: Number(e.target.value)});
                  setError(null);
                }}
              />
            </div>

            <div className="space-y-2">
               <label className={`block text-sm font-medium ${themeClasses.text}`}>Quais dias você vai estudar?</label>
               <div className="flex flex-wrap gap-2">
                 {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(day => (
                   <button
                     key={day}
                     onClick={() => {
                        const dias = availability.dias.includes(day) 
                          ? availability.dias.filter(d => d !== day)
                          : [...availability.dias, day];
                        setAvailability({...availability, dias});
                        setError(null);
                     }}
                     className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                       availability.dias.includes(day)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                     }`}
                   >
                     {day}
                   </button>
                 ))}
               </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2 animate-fadeIn">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0"></span>
            {error}
          </div>
        )}

        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
           {step > 1 ? (
             <Button variant="outline" onClick={handleBack}>
               <ChevronLeft size={18} /> Voltar
             </Button>
           ) : (
             <div />
           )}
           
           {step < 3 ? (
             <Button onClick={handleNext}>
               Próximo <ChevronRight size={18} />
             </Button>
           ) : (
             <Button onClick={handleFinish} variant="primary">
               <Save size={18} /> Finalizar e Salvar
             </Button>
           )}
        </div>
      </Card>

      {/* Edital Modal */}
      <Modal
        isOpen={isEditalModalOpen}
        onClose={() => setIsEditalModalOpen(false)}
        title="Anexar Edital do Concurso"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Cole o conteúdo do edital ou faça upload do arquivo PDF para análise automática das disciplinas.</p>
          
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer">
              <Upload size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-700">Clique para fazer upload do PDF</p>
              <p className="text-xs text-gray-400">ou arraste e solte aqui</p>
          </div>

          <div className="relative">
              <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Ou cole o texto</span>
              </div>
          </div>

          <textarea
              className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none ${themeClasses.bg === 'bg-gray-950' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
              rows={6}
              placeholder="Cole aqui a parte do edital com o conteúdo programático..."
              value={editalContent || ''}
              onChange={(e) => setEditalContent(e.target.value)}
          />

          <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditalModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleProcessEdital}>
                  Processar Edital
              </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
