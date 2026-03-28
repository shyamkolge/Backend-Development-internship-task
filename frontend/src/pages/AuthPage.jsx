import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthPanel } from '../components/AuthPanel';
import { useAuth } from '../context/AuthContext';

export function AuthPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [authMode, setAuthMode] = useState('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');

  const setNotice = (text, type = 'info') => {
    setMessage(text);
    setMessageType(type);
  };

  const handleLogin = async (formData) => {
    setAuthLoading(true);
    setMessage('');
    try {
      const loggedInUser = await login(formData);
      setNotice('Login successful.', 'success');
      navigate(loggedInUser?.role === 'admin' ? '/admin' : '/tasks', { replace: true });
    } catch (error) {
      setNotice(error.message, 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (formData) => {
    setAuthLoading(true);
    setMessage('');
    try {
      await register(formData);
      setNotice('Account created. You can login now.', 'success');
      setAuthMode('login');
    } catch (error) {
      setNotice(error.message, 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-rose-100 via-amber-50 to-sky-100 p-6 md:p-10">
      <div className="mx-auto w-full max-w-xl">
        <AuthPanel
          mode={authMode}
          loading={authLoading}
          message={message}
          messageType={messageType}
          onModeChange={setAuthMode}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      </div>
    </main>
  );
}
