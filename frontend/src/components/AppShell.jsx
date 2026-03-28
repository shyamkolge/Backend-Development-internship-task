import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const baseNavClass =
  'rounded-lg px-3 py-2 text-sm font-semibold transition';

export function AppShell() {
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 rounded-2xl bg-slate-900 p-6 text-slate-100 shadow-xl md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-amber-300">JWT Protected Workspace</p>
            <h1 className="text-2xl font-black">Welcome, {user.username}</h1>
            <p className="text-sm text-slate-300">Role: {user.role}</p>
          </div>

          <div className="flex items-center gap-2">
            {user.role !== 'admin' ? (
              <NavLink
                to="/tasks"
                className={({ isActive }) =>
                  `${baseNavClass} ${isActive ? 'bg-white text-slate-900' : 'text-slate-200 hover:bg-slate-800'}`
                }
              >
                Tasks
              </NavLink>
            ) : null}

            {user.role === 'admin' ? (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `${baseNavClass} ${isActive ? 'bg-amber-300 text-slate-950' : 'text-amber-200 hover:bg-slate-800'}`
                }
              >
                Admin
              </NavLink>
            ) : null}

            <button
              type="button"
              onClick={logout}
              className="rounded-xl bg-rose-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
            >
              Logout
            </button>
          </div>
        </header>

        <Outlet />
      </div>
    </main>
  );
}
