import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useTheme } from '../../controllers/context/ThemeContext';
import { AIProfile } from '../../models/types';

export const ConfiguracoesAI: React.FC = () => {
  const { themeClasses } = useTheme();
  const [profiles, setProfiles] = useState<AIProfile[]>([
    { id: '1', name: 'Básico', promptsPerDay: 10, maxCharactersPerPrompt: 500 },
  ]);
  const [newProfile, setNewProfile] = useState({ name: '', promptsPerDay: 0, maxCharactersPerPrompt: 0 });

  const handleAddProfile = () => {
    if (newProfile.name && newProfile.promptsPerDay > 0 && newProfile.maxCharactersPerPrompt > 0) {
      setProfiles([...profiles, { ...newProfile, id: crypto.randomUUID() }]);
      setNewProfile({ name: '', promptsPerDay: 0, maxCharactersPerPrompt: 0 });
    } else {
      alert('Preencha todos os campos corretamente');
    }
  };

  const handleDeleteProfile = (id: string) => {
    setProfiles(profiles.filter(p => p.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className={`text-3xl font-bold ${themeClasses.text}`}>Configurações de IA</h1>
        <p className="text-gray-500 mt-2">Gerencie perfis de uso da IA e seus limites.</p>
      </header>

      <Card className="p-6">
        <h2 className={`text-xl font-semibold mb-4 ${themeClasses.text}`}>Criar Novo Perfil</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            type="text" 
            placeholder="Nome do Perfil"
            value={newProfile.name}
            onChange={(e) => setNewProfile({...newProfile, name: e.target.value})}
            className="px-4 py-2 border rounded-lg"
          />
          <input 
            type="number" 
            placeholder="Prompts por dia"
            value={newProfile.promptsPerDay || ''}
            onChange={(e) => setNewProfile({...newProfile, promptsPerDay: parseInt(e.target.value)})}
            className="px-4 py-2 border rounded-lg"
          />
          <input 
            type="number" 
            placeholder="Caracteres por prompt"
            value={newProfile.maxCharactersPerPrompt || ''}
            onChange={(e) => setNewProfile({...newProfile, maxCharactersPerPrompt: parseInt(e.target.value)})}
            className="px-4 py-2 border rounded-lg"
          />
          <Button onClick={handleAddProfile}>Adicionar Perfil</Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className={`text-xl font-semibold mb-4 ${themeClasses.text}`}>Perfis Existentes</h2>
        <div className="space-y-4">
          {profiles.map(profile => (
            <div key={profile.id} className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h3 className="font-bold">{profile.name}</h3>
                <p className="text-sm text-gray-500">{profile.promptsPerDay} prompts/dia, {profile.maxCharactersPerPrompt} caracteres/prompt</p>
              </div>
              <Button variant="danger" onClick={() => handleDeleteProfile(profile.id)}>Excluir</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
