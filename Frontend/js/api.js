    // The base URL of your backend server
    const API_BASE = 'http://localhost:5000/api';

    // Helper: get the stored JWT token
    function getToken() {
      return localStorage.getItem('token');
    }

    // Helper: build headers with Authorization token
    function authHeaders() {
      return {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken(),
      };
    }

    // Helper: handle API errors consistently
    async function handleResponse(res) {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong.');
      }
      return data;
    }

    // ── AUTH ───────────────────────────────────────
    const authAPI = {
      login: (email, password) =>
        fetch(API_BASE + '/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }).then(handleResponse),

      resetPassword: (newPassword) =>
        fetch(API_BASE + '/auth/reset-password', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ newPassword }),
        }).then(handleResponse),
    };

    // ── USERS ──────────────────────────────────────
    const userAPI = {
      getAll: () =>
        fetch(API_BASE + '/users', {
          headers: authHeaders()
        }).then(handleResponse),

      create: (data) =>
        fetch(API_BASE + '/users', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(data),
        }).then(handleResponse),

      update: (id, data) =>
        fetch(API_BASE + '/users/' + id, {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify(data),
        }).then(handleResponse),

      deactivate: (id) =>
        fetch(API_BASE + '/users/' + id + '/deactivate', {
          method: 'PATCH',
          headers: authHeaders(),
        }).then(handleResponse),
    };

    // ── TASKS ──────────────────────────────────────
    const taskAPI = {
      getAll: (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        return fetch(API_BASE + '/tasks?' + params, {
          headers: authHeaders(),
        }).then(handleResponse);
      },

      getById: (id) =>
        fetch(API_BASE + '/tasks/' + id, {
          headers: authHeaders(),
        }).then(handleResponse),

      create: (data) =>
        fetch(API_BASE + '/tasks', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(data),
        }).then(handleResponse),

      update: (id, data) =>
        fetch(API_BASE + '/tasks/' + id, {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify(data),
        }).then(handleResponse),

      delete: (id) =>
        fetch(API_BASE + '/tasks/' + id, {
          method: 'DELETE',
          headers: authHeaders(),
        }).then(handleResponse),

      addComment: (taskId, content) =>
        fetch(API_BASE + '/tasks/' + taskId + '/comments', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ content }),
        }).then(handleResponse),

      getComments: (taskId) =>
        fetch(API_BASE + '/tasks/' + taskId + '/comments', {
          headers: authHeaders(),
        }).then(handleResponse),

      uploadAttachment: (taskId, file) => {
        const formData = new FormData();
        formData.append('file', file);
        return fetch(API_BASE + '/tasks/' + taskId + '/attachments', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + getToken() },
          body: formData,
        }).then(handleResponse);
      },

      getAttachments: (taskId) =>
        fetch(API_BASE + '/tasks/' + taskId + '/attachments', {
          headers: authHeaders(),
        }).then(handleResponse),
    };