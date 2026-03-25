import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useTheme } from '../../controllers/context/ThemeContext';
import { Save } from 'lucide-react';

interface AIAgent {
  id: string;
  name: string;
  instructions: string;
  model: string;
}

export const ConfiguracoesAgentes: React.FC = () => {
  const { themeClasses } = useTheme();
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/ai-agents');
      if (response.ok) {
        const data = await response.json();
        setAgents(data);
        if (data.length > 0 && !selectedAgent) {
          setSelectedAgent(data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedAgent) return;
    
    try {
      setIsSaving(true);
      setMessage(null);
      const response = await fetch(`/api/ai-agents/${selectedAgent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedAgent),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Agente salvo com sucesso!' });
        setAgents(agents.map(a => a.id === selectedAgent.id ? selectedAgent : a));
      } else {
        setMessage({ type: 'error', text: 'Erro ao salvar agente.' });
      }
    } catch (error) {
      console.error('Failed to save agent:', error);
      setMessage({ type: 'error', text: 'Erro ao salvar agente.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Carregando agentes...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header>
        <h1 className={`text-3xl font-bold ${themeClasses.text}`}>Agente de IA</h1>
        <p className="text-gray-500 mt-2">Configure as instruções e o modelo dos agentes de IA do sistema.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-4 md:col-span-1 h-fit">
          <h2 className={`text-lg font-semibold mb-4 ${themeClasses.text}`}>Agentes</h2>
          <div className="space-y-2">
            {agents.map(agent => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  selectedAgent?.id === agent.id 
                    ? 'bg-blue-100 text-blue-800 font-medium' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {agent.name}
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-6 md:col-span-3">
          {selectedAgent ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className={`text-xl font-semibold ${themeClasses.text}`}>Editar: {selectedAgent.name}</h2>
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  <Save size={18} />
                  {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>

              {message && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {message.text}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Agente</label>
                  <input
                    type="text"
                    value={selectedAgent.name}
                    onChange={(e) => setSelectedAgent({ ...selectedAgent, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                  <select
                    value={selectedAgent.model}
                    onChange={(e) => setSelectedAgent({ ...selectedAgent, model: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="gpt-4o-mini">GPT-4o Mini</option>
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="o1-mini">o1-mini</option>
                    <option value="o1-preview">o1-preview</option>
                    <option value="o3-mini">o3-mini</option>
                    <option value="o4-mini">o4-mini</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instruções (System Prompt)</label>
                  <textarea
                    value={selectedAgent.instructions}
                    onChange={(e) => setSelectedAgent({ ...selectedAgent, instructions: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                    rows={20}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Estas instruções definem o comportamento, regras e formato de saída do agente.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Selecione um agente na lista para editar.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
