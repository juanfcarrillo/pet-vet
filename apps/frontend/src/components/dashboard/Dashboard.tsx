
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from './DashboardLayout';
import { DashboardHome } from './DashboardHome';
import { AppointmentsView } from '../appointments/AppointmentsView';
import { ChatView } from '../chat/ChatView';
import { ProfileView } from '../profile/ProfileView';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/appointments/*" element={<AppointmentsView />} />
        <Route path="/chat/*" element={<ChatView currentUser={user} />} />
        <Route path="/profile" element={<ProfileView />} />
      </Routes>
    </DashboardLayout>
  );
};
