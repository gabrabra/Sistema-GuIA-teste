import React, { useState } from 'react';
import { useStudy } from '../../controllers/context/StudyContext';
import { useTheme } from '../../controllers/context/ThemeContext';
import { Trash2, CheckCircle, Circle, AlertCircle, Calendar } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const Revisoes: React.FC = () => {
  const { materias, updateAssunto, deleteAssunto, isTimerRunning, activeTopic } = useStudy();
  const { themeClasses } = useTheme();
  const [filter, setFilter] = useState<'todos' | 'pendente' | 'atrasado'>('todos');

  // Helper to calculate revision dates
  const getRevisionDates = (dateString?: string, completedRevisions: string[] = []) => {
    if (!dateString) return { next: null, status: 'Não iniciado', all: [] };
    
    const studyDate = new Date(dateString);
    studyDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Revision intervals: 1 day (24h), 7 days, 30 days
    const rev1 = new Date(studyDate); rev1.setDate(studyDate.getDate() + 1);
    const rev7 = new Date(studyDate); rev7.setDate(studyDate.getDate() + 7);
    const rev30 = new Date(studyDate); rev30.setDate(studyDate.getDate() + 30);

    const revisions = [
      { date: rev1, label: '24h' },
      { date: rev7, label: '7d' },
      { date: rev30, label: '30d' }
    ];

    // Find the first revision that is NOT completed
    const nextRevision = revisions.find(r => !completedRevisions.includes(r.label));
    
    let status = 'Concluído';
    
    if (nextRevision) {
      if (nextRevision.date < today) {
        status = 'Atrasado';
      } else if (nextRevision.date.getTime() === today.getTime()) {
        status = 'Para hoje';
      } else {
        status = 'Em dia';
      }
    }
    
    return { next: nextRevision || null, status, all: revisions };
  };

  // Flatten data for the table
  const allTopics = materias.flatMap(materia => 
    materia.assuntos.map(assunto => {
      const { next, status, all } = getRevisionDates(assunto.dataEstudo, assunto.revisoesConcluidas);
      return {
        materiaId: materia.id,
        materiaNome: materia.nome,
        ...assunto,
        nextRevision: next,
        revisionStatus: status,
        allRevisions: all
      };
    })
  );

  // Filter topics to show only those that have been finished
  const topicsToDisplay = allTopics.filter(t => t.concluido);

  // Group topics by materia
  const groupedTopics = topicsToDisplay.reduce((acc: Record<string, typeof allTopics>, topic) => {
    if (!acc[topic.materiaNome]) {
      acc[topic.materiaNome] = [];
    }
    acc[topic.materiaNome].push(topic);
    return acc;
  }, {});

  const [expandedDisciplinas, setExpandedDisciplinas] = useState<Record<string, boolean>>({});

  const toggleDisciplina = (materiaNome: string) => {
    setExpandedDisciplinas(prev => ({
      ...prev,
      [materiaNome]: !prev[materiaNome]
    }));
  };

  const filteredTopics = topicsToDisplay.filter(topic => {
    if (filter === 'todos') return true;
    if (filter === 'pendente') return topic.revisionStatus === 'Para hoje';
    if (filter === 'atrasado') return topic.revisionStatus === 'Atrasado';
    return true;
  });

  // Re-group filtered topics
  const filteredGroupedTopics: Record<string, typeof allTopics> = filteredTopics.reduce((acc: Record<string, typeof allTopics>, topic) => {
    if (!acc[topic.materiaNome]) {
      acc[topic.materiaNome] = [];
    }
    acc[topic.materiaNome].push(topic);
    return acc;
  }, {});

  const counts = {
    todos: topicsToDisplay.length,
    pendente: topicsToDisplay.filter(t => t.revisionStatus === 'Para hoje').length,
    atrasado: topicsToDisplay.filter(t => t.revisionStatus === 'Atrasado').length
  };

  const handleDelete = (materiaId: string, assuntoId: string) => {
    if (confirm('Tem certeza que deseja excluir este tópico?')) {
      deleteAssunto(materiaId, assuntoId);
    }
  };

  const handleToggleRevision = (materiaId: string, assuntoId: string, revisionLabel: string, currentRevisions: string[] = [], currentDataEstudo?: string) => {
    const newRevisions = currentRevisions.includes(revisionLabel)
      ? currentRevisions.filter(r => r !== revisionLabel)
      : [...currentRevisions, revisionLabel];
    
    const updates: any = { revisoesConcluidas: newRevisions };
    
    // If user checks a revision but hasn't set a study date, assume study date is today
    // This allows the dynamic calculation to start working immediately
    if (!currentDataEstudo && newRevisions.length > 0) {
      updates.dataEstudo = new Date().toISOString();
    }
    
    updateAssunto(materiaId, assuntoId, updates);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-2xl font-bold ${themeClasses.text}`}>Controle de Revisões</h1>
          <p className="text-gray-500">Gerencie suas revisões espaçadas (24h, 7d, 30d)</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total de Tópicos</p>
            <p className={`text-3xl font-bold ${themeClasses.text}`}>{counts.todos}</p>
          </div>
          <div className={`p-3 rounded-full ${themeClasses.bg}`}>
            <CheckCircle size={24} className={themeClasses.text} />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Pendentes Hoje</p>
            <p className="text-3xl font-bold text-yellow-500">
              {counts.pendente}
            </p>
          </div>
          <div className={`p-3 rounded-full ${themeClasses.bg}`}>
            <Calendar size={24} className="text-yellow-500" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Atrasadas</p>
            <p className="text-3xl font-bold text-red-500">
              {counts.atrasado}
            </p>
          </div>
          <div className={`p-3 rounded-full ${themeClasses.bg}`}>
            <AlertCircle size={24} className="text-red-500" />
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className={`p-4 border-b ${themeClasses.borderColor} flex gap-2`}>
          <button 
            onClick={() => setFilter('todos')}
            className={`px-4 py-1 rounded-full text-sm transition-colors ${filter === 'todos' ? `${themeClasses.sidebarActiveBg} ${themeClasses.sidebarActiveText}` : 'text-gray-500 hover:bg-gray-100'}`}
          >
            Todos <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${filter === 'todos' ? 'bg-white/20' : 'bg-gray-200 text-gray-700'}`}>{counts.todos}</span>
          </button>
          <button 
            onClick={() => setFilter('pendente')}
            className={`px-4 py-1 rounded-full text-sm transition-colors ${filter === 'pendente' ? `${themeClasses.sidebarActiveBg} ${themeClasses.sidebarActiveText}` : 'text-gray-500 hover:bg-gray-100'}`}
          >
            Revisar Hoje <span className="ml-1 bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded-full text-xs">{counts.pendente}</span>
          </button>
          <button 
            onClick={() => setFilter('atrasado')}
            className={`px-4 py-1 rounded-full text-sm transition-colors ${filter === 'atrasado' ? `${themeClasses.sidebarActiveBg} ${themeClasses.sidebarActiveText}` : 'text-gray-500 hover:bg-gray-100'}`}
          >
            Atrasadas <span className="ml-1 bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full text-xs">{counts.atrasado}</span>
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl">
          <table className="w-full text-left text-sm border-collapse">
            <tbody className="divide-y divide-gray-100">
              {Object.keys(filteredGroupedTopics).length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                    Nenhum tópico encontrado.
                  </td>
                </tr>
              ) : (
                Object.entries(filteredGroupedTopics).map(([materiaNome, topics]) => (
                  <React.Fragment key={materiaNome}>
                    <tr 
                      className={`cursor-pointer hover:bg-gray-50 transition-colors ${themeClasses.bg} ${expandedDisciplinas[materiaNome] ? 'bg-blue-100' : ''}`}
                      onClick={() => toggleDisciplina(materiaNome)}
                    >
                      <td colSpan={10} className="px-6 py-4 font-bold flex items-center gap-2">
                        {expandedDisciplinas[materiaNome] ? '▼' : '▶'} {materiaNome} ({topics.length})
                      </td>
                    </tr>
                    {expandedDisciplinas[materiaNome] && (
                      <>
                        <tr className={`text-xs uppercase bg-gray-50 text-gray-500`}>
                          <th className="px-6 py-4 font-medium"></th>
                          <th className="px-6 py-4 font-medium">Tópico</th>
                          <th className="px-6 py-4 font-medium">Data Estudo</th>
                          <th className="px-6 py-4 font-medium text-center">24h</th>
                          <th className="px-6 py-4 font-medium text-center">7d</th>
                          <th className="px-6 py-4 font-medium text-center">30d</th>
                          <th className="px-6 py-4 font-medium text-center">Simulado</th>
                          <th className="px-6 py-4 font-medium">Status</th>
                          <th className="px-6 py-4 font-medium">Próxima</th>
                          <th className="px-6 py-4 font-medium text-right">Ações</th>
                        </tr>
                        {topics.map((topic) => (
                          <tr key={topic.id} className="hover:bg-gray-50 transition-colors">
                            <td className={`px-6 py-4 font-medium ${themeClasses.text}`}></td>
                            <td className="px-6 py-4 text-gray-500">{topic.nome}</td>
                            <td className={`px-6 py-4 ${themeClasses.text}`}>
                              <input 
                                type="date" 
                                value={topic.dataEstudo ? new Date(topic.dataEstudo).toISOString().split('T')[0] : ''}
                                onChange={(e) => {
                                  const newDate = e.target.value;
                                  if (newDate) {
                                    updateAssunto(topic.materiaId, topic.id, { dataEstudo: new Date(newDate).toISOString() });
                                  }
                                }}
                                className={`bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none text-sm w-32 ${themeClasses.text}`}
                              />
                            </td>
                            
                            {/* Checkboxes for revisions */}
                            {['24h', '7d', '30d', 'simulado'].map((revType) => (
                              <td key={revType} className="px-6 py-4 text-center">
                                <div className="flex justify-center">
                                  <input 
                                    type="checkbox" 
                                    checked={topic.revisoesConcluidas?.includes(revType) || false}
                                    onChange={() => handleToggleRevision(topic.materiaId, topic.id, revType, topic.revisoesConcluidas, topic.dataEstudo)}
                                    className={`rounded border-gray-300 text-blue-600 focus:ring-2`} 
                                  />
                                </div>
                              </td>
                            ))}

                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${topic.revisionStatus === 'Para hoje' ? 'bg-yellow-100 text-yellow-800' : 
                                  topic.revisionStatus === 'Atrasado' ? 'bg-red-100 text-red-800' : 
                                  topic.revisionStatus === 'Concluído' ? 'bg-green-100 text-green-800' :
                                  'bg-blue-100 text-blue-800'}`}>
                                {topic.revisionStatus}
                              </span>
                            </td>
                            <td className={`px-6 py-4 ${themeClasses.text}`}>
                              {topic.nextRevision ? (
                                <div className="flex flex-col">
                                  <span className="text-xs text-gray-500">{topic.nextRevision.label}</span>
                                  <span>{topic.nextRevision.date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                                </div>
                              ) : '-'}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button 
                                onClick={() => handleDelete(topic.materiaId, topic.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

