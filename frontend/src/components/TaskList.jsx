const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

const statusStyle = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  in_progress: 'bg-sky-100 text-sky-800 border-sky-200',
  completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

const priorityStyle = {
  low: 'text-emerald-700',
  medium: 'text-amber-700',
  high: 'text-rose-700',
};

export function TaskList({ tasks, loading, activeFilter, onFilterChange, onEdit, onDelete, onQuickUpdate }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Your Tasks</h2>
          <p className="text-sm text-slate-600">Test list, update, and delete endpoints from one place.</p>
        </div>

        <select
          value={activeFilter}
          onChange={(event) => onFilterChange(event.target.value)}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-400 transition focus:ring"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? <p className="py-8 text-center text-slate-500">Loading tasks...</p> : null}

      {!loading && tasks.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 py-10 text-center text-slate-500">
          No tasks yet. Create one using the form.
        </p>
      ) : null}

      <div className="space-y-3">
        {tasks.map((task) => (
          <article key={task.id} className="rounded-xl border border-slate-200 p-4">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900">{task.title}</h3>
              <span
                className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${statusStyle[task.status] || statusStyle.pending}`}
              >
                {task.status}
              </span>
              <span className={`text-xs font-bold uppercase tracking-wide ${priorityStyle[task.priority] || 'text-slate-600'}`}>
                {task.priority}
              </span>
            </div>

            <p className="mb-3 whitespace-pre-wrap text-sm text-slate-700">{task.description || 'No description'}</p>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={task.status}
                onChange={(event) => onQuickUpdate(task.id, { status: event.target.value })}
                className="rounded-lg border border-slate-300 px-2 py-1 text-xs outline-none ring-indigo-400 transition focus:ring"
              >
                <option value="pending">pending</option>
                <option value="in_progress">in_progress</option>
                <option value="completed">completed</option>
              </select>

              <select
                value={task.priority}
                onChange={(event) => onQuickUpdate(task.id, { priority: event.target.value })}
                className="rounded-lg border border-slate-300 px-2 py-1 text-xs outline-none ring-indigo-400 transition focus:ring"
              >
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>

              <button
                type="button"
                onClick={() => onEdit(task)}
                className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Edit
              </button>

              <button
                type="button"
                onClick={() => onDelete(task.id)}
                className="rounded-lg bg-rose-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-rose-600"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
