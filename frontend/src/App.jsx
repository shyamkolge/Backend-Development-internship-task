import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AuthPage } from './pages/AuthPage';
import { TasksPage } from './pages/TasksPage';

function App() {
  const { isAuthenticated, user } = useAuth();
  const defaultRoute = user?.role === 'admin' ? '/admin' : '/tasks';

  return (
    <Routes>
      <Route
        path="/auth"
        element={isAuthenticated ? <Navigate to={defaultRoute} replace /> : <AuthPage />}
      />

      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to={defaultRoute} replace />} />
        <Route
          path="/tasks"
          element={user?.role === 'admin' ? <Navigate to="/admin" replace /> : <TasksPage />}
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireRole="admin">
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to={isAuthenticated ? defaultRoute : '/auth'} replace />} />
    </Routes>
  );
}

export default App;
