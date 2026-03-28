import { useEffect, useState } from 'react';

const initialState = {
  title: '',
  description: '',
  priority: 'medium',
  status: 'pending',
};

export function TaskForm({ mode, initialTask, loading, onSubmit, onCancelEdit }) {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (mode === 'edit' && initialTask) {
      setForm({
        title: initialTask.title || '',
        description: initialTask.description || '',
        priority: initialTask.priority || 'medium',
        status: initialTask.status || 'pending',
      });
      return;
    }

    setForm(initialState);
  }, [initialTask, mode]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
    };

    if (mode === 'edit') {
      payload.status = form.status;
    }

    onSubmit(payload);

    if (mode === 'create') {
      setForm(initialState);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">{mode === 'edit' ? 'Edit Task' : 'New Task'}</h2>
      <p className="mb-4 text-sm text-slate-600">
        {mode === 'edit' ? 'Update fields and save changes.' : 'Create a task and test your POST endpoint.'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Title</span>
          <input
            type="text"
            minLength={3}
            maxLength={255}
            required
            value={form.title}
            onChange={(event) => handleChange('title', event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-indigo-400 transition focus:ring"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Description</span>
          <textarea
            rows={4}
            maxLength={1000}
            value={form.description}
            onChange={(event) => handleChange('description', event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-indigo-400 transition focus:ring"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Priority</span>
          <select
            value={form.priority}
            onChange={(event) => handleChange('priority', event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-indigo-400 transition focus:ring"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>

        {mode === 'edit' ? (
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Status</span>
            <select
              value={form.status}
              onChange={(event) => handleChange('status', event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-indigo-400 transition focus:ring"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </label>
        ) : null}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Saving...' : mode === 'edit' ? 'Save changes' : 'Create task'}
          </button>

          {mode === 'edit' ? (
            <button
              type="button"
              onClick={onCancelEdit}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}
