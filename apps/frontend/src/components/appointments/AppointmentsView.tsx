
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Appointments } from './Appointments';

export const AppointmentsView: React.FC = () => {
  return (
    <Routes>
      <Route path="/*" element={<Appointments />} />
    </Routes>
  );
};
