import React, { useState } from 'react';
import { useStudy } from '../../controllers/context/StudyContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useTheme } from '../../controllers/context/ThemeContext';
import { Plus, Trash2, ChevronDown, ChevronRight, FileText, List, Edit2, Save, X, AlertTriangle } from 'lucide-react';

export const ConfiguracoesMaterias: React.FC = () => {
  const { materias, addMateria, updateMateria, deleteMateria, addAssunto, updateAssunto, deleteAssunto, setMaterias } = useStudy();
  const { themeClasses } = useTheme();
  
  const [activeTab, setActiveTab] = useState<'manual' | 'import'>('manual');
  const [newMateriaName, setNewMateriaName] = useState('');
  const [expandedMateriaId, setExpandedMateriaId] = useState<string | null>(null);
  const [newAssuntoName, setNewAssuntoName] = useState('');
  
  const [editingMateriaId, setEditingMateriaId] = useState<string | null>(null);
  const [editingMateriaName, setEditingMateriaName] = useState('');
  
  const [editingAssuntoId, setEditingAssuntoId] = useState<string | null>(null);
  const [editingAssuntoName, setEditingAssuntoName] = useState('');

  const [importText, setImportText] = useState('');

  // Confirmation Modal State
  const [confirmDelete, setConfirmDelete] = useState<{
    type: 'materia' | 'assunto';
    materiaId: string;
    assuntoId?: string;
    name: string;
  } | null>(null);

  const handleAddMateria = () => {
    if (newMateriaName.trim()) {
      addMateria(newMateriaName.trim());
      setNewMateriaName('');
    }
  };

  const handleAddAssunto = (materiaId: string) => {
    if (newAssuntoName.trim()) {
      addAssunto(materiaId, newAssuntoName.trim());
      setNewAssuntoName('');
    }
  };

  const handleEditMateria = (materiaId: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingMateriaId(materiaId);
    setEditingMateriaName(currentName);
  };

  const handleSaveMateria = (materiaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingMateriaName.trim()) {
      updateMateria(materiaId, editingMateriaName.trim());
    }
    setEditingMateriaId(null);
  };

  const handleDeleteMateria = (materiaId: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDelete({ type: 'materia', materiaId, name });
  };

  const handleEditAssunto = (assuntoId: string, currentName: string) => {
    setEditingAssuntoId(assuntoId);
    setEditingAssuntoName(currentName);
  };

  const handleSaveAssunto = (materiaId: string, assuntoId: string) => {
    if (editingAssuntoName.trim()) {
      updateAssunto(materiaId, assuntoId, { nome: editingAssuntoName.trim() });
    }
    setEditingAssuntoId(null);
  };

  const handleDeleteAssunto = (materiaId: string, assuntoId: string, name: string) => {
    setConfirmDelete({ type: 'assunto', materiaId, assuntoId, name });
  };

  const executeDelete = () => {
    if (!confirmDelete) return;

    if (confirmDelete.type === 'materia') {
      deleteMateria(confirmDelete.materiaId);
    } else if (confirmDelete.type === 'assunto' && confirmDelete.assuntoId) {
      deleteAssunto(confirmDelete.materiaId, confirmDelete.assuntoId);
    }

    setConfirmDelete(null);
  };

  const toggleExpand = (id: string) => {
    if (editingMateriaId === id) return;
    setExpandedMateriaId(expandedMateriaId === id ? null : id);
  };

  const handleImport = () => {
    const lines = importText.split('\n').map(l => l.trim()).filter(l => l);
    let currentMateriaId: string | null = null;
    let newMaterias = [...materias];

    // Simple heuristic: 
    // Lines ending with ":" are subjects.
    // OR Lines that are all uppercase are subjects.
    // Everything else is a topic for the last subject.
    
    lines.forEach(line => {
      const isSubject = line.endsWith(':') || (line === line.toUpperCase() && line.length > 3 && !line.includes('-'));
      
      if (isSubject) {
        const nome = line.replace(':', '').trim();
        const newMateria = {
          id: crypto.randomUUID(),
          nome,
          assuntos: []
        };
        newMaterias.push(newMateria);
        currentMateriaId = newMateria.id;
      } else if (currentMateriaId) {
        // Find the materia and add topic
        const materiaIndex = newMaterias.findIndex(m => m.id === currentMateriaId);
        if (materiaIndex >= 0) {
            newMaterias[materiaIndex].assuntos.push({
                id: crypto.randomUUID(),
                nome: line,
                concluido: false
            });
        }
      }
    });

    setMaterias(newMaterias);
    setImportText('');
    setActiveTab('manual');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className={`text-3xl font-bold ${themeClasses.text}`}>Gerenciar Matérias e Assuntos</h1>
        <p className="text-gray-500 mt-2">Crie ou importe o conteúdo do seu edital para usar no planejamento.</p>
      </header>

      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('manual')}
          className={`pb-2 px-4 font-medium transition-colors ${
            activeTab === 'manual' 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <List size={18} />
            Manual
          </div>
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`pb-2 px-4 font-medium transition-colors ${
            activeTab === 'import' 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText size={18} />
            Importar do Edital
          </div>
        </button>
      </div>

      {activeTab === 'manual' ? (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text}`}>Adicionar Nova Matéria</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={newMateriaName}
                onChange={(e) => setNewMateriaName(e.target.value)}
                placeholder="Nome da matéria (ex: Direito Constitucional)"
                className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeClasses.bg === 'bg-gray-950' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                onKeyDown={(e) => e.key === 'Enter' && handleAddMateria()}
              />
              <Button onClick={handleAddMateria}>
                <Plus size={18} />
                Adicionar
              </Button>
            </div>
          </Card>

          <div className="space-y-4">
            {materias.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    Nenhuma matéria cadastrada. Adicione acima ou importe do edital.
                </div>
            )}
            {materias.map((materia) => (
              <Card key={materia.id} className="p-0 overflow-hidden">
                <div 
                    className={`p-4 flex items-center justify-between cursor-pointer ${themeClasses.bg === 'bg-gray-950' ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
                    onClick={() => toggleExpand(materia.id)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {expandedMateriaId === materia.id ? <ChevronDown size={20} className="text-gray-400" /> : <ChevronRight size={20} className="text-gray-400" />}
                    
                    {editingMateriaId === materia.id ? (
                      <div className="flex items-center gap-2 flex-1" onClick={e => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editingMateriaName}
                          onChange={(e) => setEditingMateriaName(e.target.value)}
                          className={`flex-1 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeClasses.bg === 'bg-gray-950' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveMateria(materia.id, e as any);
                            if (e.key === 'Escape') setEditingMateriaId(null);
                          }}
                        />
                        <button onClick={(e) => handleSaveMateria(materia.id, e)} className="text-green-600 p-1 hover:bg-green-50 rounded">
                          <Save size={16} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setEditingMateriaId(null); }} className="text-red-500 p-1 hover:bg-red-50 rounded">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <h4 className={`font-bold ${themeClasses.text}`}>{materia.nome}</h4>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {materia.assuntos.length} assuntos
                        </span>
                        <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => handleEditMateria(materia.id, materia.nome, e)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={(e) => handleDeleteMateria(materia.id, materia.nome, e)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {expandedMateriaId === materia.id && (
                  <div className={`p-4 border-t ${themeClasses.borderColor} bg-opacity-50 ${themeClasses.bg === 'bg-gray-950' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    <div className="mb-4 flex gap-2">
                        <input
                            type="text"
                            value={newAssuntoName}
                            onChange={(e) => setNewAssuntoName(e.target.value)}
                            placeholder="Adicionar novo assunto..."
                            className={`flex-1 px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeClasses.bg === 'bg-gray-950' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddAssunto(materia.id)}
                        />
                        <Button variant="outline" className="py-1.5 px-3 text-sm" onClick={() => handleAddAssunto(materia.id)}>
                            Adicionar
                        </Button>
                    </div>
                    
                    <ul className="space-y-2 pl-2">
                        {materia.assuntos.length === 0 && <li className="text-sm text-gray-400 italic">Nenhum assunto cadastrado.</li>}
                        {materia.assuntos.map((assunto) => (
                            <li key={assunto.id} className={`text-sm flex items-center justify-between group ${themeClasses.text}`}>
                                <div className="flex items-center gap-2 flex-1">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                  
                                  {editingAssuntoId === assunto.id ? (
                                    <div className="flex items-center gap-2 flex-1">
                                      <input
                                        type="text"
                                        value={editingAssuntoName}
                                        onChange={(e) => setEditingAssuntoName(e.target.value)}
                                        className={`flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeClasses.bg === 'bg-gray-950' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                                        autoFocus
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') handleSaveAssunto(materia.id, assunto.id);
                                          if (e.key === 'Escape') setEditingAssuntoId(null);
                                        }}
                                      />
                                      <button onClick={() => handleSaveAssunto(materia.id, assunto.id)} className="text-green-600 p-1 hover:bg-green-50 rounded">
                                        <Save size={14} />
                                      </button>
                                      <button onClick={() => setEditingAssuntoId(null)} className="text-red-500 p-1 hover:bg-red-50 rounded">
                                        <X size={14} />
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <span>{assunto.nome}</span>
                                      <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                          onClick={() => handleEditAssunto(assunto.id, assunto.nome)}
                                          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                        >
                                          <Edit2 size={14} />
                                        </button>
                                        <button 
                                          onClick={() => handleDeleteAssunto(materia.id, assunto.id, assunto.nome)}
                                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                            </li>
                        ))}
                    </ul>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card className="p-6">
          <h3 className={`text-lg font-semibold mb-2 ${themeClasses.text}`}>Importação Inteligente</h3>
          <p className="text-sm text-gray-500 mb-4">
            Cole o conteúdo do seu edital abaixo. O sistema tentará identificar matérias e assuntos automaticamente.
            <br />
            <strong>Dica:</strong> Use linhas terminadas em ":" ou em CAIXA ALTA para identificar matérias.
          </p>
          
          <textarea
            value={importText || ''}
            onChange={(e) => setImportText(e.target.value)}
            className={`w-full h-64 p-4 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 ${themeClasses.bg === 'bg-gray-950' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
            placeholder={`Exemplo:
DIREITO CONSTITUCIONAL:
Princípios fundamentais
Direitos e garantias fundamentais

DIREITO ADMINISTRATIVO
Organização administrativa
Atos administrativos`}
          />
          
          <div className="flex justify-end">
            <Button onClick={handleImport}>
              Processar e Importar
            </Button>
          </div>
        </Card>
      )}

      {/* Confirmation Modal */}
      <Modal 
        isOpen={!!confirmDelete} 
        onClose={() => setConfirmDelete(null)} 
        title="Confirmar Exclusão"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-amber-600 bg-amber-50 p-3 rounded-lg">
            <AlertTriangle size={24} />
            <p className="text-sm font-medium">
              Esta ação não pode ser desfeita.
            </p>
          </div>
          
          <p className={themeClasses.text}>
            Tem certeza que deseja excluir o {confirmDelete?.type === 'materia' ? 'matéria' : 'assunto'} 
            <strong className="mx-1">"{confirmDelete?.name}"</strong>?
            {confirmDelete?.type === 'materia' && " Todos os assuntos vinculados também serão removidos."}
          </p>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={executeDelete}>
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
