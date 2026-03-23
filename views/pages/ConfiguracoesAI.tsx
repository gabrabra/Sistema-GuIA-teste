import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useTheme } from '../../controllers/context/ThemeContext';
import { useAIProfile } from '../../controllers/context/AIProfileContext';
import { AIProfile } from '../../models/types';
import { X } from 'lucide-react';

export const ConfiguracoesAI: React.FC = () => {
  const { themeClasses } = useTheme();
  const { profiles, addProfile, updateProfile, deleteProfile, isLoading } = useAIProfile();
  
  const [editingProfile, setEditingProfile] = useState<AIProfile | null>(null);
  
  const [newProfile, setNewProfile] = useState<{
    name: string;
    periodicity: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'bimonthly' | 'quarterly' | 'quadrimesterly' | 'semiannual' | 'yearly' | 'biannual';
    respondePrompts: number;
    respondeChars: number;
    redigePrompts: number;
    redigeChars: number;
  }>({ 
    name: '', 
    periodicity: 'daily',
    respondePrompts: 0, respondeChars: 0,
    redigePrompts: 0, redigeChars: 0
  });

  const handleAddProfile = async () => {
    if (newProfile.name && newProfile.respondePrompts > 0 && newProfile.respondeChars > 0 && newProfile.redigePrompts > 0 && newProfile.redigeChars > 0) {
      try {
        await addProfile({ 
          id: crypto.randomUUID(), 
          name: newProfile.name,
          periodicity: newProfile.periodicity,
          responde: { promptsPerPeriod: newProfile.respondePrompts, maxCharactersPerPrompt: newProfile.respondeChars },
          redige: { promptsPerPeriod: newProfile.redigePrompts, maxCharactersPerPrompt: newProfile.redigeChars }
        });
        setNewProfile({ name: '', periodicity: 'daily', respondePrompts: 0, respondeChars: 0, redigePrompts: 0, redigeChars: 0 });
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

  const handleUpdateProfile = async () => {
    if (editingProfile && editingProfile.name && editingProfile.responde.promptsPerPeriod > 0 && editingProfile.responde.maxCharactersPerPrompt > 0 && editingProfile.redige.promptsPerPeriod > 0 && editingProfile.redige.maxCharactersPerPrompt > 0) {
      try {
        await updateProfile(editingProfile.id, editingProfile);
        setEditingProfile(null);
      } catch (error) {
        console.error('Erro ao atualizar perfil', error);
      }
    } else {
      console.warn('Preencha todos os campos corretamente');
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
            className="px-4 py-2 border rounded-lg"
          />
          <select
            value={newProfile.periodicity}
            onChange={(e) => setNewProfile({...newProfile, periodicity: e.target.value as any})}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="daily">Diário</option>
            <option value="weekly">Semanal</option>
            <option value="biweekly">Quinzenal</option>
            <option value="monthly">Mensal</option>
            <option value="bimonthly">Bimestral</option>
            <option value="quarterly">Trimestral</option>
            <option value="quadrimesterly">Quadrimestral</option>
            <option value="semiannual">Semestral</option>
            <option value="yearly">Anual</option>
            <option value="biannual">Bianual</option>
          </select>
          <div className="p-4 border rounded-lg">
            <h3 className="font-bold mb-2">Guia Responde</h3>
            <input 
              type="number" 
              placeholder="Prompts/período"
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
              placeholder="Prompts/período"
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
                <h3 className="font-bold">{profile.name} <span className="text-xs font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2">
                  {profile.periodicity === 'daily' ? 'Diário' : 
                   profile.periodicity === 'weekly' ? 'Semanal' : 
                   profile.periodicity === 'biweekly' ? 'Quinzenal' : 
                   profile.periodicity === 'monthly' ? 'Mensal' : 
                   profile.periodicity === 'bimonthly' ? 'Bimestral' : 
                   profile.periodicity === 'quarterly' ? 'Trimestral' : 
                   profile.periodicity === 'quadrimesterly' ? 'Quadrimestral' : 
                   profile.periodicity === 'semiannual' ? 'Semestral' : 
                   profile.periodicity === 'yearly' ? 'Anual' : 
                   profile.periodicity === 'biannual' ? 'Bianual' : profile.periodicity}
                </span></h3>
                <p className="text-sm text-gray-500 mt-1">
                  Responde: {profile.responde.promptsPerPeriod} prompts/período, {profile.responde.maxCharactersPerPrompt} chars/prompt
                </p>
                <p className="text-sm text-gray-500">
                  Redige: {profile.redige.promptsPerPeriod} prompts/período, {profile.redige.maxCharactersPerPrompt} chars/prompt
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setEditingProfile(profile)}>Editar</Button>
                <Button variant="danger" onClick={() => handleDeleteProfile(profile.id)}>Excluir</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {editingProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 w-full max-w-2xl bg-white relative">
            <button 
              onClick={() => setEditingProfile(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Editar Perfil</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="Nome do Perfil"
                value={editingProfile.name}
                onChange={(e) => setEditingProfile({...editingProfile, name: e.target.value})}
                className="px-4 py-2 border rounded-lg text-gray-900"
              />
              <select
                value={editingProfile.periodicity}
                onChange={(e) => setEditingProfile({...editingProfile, periodicity: e.target.value as any})}
                className="px-4 py-2 border rounded-lg text-gray-900"
              >
                <option value="daily">Diário</option>
                <option value="weekly">Semanal</option>
                <option value="biweekly">Quinzenal</option>
                <option value="monthly">Mensal</option>
                <option value="bimonthly">Bimestral</option>
                <option value="quarterly">Trimestral</option>
                <option value="quadrimesterly">Quadrimestral</option>
                <option value="semiannual">Semestral</option>
                <option value="yearly">Anual</option>
                <option value="biannual">Bianual</option>
              </select>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-bold mb-2 text-gray-900">Guia Responde</h3>
                <input 
                  type="number" 
                  placeholder="Prompts/período"
                  value={editingProfile.responde.promptsPerPeriod || ''}
                  onChange={(e) => setEditingProfile({
                    ...editingProfile, 
                    responde: { ...editingProfile.responde, promptsPerPeriod: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full px-4 py-2 border rounded-lg mb-2 text-gray-900"
                />
                <input 
                  type="number" 
                  placeholder="Caracteres/prompt"
                  value={editingProfile.responde.maxCharactersPerPrompt || ''}
                  onChange={(e) => setEditingProfile({
                    ...editingProfile, 
                    responde: { ...editingProfile.responde, maxCharactersPerPrompt: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full px-4 py-2 border rounded-lg text-gray-900"
                />
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-bold mb-2 text-gray-900">Guia Redige</h3>
                <input 
                  type="number" 
                  placeholder="Prompts/período"
                  value={editingProfile.redige.promptsPerPeriod || ''}
                  onChange={(e) => setEditingProfile({
                    ...editingProfile, 
                    redige: { ...editingProfile.redige, promptsPerPeriod: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full px-4 py-2 border rounded-lg mb-2 text-gray-900"
                />
                <input 
                  type="number" 
                  placeholder="Caracteres/prompt"
                  value={editingProfile.redige.maxCharactersPerPrompt || ''}
                  onChange={(e) => setEditingProfile({
                    ...editingProfile, 
                    redige: { ...editingProfile.redige, maxCharactersPerPrompt: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full px-4 py-2 border rounded-lg text-gray-900"
                />
              </div>
              
              <Button onClick={handleUpdateProfile} className="md:col-span-2">Salvar Alterações</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
