import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { firebaseUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-shell center fill-center">
        <span className="spinner" />
      </div>
    );
  }

  if (!firebaseUser) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
