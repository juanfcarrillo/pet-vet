import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { UserRole, type User } from '../../types/auth';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChatCreated: (otherUserId: string) => void;
  currentUser: User;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  isOpen,
  onClose,
  onChatCreated,
  currentUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Search for users (this would need to be implemented in your API)
  const searchUsers = async (term: string) => {
    if (!term.trim()) {
      setUsers([]);
      return;
    }

    try {
      setIsLoading(true);
      // Note: You'll need to implement this endpoint in your backend
      // For now, we'll simulate it
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(term)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Filter out current user
        setUsers(data.filter((user: User) => user.id !== currentUser.id));
      }
    } catch (error) {
      console.error('Error searching users:', error);
      // For demo purposes, create mock users based on search
      if (term.includes('@')) {
        setUsers([
          {
            id: `mock-${Date.now()}`,
            email: term,
            fullName: term.split('@')[0],
            role: UserRole.CLIENT,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            securityQuestion: '',
            isActive: true
          }
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Create new conversation
  const handleCreateChat = async (otherUserId: string) => {
    try {
      setIsCreating(true);
      onChatCreated(otherUserId);
      onClose();
    } catch (error) {
      console.error('Error creating chat:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Nueva Conversación</h3>
            <Button
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar usuario por email
            </label>
            <Input
              type="text"
              placeholder="ejemplo@email.com"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Search Results */}
          <div className="max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : users.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 mb-2">Usuarios encontrados:</p>
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.fullName?.charAt(0) || user.email.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.fullName 
                            ? `${user.fullName}`
                            : user.email
                          }
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleCreateChat(user.id)}
                      disabled={isCreating}
                    >
                      {isCreating ? 'Creando...' : 'Iniciar Chat'}
                    </Button>
                  </div>
                ))}
              </div>
            ) : searchTerm && !isLoading ? (
              <div className="text-center py-4 text-gray-500">
                <p>No se encontraron usuarios con ese email</p>
                <p className="text-sm mt-1">Asegúrate de escribir el email completo</p>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>Escribe un email para buscar usuarios</p>
              </div>
            )}
          </div>

          {/* Recent Contacts (if you want to add this feature) */}
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-2">Contactos recientes:</p>
            <div className="text-center py-2 text-gray-500 text-sm">
              No hay contactos recientes
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
