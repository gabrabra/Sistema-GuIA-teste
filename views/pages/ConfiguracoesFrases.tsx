import React, { useState, useEffect } from 'react';
import { useTheme } from '../../controllers/context/ThemeContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, Edit2, Trash2, Save, X, Quote } from 'lucide-react';

interface Phrase {
  id: string;
  phrase: string;
  author: string;
  showDate: string | null;
  createdAt: string;
}

export const ConfiguracoesFrases: React.FC = () => {
  const { themeClasses } = useTheme();
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Phrase>>({});
  const [isAdding, setIsAdding] = useState(false);

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
          }),
        });
      }
      await fetchPhrases();
      setIsEditing(null);
      setIsAdding(false);
      setEditForm({});
    } catch (err) {
      console.error('Failed to save phrase', err);
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold ${themeClasses.text}`}>Frases do Dashboard</h1>
          <p className="text-gray-500 mt-2">Gerencie as frases motivacionais exibidas no painel principal</p>
        </div>
        <Button 
          onClick={() => {
            setIsAdding(true);
            setEditForm({});
          }}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova Frase
        </Button>
      </header>

      {(isAdding || isEditing) && (
        <Card className="p-6">
          <h2 className={`text-xl font-semibold mb-4 ${themeClasses.text}`}>
            {isAdding ? 'Adicionar Nova Frase' : 'Editar Frase'}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frase</label>
              <textarea
                value={editForm.phrase || ''}
                onChange={(e) => setEditForm({ ...editForm, phrase: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                    <p className={`text-lg font-medium ${themeClasses.text}`}>"{phrase.phrase}"</p>
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
                    setEditForm(phrase);
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
