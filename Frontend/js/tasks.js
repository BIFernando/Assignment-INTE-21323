    requireAuth();
    renderNavbar('tasks');

    const user = getCurrentUser();
    let allTasks  = [];
    let isKanban  = false;

    // Hide create button for Collaborators
    if (user.role === 'COLLABORATOR') {
      document.getElementById('createTaskBtn').style.display = 'none';
    }

    // ── Load Tasks ─────────────────────────────────
    async function loadTasks() {
      const status   = document.getElementById('filterStatus').value;
      const priority = document.getElementById('filterPriority').value;
      const filters  = {};
      if (status)   filters.status   = status;
      if (priority) filters.priority = priority;

      try {
        allTasks = await taskAPI.getAll(filters);
        isKanban ? renderKanban() : renderList();
      } catch (err) {
        document.getElementById('pageError').textContent = err.message;
        document.getElementById('pageError').classList.add('show');
      }
    }

    // ── Render List View ───────────────────────────
    function renderList() {
      const tbody = document.getElementById('taskTableBody');
      if (allTasks.length === 0) {
  tbody.innerHTML = `
    <tr>
      <td colspan="6">
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <div class="empty-title">No tasks found</div>
          <div class="empty-desc">
            Tasks you create will appear here.
          </div>
        </div>
      </td>
    </tr>
  `;
  return;
}
      tbody.innerHTML = allTasks.map(task => `
        <tr>
          <td>
            <a href="task-detail.html?id=${task.id}"
               style="color:#7c8cff; font-weight:600;">
              ${task.title}
            </a>
          </td>
          <td>
            <span class="badge badge-${task.priority.toLowerCase()}">
              ${task.priority}
            </span>
          </td>
          <td>
            <span class="badge status-${task.status.toLowerCase()}">
              ${task.status.replace('_',' ')}
            </span>
          </td>
          <td>${task.dueDate
                ? new Date(task.dueDate).toLocaleDateString()
                : '—'}</td>
          <td>${task.assignees && task.assignees.length > 0
                ? task.assignees.map(a => a.name).join(', ')
                : 'Unassigned'}</td>
          <td>
            ${user.role !== 'COLLABORATOR' ? `
              <button class="btn btn-danger btn-sm"
                onclick="deleteTask('${task.id}')">Delete</button>
            ` : ''}
          </td>
        </tr>
      `).join('');
    }

    // ── Render Kanban View ─────────────────────────
    function renderKanban() {
      const statuses = ['TODO', 'IN_PROGRESS', 'COMPLETED'];

      statuses.forEach(status => {
        const cards  = allTasks.filter(t => t.status === status);
        const container = document.getElementById('cards-' + status);
        const counter   = document.getElementById('count-' + status);

        counter.textContent = cards.length;
        if (cards.length === 0) {
  container.innerHTML = `
    <div style="text-align:center; padding:30px 16px; color:var(--text-muted);">
      <i class="bi bi-inbox" style="font-size:28px; opacity:0.3;"></i>
      <div style="font-size:13px; margin-top:8px;">
        No tasks here
      </div>
    </div>
  `;
  return;
}

      container.innerHTML = cards.map(task => `

  <div class="kanban-card priority-${task.priority.toLowerCase()}"
       data-id="${task.id}"
       onclick="window.location.href='task-detail.html?id=${task.id}'">


<div class="kanban-card-title">
  ${DOMPurify.sanitize(task.title)}
</div>

<div class="kanban-card-meta">
  <span class="badge badge-${task.priority.toLowerCase()}">
    ${task.priority}
  </span>

  ${task.dueDate ? `
    <span class="kanban-card-date">
      <i class="bi bi-calendar3"></i>
      ${new Date(task.dueDate).toLocaleDateString()}
    </span>
  ` : ''}
</div>

  </div>
`).join('');

      });

      // Enable drag and drop between columns using SortableJS
      statuses.forEach(status => {
        new Sortable(document.getElementById('cards-' + status), {
          group: 'tasks',       // same group = cards can move between columns
          animation: 150,
          ghostClass: 'dragging',
          onEnd: async (evt) => {
            const taskId   = evt.item.dataset.id;
            const newStatus = evt.to.id.replace('cards-', '');
            try {
              await taskAPI.update(taskId, { status: newStatus });
            } catch (err) {
              alert('Could not update task status: ' + err.message);
              loadTasks(); // reload to revert if update failed
            }
          }
        });
      });
    }

    // ── Toggle Between List and Kanban ─────────────
    document.getElementById('toggleView')
      .addEventListener('click', () => {
      isKanban = !isKanban;
      document.getElementById('listView').style.display =
        isKanban ? 'none' : 'block';
      document.getElementById('kanbanView').style.display =
        isKanban ? 'block' : 'none';
      document.getElementById('toggleView').textContent =
        isKanban ? 'Switch to List' : 'Switch to Kanban';
      renderKanban();
    });

    // ── Filters ────────────────────────────────────
    document.getElementById('filterStatus')
      .addEventListener('change', loadTasks);
    document.getElementById('filterPriority')
      .addEventListener('change', loadTasks);

    // ── Create Task Modal ──────────────────────────
    document.getElementById('createTaskBtn')
      .addEventListener('click', () => {
      document.getElementById('createModal').classList.add('show');
    });

    document.getElementById('closeModal')
      .addEventListener('click', () => {
      document.getElementById('createModal').classList.remove('show');
    });

    document.getElementById('saveTaskBtn')
      .addEventListener('click', async () => {
      const title   = document.getElementById('taskTitle').value.trim();
      const desc    = document.getElementById('taskDesc').value.trim();
      const priority = document.getElementById('taskPriority').value;
      const dueDate = document.getElementById('taskDueDate').value;

      document.getElementById('titleError').classList.remove('show');
      document.getElementById('modalError').classList.remove('show');

      if (!title) {
        document.getElementById('titleError').classList.add('show');
        return;
      }

      try {
        await taskAPI.create({
          title, description: desc, priority,
          dueDate: dueDate || null
        });
        document.getElementById('createModal').classList.remove('show');
        document.getElementById('taskTitle').value = '';
        document.getElementById('taskDesc').value  = '';
        loadTasks();
      } catch (err) {
        const errEl = document.getElementById('modalError');
        errEl.textContent = err.message;
        errEl.classList.add('show');
      }
    });

    // ── Delete Task ────────────────────────────────
    async function deleteTask(id) {
      if (!confirm('Are you sure you want to delete this task?')) return;
      try {
        await taskAPI.delete(id);
        loadTasks();
      } catch (err) {
        alert('Error: ' + err.message);
      }
    }

    // Load tasks on page open
    loadTasks();