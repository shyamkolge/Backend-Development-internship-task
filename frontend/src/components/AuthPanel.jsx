import { useState } from 'react';

export function AuthPanel({ mode, loading, message, messageType, onModeChange, onLogin, onRegister }) {
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleLoginSubmit = (event) => {
    event.preventDefault();
    onLogin(loginData);
  };

  const handleRegisterSubmit = (event) => {
    event.preventDefault();
    onRegister(registerData);
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
      <div className="mb-6 flex rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => onModeChange('login')}
          className={`w-1/2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
            mode === 'login' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => onModeChange('register')}
          className={`w-1/2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
            mode === 'register' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          Register
        </button>
      </div>

      {message ? (
        <div
          className={`mb-4 rounded-lg border px-3 py-2 text-sm ${
            messageType === 'success'
              ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
              : messageType === 'error'
                ? 'border-rose-300 bg-rose-50 text-rose-800'
                : 'border-sky-300 bg-sky-50 text-sky-800'
          }`}
        >
          {message}
        </div>
      ) : null}

      {mode === 'login' ? (
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              required
              value={loginData.email}
              onChange={(event) => setLoginData((prev) => ({ ...prev, email: event.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-rose-400 transition focus:ring"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              required
              value={loginData.password}
              onChange={(event) => setLoginData((prev) => ({ ...prev, password: event.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-rose-400 transition focus:ring"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-rose-500 px-5 py-2.5 font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Username</span>
            <input
              type="text"
              minLength={3}
              required
              value={registerData.username}
              onChange={(event) => setRegisterData((prev) => ({ ...prev, username: event.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-rose-400 transition focus:ring"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              required
              value={registerData.email}
              onChange={(event) => setRegisterData((prev) => ({ ...prev, email: event.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-rose-400 transition focus:ring"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              minLength={6}
              required
              value={registerData.password}
              onChange={(event) => setRegisterData((prev) => ({ ...prev, password: event.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-rose-400 transition focus:ring"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Confirm Password</span>
            <input
              type="password"
              required
              value={registerData.confirmPassword}
              onChange={(event) => setRegisterData((prev) => ({ ...prev, confirmPassword: event.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-rose-400 transition focus:ring"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 px-5 py-2.5 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      )}
    </section>
  );
}
