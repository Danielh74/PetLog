import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth.ts';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { firebaseUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="route-loading" role="status" aria-label="Loading">
        <span className="spinner" />
      </div>
    );
  }

  if (!firebaseUser) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
