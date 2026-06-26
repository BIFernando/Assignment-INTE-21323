document.addEventListener('DOMContentLoaded', () => {

  requireAuth();
  renderSidebar('tasks');

  const user = getCurrentUser();

  const params = new URLSearchParams(window.location.search);
  const taskId = params.get('id');

  if (!taskId) {
    window.location.href = 'projects.html';
    return;
  }

  // ── TASK DETAILS ─────────────────────────────────────────
  async function loadTaskDetail() {
    try {
      const task = await taskAPI.getById(taskId);

      document.getElementById('taskTitle').textContent = task.title;
      document.getElementById('taskDescription').textContent =
        task.description || 'No description.';

      document.getElementById('taskMeta').innerHTML =
        `<span class="badge badge-${task.priority.toLowerCase()}">${task.priority}</span>
         &nbsp; Due: ${task.dueDate
          ? new Date(task.dueDate).toLocaleDateString()
          : 'No deadline'}`;

      const assignees = task.assignees && task.assignees.length > 0
        ? task.assignees.map(a => a.name).join(', ')
        : 'Unassigned';

      document.getElementById('taskAssignees').innerHTML =
        '<strong>Assigned to:</strong> ' + assignees;

      // ── STATUS DROPDOWN ─────────────────────────────
      const statusSelector = document.getElementById('statusSelector');

      const dropdownHTML = `
        <select class="btn btn-secondary btn-sm" id="statusSelect">
          <option value="TODO" ${task.status === 'TODO' ? 'selected' : ''}>To Do</option>
          <option value="IN_PROGRESS" ${task.status === 'IN_PROGRESS' ? 'selected' : ''}>In Progress</option>
          <option value="COMPLETED" ${task.status === 'COMPLETED' ? 'selected' : ''}>Completed</option>
        </select>
      `;

      if (!statusSelector.querySelector('#statusSelect')) {
        statusSelector.innerHTML = dropdownHTML;

        document.getElementById('statusSelect')
          .addEventListener('change', async (e) => {
            const newStatus = e.target.value;
            const dropdown = document.getElementById('statusSelect');
            const originalValue = dropdown.value;

            try {
              dropdown.disabled = true;

              await taskAPI.update(taskId, { status: newStatus });

              await new Promise(resolve => setTimeout(resolve, 200));

              showToast(
                'Success',
                'Status updated to ' + newStatus.replace('_', ' ') + '.',
                'success'
              );

              await loadTaskDetail();

            } catch (err) {
              dropdown.value = originalValue;
              showToast('Error', err.message, 'error');
            } finally {
              dropdown.disabled = false;
            }
          });

      } else {
        document.getElementById('statusSelect').value = task.status;
      }

    } catch (err) {
      document.getElementById('pageError').textContent = err.message;
      document.getElementById('pageError').classList.add('show');
    }
  }

  // ── COMMENTS PANEL ───────────────────────────────
  document.getElementById('commentsBtn')
    .addEventListener('click', async () => {
      document.getElementById('commentsPanel').classList.add('open');
      document.getElementById('commentsOverlay').classList.add('open');

      await loadComments();

      if (!window.commentRefreshInterval) {
        window.commentRefreshInterval = setInterval(() => {
          if (document.getElementById('commentsPanel').classList.contains('open')) {
            loadComments();
          } else {
            clearInterval(window.commentRefreshInterval);
            window.commentRefreshInterval = null;
          }
        }, 5000);
      }
    });

  window.closeComments = function () {
    document.getElementById('commentsPanel').classList.remove('open');
    document.getElementById('commentsOverlay').classList.remove('open');
  };

  // ── LOAD COMMENTS ────────────────────────────────
  async function loadComments() {
    const list = document.getElementById('commentsList');

    try {
      const comments = await taskAPI.getComments(taskId);

      if (comments.length === 0) {
        list.innerHTML = `<div class="notif-empty">No comments yet.</div>`;
        return;
      }

      list.innerHTML = comments.map(c => `
        <div class="notif-item">
          <div><strong>${c.author?.name || 'Unknown'}</strong></div>
          <div>${c.content}</div>
          <small>${timeAgo(c.createdAt)}</small>
        </div>
      `).join('');

    } catch (err) {
      list.innerHTML = `<div class="notif-empty">Could not load comments.</div>`;
    }
  }

  // ── TIME HELPERS ────────────────────────────────
  function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    return Math.floor(diff / 86400) + 'd ago';
  }

  // ── INIT ─────────────────────────────────────────
  loadTaskDetail();
});