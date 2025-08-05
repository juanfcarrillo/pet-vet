
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/auth';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Calendar, MessageCircle, Users, Activity, Heart, Stethoscope } from 'lucide-react';

export const DashboardHome: React.FC = () => {
  const { user } = useAuth();

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = '';
    
    if (hour < 12) greeting = 'Buenos días';
    else if (hour < 18) greeting = 'Buenas tardes';
    else greeting = 'Buenas noches';

    return `${greeting}, ${user?.fullName}!`;
  };

  const getRoleSpecificContent = () => {
    switch (user?.role) {
      case UserRole.VETERINARIAN:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Citas Hoy"
              value="8"
              icon={Calendar}
              color="blue"
            />
            <StatCard
              title="Pacientes Activos"
              value="45"
              icon={Heart}
              color="green"
            />
            <StatCard
              title="Mensajes"
              value="12"
              icon={MessageCircle}
              color="purple"
            />
            <StatCard
              title="Emergencias"
              value="2"
              icon={Activity}
              color="red"
            />
          </div>
        );
      
      case UserRole.ADMIN:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Usuarios"
              value="156"
              icon={Users}
              color="blue"
            />
            <StatCard
              title="Veterinarios"
              value="8"
              icon={Stethoscope}
              color="green"
            />
            <StatCard
              title="Citas Hoy"
              value="24"
              icon={Calendar}
              color="purple"
            />
            <StatCard
              title="Sistema"
              value="Online"
              icon={Activity}
              color="green"
            />
          </div>
        );
      
      default: // CLIENT
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Próxima Cita"
              value="Mañana 10:00"
              icon={Calendar}
              color="blue"
            />
            <StatCard
              title="Mis Mascotas"
              value="3"
              icon={Heart}
              color="green"
            />
            <StatCard
              title="Mensajes"
              value="2"
              icon={MessageCircle}
              color="purple"
            />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold">{getWelcomeMessage()}</h1>
        <p className="text-blue-100 mt-2">
          Bienvenido al sistema Pet-Vet. Aquí tienes un resumen de tu actividad.
        </p>
      </div>

      {/* Stats Cards */}
      {getRoleSpecificContent()}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {user?.role === UserRole.CLIENT && (
                <>
                  <QuickActionButton
                    href="/dashboard/appointments/new"
                    title="Agendar Cita"
                    description="Reserva una nueva cita para tu mascota"
                    icon={Calendar}
                  />
                  <QuickActionButton
                    href="/dashboard/chat"
                    title="Contactar Veterinario"
                    description="Envía un mensaje al equipo médico"
                    icon={MessageCircle}
                  />
                </>
              )}
              
              {user?.role === UserRole.VETERINARIAN && (
                <>
                  <QuickActionButton
                    href="/dashboard/appointments"
                    title="Ver Citas del Día"
                    description="Revisa tu agenda de hoy"
                    icon={Calendar}
                  />
                  <QuickActionButton
                    href="/dashboard/chat"
                    title="Mensajes de Pacientes"
                    description="Responde consultas de dueños"
                    icon={MessageCircle}
                  />
                </>
              )}
              
              {user?.role === UserRole.ADMIN && (
                <>
                  <QuickActionButton
                    href="/dashboard/appointments"
                    title="Gestionar Citas"
                    description="Administra todas las citas del sistema"
                    icon={Calendar}
                  />
                  <QuickActionButton
                    href="/dashboard/users"
                    title="Gestionar Usuarios"
                    description="Administra usuarios del sistema"
                    icon={Users}
                  />
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ActivityItem
                time="Hace 2 horas"
                title="Cita completada"
                description="Consulta general para Max"
              />
              <ActivityItem
                time="Hace 4 horas"
                title="Nuevo mensaje"
                description="Dr. García respondió tu consulta"
              />
              <ActivityItem
                time="Ayer"
                title="Cita agendada"
                description="Vacunación para Luna - 15 Dic"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'purple' | 'red';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface QuickActionButtonProps {
  href: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ href, title, description, icon: Icon }) => (
  <a
    href={href}
    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
  >
    <Icon className="h-8 w-8 text-blue-500" />
    <div className="ml-3">
      <p className="text-sm font-medium text-gray-900">{title}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  </a>
);

interface ActivityItemProps {
  time: string;
  title: string;
  description: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ time, title, description }) => (
  <div className="flex items-start space-x-3">
    <div className="flex-shrink-0 h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500">{time}</p>
      <p className="text-sm font-medium text-gray-900">{title}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  </div>
);
