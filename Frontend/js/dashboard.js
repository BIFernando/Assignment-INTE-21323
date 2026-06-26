document.addEventListener('DOMContentLoaded', () => {

  requireAuth();
  renderSidebar('dashboard');

  // ── LOAD DASHBOARD ─────────────────────────────────────────
  async function loadDashboard() {
    try {
      const projects = await projectAPI.getAll();

      if (projects.length === 0) {
        document.getElementById('countTotal').textContent = 0;
        document.getElementById('countTodo').textContent = 0;
        document.getElementById('countInProgress').textContent = 0;
        document.getElementById('countDone').textContent = 0;
        document.getElementById('recentTasksBody').innerHTML =
          '<tr><td colspan="4">No tasks yet. Create a project first.</td></tr>';
        return;
      }

      let allTasks = [];
      for (const project of projects) {
        try {
          const tasks = await taskAPI.getAll({ projectId: project.id });
          allTasks = allTasks.concat(tasks);
        } catch (e) {
          console.error(`Could not load tasks for project ${project.id}:`, e);
        }
      }

      const total = allTasks.length;
      const todo = allTasks.filter(t => t.status === 'TODO').length;
      const inProgress = allTasks.filter(t => t.status === 'IN_PROGRESS').length;
      const done = allTasks.filter(t => t.status === 'COMPLETED').length;

      document.getElementById('countTotal').textContent = total;
      document.getElementById('countTodo').textContent = todo;
      document.getElementById('countInProgress').textContent = inProgress;
      document.getElementById('countDone').textContent = done;

      const recent = allTasks.slice(0, 5);
      const tbody = document.getElementById('recentTasksBody');

      if (recent.length === 0) {
        tbody.innerHTML =
          '<tr><td colspan="4">No tasks yet.</td></tr>';
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