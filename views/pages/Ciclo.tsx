import React, { useState } from 'react';
import { useStudy } from '../../controllers/context/StudyContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { formatTime, formatTimeWithSeconds } from '../../models/utils/timeUtils';
import { Play, Pause, Plus, Flame, Zap, Target, BookOpen, Layers, PlusCircle, Clock, Book, Search, X, ChevronDown, ChevronUp, CheckCircle, Trophy, Activity, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../controllers/context/ThemeContext';
import { PriorityGuide } from '../components/ui/PriorityGuide';
import { WeeklyCalendar } from '../components/ui/WeeklyCalendar';
import { FrequencyChart } from '../components/ui/FrequencyChart';

export const Ciclo: React.FC = () => {
  const { 
    disciplinas, 
    materias,
    activeSubjectId, 
    iniciarCronometro, 
    pausarCronometro, 
    horasEstudadasHoje,
    adicionarHorasManualmente,
    excluirSessaoEstudo
  } = useStudy();
  const navigate = useNavigate();
  const { themeClasses } = useTheme();

  const [selectedGuide, setSelectedGuide] = useState('padrao');
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'study' | 'manual'>('study');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [topic, setTopic] = useState('');
  const [manualTime, setManualTime] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const maratonaMeta = 4 * 3600; // Mock 4 hours daily marathon goal
  const maratonaProgress = maratonaMeta > 0 ? (horasEstudadasHoje / maratonaMeta) * 100 : 0;

  // Calculate Indicators
  const totalSecondsStudied = disciplinas.reduce((acc, d) => acc + d.horasEstudadasTotal, 0);
  const totalTopics = materias.reduce((acc, m) => acc + (m.assuntos || []).length, 0);
  const completedTopics = materias.reduce((acc, m) => acc + (m.assuntos || []).filter(a => a.concluido).length, 0);
  const completionRate = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  
  // Mock streak for now (can be implemented with history later)
  const studyStreak = horasEstudadasHoje > 0 ? 1 : 0; 

  const guides = [
    { id: 'padrao', label: 'Ciclo Padrão', icon: Layers, desc: 'Foco equilibrado em teoria e prática', disabled: false },
    { id: 'reta-final', label: 'Reta Final', icon: Zap, desc: 'Alta intensidade pós-edital', disabled: true },
    { id: 'questoes', label: 'Só Questões', icon: Target, desc: 'Baterias de exercícios', disabled: true },
    { id: 'revisao', label: 'Revisão Turbo', icon: BookOpen, desc: 'Consolidação de memória', disabled: true },
  ];

  const indicators = [
    { 
      label: 'Tempo Total', 
      value: formatTime(totalSecondsStudied), 
      icon: Clock, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    },
    { 
      label: 'Tópicos Concluídos', 
      value: `${completedTopics}/${totalTopics}`, 
      subValue: `${completionRate}%`,
      icon: CheckCircle, 
      color: 'text-green-600', 
      bg: 'bg-green-50' 
    },
    { 
      label: 'Constância', 
      value: `${studyStreak} dias`, 
      icon: Flame, 
      color: 'text-orange-600', 
      bg: 'bg-orange-50' 
    },
    { 
      label: 'Eficiência', 
      value: '85%', 
      icon: Activity, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50' 
    },
  ];

  const handleOpenModal = (mode: 'study' | 'manual', subjectId: string) => {
    setModalMode(mode);
    setSelectedSubjectId(subjectId);
    setTopic('');
    setManualTime('');
    setSearchTerm('');
    setIsDropdownOpen(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSubjectId(null);
  };

  const handleConfirmAction = () => {
    if (!selectedSubjectId) return;

    if (modalMode === 'study') {
      iniciarCronometro(selectedSubjectId, topic);
    } else {
      const minutes = parseInt(manualTime, 10);
      if (!isNaN(minutes) && minutes > 0) {
        adicionarHorasManualmente(selectedSubjectId, minutes, topic);
      }
    }
    handleCloseModal();
  };

  const toggleExpand = (id: string) => {
    setExpandedSubjectId(prev => prev === id ? null : id);
  };

  // Helper to get subjects for the selected discipline
  const getLinkedMateria = () => {
    if (!selectedSubjectId) return null;
    const disciplina = disciplinas.find(d => d.id === selectedSubjectId);
    if (!disciplina?.materiaId) return null;
    return materias.find(m => m.id === disciplina.materiaId);
  };

  const linkedMateria = getLinkedMateria();

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-bold ${themeClasses.text}`}>Ciclo de Estudos</h2>
          <p className="text-gray-500">Gerencie sua maratona e escolha seu guia de hoje</p>
        </div>
        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-xl font-bold">
          Hoje: {formatTime(horasEstudadasHoje)}
        </div>
      </header>

      {/* Guide Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {guides.map((guide) => {
          const isSelected = selectedGuide === guide.id;
          return (
            <button
              key={guide.id}
              onClick={() => !guide.disabled && setSelectedGuide(guide.id)}
              disabled={guide.disabled}
              title={guide.disabled ? 'Essa função será liberada nas próximas atualizações' : ''}
              className={`p-3 rounded-xl border-2 text-left transition-all duration-200 flex flex-col gap-2 relative overflow-hidden ${
                guide.disabled
                  ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                  : isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-white bg-white hover:border-blue-200 text-gray-600'
              }`}
            >
              <div className={`p-2 rounded-lg w-fit ${isSelected && !guide.disabled ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                <guide.icon size={20} />
              </div>
              <div>
                <span className={`block font-bold text-sm ${isSelected && !guide.disabled ? 'text-blue-700' : 'text-gray-700'}`}>
                  {guide.label}
                </span>
                <span className="text-xs text-gray-400 leading-tight block mt-1">
                  {guide.disabled ? 'Em breve nas próximas atualizações' : guide.desc}
                </span>
              </div>
              {isSelected && !guide.disabled && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card title="Agenda de Revisões" className="h-fit">
            <WeeklyCalendar materias={materias} />
          </Card>
          <Card title="Frequência de Estudo">
            <FrequencyChart disciplinas={disciplinas} />
          </Card>
        </div>

        <Card title="Prioridades de Estudo" className="flex flex-col">
          <div className="flex-1">
            <PriorityGuide disciplinas={disciplinas} onStudyClick={(id) => handleOpenModal('study', id)} />
          </div>
        </Card>
      </div>

      {/* Maratona Diaria */}
      <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-none">
        <div className="flex items-center gap-3 mb-4">
          <Flame className="text-yellow-300" size={28} />
          <div>
            <h3 className="text-lg font-bold leading-none">Maratona Diária</h3>
            <p className="text-white/60 text-xs mt-1">Modo: {guides.find(g => g.id === selectedGuide)?.label}</p>
          </div>
        </div>
        <div className="flex justify-between items-end mb-2">
          <span className="text-4xl font-bold">{formatTime(horasEstudadasHoje)}</span>
          <span className="text-white/70 font-medium mb-1">/ {formatTime(maratonaMeta)}</span>
        </div>
        <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-yellow-400 h-full rounded-full transition-all duration-500" 
            style={{ width: `${Math.min(maratonaProgress, 100)}%` }} 
          />
        </div>
      </Card>

      {/* Study Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {indicators.map((indicator, index) => (
          <Card key={index} className="p-4 flex items-center gap-4">
            <div className={`p-3 rounded-full ${indicator.bg} ${indicator.color}`}>
              <indicator.icon size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">{indicator.label}</p>
              <div className="flex items-baseline gap-1">
                <span className={`text-xl font-bold ${themeClasses.text}`}>{indicator.value}</span>
                {indicator.subValue && (
                  <span className="text-xs text-gray-400">{indicator.subValue}</span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {disciplinas.length === 0 ? (
           <div 
             onClick={() => navigate('/planeja')}
             className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors group"
           >
             <div className="bg-gray-50 group-hover:bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 transition-colors">
               <Layers size={32} />
             </div>
             <h3 className="text-lg font-bold text-gray-800 mb-2">Nenhuma disciplina encontrada</h3>
             <p className="text-gray-500 max-w-md mx-auto mb-6">Você ainda não configurou seu ciclo de estudos. Acesse o Guia Planeja para definir suas metas e disciplinas.</p>
             <div className="text-blue-600 font-medium flex items-center justify-center gap-2">
               <PlusCircle size={18} />
               Criar meu planejamento
             </div>
           </div>
        ) : (
          disciplinas.map((disc) => {
            const isActive = activeSubjectId === disc.id;
            const isExpanded = expandedSubjectId === disc.id || isActive;
            
            return (
              <Card key={disc.id} className={`transition-all ${isActive ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}>
                <div 
                  className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer"
                  onClick={() => toggleExpand(disc.id)}
                >
                  <div className="flex-1 w-full flex justify-between items-center">
                    <div>
                        <h4 className={`font-bold ${themeClasses.text} text-lg flex items-center gap-2`}>
                        {disc.nome}
                        {isActive && <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Meta Diária: {formatTime(disc.peso * 3600)}
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className={`text-2xl font-mono font-bold ${isActive ? 'text-blue-600' : 'text-gray-700'}`}>
                            {formatTimeWithSeconds(disc.horasEstudadasHoje)}
                            </span>
                            <span className="text-xs text-gray-400">hoje</span>
                        </div>
                        <div className="text-gray-400">
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                    </div>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-100 animate-fadeIn">
                    <div className="flex flex-wrap gap-2 mb-4 justify-between items-center">
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs text-gray-500 block mb-1">Total Estudado</span>
                            <span className="text-sm font-semibold text-gray-700">{formatTime(disc.horasEstudadasTotal)}</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 block mb-1">Peso</span>
                            <span className="text-sm font-semibold text-gray-700">{disc.peso}</span>
                          </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {isActive ? (
                          <Button variant="danger" onClick={(e) => { e.stopPropagation(); pausarCronometro(); }}>
                            <Pause size={18} /> Pausar
                          </Button>
                        ) : (
                          <Button variant="primary" onClick={(e) => { e.stopPropagation(); handleOpenModal('study', disc.id); }}>
                            <Play size={18} /> Estudar
                          </Button>
                        )}
                        <Button variant="outline" onClick={(e) => { e.stopPropagation(); handleOpenModal('manual', disc.id); }} title="Adicionar tempo manual">
                          <Plus size={18} />
                        </Button>
                      </div>
                    </div>

                    {disc.historico && disc.historico.length > 0 && (
                      <div className="mt-4">
                        <h5 className={`text-sm font-semibold mb-2 ${themeClasses.text}`}>Histórico de Hoje</h5>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {[...disc.historico].reverse().map((sessao) => (
                            <div key={sessao.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-lg group">
                              <span className="text-gray-700 truncate max-w-[200px]" title={sessao.assunto}>
                                {sessao.assunto}
                              </span>
                              <div className="flex items-center gap-1">
                                <span className="font-mono text-gray-500 text-xs mr-2">
                                  {formatTimeWithSeconds(sessao.segundos)}
                                </span>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    iniciarCronometro(disc.id, sessao.assunto !== 'Estudo Livre' ? sessao.assunto : undefined);
                                  }}
                                  className="p-1.5 rounded-md text-blue-500 hover:bg-blue-100 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-all"
                                  title="Continuar estudando este assunto"
                                >
                                  <Play size={14} />
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm('Tem certeza que deseja excluir este registro de estudo?')) {
                                      excluirSessaoEstudo(disc.id, sessao.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-md text-red-400 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                                  title="Excluir este registro"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Action Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={modalMode === 'study' ? 'Iniciar Sessão de Estudo' : 'Registrar Tempo Manual'}
      >
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${themeClasses.text}`}>
              Assunto / Tópico
            </label>
            {linkedMateria && linkedMateria.assuntos.length > 0 ? (
              <div className="relative">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Search size={18} />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeClasses.bg === 'bg-gray-950' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                    placeholder="Pesquisar assunto..."
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => {
                        setSearchTerm('');
                        setTopic('');
                      }}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {isDropdownOpen && (
                  <div className={`absolute z-50 w-full mt-1 border rounded-lg shadow-lg max-h-60 overflow-y-auto ${themeClasses.bg === 'bg-gray-950' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    {linkedMateria.assuntos
                      .filter(a => a.nome.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((assunto) => (
                        <div
                          key={assunto.id}
                          className={`p-3 cursor-pointer transition-colors flex justify-between items-center ${
                            topic === assunto.nome 
                              ? 'bg-blue-50 text-blue-700' 
                              : themeClasses.bg === 'bg-gray-950' ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-700'
                          }`}
                          onClick={() => {
                            setTopic(assunto.nome);
                            setSearchTerm(assunto.nome);
                            setIsDropdownOpen(false);
                          }}
                        >
                          <span>{assunto.nome}</span>
                          {assunto.concluido && <CheckCircle size={14} className="text-green-500" />}
                        </div>
                      ))}
                      {linkedMateria.assuntos.filter(a => a.nome.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                        <div className="p-3 text-gray-500 text-sm text-center">
                          Nenhum assunto encontrado.
                        </div>
                      )}
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Book size={18} />
                </div>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeClasses.bg === 'bg-gray-950' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  placeholder="O que você vai estudar hoje?"
                />
              </div>
            )}
            {(!linkedMateria || linkedMateria.assuntos.length === 0) && (
              <p className="text-xs text-gray-500 mt-1">Opcional para este protótipo</p>
            )}
          </div>

          {modalMode === 'manual' && (
            <div>
              <label className={`block text-sm font-medium mb-1 ${themeClasses.text}`}>
                Tempo Estudado (minutos)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Clock size={18} />
                </div>
                <input
                  type="number"
                  value={manualTime}
                  onChange={(e) => setManualTime(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeClasses.bg === 'bg-gray-950' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  placeholder="Ex: 45"
                  min="1"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmAction}>
              {modalMode === 'study' ? 'Iniciar Cronômetro' : 'Salvar Registro'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};