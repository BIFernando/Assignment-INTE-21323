document.addEventListener('DOMContentLoaded', () => {

  requireAuth();
  renderSidebar('tasks');

  const user = getCurrentUser();

  // ── GET PROJECT ID FROM URL ─────────────────────────────────────────
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('projectId');

  if (!projectId) {
    window.location.href = 'projects.html';
    return;
  }

  let allTasks = [];
  let isKanban = false;

  if (user.role === 'collaborator') {
    document.getElementById('createTaskBtn').style.display = 'none';
  }
  // ── LOAD PROJECT MEMBERS ─────────────────────────────────────────
  async function loadProjectMembers() {
    try {
      const project = await projectAPI.getById(projectId);
      const select = document.getElementById('taskAssignees');

      if (!project.members || project.members.length === 0) {
        select.innerHTML =
          '<option disabled>No members found</option>';
        return;
      }

      select.innerHTML = project.members.map(m => `
        <option value="${m.userId}">
          ${m.user ? m.user.name : 'Unknown'}
          (${m.role.replace('_', ' ')})
        </option>
      `).join('');
    } catch (err) {
      console.error('Could not load members:', err);
    }
  }
  // ── LOAD TASKS ─────────────────────────────────
  async function loadTasks() {
    try {
      allTasks = await taskAPI.getAll({ projectId });
      isKanban ? renderKanban() : renderList();
    } catch (err) {
      document.getElementById('pageError').textContent = err.message;
      document.getElementById('pageError').classList.add('show');
    }
  }

  // ── RENDER LIST VIEW ───────────────────────────
  function renderList() {
    const tbody = document.getElementById('taskTableBody');
    if (allTasks.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-state">
              <div class="empty-icon">📋</div>
              <div class="empty-title">No tasks found</div>
              <div class="empty-desc">Tasks you create will appear here.</div>
            </div>
          </td>
        </tr>`;
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
            ${task.status.replace('_', ' ')}
          </span>
        </td>
        <td>${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</td>
        <td>${task.assignees && task.assignees.length > 0
        ? task.assignees.map(a => a.name).join(', ')
        : 'Unassigned'}</td>
        <td>
          ${user.role !== 'collaborator' ? `
            <button class="btn btn-danger btn-sm"
              onclick="deleteTask('${task.id}')">Delete</button>
          ` : ''}
        </td>
      </tr>
    `).join('');
  }

  // ── RENDER KANBAN VIEW ─────────────────────────
  function renderKanban() {
    const statuses = ['TODO', 'IN_PROGRESS', 'COMPLETED'];

    statuses.forEach(status => {
      const cards = allTasks.filter(t => t.status === status);
      const container = document.getElementById('cards-' + status);
      const counter = document.getElementById('count-' + status);

      counter.textContent = cards.length;

      if (cards.length === 0) {
        container.innerHTML = `
          <div style="text-align:center; padding:30px 16px; color:var(--text-muted);">
            <i class="bi bi-inbox" style="font-size:28px; opacity:0.3;"></i>
            <div style="font-size:13px; margin-top:8px;">No tasks here</div>
          </div>`;
        return;
      }

      container.innerHTML = cards.map(task => `
  <div class="kanban-card priority-${task.priority.toLowerCase()}"
       data-id="${task.id}"
       onclick="window.location.href='task-detail.html?id=${task.id}'">
    <div class="kanban-card-title">${task.title}</div>
    <div class="kanban-card-meta">
      <span class="badge badge-${task.priority.toLowerCase()}">
        ${task.priority}
      </span>
      ${task.dueDate ? `
        <span class="kanban-card-date">
          <i class="bi bi-calendar3"></i>
          ${new Date(task.dueDate).toLocaleDateString()}
        </span>` : ''}
    </div>

    ${task.assignees && task.assignees.length > 0 ? `
      <div style="margin-top:8px; font-size:11px; color:var(--text-muted);">
        <i class="bi bi-person"></i>
        ${task.assignees.map(a => a.name).join(', ')}
      </div>
    ` : ''}

  </div>
`).join('');

      // ── DRAG AND DROP ─────────────────────────────────────────
      statuses.forEach(status => {
        new Sortable(document.getElementById('cards-' + status), {
          group: 'tasks',
          animation: 150,
          ghostClass: 'dragging',
          onEnd: async (evt) => {
            const taskId = evt.item.dataset.id;
            const newStatus = evt.to.id.replace('cards-', '');
            try {
              await taskAPI.update(taskId, { status: newStatus });
              loadTasks();
            } catch (err) {
              showToast('Error', 'Could not update task status.', 'error');
              loadTasks();
            }
          }
        });
      });
    });
  }

  // ── TOGGLE VIEW ────────────────────────────────
  const toggleBtn = document.getElementById('toggleView');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      isKanban = !isKanban;
      document.getElementById('listView').style.display = isKanban ? 'none' : 'block';
      document.getElementById('kanbanView').style.display = isKanban ? 'block' : 'none';
      toggleBtn.textContent = isKanban ? 'Switch to List' : 'Switch to Kanban';
      if (isKanban) renderKanban();
    });
  }

  // ── CREATE TASK MODAL ──────────────────────────
  document.getElementById('createTaskBtn').addEventListener('click', () => {
    loadProjectMembers();
    document.getElementById('createModal').classList.add('show');
  });

  document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('createModal').classList.remove('show');
  });

  document.getElementById('saveTaskBtn').addEventListener('click', async () => {
    const title = document.getElementById('taskTitle').value.trim();
    const desc = document.getElementById('taskDesc').value.trim();
    const priority = document.getElementById('taskPriority').value;
    const dueDate = document.getElementById('taskDueDate').value;

    const assigneeSelect = document.getElementById('taskAssignees');
    const assigneeIds = Array.from(assigneeSelect.selectedOptions)
      .map(opt => opt.value);

    document.getElementById('titleError').classList.remove('show');
    document.getElementById('modalError').classList.remove('show');

    if (!title) {
      document.getElementById('titleError').classList.add('show');
      return;
    }

    try {
      const task = await taskAPI.create({
        title,
        description: desc,
        priority,
        dueDate: dueDate || null,
        projectId,
        assigneeIds
      });

      document.getElementById('createModal').classList.remove('show');
      document.getElementById('taskTitle').value = '';
      document.getElementById('taskDesc').value = '';
      assigneeSelect.selectedIndex = -1;

      loadTasks();
    } catch (err) {
      const errEl = document.getElementById('modalError');
      errEl.textContent = err.message;
      errEl.classList.add('show');
    }
  });

  // ── DELETE TASK ─────────────────────────────────
  window.deleteTask = async function (id) {
    const ok = await appConfirm(
      'Delete Task?',
      'This action cannot be undone.',
      'Delete'
    );
    if (!ok) return;
    try {
      await taskAPI.delete(id);
      loadTasks();
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  loadTasks();

  window.addEventListener('pageshow', (event) => {
    if (event.persisted || sessionStorage.getItem('tasksNeedReload')) {
      sessionStorage.removeItem('tasksNeedReload');
      loadTasks();
    }
  });

}); 
