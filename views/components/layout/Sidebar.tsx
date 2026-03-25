import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Map, Repeat, MessageSquare, PenTool, LogOut, GraduationCap, Settings, ChevronDown, ChevronRight, User, Users, Shield, Layout, Book, X, CalendarCheck, ShoppingBag, CreditCard, List, Accessibility, Eye, Type, Languages } from 'lucide-react';
import { useTheme } from '../../../controllers/context/ThemeContext';
import { useStudy } from '../../../controllers/context/StudyContext';
import { useMenu } from '../../../controllers/context/MenuContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

import { usePermissions } from '../../../controllers/context/PermissionContext';

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { themeClasses } = useTheme();
  const { disciplinas, concursoSelecionado } = useStudy();
  const { menuVisibility } = useMenu();
  const { hasPermission } = usePermissions();
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isA11yOpen, setIsA11yOpen] = useState(false);

  // Accessibility states
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('a11y_contrast') === 'true');
  const [largeFont, setLargeFont] = useState(() => localStorage.getItem('a11y_font') === 'true');
  const [librasEnabled, setLibrasEnabled] = useState(() => localStorage.getItem('a11y_libras') === 'true');

  useEffect(() => {
    if (location.pathname.startsWith('/configuracoes')) {
      setIsConfigOpen(true);
    }
    // Close sidebar on route change (mobile)
    onClose();
  }, [location.pathname]);

  // Apply Accessibility settings
  useEffect(() => {
    localStorage.setItem('a11y_contrast', String(highContrast));
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  useEffect(() => {
    localStorage.setItem('a11y_font', String(largeFont));
    if (largeFont) {
      document.documentElement.classList.add('large-font');
    } else {
      document.documentElement.classList.remove('large-font');
    }
  }, [largeFont]);

  useEffect(() => {
    localStorage.setItem('a11y_libras', String(librasEnabled));
    
    const widget = document.querySelector('[vw]');
    
    if (widget) {
      if (librasEnabled) {
        (widget as HTMLElement).style.display = 'block';
      } else {
        (widget as HTMLElement).style.display = 'none';
      }
    }
  }, [librasEnabled]);
  
  const hasCycle = !!concursoSelecionado || disciplinas.length > 0;

  const navItems = [
    ...(menuVisibility.dashboard && hasPermission('dash_view') ? [{ name: 'Dashboard', path: '/', icon: LayoutDashboard }] : []),
    ...(menuVisibility.planeja && hasPermission('plan_view') ? [{ name: 'Guia Planeja', path: '/planeja', icon: Map }] : []),
    ...(hasCycle && menuVisibility.ciclo && hasPermission('cycle_view') ? [{ name: 'Ciclo de Estudos', path: '/ciclo', icon: Repeat }] : []),
    ...(hasCycle && menuVisibility.revisoes && hasPermission('cycle_view') ? [{ name: 'Revisões', path: '/revisoes', icon: CalendarCheck }] : []),
    ...(menuVisibility.responde && hasPermission('resp_view') ? [{ name: 'Guia Responde', path: '/responde', icon: MessageSquare }] : []),
    ...(menuVisibility.redige && hasPermission('red_view') ? [{ name: 'Guia Redige', path: '/redige', icon: PenTool }] : []),
    ...(menuVisibility.produtos && hasPermission('dash_view') ? [{ name: 'Produtos', path: '/produtos', icon: ShoppingBag }] : []),
  ];

  const configSubItems = [
    { name: 'Perfil', path: '/configuracoes/perfil', icon: User, permission: 'conf_profile' },
    { name: 'Assinatura', path: '/configuracoes/assinatura', icon: CreditCard, permission: 'conf_assinatura' },
    { name: 'Menu', path: '/configuracoes/menu', icon: List, permission: 'conf_menu' },
    { name: 'Matérias & Assuntos', path: '/configuracoes/materias', icon: Book, permission: 'conf_subjects' },
    { name: 'Usuários', path: '/configuracoes/usuarios', icon: Users, permission: 'conf_users' },
    { name: 'Dashboard', path: '/configuracoes/dashboard', icon: Layout, permission: 'conf_dash' },
    { name: 'Permissões', path: '/configuracoes/permissoes', icon: Shield, permission: 'conf_perms' },
    { name: 'Produtos', path: '/configuracoes/produtos', icon: ShoppingBag, permission: 'conf_produtos' },
    { name: 'Prompts IA', path: '/configuracoes/prompts', icon: MessageSquare, permission: 'conf_prompts' },
    { name: 'Frases', path: '/configuracoes/frases', icon: Type, permission: 'conf_phrases' },
    { name: 'Agente de IA', path: '/configuracoes/agentes', icon: MessageSquare, permission: 'conf_prompts' },
  ].filter(item => hasPermission(item.permission));

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

            {/* Acessibilidade Menu Item */}
            <div>
              <button
                onClick={() => setIsA11yOpen(!isA11yOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                  isA11yOpen
                    ? `${themeClasses.sidebarActiveBg} ${themeClasses.sidebarActiveText} font-semibold`
                    : `${themeClasses.sidebarText} hover:bg-gray-50 hover:text-gray-900`
                }`}
              >
                <div className="flex items-center gap-3">
                  <Accessibility size={20} />
                  <span>Acessibilidade</span>
                </div>
                {isA11yOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>

              {isA11yOpen && (
                <div className={`mt-1 ml-4 space-y-1 border-l-2 ${themeClasses.sidebarBorder} pl-2`}>
                  <button 
                    onClick={() => setHighContrast(!highContrast)}
                    className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm transition-colors ${themeClasses.sidebarText} hover:bg-gray-50 hover:text-gray-900`}
                  >
                    <div className="flex items-center gap-3">
                      <Eye size={16} />
                      <span>Alto Contraste</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full transition-colors ${highContrast ? 'bg-blue-600' : 'bg-gray-300'} relative`}>
                      <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${highContrast ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </div>
                  </button>
                  <button 
                    onClick={() => setLargeFont(!largeFont)}
                    className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm transition-colors ${themeClasses.sidebarText} hover:bg-gray-50 hover:text-gray-900`}
                  >
                    <div className="flex items-center gap-3">
                      <Type size={16} />
                      <span>Fonte Maior</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full transition-colors ${largeFont ? 'bg-blue-600' : 'bg-gray-300'} relative`}>
                      <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${largeFont ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </div>
                  </button>
                  <button 
                    onClick={() => setLibrasEnabled(!librasEnabled)}
                    className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm transition-colors ${themeClasses.sidebarText} hover:bg-gray-50 hover:text-gray-900`}
                  >
                    <div className="flex items-center gap-3">
                      <Languages size={16} />
                      <span>Libras (VLibras)</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full transition-colors ${librasEnabled ? 'bg-blue-600' : 'bg-gray-300'} relative`}>
                      <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${librasEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </div>
                  </button>
                </div>
              )}
            </div>

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
                <div className={`mt-1 ml-4 space-y-1 border-l-2 ${themeClasses.sidebarBorder} pl-2`}>
                  {configSubItems.map((subItem) => (
                    <NavLink
                      key={subItem.path}
                      to={subItem.path}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? `${themeClasses.sidebarActiveBg} ${themeClasses.sidebarActiveText} font-medium`
                            : `${themeClasses.sidebarText} hover:bg-gray-50 hover:text-gray-900`
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

        <div className={`p-6 border-t ${themeClasses.sidebarBorder}`}>
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
