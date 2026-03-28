import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { TaskForm } from '../components/TaskForm';
import { TaskList } from '../components/TaskList';

export function TasksPage() {
  const [taskLoading, setTaskLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [tasks, setTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingTask, setEditingTask] = useState(null);

  const filteredTasks = useMemo(() => {
    if (statusFilter === 'all') {
      return tasks;
    }
    return tasks.filter((task) => task.status === statusFilter);
  }, [tasks, statusFilter]);

  const setNotice = (text, type = 'info') => {
    setMessage(text);
    setMessageType(type);
  };

  const loadTasks = async () => {
    setTaskLoading(true);
    try {
      const response = await api.getTasks();
      setTasks(response.data || []);
    } catch (error) {
      setNotice(error.message, 'error');
    } finally {
      setTaskLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreateTask = async (payload) => {
    setSubmitLoading(true);
    setMessage('');
    try {
      const response = await api.createTask(payload);
      setTasks((prev) => [response.data, ...prev]);
      setNotice('Task created.', 'success');
    } catch (error) {
      setNotice(error.message, 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditTask = async (payload) => {
    if (!editingTask) {
      return;
    }

    setSubmitLoading(true);
    setMessage('');
    try {
      const response = await api.updateTask(editingTask.id, payload);
      setTasks((prev) => prev.map((task) => (task.id === editingTask.id ? response.data : task)));
      setEditingTask(null);
      setNotice('Task updated.', 'success');
    } catch (error) {
      setNotice(error.message, 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleQuickUpdate = async (taskId, payload) => {
    try {
      const response = await api.updateTask(taskId, payload);
      setTasks((prev) => prev.map((task) => (task.id === taskId ? response.data : task)));
    } catch (error) {
      setNotice(error.message, 'error');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.deleteTask(taskId);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      setNotice('Task deleted.', 'success');

      if (editingTask?.id === taskId) {
        setEditingTask(null);
      }
    } catch (error) {
      setNotice(error.message, 'error');
    }
  };

  return (
    <>
      {message ? (
        <div
          className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
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

      <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
        <TaskForm
          mode={editingTask ? 'edit' : 'create'}
          initialTask={editingTask}
          loading={submitLoading}
          onSubmit={editingTask ? handleEditTask : handleCreateTask}
          onCancelEdit={() => setEditingTask(null)}
        />

        <TaskList
          tasks={filteredTasks}
          loading={taskLoading}
          activeFilter={statusFilter}
          onFilterChange={setStatusFilter}
          onEdit={(task) => setEditingTask(task)}
          onDelete={handleDeleteTask}
          onQuickUpdate={handleQuickUpdate}
        />
      </div>
    </>
  );
}
