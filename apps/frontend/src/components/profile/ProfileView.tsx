
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/auth';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { User, Mail, Shield } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { user } = useAuth();

  const getRoleName = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'Administrador';
      case UserRole.VETERINARIAN:
        return 'Veterinario';
      default:
        return 'Dueño de Mascota';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
      </div>

      {/* User Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <User className="h-6 w-6 text-blue-500" />
            <h3 className="text-lg font-semibold">Información Personal</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo
              </label>
              <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                {user?.fullName}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                {user?.email}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                <Shield className="h-4 w-4 text-gray-400 mr-2" />
                {getRoleName(user?.role || UserRole.CLIENT)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  user?.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user?.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Información de Cuenta</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">ID de Usuario:</span>
              <span className="ml-2 text-gray-600 font-mono">{user?.id}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Pregunta de Seguridad:</span>
              <span className="ml-2 text-gray-600">{user?.securityQuestion}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Fecha de Registro:</span>
              <span className="ml-2 text-gray-600">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'No disponible'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Última Actualización:</span>
              <span className="ml-2 text-gray-600">
                {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'No disponible'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
