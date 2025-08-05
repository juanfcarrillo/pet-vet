import { useState, useEffect, useCallback } from 'react';
import { Plus, CalendarIcon, Clock, User, Heart, FileText } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import type { AppointmentFormData, VeterinarianOption } from '../../types/appointment';
import { AppointmentType } from '../../types/appointment';

interface AppointmentFormProps {
  onSubmit?: (appointmentId: string) => void;
  onCancel?: () => void;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({ onSubmit, onCancel }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<AppointmentFormData>({
    veterinarianId: '',
    petName: '',
    petSpecies: '',
    petBreed: '',
    petAge: 1,
    appointmentDate: '',
    appointmentTime: '',
    type: 'Consulta' as AppointmentType,
    reason: '',
    clientPhone: '',
    isEmergency: false,
  });

  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [veterinarians, setVeterinarians] = useState<VeterinarianOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock veterinarians data - in real app, fetch from API
  useEffect(() => {
    const mockVets: VeterinarianOption[] = [
      { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Dr. Ana García', specialization: 'Medicina General' },
      { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Dr. Carlos López', specialization: 'Cirugía' },
      { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Dr. María Rodríguez', specialization: 'Dermatología' },
    ];
    setVeterinarians(mockVets);
  }, []);

  const fetchAvailableSlots = useCallback(async () => {
    try {
      const slots = await apiService.getAvailableTimeSlots(
        formData.veterinarianId,
        formData.appointmentDate
      );
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setAvailableSlots([]);
    }
  }, [formData.veterinarianId, formData.appointmentDate]);

  // Fetch available time slots when date and veterinarian change
  useEffect(() => {
    if (formData.veterinarianId && formData.appointmentDate) {
      fetchAvailableSlots();
    }
  }, [formData.veterinarianId, formData.appointmentDate, fetchAvailableSlots]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Combine date and time into ISO string
      const appointmentDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}:00`);
      
      const selectedVet = veterinarians.find(v => v.id === formData.veterinarianId);
      
      const appointmentData = {
        clientId: user.id,
        veterinarianId: formData.veterinarianId,
        petName: formData.petName,
        petSpecies: formData.petSpecies,
        petBreed: formData.petBreed || undefined,
        petAge: formData.petAge,
        appointmentDate: appointmentDateTime.toISOString(),
        type: formData.type,
        reason: formData.reason || undefined,
        clientName: user.fullName,
        clientEmail: user.email,
        clientPhone: formData.clientPhone || undefined,
        veterinarianName: selectedVet?.name || 'Veterinario',
        isEmergency: formData.isEmergency,
      };

      const appointment = await apiService.createAppointment(appointmentData);
      onSubmit?.(appointment.id);
    } catch (error: unknown) {
      console.error('Error creating appointment:', error);
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Error al crear la cita';
      setError(errorMessage || 'Error al crear la cita');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof AppointmentFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const appointmentTypes: { value: AppointmentType; label: string }[] = [
    { value: AppointmentType.CONSULTATION, label: 'Consulta General' },
    { value: AppointmentType.VACCINATION, label: 'Vacunación' },
    { value: AppointmentType.SURGERY, label: 'Cirugía' },
    { value: AppointmentType.EMERGENCY, label: 'Emergencia' },
    { value: AppointmentType.CHECKUP, label: 'Revisión' },
  ];

  const petSpecies = ['Perro', 'Gato', 'Ave', 'Conejo', 'Hámster', 'Otro'];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Plus className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Nueva Cita</h2>
            <p className="text-sm text-gray-500">Agenda una cita para tu mascota</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Veterinarian Selection */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4" />
            Veterinario
          </label>
          <select
            value={formData.veterinarianId}
            onChange={(e) => handleInputChange('veterinarianId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Selecciona un veterinario</option>
            {veterinarians.map(vet => (
              <option key={vet.id} value={vet.id}>
                {vet.name} {vet.specialization && `- ${vet.specialization}`}
              </option>
            ))}
          </select>
        </div>

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
              <select
                value={formData.appointmentTime}
                onChange={(e) => handleInputChange('appointmentTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={!formData.appointmentDate || !formData.veterinarianId}
              >
                <option value="">Selecciona hora</option>
                {availableSlots.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
              {!formData.appointmentDate || !formData.veterinarianId ? (
                <p className="text-xs text-gray-500 mt-1">
                  Selecciona fecha y veterinario para ver horarios disponibles
                </p>
              ) : availableSlots.length === 0 ? (
                <p className="text-xs text-red-500 mt-1">
                  No hay horarios disponibles para esta fecha
                </p>
              ) : null}
            </div>
          </div>
          
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
          
          <Input
            label="Teléfono (opcional)"
            type="tel"
            value={formData.clientPhone}
            onChange={(e) => handleInputChange('clientPhone', e.target.value)}
            placeholder="+1234567890"
          />
          
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
            disabled={!formData.veterinarianId || !formData.appointmentDate || !formData.appointmentTime}
            className="flex-1"
          >
            Agendar Cita
          </Button>
        </div>
      </form>
    </Card>
  );
};
