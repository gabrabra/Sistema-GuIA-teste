import React from 'react';
import { useTheme } from '../../controllers/context/ThemeContext';
import { Card } from '../components/ui/Card';
import { Users, Server, Activity, DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Mock Data
const USER_GROWTH_DATA = [
  { name: 'Jan', users: 400 },
  { name: 'Fev', users: 600 },
  { name: 'Mar', users: 900 },
  { name: 'Abr', users: 1200 },
  { name: 'Mai', users: 1500 },
  { name: 'Jun', users: 2100 },
];

const SYSTEM_USAGE_DATA = [
  { name: '00h', load: 20 },
  { name: '04h', load: 15 },
  { name: '08h', load: 60 },
  { name: '12h', load: 85 },
  { name: '16h', load: 75 },
  { name: '20h', load: 50 },
];

const RECENT_CLIENTS = [
  { id: 1, name: 'João Silva', email: 'joao@email.com', plan: 'Premium', status: 'Ativo', date: 'Hoje, 14:30' },
  { id: 2, name: 'Maria Oliveira', email: 'maria@email.com', plan: 'Básico', status: 'Ativo', date: 'Hoje, 10:15' },
  { id: 3, name: 'Carlos Santos', email: 'carlos@email.com', plan: 'Gratuito', status: 'Inativo', date: 'Ontem, 18:45' },
  { id: 4, name: 'Ana Costa', email: 'ana@email.com', plan: 'Premium', status: 'Ativo', date: 'Ontem, 09:20' },
];

export const ConfiguracoesDashboard: React.FC = () => {
  const { themeClasses } = useTheme();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header>
        <h1 className={`text-3xl font-bold ${themeClasses.text}`}>Dashboard Administrativo</h1>
        <p className="text-gray-500 mt-2">Visão geral da gestão do sistema e métricas de clientes.</p>
      </header>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-4 border-l-4 border-blue-500">
          <div className="p-3 bg-blue-50 rounded-full text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total de Usuários</p>
            <h3 className={`text-2xl font-bold ${themeClasses.text}`}>2,543</h3>
            <span className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp size={12} /> +12% este mês
            </span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 border-l-4 border-green-500">
          <div className="p-3 bg-green-50 rounded-full text-green-600">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Receita Mensal</p>
            <h3 className={`text-2xl font-bold ${themeClasses.text}`}>R$ 45.2k</h3>
            <span className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp size={12} /> +8% vs anterior
            </span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 border-l-4 border-purple-500">
          <div className="p-3 bg-purple-50 rounded-full text-purple-600">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Sessões Ativas</p>
            <h3 className={`text-2xl font-bold ${themeClasses.text}`}>142</h3>
            <span className="text-xs text-gray-500">Agora</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 border-l-4 border-emerald-500">
          <div className="p-3 bg-emerald-50 rounded-full text-emerald-600">
            <Server size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Status do Sistema</p>
            <h3 className={`text-2xl font-bold ${themeClasses.text}`}>Online</h3>
            <span className="text-xs text-emerald-600 flex items-center gap-1">
              <CheckCircle size={12} /> 99.9% Uptime
            </span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className={`text-lg font-semibold mb-6 ${themeClasses.text}`}>Crescimento de Usuários</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={USER_GROWTH_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} 
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
             <div className="flex justify-between items-center mb-6">
                <h3 className={`text-lg font-semibold ${themeClasses.text}`}>Gestão de Clientes Recentes</h3>
                <button className="text-sm text-blue-600 hover:underline">Ver todos</button>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="border-b border-gray-100 text-sm text-gray-500">
                     <th className="py-3 font-medium">Cliente</th>
                     <th className="py-3 font-medium">Plano</th>
                     <th className="py-3 font-medium">Status</th>
                     <th className="py-3 font-medium text-right">Data</th>
                   </tr>
                 </thead>
                 <tbody>
                   {RECENT_CLIENTS.map(client => (
                     <tr key={client.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                       <td className="py-3">
                         <div>
                           <p className={`font-medium ${themeClasses.text}`}>{client.name}</p>
                           <p className="text-xs text-gray-500">{client.email}</p>
                         </div>
                       </td>
                       <td className="py-3">
                         <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                           client.plan === 'Premium' ? 'bg-purple-100 text-purple-700' : 
                           client.plan === 'Básico' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                         }`}>
                           {client.plan}
                         </span>
                       </td>
                       <td className="py-3">
                         <span className={`flex items-center gap-1.5 text-sm ${client.status === 'Ativo' ? 'text-green-600' : 'text-red-500'}`}>
                           <span className={`w-1.5 h-1.5 rounded-full ${client.status === 'Ativo' ? 'bg-green-500' : 'bg-red-500'}`} />
                           {client.status}
                         </span>
                       </td>
                       <td className="py-3 text-right text-sm text-gray-500">{client.date}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </Card>
        </div>

        {/* System Stats Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className={`text-lg font-semibold mb-6 ${themeClasses.text}`}>Carga do Sistema</h3>
            <div className="h-[200px] w-full mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SYSTEM_USAGE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px' }} />
                  <Bar dataKey="load" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">CPU Usage</span>
                  <span className="font-medium text-gray-900">45%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Memory Usage</span>
                  <span className="font-medium text-gray-900">62%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '62%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Storage</span>
                  <span className="font-medium text-gray-900">28%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '28%' }}></div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-yellow-400">
            <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text}`}>Alertas do Sistema</h3>
            <div className="space-y-3">
              <div className="flex gap-3 items-start p-3 bg-yellow-50 rounded-lg">
                <AlertCircle size={18} className="text-yellow-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Alta latência detectada</h4>
                  <p className="text-xs text-yellow-700 mt-1">API response time &gt; 500ms na região Sul.</p>
                  <span className="text-xs text-yellow-600 mt-2 block">Há 15 min</span>
                </div>
              </div>
              <div className="flex gap-3 items-start p-3 bg-blue-50 rounded-lg">
                <Activity size={18} className="text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800">Backup Realizado</h4>
                  <p className="text-xs text-blue-700 mt-1">Backup diário do banco de dados concluído com sucesso.</p>
                  <span className="text-xs text-blue-600 mt-2 block">Há 2 horas</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
