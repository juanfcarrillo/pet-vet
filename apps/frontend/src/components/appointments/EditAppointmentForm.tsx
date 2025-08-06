import { useState, useEffect, useCallback } from 'react';
import { Edit, CalendarIcon, Clock, Heart, FileText } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { apiService } from '../../services/api';
import type { Appointment, UpdateAppointmentData } from '../../types/appointment';
import { AppointmentType, AppointmentStatus } from '../../types/appointment';

interface EditAppointmentFormProps {
  appointment: Appointment;
  onSubmit?: (appointmentId: string) => void;
  onCancel?: () => void;
}

export const EditAppointmentForm: React.FC<EditAppointmentFormProps> = ({
  appointment,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    petName: appointment.petName,
    petSpecies: appointment.petSpecies,
    petBreed: appointment.petBreed || '',
    petAge: appointment.petAge,
    appointmentDate: new Date(appointment.appointmentDate).toISOString().split('T')[0],
    appointmentTime: new Date(appointment.appointmentDate).toTimeString().substring(0, 5),
    type: appointment.type,
    status: appointment.status,
    reason: appointment.reason || '',
    notes: appointment.notes || '',
    clientPhone: appointment.clientPhone || '',
    cost: appointment.cost || '',
    isEmergency: appointment.isEmergency,
  });

  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailableSlots = useCallback(async () => {
    try {
      const slots = await apiService.getAvailableTimeSlots(
        appointment.veterinarianId,
        formData.appointmentDate
      );
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setAvailableSlots([]);
    }
  }, [appointment.veterinarianId, formData.appointmentDate]);

  useEffect(() => {
    if (formData.appointmentDate) {
      fetchAvailableSlots();
    }
  }, [formData.appointmentDate, fetchAvailableSlots]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const appointmentDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}:00`);
      
      const updateData: UpdateAppointmentData = {
        petName: formData.petName,
        petSpecies: formData.petSpecies,
        petBreed: formData.petBreed || undefined,
        petAge: formData.petAge,
        appointmentDate: appointmentDateTime.toISOString(),
        type: formData.type,
        status: formData.status,
        reason: formData.reason || undefined,
        notes: formData.notes || undefined,
        clientPhone: formData.clientPhone || undefined,
        cost: formData.cost ? Number(formData.cost) : undefined,
        isEmergency: formData.isEmergency,
      };

      await apiService.updateAppointment(appointment.id, updateData);
      onSubmit?.(appointment.id);
    } catch (error: unknown) {
      console.error('Error updating appointment:', error);
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Error al actualizar la cita';
      setError(errorMessage || 'Error al actualizar la cita');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const appointmentTypes: { value: AppointmentType; label: string }[] = [
    { value: AppointmentType.CONSULTATION, label: 'Consulta General' },
    { value: AppointmentType.VACCINATION, label: 'Vacunación' },
    { value: AppointmentType.SURGERY, label: 'Cirugía' },
    { value: AppointmentType.EMERGENCY, label: 'Emergencia' },
    { value: AppointmentType.CHECKUP, label: 'Revisión' },
  ];

  const statusOptions: { value: AppointmentStatus; label: string }[] = [
    { value: AppointmentStatus.SCHEDULED, label: 'Programada' },
    { value: AppointmentStatus.CONFIRMED, label: 'Confirmada' },
    { value: AppointmentStatus.IN_PROGRESS, label: 'En progreso' },
    { value: AppointmentStatus.COMPLETED, label: 'Completada' },
    { value: AppointmentStatus.CANCELLED, label: 'Cancelada' },
  ];

  const petSpecies = ['Perro', 'Gato', 'Ave', 'Conejo', 'Hámster', 'Otro'];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Edit className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Editar Cita</h2>
            <p className="text-sm text-gray-500">Modifica los detalles de la cita</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Pet Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Información de la Mascota
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre de la mascota"
              value={formData.petName}
              onChange={(e) => handleInputChange('petName', e.target.value)}
              placeholder="Ej: Firulais"
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Especie</label>
              <select
                value={formData.petSpecies}
                onChange={(e) => handleInputChange('petSpecies', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Selecciona especie</option>
                {petSpecies.map(species => (
                  <option key={species} value={species}>{species}</option>
                ))}
              </select>
            </div>
            
            <Input
              label="Raza (opcional)"
              value={formData.petBreed}
              onChange={(e) => handleInputChange('petBreed', e.target.value)}
              placeholder="Ej: Golden Retriever"
            />
            
            <Input
              label="Edad (años)"
              type="number"
              min="0"
              max="50"
              value={formData.petAge}
              onChange={(e) => handleInputChange('petAge', parseInt(e.target.value))}
              required
            />
          </div>
        </div>

        {/* Appointment Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Detalles de la Cita
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Fecha"
              type="date"
              value={formData.appointmentDate}
              onChange={(e) => handleInputChange('appointmentDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
            
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Clock className="w-4 h-4" />
                Hora
              </label>
              {/* <select
                value={formData.appointmentTime}
                onChange={(e) => handleInputChange('appointmentTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Selecciona hora</option>
                {availableSlots.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select> */}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de cita</label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value as AppointmentType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {appointmentTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as AppointmentStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <FileText className="w-4 h-4" />
              Motivo de la consulta (opcional)
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              placeholder="Describe el motivo de la consulta..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas adicionales (opcional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Notas del veterinario..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Teléfono (opcional)"
              type="tel"
              value={formData.clientPhone}
              onChange={(e) => handleInputChange('clientPhone', e.target.value)}
              placeholder="+1234567890"
            />
            
            <Input
              label="Costo (opcional)"
              type="number"
              min="0"
              step="0.01"
              value={formData.cost}
              onChange={(e) => handleInputChange('cost', e.target.value)}
              placeholder="0.00"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isEmergency"
              checked={formData.isEmergency}
              onChange={(e) => handleInputChange('isEmergency', e.target.checked)}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <label htmlFor="isEmergency" className="text-sm text-gray-700">
              Es una emergencia
            </label>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            isLoading={loading}
            disabled={!formData.appointmentDate || !formData.appointmentTime}
            className="flex-1"
          >
            Actualizar Cita
          </Button>
        </div>
      </form>
    </Card>
  );
};
