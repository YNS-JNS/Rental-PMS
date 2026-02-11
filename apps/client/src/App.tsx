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
import TenantsPage from '@/pages/tenants/TenantsPage';
import NewTenantPage from '@/pages/tenants/NewTenantPage';
import TenantDetailsPage from '@/pages/tenants/TenantDetailsPage';
import EditTenantPage from '@/pages/tenants/EditTenantPage';
import BookingsPage from '@/pages/bookings/BookingsPage';
import NewBookingPage from '@/pages/bookings/NewBookingPage';
import BookingDetailsPage from '@/pages/bookings/BookingDetailsPage';
import EditBookingPage from '@/pages/bookings/EditBookingPage';

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
        
        {/* Tenant Routes */}
        <Route path="/tenants" element={<TenantsPage />} />
        <Route path="/tenants/new" element={<NewTenantPage />} />
        <Route path="/tenants/:id" element={<TenantDetailsPage />} />
        <Route path="/tenants/:id/edit" element={<EditTenantPage />} />
        
        {/* Booking Routes */}
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/bookings/new" element={<NewBookingPage />} />
        <Route path="/bookings/:id" element={<BookingDetailsPage />} />
        <Route path="/bookings/:id/edit" element={<EditBookingPage />} />
        
      </Route>

      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;