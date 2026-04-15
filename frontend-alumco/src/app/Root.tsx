import { Outlet, useLocation, useNavigate } from 'react-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated && location.pathname === '/panel') {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  return <>{children}</>;
}

function RootContent() {
  return (
    <>
      <ProtectedRoute>
        <Outlet />
      </ProtectedRoute>
    </>
  );
}

export default function Root() {
  return (
    <AuthProvider>
      <RootContent />
    </AuthProvider>
  );
}
