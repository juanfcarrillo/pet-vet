
import React from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';

export const ChatView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Chat en Tiempo Real</h1>
      </div>
      
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Próximamente</h3>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            El módulo de chat en tiempo real estará disponible próximamente.
            Aquí podrás comunicarte directamente con veterinarios y recibir
            consultas en tiempo real.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
