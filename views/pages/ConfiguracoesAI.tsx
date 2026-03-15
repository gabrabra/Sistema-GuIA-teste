import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useTheme } from '../../controllers/context/ThemeContext';
import { useAIProfile } from '../../controllers/context/AIProfileContext';
import { AIProfile } from '../../models/types';

export const ConfiguracoesAI: React.FC = () => {
  const { themeClasses } = useTheme();
  const { profiles, addProfile, deleteProfile, isLoading } = useAIProfile();
  
  const [newProfile, setNewProfile] = useState({ 
    name: '', 
    respondePrompts: 0, respondeChars: 0,
    redigePrompts: 0, redigeChars: 0
  });

  const handleAddProfile = async () => {
    if (newProfile.name && newProfile.respondePrompts > 0 && newProfile.respondeChars > 0 && newProfile.redigePrompts > 0 && newProfile.redigeChars > 0) {
      try {
        await addProfile({ 
          id: crypto.randomUUID(), 
          name: newProfile.name,
          responde: { promptsPerDay: newProfile.respondePrompts, maxCharactersPerPrompt: newProfile.respondeChars },
          redige: { promptsPerDay: newProfile.redigePrompts, maxCharactersPerPrompt: newProfile.redigeChars }
        });
        setNewProfile({ name: '', respondePrompts: 0, respondeChars: 0, redigePrompts: 0, redigeChars: 0 });
      } catch (error) {
        console.error('Erro ao adicionar perfil', error);
      }
    } else {
      console.warn('Preencha todos os campos corretamente');
    }
  };

  const handleDeleteProfile = async (id: string) => {
    try {
      await deleteProfile(id);
    } catch (error) {
      console.error('Erro ao excluir perfil', error);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Carregando perfis...</div>;
  }

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
            className="px-4 py-2 border rounded-lg md:col-span-2"
          />
          <div className="p-4 border rounded-lg">
            <h3 className="font-bold mb-2">Guia Responde</h3>
            <input 
              type="number" 
              placeholder="Prompts/dia"
              value={newProfile.respondePrompts || ''}
              onChange={(e) => setNewProfile({...newProfile, respondePrompts: parseInt(e.target.value)})}
              className="w-full px-4 py-2 border rounded-lg mb-2"
            />
            <input 
              type="number" 
              placeholder="Caracteres/prompt"
              value={newProfile.respondeChars || ''}
              onChange={(e) => setNewProfile({...newProfile, respondeChars: parseInt(e.target.value)})}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-bold mb-2">Guia Redige</h3>
            <input 
              type="number" 
              placeholder="Prompts/dia"
              value={newProfile.redigePrompts || ''}
              onChange={(e) => setNewProfile({...newProfile, redigePrompts: parseInt(e.target.value)})}
              className="w-full px-4 py-2 border rounded-lg mb-2"
            />
            <input 
              type="number" 
              placeholder="Caracteres/prompt"
              value={newProfile.redigeChars || ''}
              onChange={(e) => setNewProfile({...newProfile, redigeChars: parseInt(e.target.value)})}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <Button onClick={handleAddProfile} className="md:col-span-2">Adicionar Perfil</Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className={`text-xl font-semibold mb-4 ${themeClasses.text}`}>Perfis Existentes</h2>
        <div className="space-y-4">
          {profiles.map(profile => (
            <div key={profile.id} className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h3 className="font-bold">{profile.name}</h3>
                <p className="text-sm text-gray-500">
                  Responde: {profile.responde.promptsPerDay} prompts/dia, {profile.responde.maxCharactersPerPrompt} chars/prompt
                </p>
                <p className="text-sm text-gray-500">
                  Redige: {profile.redige.promptsPerDay} prompts/dia, {profile.redige.maxCharactersPerPrompt} chars/prompt
                </p>
              </div>
              <Button variant="danger" onClick={() => handleDeleteProfile(profile.id)}>Excluir</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
