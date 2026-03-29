const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-development-internship-task.onrender.com/api/v1';


async function request(path, options = {}) {
  const { method = 'GET', body } = options;
  const headers = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const validationErrors = payload.errors?.map((item) => item.message).join(', ');
    const message = validationErrors || payload.message || 'Request failed.';
    throw new Error(message);
  }

  return payload;
}

export const api = {
  baseUrl: API_BASE_URL,

  register(formData) {
    return request('/auth/register', {
      method: 'POST',
      body: formData,
    });
  },

  login(formData) {
    return request('/auth/login', {
      method: 'POST',
      body: formData,
    });
  },

  refreshToken() {
    return request('/auth/refresh', {
      method: 'POST',
    });
  },

  logout() {
    return request('/auth/logout', {
      method: 'POST',
    });
  },

  getMe() {
    return request('/auth/me');
  },

  getTasks() {
    return request('/tasks');
  },

  createTask(formData) {
    return request('/tasks', {
      method: 'POST',
      body: formData,
    });
  },

  updateTask(taskId, formData) {
    return request(`/tasks/${taskId}`, {
      method: 'PUT',
      body: formData,
    });
  },

  deleteTask(taskId) {
    return request(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },

  getAdminDashboard() {
    return request('/admin/dashboard');
  },
};
