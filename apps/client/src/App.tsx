import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts & Pages
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import ApartmentsPage from '@/pages/apartments/ApartmentsPage';
import NewApartmentPage from '@/pages/apartments/NewApartmentPage';
import ApartmentDetailsPage from '@/pages/apartments/ApartmentDetailsPage';
import EditApartmentPage from '@/pages/apartments/EditApartmentPage';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes Wrapper */}
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* Apartment Routes */}
        <Route path="/apartments" element={<ApartmentsPage />} />
        <Route path="/apartments/new" element={<NewApartmentPage />} />
        <Route path="/apartments/:id" element={<ApartmentDetailsPage />} />
        <Route path="/apartments/:id/edit" element={<EditApartmentPage />} />
        
      </Route>

      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;