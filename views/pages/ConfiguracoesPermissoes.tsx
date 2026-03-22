import React, { useState, useEffect } from 'react';
import { useTheme } from '../../controllers/context/ThemeContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Permission, Role } from '../../models/types';
import { Shield, Check, X, Lock, Unlock, Plus, Trash2, Edit2, Save } from 'lucide-react';

// Mock Data for Permissions
const ALL_PERMISSIONS: Permission[] = [
  // Dashboard
  { id: 'dash_view', name: 'Visualizar Dashboard', description: 'Acesso aos gráficos e métricas gerais', module: 'dashboard' },
  { id: 'dash_export', name: 'Exportar Relatórios', description: 'Permite exportar dados do dashboard', module: 'dashboard' },
  
  // Planeja
  { id: 'plan_view', name: 'Visualizar Planejamento', description: 'Ver o plano de estudos atual', module: 'planeja' },
  { id: 'plan_edit', name: 'Editar Planejamento', description: 'Criar ou modificar planos de estudo', module: 'planeja' },
  { id: 'plan_delete', name: 'Excluir Planejamento', description: 'Remover planos existentes', module: 'planeja' },

  // Ciclo
  { id: 'cycle_view', name: 'Visualizar Ciclo', description: 'Acesso ao ciclo de estudos', module: 'ciclo' },
  { id: 'cycle_timer', name: 'Usar Cronômetro', description: 'Iniciar e parar sessões de estudo', module: 'ciclo' },
  { id: 'cycle_manual', name: 'Registro Manual', description: 'Adicionar horas manualmente', module: 'ciclo' },

  // Responde
  { id: 'resp_view', name: 'Acessar Guia Responde', description: 'Usar o chat de IA', module: 'responde' },
  { id: 'resp_history', name: 'Ver Histórico', description: 'Acessar conversas antigas', module: 'responde' },

  // Redige
  { id: 'red_view', name: 'Acessar Guia Redige', description: 'Usar ferramenta de redação', module: 'redige' },
  { id: 'red_submit', name: 'Enviar Redação', description: 'Submeter textos para correção', module: 'redige' },

  // Configurações
  { id: 'conf_profile', name: 'Editar Perfil', description: 'Alterar dados pessoais', module: 'configuracoes' },
  { id: 'conf_assinatura', name: 'Acessar Assinatura', description: 'Gerenciar plano de assinatura', module: 'configuracoes' },
  { id: 'conf_menu', name: 'Configurar Menu', description: 'Personalizar visibilidade do menu', module: 'configuracoes' },
  { id: 'conf_subjects', name: 'Gerenciar Matérias', description: 'Cadastrar matérias e assuntos', module: 'configuracoes' },
  { id: 'conf_users', name: 'Gerenciar Usuários', description: 'Adicionar ou remover usuários', module: 'configuracoes' },
  { id: 'conf_dash', name: 'Configurar Dashboard', description: 'Personalizar layout do dashboard', module: 'configuracoes' },
  { id: 'conf_perms', name: 'Gerenciar Permissões', description: 'Alterar regras de acesso', module: 'configuracoes' },
  { id: 'conf_produtos', name: 'Gerenciar Produtos', description: 'Cadastrar produtos', module: 'configuracoes' },
  { id: 'conf_prompts', name: 'Configurar Prompts IA', description: 'Gerenciar prompts do sistema', module: 'configuracoes' },
  { id: 'conf_phrases', name: 'Gerenciar Frases', description: 'Configurar frases motivacionais do dashboard', module: 'configuracoes' },
];

const INITIAL_ROLES: Role[] = [
  { 
    id: 'admin', 
    name: 'Administrador', 
    permissions: ALL_PERMISSIONS.map(p => p.id) // All permissions
  },
  { 
    id: 'student', 
    name: 'Estudante', 
    permissions: ['dash_view', 'plan_view', 'plan_edit', 'cycle_view', 'cycle_timer', 'cycle_manual', 'resp_view', 'red_view', 'red_submit', 'conf_profile', 'conf_subjects']
  },
  { 
    id: 'guest', 
    name: 'Visitante', 
    permissions: ['dash_view', 'plan_view']
  }
];

