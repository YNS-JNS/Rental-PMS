import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/app/hooks';
import { logOut } from '@/features/auth/authSlice';
import { Button } from '@/components/ui/button';

// Layouts & Pages
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

// Temporary Dashboard Component (Test Only)
const Dashboard = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logOut());
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-4">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard Protected Area</h1>
      <p className="text-gray-600">You are securely logged in.</p>
      <Button variant="destructive" onClick={handleLogout}>
        Log Out
      </Button>
    </div>
  );
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes Wrapper */}
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Future routes like /bookings, /apartments will go here */}
      </Route>

      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;