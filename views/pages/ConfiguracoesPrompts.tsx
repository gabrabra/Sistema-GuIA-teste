import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { usePrompts, PromptOption } from '../../controllers/context/PromptContext';
import { useTheme } from '../../controllers/context/ThemeContext';
import { Plus, Edit2, Trash2, MessageSquare, PenTool } from 'lucide-react';
import * as Icons from 'lucide-react';

const COLOR_THEMES = [
  { label: 'Verde', color: 'bg-green-100 border-green-200 hover:bg-green-200', iconColor: 'text-green-700' },
  { label: 'Lima', color: 'bg-lime-100 border-lime-200 hover:bg-lime-200', iconColor: 'text-lime-700' },
  { label: 'Azul', color: 'bg-blue-100 border-blue-200 hover:bg-blue-200', iconColor: 'text-blue-700' },
  { label: 'Roxo', color: 'bg-purple-100 border-purple-200 hover:bg-purple-200', iconColor: 'text-purple-700' },
  { label: 'Laranja', color: 'bg-orange-100 border-orange-200 hover:bg-orange-200', iconColor: 'text-orange-700' },
  { label: 'Rosa', color: 'bg-rose-100 border-rose-200 hover:bg-rose-200', iconColor: 'text-rose-700' },
  { label: 'Pink', color: 'bg-pink-100 border-pink-200 hover:bg-pink-200', iconColor: 'text-pink-700' },
  { label: 'Céu', color: 'bg-sky-100 border-sky-200 hover:bg-sky-200', iconColor: 'text-sky-700' },
  { label: 'Amarelo', color: 'bg-yellow-100 border-yellow-200 hover:bg-yellow-200', iconColor: 'text-yellow-700' },
  { label: 'Violeta', color: 'bg-violet-100 border-violet-200 hover:bg-violet-200', iconColor: 'text-violet-700' },
];

const ICON_OPTIONS = [
  'Baby', 'FileQuestion', 'Brain', 'Briefcase', 'HelpCircle', 'Scale', 'Table2', 'Languages', 'Key',
  'CheckCheck', 'Link', 'RefreshCw', 'AlignLeft', 'LayoutTemplate', 'Maximize2', 'Minimize2', 'Lightbulb',
  'MessageSquare', 'PenTool', 'Sparkles', 'Star', 'Zap', 'Target', 'BookOpen', 'Edit3', 'FileText'
];