export const ConfiguracoesPermissoes: React.FC = () => {
  const { themeClasses } = useTheme();
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('admin');
  const [isEditingRoleName, setIsEditingRoleName] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');

  useEffect(() => {
    fetch('/api/roles')
      .then(res => res.json())
      .then(async (data: Role[]) => {
        if (data.length === 0) {
          setRoles(INITIAL_ROLES);
          for (const r of INITIAL_ROLES) {
            await fetch('/api/roles', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(r)
            });
          }
        } else {
          setRoles(data);
        }
      })
      .catch(err => console.error('Failed to fetch roles', err));
  }, []);

  const selectedRole = roles.find(r => r.id === selectedRoleId) || roles[0];

  if (!selectedRole) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <header>
          <h1 className={`text-3xl font-bold ${themeClasses.text}`}>Permissões</h1>
          <p className="text-gray-500 mt-2">Carregando perfis e permissões...</p>
        </header>
      </div>
    );
  }

  const togglePermission = (permissionId: string) => {
    if (!selectedRole || selectedRole.id === 'admin') return; // Admin always has all permissions (mock rule)

    setRoles(prevRoles => {
      const newRoles = prevRoles.map(role => {
        if (role.id === selectedRoleId) {
          const hasPermission = role.permissions.includes(permissionId);
          return {
            ...role,
            permissions: hasPermission 
              ? role.permissions.filter(p => p !== permissionId)
              : [...role.permissions, permissionId]
          };
        }
        return role;
      });

      const updatedRole = newRoles.find(r => r.id === selectedRoleId);
      if (updatedRole) {
        fetch(`/api/roles/${updatedRole.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedRole)
        }).catch(err => console.error('Failed to update role', err));
      }

      return newRoles;
    });
  };

  const handleAddRole = () => {
    const newRole: Role = {
      id: crypto.randomUUID(),
      name: 'Novo Perfil',
      permissions: []
    };
    setRoles([...roles, newRole]);
    setSelectedRoleId(newRole.id);

    fetch('/api/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRole)
    }).catch(err => console.error('Failed to create role', err));
  };

  const handleDeleteRole = (roleId: string) => {
    if (roleId === 'admin') return;
    setRoles(roles.filter(r => r.id !== roleId));
    if (selectedRoleId === roleId) setSelectedRoleId('admin');

    fetch(`/api/roles/${roleId}`, {
      method: 'DELETE'
    }).catch(err => console.error('Failed to delete role', err));
  };

  const updateRoleName = () => {
    if (newRoleName.trim() && selectedRole) {
      setRoles(prevRoles => {
        const newRoles = prevRoles.map(r => r.id === selectedRoleId ? { ...r, name: newRoleName } : r);
        const updatedRole = newRoles.find(r => r.id === selectedRoleId);
        if (updatedRole) {
          fetch(`/api/roles/${updatedRole.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedRole)
          }).catch(err => console.error('Failed to update role', err));
        }
        return newRoles;
      });
      setIsEditingRoleName(false);
      setNewRoleName('');
    }
  };

  const startEditingName = () => {
    if (selectedRole) {
      setNewRoleName(selectedRole.name);
      setIsEditingRoleName(true);
    }
  };

  // Group permissions by module
  const permissionsByModule = ALL_PERMISSIONS.reduce((acc, perm) => {
    if (!acc[perm.module]) acc[perm.module] = [];
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  const moduleNames: Record<string, string> = {
    dashboard: 'Dashboard',
    planeja: 'Guia Planeja',
    ciclo: 'Ciclo de Estudos',
    responde: 'Guia Responde',
    redige: 'Guia Redige',
    configuracoes: 'Configurações'
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 h-full flex flex-col">
      <header>
        <h1 className={`text-3xl font-bold ${themeClasses.text}`}>Gerenciamento de Permissões</h1>
        <p className="text-gray-500 mt-2">Defina o que cada perfil de usuário pode acessar no sistema.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        {/* Sidebar: Roles List */}
        <Card className="lg:col-span-1 flex flex-col p-4 h-64 lg:h-full overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className={`font-semibold ${themeClasses.text}`}>Perfis de Acesso</h3>
            <button onClick={handleAddRole} className="p-1 hover:bg-gray-100 rounded-full text-blue-600">
              <Plus size={20} />
            </button>
          </div>
          
          <div className="space-y-2 overflow-y-auto flex-1 pr-2">
            {roles.map(role => (
              <div 
                key={role.id}
                onClick={() => setSelectedRoleId(role.id)}
                className={`
                  flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all
                  ${selectedRoleId === role.id 
                    ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' 
                    : 'hover:bg-gray-50 border border-transparent'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Shield size={16} className={selectedRoleId === role.id ? 'text-blue-600' : 'text-gray-400'} />
                  <span className={`font-medium ${selectedRoleId === role.id ? 'text-blue-700' : 'text-gray-600'}`}>
                    {role.name}
                  </span>
                </div>
                {role.id !== 'admin' && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteRole(role.id); }}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Main Content: Permissions Matrix */}
        <Card className="lg:col-span-3 flex flex-col p-6 h-full overflow-hidden">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              {isEditingRoleName ? (
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    className="border rounded px-2 py-1 text-lg font-bold"
                    autoFocus
                  />
                  <button onClick={updateRoleName} className="text-green-600"><Save size={18} /></button>
                  <button onClick={() => setIsEditingRoleName(false)} className="text-red-500"><X size={18} /></button>
                </div>
              ) : (
                <>
                  <h2 className={`text-2xl font-bold ${themeClasses.text}`}>{selectedRole.name}</h2>
                  {selectedRole.id !== 'admin' && (
                    <button onClick={startEditingName} className="text-gray-400 hover:text-blue-600">
                      <Edit2 size={16} />
                    </button>
                  )}
                </>
              )}
            </div>
            
            <div className="text-sm text-gray-500 flex items-center gap-2">
              {selectedRole.id === 'admin' ? (
                <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                  <Lock size={14} /> Perfil protegido
                </span>
              ) : (
                <>
                  <span className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    <Unlock size={14} /> Editável
                  </span>
                  <button 
                    onClick={() => handleDeleteRole(selectedRole.id)}
                    className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1 rounded-full hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={14} /> Excluir Perfil
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="overflow-y-auto pr-4 flex-1 space-y-8">
            {Object.entries(permissionsByModule).map(([moduleKey, permissions]) => (
              <div key={moduleKey} className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2 border-b pb-2">
                  {moduleNames[moduleKey] || moduleKey}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {permissions.map(perm => {
                    const isGranted = selectedRole.permissions.includes(perm.id);
                    return (
                      <div 
                        key={perm.id}
                        onClick={() => togglePermission(perm.id)}
                        className={`
                          flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer
                          ${isGranted 
                            ? 'bg-blue-50/50 border-blue-200' 
                            : 'bg-gray-50/50 border-gray-100 hover:border-gray-300'
                          }
                          ${selectedRole.id === 'admin' ? 'cursor-not-allowed opacity-80' : ''}
                        `}
                      >
                        <div className={`
                          mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors
                          ${isGranted ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}
                        `}>
                          {isGranted && <Check size={12} className="text-white" />}
                        </div>
                        <div>
                          <h4 className={`font-medium ${isGranted ? 'text-blue-900' : 'text-gray-700'}`}>
                            {perm.name}
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {perm.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
