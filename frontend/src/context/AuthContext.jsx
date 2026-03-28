import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const clearSession = useCallback(() => {
    setUser(null);
  }, []);

  const loadCurrentUser = useCallback(async () => {
    const meResponse = await api.getMe();
    setUser(meResponse.data);
    return meResponse.data;
  }, []);

  const login = useCallback(async (formData) => {
    await api.login(formData);
    return loadCurrentUser();
  }, [loadCurrentUser]);

  const register = useCallback((formData) => api.register(formData), []);

  const refresh = useCallback(async () => {
    await api.refreshToken();
    await loadCurrentUser();
  }, [loadCurrentUser]);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await loadCurrentUser();
      } catch {
        try {
          await refresh();
        } catch {
          clearSession();
        }
      } finally {
        setInitializing(false);
      }
    };

    bootstrap();
  }, [loadCurrentUser, refresh, clearSession]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      initializing,
      login,
      register,
      refresh,
      logout,
      clearSession,
      setUser,
    }),
    [user, initializing, login, register, refresh, logout, clearSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
