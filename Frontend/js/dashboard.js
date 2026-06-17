document.addEventListener('DOMContentLoaded', () => {

  requireAuth();
  renderSidebar('dashboard');

  async function loadDashboard() {
    try {
      const tasks = await taskAPI.getAll();

      const total      = tasks.length;
      const todo       = tasks.filter(t => t.status === 'TODO').length;
      const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
      const done       = tasks.filter(t => t.status === 'COMPLETED').length;

      document.getElementById('countTotal').textContent      = total;
      document.getElementById('countTodo').textContent       = todo;
      document.getElementById('countInProgress').textContent = inProgress;
      document.getElementById('countDone').textContent       = done;

      const recent = tasks.slice(0, 5);
      const tbody  = document.getElementById('recentTasksBody');

      if (recent.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">No tasks yet.</td></tr>';
        return;
      }

      tbody.innerHTML = recent.map(task => `
        <tr onclick="window.location.href='task-detail.html?id=${task.id}'"
            style="cursor:pointer;">
          <td>${task.title}</td>
          <td>
            <span class="badge badge-${task.priority.toLowerCase()}">
              ${task.priority}
            </span>
          </td>
          <td>
            <span class="badge status-${task.status.toLowerCase()}">
              ${task.status.replace('_', ' ')}
            </span>
          </td>
          <td>${task.dueDate
                ? new Date(task.dueDate).toLocaleDateString()
                : 'No deadline'}</td>
        </tr>
      `).join('');

    } catch (err) {
      console.error('Dashboard error:', err);
    }
  }

  loadDashboard();

});