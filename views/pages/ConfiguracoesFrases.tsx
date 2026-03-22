import React, { useState, useEffect } from 'react';
import { useTheme } from '../../controllers/context/ThemeContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, Edit2, Trash2, Save, X, Quote, Bold, Italic, Palette, FileSpreadsheet } from 'lucide-react';

interface PhraseStyle {
  color?: string;
  bold?: boolean;
  italic?: boolean;
}

interface Phrase {
  id: string;
  phrase: string;
  author: string;
  showDate: string | null;
  style?: PhraseStyle;
  createdAt: string;
}

export const ConfiguracoesFrases: React.FC = () => {
  const { themeClasses } = useTheme();
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Phrase>>({ style: {} });
  const [isAdding, setIsAdding] = useState(false);
  const [isBulkAdding, setIsBulkAdding] = useState(false);
  const [bulkText, setBulkText] = useState('');

  useEffect(() => {
    fetchPhrases();
  }, []);

  const fetchPhrases = async () => {
    try {
      const res = await fetch('/api/motivational-phrases');
      if (res.ok) {
        const data = await res.json();
        setPhrases(data);
      }
    } catch (err) {
      console.error('Failed to fetch phrases', err);
    }
  };

  const handleSave = async () => {
    try {
      if (isAdding) {
        const newPhrase = {
          id: `phrase_${Date.now()}`,
          phrase: editForm.phrase,
          author: editForm.author || '',
          showDate: editForm.showDate || null,
          style: editForm.style || {},
        };
        await fetch('/api/motivational-phrases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPhrase),
        });
      } else if (isEditing) {
        await fetch(`/api/motivational-phrases/${isEditing}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phrase: editForm.phrase,
            author: editForm.author || '',
            showDate: editForm.showDate || null,
            style: editForm.style || {},
          }),
        });
      }
      await fetchPhrases();
      setIsEditing(null);
      setIsAdding(false);
      setEditForm({ style: {} });
    } catch (err) {
      console.error('Failed to save phrase', err);
    }
  };

  const handleBulkSave = async () => {
    try {
      if (!bulkText.trim()) return;

      const rows = bulkText.split('\n').filter(row => row.trim() !== '');
      const newPhrases = rows.map((row, index) => {
        const columns = row.split('\t');
        const phrase = columns[0]?.trim();
        const author = columns[1]?.trim() || '';
        const showDate = columns[2]?.trim() || null;

        return {
          id: `phrase_${Date.now()}_${index}`,
          phrase,
          author,
          showDate,
          style: {}
        };
      }).filter(p => p.phrase); // Only keep rows that have at least a phrase

      if (newPhrases.length === 0) {
        alert('Nenhuma frase válida encontrada. Verifique o formato.');
        return;
      }

      await fetch('/api/motivational-phrases/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phrases: newPhrases }),
      });

      await fetchPhrases();
      setIsBulkAdding(false);
      setBulkText('');
    } catch (err) {
      console.error('Failed to bulk save phrases', err);
      alert('Erro ao importar frases. Verifique o console para mais detalhes.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta frase?')) return;
    try {
      await fetch(`/api/motivational-phrases/${id}`, {
        method: 'DELETE',
      });
      await fetchPhrases();
    } catch (err) {
      console.error('Failed to delete phrase', err);
    }
  };

  const toggleStyle = (key: keyof PhraseStyle) => {
    setEditForm(prev => ({
      ...prev,
      style: {
        ...prev.style,
        [key]: !prev.style?.[key]
      }
    }));
  };

  const updateColor = (color: string) => {
    setEditForm(prev => ({
      ...prev,
      style: {
        ...prev.style,
        color
      }
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold ${themeClasses.text}`}>Frases do Dashboard</h1>
          <p className="text-gray-500 mt-2">Gerencie as frases motivacionais exibidas no painel principal</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={() => {
              setIsBulkAdding(true);
              setIsAdding(false);
              setIsEditing(null);
              setBulkText('');
            }}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Importar Planilha
          </Button>
          <Button 
            onClick={() => {
              setIsAdding(true);
              setIsBulkAdding(false);
              setEditForm({ style: {} });
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Frase
          </Button>
        </div>
      </header>

      {isBulkAdding && (
        <Card className="p-6 border-indigo-200 bg-indigo-50/30">
          <h2 className={`text-xl font-semibold mb-2 ${themeClasses.text}`}>
            Importação em Lote
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Copie os dados do Excel ou Google Sheets e cole na caixa abaixo. 
            A planilha deve ter as colunas na seguinte ordem: <strong>Frase</strong> | <strong>Autor</strong> (opcional) | <strong>Data de Exibição</strong> (opcional, formato YYYY-MM-DD).
          </p>
          <div className="space-y-4">
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
              rows={8}
              placeholder="Exemplo:&#10;O sucesso é a soma de pequenos esforços...&#9;Robert Collier&#9;2024-12-25&#10;Acredite em você mesmo.&#9;&#9;"
            />
            <div className="flex justify-end gap-2 mt-6">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsBulkAdding(false);
                  setBulkText('');
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleBulkSave} disabled={!bulkText.trim()}>
                Importar Frases
              </Button>
            </div>
          </div>
        </Card>
      )}

      {(isAdding || isEditing) && !isBulkAdding && (
        <Card className="p-6">
          <h2 className={`text-xl font-semibold mb-4 ${themeClasses.text}`}>
            {isAdding ? 'Adicionar Nova Frase' : 'Editar Frase'}
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-end mb-1">
                <label className="block text-sm font-medium text-gray-700">Frase</label>
                <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-md border">
                  <button
                    onClick={() => toggleStyle('bold')}
                    className={`p-1.5 rounded ${editForm.style?.bold ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-200'}`}
                    title="Negrito"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleStyle('italic')}
                    className={`p-1.5 rounded ${editForm.style?.italic ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-200'}`}
                    title="Itálico"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <div className="h-4 w-px bg-gray-300 mx-1"></div>
                  <div className="relative flex items-center">
                    <Palette className="w-4 h-4 text-gray-500 mr-1" />
                    <input
                      type="color"
                      value={editForm.style?.color || '#000000'}
                      onChange={(e) => updateColor(e.target.value)}
                      className="w-6 h-6 p-0 border-0 rounded cursor-pointer"
                      title="Cor do texto"
                    />
                  </div>
                </div>
              </div>
              <textarea
                value={editForm.phrase || ''}
                onChange={(e) => setEditForm({ ...editForm, phrase: e.target.value })}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                style={{
                  fontWeight: editForm.style?.bold ? 'bold' : 'normal',
                  fontStyle: editForm.style?.italic ? 'italic' : 'normal',
                  color: editForm.style?.color || 'inherit'
                }}
                rows={3}
                placeholder="Digite a frase motivacional..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Autor (Opcional)</label>
                <input
                  type="text"
                  value={editForm.author || ''}
                  onChange={(e) => setEditForm({ ...editForm, author: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Nome do autor"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Exibição (Opcional)</label>
                <input
                  type="date"
                  value={editForm.showDate || ''}
                  onChange={(e) => setEditForm({ ...editForm, showDate: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">Se preenchido, a frase só aparecerá nesta data específica.</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAdding(false);
                  setIsEditing(null);
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={!editForm.phrase?.trim()}>
                Salvar
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4">
        {phrases.map((phrase) => (
          <Card key={phrase.id} className="p-6">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  <Quote className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-1" />
                  <div>
                    <p 
                      className="text-lg"
                      style={{
                        fontWeight: phrase.style?.bold ? 'bold' : 'normal',
                        fontStyle: phrase.style?.italic ? 'italic' : 'normal',
                        color: phrase.style?.color || 'inherit',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      "{phrase.phrase}"
                    </p>
                    {phrase.author && (
                      <p className="text-sm text-gray-500 mt-1">— {phrase.author}</p>
                    )}
                  </div>
                </div>
                {phrase.showDate && (
                  <div className="mt-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    Exibição agendada para: {new Date(phrase.showDate).toLocaleDateString()}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsEditing(phrase.id);
                    setEditForm({
                      ...phrase,
                      style: phrase.style || {}
                    });
                    setIsAdding(false);
                  }}
                  className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(phrase.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
        
        {phrases.length === 0 && !isAdding && (
          <div className="text-center py-12 text-gray-500 bg-white/50 rounded-xl border border-dashed border-gray-200">
            <Quote className="w-8 h-8 mx-auto mb-3 text-gray-400" />
            <p>Nenhuma frase cadastrada ainda.</p>
            <p className="text-sm mt-1">Clique em "Nova Frase" para adicionar.</p>
          </div>
        )}
      </div>
    </div>
  );
};
