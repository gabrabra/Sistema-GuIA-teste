import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { PermissionProvider } from './controllers/context/PermissionContext';
import { StudyProvider } from './controllers/context/StudyContext';
import { ThemeProvider, useTheme } from './controllers/context/ThemeContext';
import { UserSettingsProvider } from './controllers/context/UserSettingsContext';
import { ProductProvider } from './controllers/context/ProductContext';
import { PromptProvider } from './controllers/context/PromptContext';
import { AIProfileProvider } from './controllers/context/AIProfileContext';
import { MenuProvider } from './controllers/context/MenuContext';
import { Sidebar } from './views/components/layout/Sidebar';
import { Header } from './views/components/layout/Header';
import { Dashboard } from './views/pages/Dashboard';
import { Planeja } from './views/pages/Planeja';
import { Ciclo } from './views/pages/Ciclo';
import { Responde } from './views/pages/Responde';
import { Redige } from './views/pages/Redige';
import { Produtos } from './views/pages/Produtos';
import { Configuracoes } from './views/pages/Configuracoes';
import { ConfiguracoesMaterias } from './views/pages/ConfiguracoesMaterias';
import { ConfiguracoesPermissoes } from './views/pages/ConfiguracoesPermissoes';
import { ConfiguracoesDashboard } from './views/pages/ConfiguracoesDashboard';
import { ConfiguracoesProdutos } from './views/pages/ConfiguracoesProdutos';
import { ConfiguracoesPrompts } from './views/pages/ConfiguracoesPrompts';
import { ConfiguracoesAssinatura } from './views/pages/ConfiguracoesAssinatura';
import { ConfiguracoesMenu } from './views/pages/ConfiguracoesMenu';
import { ConfiguracoesUsuarios } from './views/pages/ConfiguracoesUsuarios';
import { ConfiguracoesAI } from './views/pages/ConfiguracoesAI';
import { ConfiguracoesFrases } from './views/pages/ConfiguracoesFrases';
import { Revisoes } from './views/pages/Revisoes';
import { Login } from './views/pages/Login';
import { Menu } from 'lucide-react';
import { StudyTimerModal } from './views/components/ui/StudyTimerModal';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { themeClasses } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  return (
    <div className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} font-sans flex flex-col md:block transition-colors duration-300`}>
      <StudyTimerModal />
      {/* Mobile Header */}
      <div className={`md:hidden flex items-center justify-between p-4 border-b sticky top-0 z-30 ${themeClasses.cardBg} ${themeClasses.borderColor}`}>
         <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
            GuIA
         </div>
         <button 
            onClick={() => setIsSidebarOpen(true)} 
            className={`p-2 rounded-lg hover:bg-gray-100/10`}
         >
            <Menu size={24} />
         </button>
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto h-[calc(100vh-65px)] md:h-screen">
        <Header />
        {children}
      </main>
    </div>
  );
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  if (isLoginPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <PermissionProvider>
      <UserSettingsProvider>
        <AIProfileProvider>
          <StudyProvider>
            <ProductProvider>
              <PromptProvider>
                <MenuProvider>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/planeja" element={<Planeja />} />
                      <Route path="/ciclo" element={<Ciclo />} />
                      <Route path="/revisoes" element={<Revisoes />} />
                      <Route path="/responde" element={<Responde />} />
                      <Route path="/redige" element={<Redige />} />
                      <Route path="/produtos" element={<Produtos />} />
                      <Route path="/configuracoes" element={<Configuracoes />} />
                      <Route path="/configuracoes/perfil" element={<Configuracoes />} />
                      <Route path="/configuracoes/assinatura" element={<ConfiguracoesAssinatura />} />
                      <Route path="/configuracoes/menu" element={<ConfiguracoesMenu />} />
                      <Route path="/configuracoes/materias" element={<ConfiguracoesMaterias />} />
                      <Route path="/configuracoes/usuarios" element={<ConfiguracoesUsuarios />} />
                      <Route path="/configuracoes/dashboard" element={<ConfiguracoesDashboard />} />
                      <Route path="/configuracoes/permissoes" element={<ConfiguracoesPermissoes />} />
                      <Route path="/configuracoes/produtos" element={<ConfiguracoesProdutos />} />
                      <Route path="/configuracoes/prompts" element={<ConfiguracoesPrompts />} />
                      <Route path="/configuracoes/ai" element={<ConfiguracoesAI />} />
                      <Route path="/configuracoes/frases" element={<ConfiguracoesFrases />} />
                      {/* Redirect unknown routes to dashboard or login */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Layout>
                </MenuProvider>
              </PromptProvider>
            </ProductProvider>
          </StudyProvider>
        </AIProfileProvider>
      </UserSettingsProvider>
    </PermissionProvider>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
};

export default App;
