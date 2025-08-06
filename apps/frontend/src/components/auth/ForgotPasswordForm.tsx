// Importaciones de React y hooks
import React, { useState } from 'react';
// Importa el componente Link para navegación sin recargar la página
import { Link } from 'react-router-dom';
// Hook personalizado para acceder a las funciones de autenticación
import { useAuth } from '../../contexts/AuthContext';
// Componentes reutilizables de UI
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardHeader, CardContent } from '../ui/Card';
// Íconos desde la librería Lucide
import { Heart, ArrowLeft, CheckCircle } from 'lucide-react';


// Componente funcional principal para recuperación de contraseña
export const ForgotPasswordForm: React.FC = () => {
   // Control del paso actual: email → security → success
  const [step, setStep] = useState<'email' | 'security' | 'success'>('email');
  // Estados para cada input del formulario
  const [email, setEmail] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Función de reseteo de contraseña desde el contexto de autenticación
  const { resetPassword } = useAuth();
  // Primer paso: envía el email
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // En una app real aquí se debería verificar si el email existe
    // Por simplicidad, se pasa directamente al siguiente paso
    setStep('security');
  };
   
   // Maneja el envío del formulario de restablecimiento
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword({
        email,
        securityAnswer,
        newPassword,
      });
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Error al restablecer la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <form onSubmit={handleEmailSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@email.com"
        required
        helperText="Ingresa el email asociado a tu cuenta"
      />

      <Button type="submit" className="w-full" disabled={!email}>
        Continuar
      </Button>
    </form>
  );

  const renderSecurityStep = () => (
    <form onSubmit={handleResetSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
        <p className="text-sm">
          Responde tu pregunta de seguridad para restablecer tu contraseña
        </p>
      </div>

      <Input
        label="Respuesta de Seguridad"
        value={securityAnswer}
        onChange={(e) => setSecurityAnswer(e.target.value)}
        placeholder="Tu respuesta"
        required
        helperText="La respuesta que proporcionaste al registrarte"
      />

      <Input
        label="Nueva Contraseña"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="••••••••"
        required
        helperText="Mínimo 8 caracteres"
      />

      <Input
        label="Confirmar Nueva Contraseña"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="••••••••"
        required
      />

      <div className="flex space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep('email')}
          className="flex-1"
        >
          Volver
        </Button>
        <Button
          type="submit"
          className="flex-1"
          isLoading={isLoading}
          disabled={!securityAnswer || !newPassword || !confirmPassword}
        >
          {isLoading ? 'Restableciendo...' : 'Restablecer'}
        </Button>
      </div>
    </form>
  );

  const renderSuccessStep = () => (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="bg-green-100 p-3 rounded-full">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          ¡Contraseña Restablecida!
        </h3>
        <p className="text-sm text-gray-600">
          Tu contraseña ha sido actualizada exitosamente.
        </p>
      </div>

      <Link to="/login">
        <Button className="w-full">
          Iniciar Sesión
        </Button>
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-purple-600 p-3 rounded-full">
              <Heart className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Recuperar Contraseña
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === 'email' && 'Ingresa tu email para continuar'}
            {step === 'security' && 'Verifica tu identidad'}
            {step === 'success' && 'Proceso completado'}
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            {step !== 'success' && (
              <div className="flex items-center space-x-2">
                {step === 'security' && (
                  <button
                    onClick={() => setStep('email')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <ArrowLeft size={20} />
                  </button>
                )}
                <h3 className="text-xl font-semibold text-gray-900">
                  {step === 'email' && 'Verificar Email'}
                  {step === 'security' && 'Pregunta de Seguridad'}
                </h3>
              </div>
            )}
          </CardHeader>
          
          <CardContent>
            {step === 'email' && renderEmailStep()}
            {step === 'security' && renderSecurityStep()}
            {step === 'success' && renderSuccessStep()}
          </CardContent>
        </Card>

        {step !== 'success' && (
          <div className="text-center">
            <Link
              to="/login"
              className="text-sm text-purple-600 hover:text-purple-500"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
