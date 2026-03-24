import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = () => {
  const { user, getToken } = useAuth();
  
  if (!user || !getToken()) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};

export const AdminRoute = () => {
  const { user, checkRole } = useAuth();
  
  if (!user || !checkRole('ROLE_ADMIN')) {
    return <Navigate to="/" replace />;
  }
  
  return <Outlet />;
};
