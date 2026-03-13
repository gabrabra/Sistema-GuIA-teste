import React, { useState } from 'react';
import { useStudy } from '../../controllers/context/StudyContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useTheme } from '../../controllers/context/ThemeContext';
import { Plus, Trash2, ChevronDown, ChevronRight, FileText, List } from 'lucide-react';

export const ConfiguracoesMaterias: React.FC = () => {
  const { materias, addMateria, addAssunto, setMaterias } = useStudy();
  const { themeClasses } = useTheme();
  
  const [activeTab, setActiveTab] = useState<'manual' | 'import'>('manual');
  const [newMateriaName, setNewMateriaName] = useState('');
  const [expandedMateriaId, setExpandedMateriaId] = useState<string | null>(null);
  const [newAssuntoName, setNewAssuntoName] = useState('');
  
  const [importText, setImportText] = useState('');

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

  const toggleExpand = (id: string) => {
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
                  <div className="flex items-center gap-3">
                    {expandedMateriaId === materia.id ? <ChevronDown size={20} className="text-gray-400" /> : <ChevronRight size={20} className="text-gray-400" />}
                    <h4 className={`font-bold ${themeClasses.text}`}>{materia.nome}</h4>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {materia.assuntos.length} assuntos
                    </span>
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
                            <li key={assunto.id} className={`text-sm flex items-center gap-2 ${themeClasses.text}`}>
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                {assunto.nome}
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
            value={importText}
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
    </div>
  );
};
