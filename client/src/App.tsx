import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import { useAuth } from './context/AuthContext.tsx';
import Landing from './pages/Landing.tsx';
import Login from './pages/Login.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Reminders from './pages/Reminders.tsx';
import Account from './pages/Account.tsx';
import Onboarding from './pages/Onboarding.tsx';
import PetProfile from './pages/PetProfile.tsx';
import SymptomChecker from './pages/SymptomChecker.tsx';
import SharePage from './pages/SharePage.tsx';

const AuthenticatedRoot = () => {
  const { firebaseUser, loading } = useAuth();
  if (loading) return <div />;
  return firebaseUser ? <Navigate to="/dashboard" replace /> : <Landing />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<AuthenticatedRoot />} />
          <Route path="/login" element={<Login />} />
          <Route path="/share/:token" element={<SharePage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reminders"
            element={
              <ProtectedRoute>
                <Reminders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pets/new"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pets/:id"
            element={
              <ProtectedRoute>
                <PetProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pets/:id/symptom-check"
            element={
              <ProtectedRoute>
                <SymptomChecker />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
