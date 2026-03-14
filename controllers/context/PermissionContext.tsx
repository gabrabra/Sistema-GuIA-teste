import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Role, Permission } from '../../models/types';

interface PermissionContextType {
  roles: Role[];
  hasPermission: (permissionId: string) => boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const roleId = user.roleId;

  useEffect(() => {
    fetch('/api/roles')
      .then(res => res.json())
      .then(data => setRoles(data))
      .catch(err => console.error('Failed to fetch roles', err));
  }, []);

  const hasPermission = (permissionId: string) => {
    if (!roleId) return false;
    const role = roles.find(r => r.id === roleId);
    if (!role) return false;
    if (role.id === 'admin') return true; // Admin has all permissions
    return role.permissions.includes(permissionId);
  };

  return (
    <PermissionContext.Provider value={{ roles, hasPermission }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};
