import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { AppointmentsList } from './AppointmentsList';
import { AppointmentForm } from './AppointmentForm';
import { EditAppointmentForm } from './EditAppointmentForm';
import { useAuth } from '../../contexts/AuthContext';
import type { Appointment } from '../../types/appointment';
import { UserRole } from '../../types/auth';

type ViewMode = 'list' | 'create' | 'edit';

export const Appointments: React.FC = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  if (!user) return null;

  const handleNewAppointment = () => {
    setViewMode('create');
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setViewMode('edit');
  };

  const handleAppointmentCreated = (appointmentId: string) => {
    console.log('Appointment created:', appointmentId);
    setViewMode('list');
  };

  const handleAppointmentUpdated = (appointmentId: string) => {
    console.log('Appointment updated:', appointmentId);
    setEditingAppointment(null);
    setViewMode('list');
  };

  const handleCancel = () => {
    setEditingAppointment(null);
    setViewMode('list');
  };

  const getClientId = () => {
    return user.role === UserRole.CLIENT ? user.id : undefined;
  };

  const getVeterinarianId = () => {
    return user.role === UserRole.VETERINARIAN ? user.id : undefined;
  };

  if (viewMode === 'create') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nueva Cita</h1>
            <p className="text-gray-600">Agenda una nueva cita veterinaria</p>
          </div>
        </div>
        
        <AppointmentForm
          onSubmit={handleAppointmentCreated}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  if (viewMode === 'edit' && editingAppointment) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editar Cita</h1>
            <p className="text-gray-600">Modifica los detalles de la cita</p>
          </div>
        </div>
        
        <EditAppointmentForm
          appointment={editingAppointment}
          onSubmit={handleAppointmentUpdated}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <AppointmentsList
      clientId={getClientId()}
      veterinarianId={getVeterinarianId()}
      onEditAppointment={handleEditAppointment}
      onNewAppointment={user.role === UserRole.CLIENT ? handleNewAppointment : undefined}
    />
  );
};
