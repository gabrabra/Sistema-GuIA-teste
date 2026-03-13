import React from 'react';
import { Card } from '../components/ui/Card';
import { useTheme } from '../../controllers/context/ThemeContext';
import { useMenu } from '../../controllers/context/MenuContext';
import { LayoutDashboard, Map, Repeat, CalendarCheck, MessageSquare, PenTool, ShoppingBag } from 'lucide-react';

export const ConfiguracoesMenu: React.FC = () => {
  const { themeClasses } = useTheme();
  const { menuVisibility, toggleMenuVisibility } = useMenu();

  const menuItems = [
    { key: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, description: 'Visão geral do seu progresso' },
    { key: 'planeja', name: 'Guia Planeja', icon: Map, description: 'Planejamento de estudos' },
    { key: 'ciclo', name: 'Ciclo de Estudos', icon: Repeat, description: 'Seu ciclo de estudos ativo' },
    { key: 'revisoes', name: 'Revisões', icon: CalendarCheck, description: 'Controle de revisões programadas' },
    { key: 'responde', name: 'Guia Responde', icon: MessageSquare, description: 'Tire dúvidas com a IA' },
    { key: 'redige', name: 'Guia Redige', icon: PenTool, description: 'Correção de redações com IA' },
    { key: 'produtos', name: 'Produtos', icon: ShoppingBag, description: 'Cursos e materiais disponíveis' },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className={`text-2xl font-bold ${themeClasses.text}`}>Configurações do Menu</h2>
        <p className="text-gray-500">Escolha quais itens devem aparecer no menu principal da aplicação.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {menuItems.map((item) => (
          <Card key={item.key} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-blue-50 text-blue-600`}>
                <item.icon size={24} />
              </div>
              <div>
                <h3 className={`font-bold ${themeClasses.text}`}>{item.name}</h3>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={menuVisibility[item.key as keyof typeof menuVisibility]}
                onChange={() => toggleMenuVisibility(item.key as keyof typeof menuVisibility)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </Card>
        ))}
      </div>
    </div>
  );
};
