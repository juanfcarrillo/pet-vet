
import React from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';

export const AppointmentsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Citas</h1>
      </div>
      
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Próximamente</h3>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            El módulo de gestión de citas estará disponible próximamente.
            Aquí podrás agendar, modificar y cancelar citas médicas.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
