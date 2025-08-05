
import React, { type ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole, type User } from '../../types/auth';
import { 
  Heart, 
  Calendar, 
  MessageCircle, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X,
  Home,
  Stethoscope,
  Crown
} from 'lucide-react';
import { Button } from '../ui/Button';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, current: location.pathname === '/dashboard' },
    { name: 'Citas', href: '/dashboard/appointments', icon: Calendar, current: location.pathname.startsWith('/dashboard/appointments') },
    { name: 'Chat', href: '/dashboard/chat', icon: MessageCircle, current: location.pathname.startsWith('/dashboard/chat') },
    { name: 'Perfil', href: '/dashboard/profile', icon: UserIcon, current: location.pathname === '/dashboard/profile' },
  ];

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return <Crown className="h-5 w-5" />;
      case UserRole.VETERINARIAN:
        return <Stethoscope className="h-5 w-5" />;
      default:
        return <UserIcon className="h-5 w-5" />;
    }
  };

  const getRoleName = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'Administrador';
      case UserRole.VETERINARIAN:
        return 'Veterinario';
      default:
        return 'Dueño';
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <SidebarContent navigation={navigation} user={user} onLogout={handleLogout} getRoleIcon={getRoleIcon} getRoleName={getRoleName} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <SidebarContent navigation={navigation} user={user} onLogout={handleLogout} getRoleIcon={getRoleIcon} getRoleName={getRoleName} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current: boolean;
}

interface SidebarContentProps {
  navigation: NavigationItem[];
  user: User | null;
  onLogout: () => void;
  getRoleIcon: (role: UserRole) => React.ReactElement;
  getRoleName: (role: UserRole) => string;
}

const SidebarContent: React.FC<SidebarContentProps> = ({ navigation, user, onLogout, getRoleIcon, getRoleName }) => (
  <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
    {/* Logo */}
    <div className="flex items-center h-16 flex-shrink-0 px-4 bg-blue-600">
      <Heart className="h-8 w-8 text-white" />
      <span className="ml-2 text-xl font-bold text-white">Pet-Vet</span>
    </div>

    {/* User info */}
    <div className="flex items-center px-4 py-3 border-b border-gray-200">        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center h-10 w-10 bg-blue-100 rounded-full">
            {user && getRoleIcon(user.role)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.fullName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user && getRoleName(user.role)}
            </p>
          </div>
        </div>
    </div>

    {/* Navigation */}
    <nav className="flex-1 px-2 py-4 bg-white space-y-1">
      {navigation.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={`
              group flex items-center px-2 py-2 text-sm font-medium rounded-md
              ${item.current
                ? 'bg-blue-100 text-blue-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            <Icon
              className={`
                mr-3 flex-shrink-0 h-6 w-6
                ${item.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
              `}
            />
            {item.name}
          </Link>
        );
      })}
    </nav>

    {/* Logout button */}
    <div className="flex-shrink-0 p-4 border-t border-gray-200">
      <Button
        variant="outline"
        onClick={onLogout}
        className="w-full flex items-center justify-center"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Cerrar Sesión
      </Button>
    </div>
  </div>
);
