import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Map, Repeat, MessageSquare, PenTool, LogOut, GraduationCap, Settings, ChevronDown, ChevronRight, User, Users, Shield, Layout, Book, X, CalendarCheck, ShoppingBag, CreditCard, List } from 'lucide-react';
import { useTheme } from '../../../controllers/context/ThemeContext';
import { useStudy } from '../../../controllers/context/StudyContext';
import { useMenu } from '../../../controllers/context/MenuContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { themeClasses } = useTheme();
  const { disciplinas, concursoSelecionado } = useStudy();
  const { menuVisibility } = useMenu();
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  useEffect(() => {
    if (location.pathname.startsWith('/configuracoes')) {
      setIsConfigOpen(true);
    }
    // Close sidebar on route change (mobile)
    onClose();
  }, [location.pathname]);
  
  const hasCycle = !!concursoSelecionado || disciplinas.length > 0;

  const navItems = [
    ...(menuVisibility.dashboard ? [{ name: 'Dashboard', path: '/', icon: LayoutDashboard }] : []),
    ...(menuVisibility.planeja ? [{ name: 'Guia Planeja', path: '/planeja', icon: Map }] : []),
    ...(hasCycle && menuVisibility.ciclo ? [{ name: 'Ciclo de Estudos', path: '/ciclo', icon: Repeat }] : []),
    ...(hasCycle && menuVisibility.revisoes ? [{ name: 'Revisões', path: '/revisoes', icon: CalendarCheck }] : []),
    ...(menuVisibility.responde ? [{ name: 'Guia Responde', path: '/responde', icon: MessageSquare }] : []),
    ...(menuVisibility.redige ? [{ name: 'Guia Redige', path: '/redige', icon: PenTool }] : []),
    ...(menuVisibility.produtos ? [{ name: 'Produtos', path: '/produtos', icon: ShoppingBag }] : []),
  ];

  const configSubItems = [
    { name: 'Perfil', path: '/configuracoes/perfil', icon: User },
    { name: 'Assinatura', path: '/configuracoes/assinatura', icon: CreditCard },
    { name: 'Menu', path: '/configuracoes/menu', icon: List },
    { name: 'Matérias & Assuntos', path: '/configuracoes/materias', icon: Book },
    { name: 'Usuários', path: '/configuracoes/usuarios', icon: Users },
    { name: 'Dashboard', path: '/configuracoes/dashboard', icon: Layout },
    { name: 'Permissões', path: '/configuracoes/permissoes', icon: Shield },
    { name: 'Produtos', path: '/configuracoes/produtos', icon: ShoppingBag },
    { name: 'Prompts IA', path: '/configuracoes/prompts', icon: MessageSquare },
  ];

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  const isConfigActive = location.pathname.startsWith('/configuracoes');

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed left-0 top-0 h-screen w-64 
          ${themeClasses.sidebarBg} border-r ${themeClasses.sidebarBorder} 
          flex flex-col justify-between z-50 
          transition-transform duration-300 ease-in-out
          overflow-y-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3 text-blue-600">
              <div className="bg-blue-50 p-2 rounded-lg">
                <GraduationCap size={28} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">GuIA</h1>
            </div>
            {/* Mobile Close Button */}
            <button 
              onClick={onClose}
              className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive
                      ? `${themeClasses.sidebarActiveBg} ${themeClasses.sidebarActiveText} font-semibold`
                      : `${themeClasses.sidebarText} hover:bg-gray-50 hover:text-gray-900`
                  }`
                }
              >
                <item.icon size={20} />
                {item.name}
              </NavLink>
            ))}

            {/* Configurações Menu Item */}
            <div>
              <button
                onClick={() => setIsConfigOpen(!isConfigOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                  isConfigActive
                    ? `${themeClasses.sidebarActiveBg} ${themeClasses.sidebarActiveText} font-semibold`
                    : `${themeClasses.sidebarText} hover:bg-gray-50 hover:text-gray-900`
                }`}
              >
                <div className="flex items-center gap-3">
                  <Settings size={20} />
                  <span>Configurações</span>
                </div>
                {isConfigOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>

              {isConfigOpen && (
                <div className="mt-1 ml-4 space-y-1 border-l-2 border-gray-100 pl-2">
                  {configSubItems.map((subItem) => (
                    <NavLink
                      key={subItem.path}
                      to={subItem.path}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? `${themeClasses.sidebarActiveText} font-medium bg-gray-50`
                            : `${themeClasses.sidebarText} hover:text-gray-900`
                        }`
                      }
                    >
                      <subItem.icon size={16} />
                      {subItem.name}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>

        <div className="p-6 border-t border-gray-50">
          <button 
            onClick={handleLogout}
            className={`flex items-center gap-3 ${themeClasses.sidebarText} hover:text-red-500 transition-colors w-full px-4 py-2`}
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
};
