import { useState, useEffect } from 'react';
import { Filter, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { AppointmentCard } from './AppointmentCard';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { type Appointment, type AppointmentFilters, AppointmentStatus } from '../../types/appointment';
import { UserRole } from '../../types/auth';

interface AppointmentsListProps {
  clientId?: string;
  veterinarianId?: string;
  onEditAppointment?: (appointment: Appointment) => void;
  onNewAppointment?: () => void;
}

export const AppointmentsList: React.FC<AppointmentsListProps> = ({
  clientId,
  veterinarianId,
  onEditAppointment,
  onNewAppointment,
}) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<AppointmentFilters>({
    page: 1,
    limit: 10,
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, [filters, clientId, veterinarianId]);

  const fetchAppointments = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      let response;
      
      if (clientId) {
        response = await apiService.getClientAppointments(clientId, filters);
      } else if (veterinarianId) {
        response = await apiService.getVeterinarianAppointments(veterinarianId, filters);
      } else {
        // For admin users, get all appointments
        response = await apiService.getAppointments(filters);
      }

      setAppointments(response.appointments);
      setTotalPages(Math.ceil(response.total / response.limit));
      setCurrentPage(response.page);
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      setError('Error al cargar las citas');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = () => {
    const newFilters: AppointmentFilters = {
      ...filters,
      page: 1,
      status: statusFilter || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setFilters({ page: 1, limit: 10 });
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta cita?')) return;

    try {
      await apiService.deleteAppointment(appointmentId);
      fetchAppointments(); // Refresh the list
    } catch (error: any) {
      console.error('Error deleting appointment:', error);
      alert('Error al eliminar la cita');
    }
  };

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      await apiService.confirmAppointment(appointmentId);
      fetchAppointments(); // Refresh the list
    } catch (error: any) {
      console.error('Error confirming appointment:', error);
      alert('Error al confirmar la cita');
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('¿Estás seguro de que quieres cancelar esta cita?')) return;

    try {
      await apiService.updateAppointment(appointmentId, { status: AppointmentStatus.CANCELLED });
      fetchAppointments(); // Refresh the list
    } catch (error: any) {
      console.error('Error canceling appointment:', error);
      alert('Error al cancelar la cita');
    }
  };

  const statusOptions: { value: AppointmentStatus | ''; label: string }[] = [
    { value: '', label: 'Todos los estados' },
    { value: AppointmentStatus.SCHEDULED, label: 'Programada' },
    { value: AppointmentStatus.CONFIRMED, label: 'Confirmada' },
    { value: AppointmentStatus.IN_PROGRESS, label: 'En progreso' },
    { value: AppointmentStatus.COMPLETED, label: 'Completada' },
    { value: AppointmentStatus.CANCELLED, label: 'Cancelada' },
  ];

  const getTitle = () => {
    if (clientId) return 'Mis Citas';
    if (veterinarianId) return 'Citas del Veterinario';
    return 'Todas las Citas';
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{getTitle()}</h1>
          <p className="text-gray-600">Gestiona las citas veterinarias</p>
        </div>
        
        {user.role === UserRole.CLIENT && onNewAppointment && (
          <Button onClick={onNewAppointment}>
            <Calendar className="w-4 h-4 mr-2" />
            Nueva Cita
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtros</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Ocultar' : 'Mostrar'}
            </Button>
          </div>

          {showFilters && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | '')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <Input
                  label="Fecha desde"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                
                <Input
                  label="Fecha hasta"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                
                <div className="flex items-end gap-2">
                  <Button onClick={handleFilterChange} className="flex-1">
                    Aplicar
                  </Button>
                  <Button variant="outline" onClick={clearFilters}>
                    Limpiar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <Card>
          <div className="p-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchAppointments}>Reintentar</Button>
          </div>
        </Card>
      ) : appointments.length === 0 ? (
        <Card>
          <div className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay citas</h3>
            <p className="text-gray-600 mb-4">
              {statusFilter || startDate || endDate
                ? 'No se encontraron citas con los filtros aplicados.'
                : 'Aún no tienes citas programadas.'}
            </p>
            {user.role === UserRole.CLIENT && onNewAppointment && (
              <Button onClick={onNewAppointment}>
                Agendar primera cita
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <>
          {/* Appointments Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {appointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                userRole={user.role}
                onEdit={onEditAppointment}
                onDelete={handleDeleteAppointment}
                onConfirm={handleConfirmAppointment}
                onCancel={handleCancelAppointment}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Card>
              <div className="p-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Página {currentPage} de {totalPages}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
