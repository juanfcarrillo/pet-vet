import { Calendar, Clock, Heart, User, Phone, MapPin, Edit, Trash2, CheckCircle, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import type { Appointment, AppointmentStatus } from '../../types/appointment';
import { UserRole } from '../../types/auth';

interface AppointmentCardProps {
  appointment: Appointment;
  userRole: UserRole;
  onEdit?: (appointment: Appointment) => void;
  onDelete?: (appointmentId: string) => void;
  onConfirm?: (appointmentId: string) => void;
  onCancel?: (appointmentId: string) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  userRole,
  onEdit,
  onDelete,
  onConfirm,
  onCancel,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: AppointmentStatus): string => {
    switch (status) {
      case 'Programada':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Confirmada':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'En progreso':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Completada':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Cancelada':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'Emergencia':
        return 'bg-red-100 text-red-700';
      case 'Cirugía':
        return 'bg-purple-100 text-purple-700';
      case 'Vacunación':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  const canEdit = appointment.status === 'Programada' && (userRole === UserRole.CLIENT || userRole === UserRole.ADMIN);
  const canDelete = appointment.status === 'Programada' && (userRole === UserRole.CLIENT || userRole === UserRole.ADMIN);
  const canConfirm = appointment.status === 'Programada' && (userRole === UserRole.VETERINARIAN || userRole === UserRole.ADMIN);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getTypeColor(appointment.type)}`}>
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{appointment.petName}</h3>
              <p className="text-sm text-gray-500">
                {appointment.petSpecies} {appointment.petBreed && `• ${appointment.petBreed}`} • {appointment.petAge} años
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(appointment.status)}`}>
              {appointment.status}
            </span>
            {appointment.isEmergency && (
              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full border border-red-200">
                Emergencia
              </span>
            )}
          </div>
        </div>

        {/* Appointment Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(appointment.appointmentDate)}</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{formatTime(appointment.appointmentDate)}</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>
              {userRole === UserRole.VETERINARIAN || userRole === UserRole.ADMIN
                ? `Cliente: ${appointment.clientName}`
                : `Veterinario: ${appointment.veterinarianName}`
              }
            </span>
          </div>
          
          {appointment.clientPhone && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              <span>{appointment.clientPhone}</span>
            </div>
          )}
          
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{appointment.type}</span>
          </div>
        </div>

        {/* Reason */}
        {appointment.reason && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              <strong>Motivo:</strong> {appointment.reason}
            </p>
          </div>
        )}

        {/* Notes */}
        {appointment.notes && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              <strong>Notas:</strong> {appointment.notes}
            </p>
          </div>
        )}

        {/* Cost */}
        {appointment.cost && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              <strong>Costo:</strong> ${appointment.cost.toFixed(2)}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
          {canConfirm && (
            <Button
              size="sm"
              onClick={() => onConfirm?.(appointment.id)}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Confirmar
            </Button>
          )}
          
          {canEdit && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit?.(appointment)}
            >
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </Button>
          )}
          
          {canDelete && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete?.(appointment.id)}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Eliminar
            </Button>
          )}
          
          {appointment.status === 'Programada' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCancel?.(appointment.id)}
              className="text-gray-600 border-gray-200 hover:bg-gray-50 ml-auto"
            >
              <X className="w-4 h-4 mr-1" />
              Cancelar
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
