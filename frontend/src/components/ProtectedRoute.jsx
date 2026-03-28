import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children, requireRole }) {
  const { initializing, isAuthenticated, user } = useAuth();

  if (initializing) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100">
        <p className="text-sm font-semibold text-slate-600">Loading session...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (requireRole && user?.role !== requireRole) {
    return <Navigate to="/tasks" replace />;
  }

  return children;
}