export const ConfiguracoesPrompts: React.FC = () => {
  const navigate = useNavigate();
  const { themeClasses } = useTheme();
  const { respondePrompts, redigePrompts, updateRespondePrompts, updateRedigePrompts } = usePrompts();
  
  const [activeTab, setActiveTab] = useState<'responde' | 'redige'>('responde');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<PromptOption | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<PromptOption>>({
    title: '',
    description: '',
    iconName: 'Sparkles',
    color: COLOR_THEMES[0].color,
    iconColor: COLOR_THEMES[0].iconColor
  });

  const currentPrompts = activeTab === 'responde' ? respondePrompts : redigePrompts;
  const updateCurrentPrompts = activeTab === 'responde' ? updateRespondePrompts : updateRedigePrompts;

  const handleOpenModal = (prompt?: PromptOption) => {
    if (prompt) {
      setEditingPrompt(prompt);
      setFormData(prompt);
    } else {
      setEditingPrompt(null);
      setFormData({
        title: '',
        description: '',
        promptContent: '',
        iconName: 'Sparkles',
        color: COLOR_THEMES[0].color,
        iconColor: COLOR_THEMES[0].iconColor
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.title || !formData.promptContent) return;

    if (editingPrompt) {
      const updated = currentPrompts.map(p => 
        p.id === editingPrompt.id ? { ...p, ...formData } as PromptOption : p
      );
      updateCurrentPrompts(updated);
    } else {
      const newPrompt: PromptOption = {
        id: Date.now().toString(),
        title: formData.title!,
        description: formData.description || '',
        promptContent: formData.promptContent!,
        iconName: formData.iconName || 'Sparkles',
        color: formData.color || COLOR_THEMES[0].color,
        iconColor: formData.iconColor || COLOR_THEMES[0].iconColor
      };
      updateCurrentPrompts([...currentPrompts, newPrompt]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      updateCurrentPrompts(currentPrompts.filter(p => p.id !== deleteId));
      setDeleteId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${themeClasses.text}`}>Configurar Prompts IA</h2>
          <p className="text-gray-500">Personalize os botões de ajuda do Guia Responde e Guia Redige.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/configuracoes/ai')} variant="outline">
            Gerenciar Perfis de IA
          </Button>
          <Button onClick={() => handleOpenModal()} variant="primary">
            <Plus size={18} className="mr-2" /> Novo Prompt
          </Button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('responde')}
          className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'responde' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <MessageSquare size={18} /> Guia Responde
        </button>
        <button
          onClick={() => setActiveTab('redige')}
          className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'redige' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <PenTool size={18} /> Guia Redige
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentPrompts.map(prompt => {
          const IconComponent = (Icons as any)[prompt.iconName] || Icons.HelpCircle;
          return (
            <div key={prompt.id} className="flex flex-col h-full relative group p-6 rounded-2xl border shadow-sm bg-white">
              <div className="absolute top-4 right-4 flex gap-2 transition-opacity z-50">
                <button 
                  onClick={() => handleOpenModal(prompt)}
                  className="p-1.5 bg-white rounded-md text-gray-500 hover:text-blue-600 shadow-sm border border-gray-100"
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  onClick={() => handleDelete(prompt.id)}
                  className="p-1.5 bg-white rounded-md text-gray-500 hover:text-red-600 shadow-sm border border-gray-100"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className={`p-3 rounded-xl bg-white/60 mb-3 w-fit ${prompt.iconColor} ${prompt.color.split(' ')[0]}`}>
                <IconComponent size={24} />
              </div>
              <h3 className={`font-bold mb-2 ${themeClasses.text}`}>{prompt.title}</h3>
              <p className="text-sm text-gray-500 flex-1">{prompt.description}</p>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPrompt ? 'Editar Prompt' : 'Novo Prompt'}
      >
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${themeClasses.text}`}>Título</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none ${themeClasses.bg === 'bg-gray-950' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
              placeholder="Ex: Resuma o texto"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${themeClasses.text}`}>Descrição (Resumo)</label>
            <input
              type="text"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none ${themeClasses.bg === 'bg-gray-950' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
              placeholder="Ex: Resumo rápido"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${themeClasses.text}`}>Prompt (O que será enviado à IA)</label>
            <textarea
              value={formData.promptContent}
              onChange={e => setFormData({ ...formData, promptContent: e.target.value })}
              className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none ${themeClasses.bg === 'bg-gray-950' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
              rows={4}
              placeholder="Ex: Faça um resumo destacando os pontos principais..."
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${themeClasses.text}`}>Ícone</label>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-40 overflow-y-auto p-2 border rounded-xl bg-gray-50">
              {ICON_OPTIONS.map(iconName => {
                const IconComp = (Icons as any)[iconName];
                return (
                  <button
                    key={iconName}
                    onClick={() => setFormData({ ...formData, iconName })}
                    className={`p-2 rounded-lg flex justify-center items-center transition-colors ${
                      formData.iconName === iconName ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-500' : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                    title={iconName}
                  >
                    <IconComp size={20} />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${themeClasses.text}`}>Cor do Botão</label>
            <div className="grid grid-cols-5 gap-2">
              {COLOR_THEMES.map(theme => (
                <button
                  key={theme.label}
                  onClick={() => setFormData({ ...formData, color: theme.color, iconColor: theme.iconColor })}
                  className={`h-10 rounded-lg border-2 transition-all ${theme.color.split(' ')[0]} ${
                    formData.color === theme.color ? 'border-gray-800 scale-105' : 'border-transparent hover:scale-105'
                  }`}
                  title={theme.label}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!formData.title || !formData.promptContent}>
              Salvar Prompt
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Confirmar Exclusão"
      >
        <div className="space-y-4">
          <p className={themeClasses.text}>Tem certeza que deseja excluir este prompt? Esta ação não pode ser desfeita.</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button variant="danger" onClick={confirmDelete}>Excluir</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
