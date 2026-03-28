import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';

function StatCard({ title, value, tone, description }) {
  const toneClasses = {
    amber: 'from-amber-200 via-amber-100 to-white border-amber-300',
    sky: 'from-sky-200 via-sky-100 to-white border-sky-300',
    emerald: 'from-emerald-200 via-emerald-100 to-white border-emerald-300',
    rose: 'from-rose-200 via-rose-100 to-white border-rose-300',
  };

  return (
    <article className={`rounded-2xl border bg-linear-to-br p-5 shadow-sm ${toneClasses[tone] || toneClasses.sky}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">{title}</p>
      <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
    </article>
  );
}

export function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.getAdminDashboard();
        setDashboard(response.data);
      } catch (requestError) {
        setError(requestError.message || 'Failed to load dashboard.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const completionRate = useMemo(() => {
    if (!dashboard || dashboard.tasks.total === 0) {
      return 0;
    }

    return Math.round((dashboard.tasks.completed / dashboard.tasks.total) * 100);
  }, [dashboard]);

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600 shadow-sm">
        Loading admin dashboard...
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-rose-300 bg-rose-50 p-6 text-rose-800 shadow-sm">
        {error}
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black text-slate-900">Admin Control Dashboard</h2>
        <p className="mt-1 text-sm text-slate-600">
          Protected analytics for admin users only. Data is served from a JWT-protected endpoint.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Users"
          value={dashboard.users.total}
          tone="sky"
          description={`${dashboard.users.active} currently active`}
        />
        <StatCard
          title="Admin Accounts"
          value={dashboard.users.admins}
          tone="amber"
          description="Users with full privileges"
        />
        <StatCard
          title="Total Tasks"
          value={dashboard.tasks.total}
          tone="emerald"
          description={`${dashboard.tasks.pending} still pending`}
        />
        <StatCard
          title="Completion"
          value={`${completionRate}%`}
          tone="rose"
          description={`${dashboard.tasks.completed} tasks completed`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">Recent Users</h3>
          <div className="mt-4 space-y-3">
            {dashboard.recentUsers.map((user) => (
              <div key={user.id} className="rounded-xl border border-slate-200 p-3">
                <p className="text-sm font-semibold text-slate-900">{user.username}</p>
                <p className="text-xs text-slate-600">{user.email}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                  Role: {user.role} • {user.is_active ? 'active' : 'inactive'}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">Recent Tasks</h3>
          <div className="mt-4 space-y-3">
            {dashboard.recentTasks.map((task) => (
              <div key={task.id} className="rounded-xl border border-slate-200 p-3">
                <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                <p className="text-xs text-slate-600">Owner: {task.username}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                  Status: {task.status} • Priority: {task.priority}
                </p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
