import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useTheme } from '../../controllers/context/ThemeContext';
import { Save, Code } from 'lucide-react';

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
  
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importCode, setImportCode] = useState('');
  const [importError, setImportError] = useState('');

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

  const extractInstructions = (body: string) => {
    const prefix = "instructions:";
    const idx = body.indexOf(prefix);
    if (idx === -1) return null;
    
    let start = idx + prefix.length;
    while (start < body.length && /\s/.test(body[start])) {
      start++;
    }
    
    const quoteChar = body[start];
    if (!['`', '"', "'"].includes(quoteChar)) return null;
    
    let end = start + 1;
    let isEscaped = false;
    while (end < body.length) {
      if (body[end] === '\\' && !isEscaped) {
        isEscaped = true;
      } else if (body[end] === quoteChar && !isEscaped) {
        break;
      } else {
        isEscaped = false;
      }
      end++;
    }
    
    let content = body.substring(start + 1, end);
    if (quoteChar === '`') {
      content = content.replace(/\\`/g, '`').replace(/\\\$/g, '$');
    } else if (quoteChar === '"') {
      content = content.replace(/\\"/g, '"').replace(/\\n/g, '\n');
    } else if (quoteChar === "'") {
      content = content.replace(/\\'/g, "'").replace(/\\n/g, '\n');
    }
    
    return content;
  };

  const parseSDKCode = (code: string) => {
    const parsedAgents = [];
    const agentRegex = /new\s+Agent\s*\(\s*\{([\s\S]*?)\}\s*\)/g;
    let match;
    while ((match = agentRegex.exec(code)) !== null) {
      const agentBody = match[1];
      
      const nameMatch = agentBody.match(/name:\s*["']([^"']+)["']/);
      const name = nameMatch ? nameMatch[1] : null;
      
      const modelMatch = agentBody.match(/model:\s*["']([^"']+)["']/);
      const model = modelMatch ? modelMatch[1] : null;
      
      const instructions = extractInstructions(agentBody);
      
      if (name && instructions) {
        parsedAgents.push({ name, instructions, model });
      }
    }
    return parsedAgents;
  };

  const handleImportSDK = () => {
    setImportError('');
    const parsedAgents = parseSDKCode(importCode);
    
    if (parsedAgents.length === 0) {
      setImportError('Nenhum agente encontrado no código fornecido. Verifique se copiou o código completo do SDK.');
      return;
    }

    let updatedCount = 0;
    const newAgentsList = [...agents];

    parsedAgents.forEach(parsedAgent => {
      const existingAgentIndex = newAgentsList.findIndex(a => 
        a.name.toLowerCase() === parsedAgent.name.toLowerCase() || 
        a.id.toLowerCase() === parsedAgent.name.toLowerCase() ||
        parsedAgent.name.toLowerCase().includes(a.name.toLowerCase()) ||
        a.name.toLowerCase().includes(parsedAgent.name.toLowerCase())
      );

      if (existingAgentIndex >= 0) {
        newAgentsList[existingAgentIndex] = {
          ...newAgentsList[existingAgentIndex],
          instructions: parsedAgent.instructions,
          model: parsedAgent.model || newAgentsList[existingAgentIndex].model
        };
        updatedCount++;
        
        if (selectedAgent && selectedAgent.id === newAgentsList[existingAgentIndex].id) {
          setSelectedAgent(newAgentsList[existingAgentIndex]);
        }
      } else if (parsedAgents.length === 1 && selectedAgent) {
        const idx = newAgentsList.findIndex(a => a.id === selectedAgent.id);
        if (idx >= 0) {
          newAgentsList[idx] = {
            ...newAgentsList[idx],
            instructions: parsedAgent.instructions,
            model: parsedAgent.model || newAgentsList[idx].model
          };
          setSelectedAgent(newAgentsList[idx]);
          updatedCount++;
        }
      }
    });

    if (updatedCount > 0) {
      setAgents(newAgentsList);
      setIsImportModalOpen(false);
      setImportCode('');
      setMessage({ type: 'success', text: `${updatedCount} agente(s) atualizado(s) com os dados do SDK! Lembre-se de clicar em "Salvar Alterações".` });
    } else {
      setImportError('Agentes encontrados no código não correspondem aos agentes existentes no sistema.');
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
                <div className="flex gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => setIsImportModalOpen(true)} 
                    className="flex items-center gap-2"
                  >
                    <Code size={18} />
                    Importar SDK
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="flex items-center gap-2"
                  >
                    <Save size={18} />
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </div>
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

      {/* Modal de Importação SDK */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">Importar do Agents SDK</h3>
              <p className="text-gray-500 text-sm mt-1">Cole o código TypeScript exportado do OpenAI Agents SDK. O sistema atualizará automaticamente as instruções e o modelo.</p>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              {importError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                  {importError}
                </div>
              )}
              <textarea
                value={importCode}
                onChange={(e) => setImportCode(e.target.value)}
                placeholder="import { Agent } from 'openai/agents';&#10;&#10;const myAgent = new Agent({&#10;  name: 'Classify',&#10;  instructions: `...`&#10;});"
                className="w-full h-64 p-4 font-mono text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-gray-50"
              />
            </div>
            
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsImportModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleImportSDK}>
                Processar Código
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
