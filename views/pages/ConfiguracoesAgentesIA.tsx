import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useTheme } from '../../controllers/context/ThemeContext';

export const ConfiguracoesAgentesIA: React.FC = () => {
  const { themeClasses } = useTheme();
  const [openaiKey, setOpenaiKey] = useState('');
  const [redisUrl, setRedisUrl] = useState('');
  const [guiaRespondePipeline, setGuiaRespondePipeline] = useState('');
  const [guiaRedigePipeline, setGuiaRedigePipeline] = useState('');

  const handleSave = () => {
    // Implement save logic here, e.g., call an API to save these settings
    console.log('Saving AI Agent configurations:', { 
      openaiKey, 
      redisUrl, 
      guiaRespondePipeline,
      guiaRedigePipeline
    });
    alert('Configurações salvas com sucesso!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className={`text-3xl font-bold ${themeClasses.text}`}>Agentes de IA</h1>
        <p className="text-gray-500 mt-2">Configure os agentes de IA e integrações.</p>
      </header>

      <Card className="p-6">
        <h2 className={`text-xl font-semibold mb-4 ${themeClasses.text}`}>Configurações do OpenAI</h2>
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${themeClasses.text}`}>Chave de API OpenAI</label>
            <input 
              type="password" 
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="sk-..."
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className={`text-xl font-semibold mb-4 ${themeClasses.text}`}>Configurações do Redis</h2>
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${themeClasses.text}`}>URL do Redis</label>
            <input 
              type="text" 
              value={redisUrl}
              onChange={(e) => setRedisUrl(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="redis://localhost:6379"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className={`text-xl font-semibold mb-4 ${themeClasses.text}`}>Pipeline: Guia Responde</h2>
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${themeClasses.text}`}>JSON do Pipeline</label>
            <textarea 
              value={guiaRespondePipeline}
              onChange={(e) => setGuiaRespondePipeline(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg h-64 font-mono text-sm"
              placeholder='{"target_agent": "Guia Responde", ...}'
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className={`text-xl font-semibold mb-4 ${themeClasses.text}`}>Pipeline: Guia Redige</h2>
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${themeClasses.text}`}>JSON do Pipeline</label>
            <textarea 
              value={guiaRedigePipeline}
              onChange={(e) => setGuiaRedigePipeline(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg h-64 font-mono text-sm"
              placeholder='{"target_agent": "Guia Redige", ...}'
            />
          </div>
        </div>
      </Card>

      <Button onClick={handleSave}>Salvar Configurações</Button>
    </div>
  );
};
