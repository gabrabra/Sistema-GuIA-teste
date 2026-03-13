import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { StudyProvider } from './controllers/context/StudyContext';
import { ThemeProvider, useTheme } from './controllers/context/ThemeContext';
import { ProductProvider } from './controllers/context/ProductContext';
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
import { Revisoes } from './views/pages/Revisoes';
import { Login } from './views/pages/Login';
import { Menu } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { themeClasses } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  return (
    <div className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} font-sans flex flex-col md:block transition-colors duration-300`}>
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

  if (isLoginPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  return (
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
        <Route path="/configuracoes/materias" element={<ConfiguracoesMaterias />} />
        <Route path="/configuracoes/usuarios" element={<Configuracoes />} />
        <Route path="/configuracoes/dashboard" element={<ConfiguracoesDashboard />} />
        <Route path="/configuracoes/permissoes" element={<ConfiguracoesPermissoes />} />
        <Route path="/configuracoes/produtos" element={<ConfiguracoesProdutos />} />
        {/* Redirect unknown routes to dashboard or login */}
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <StudyProvider>
        <ProductProvider>
          <Router>
            <AppContent />
          </Router>
        </ProductProvider>
      </StudyProvider>
    </ThemeProvider>
  );
};

export default App;
