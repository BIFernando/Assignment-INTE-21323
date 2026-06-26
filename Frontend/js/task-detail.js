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

  let currentTask = null;

  function renderAssignees(assignees) {
    const names = assignees && assignees.length > 0
      ? assignees.map(a => a.name).join(', ')
      : 'Unassigned';

    document.getElementById('taskAssignees').innerHTML =
      '<strong>Assigned to:</strong> ' + names;
  }

  function updateStatusSelect(status) {
    const statusSelect = document.getElementById('statusSelect');
    if (statusSelect) {
      statusSelect.value = status;
    }
  }

  // ── TASK DETAILS ─────────────────────────────────────────
  async function loadTaskDetail() {
    try {
      const task = await taskAPI.getById(taskId);
      currentTask = task;

      document.getElementById('taskTitle').textContent = task.title;
      document.getElementById('taskDescription').textContent =
        task.description || 'No description.';

      document.getElementById('taskMeta').innerHTML =
        `<span class="badge badge-${task.priority.toLowerCase()}">${task.priority}</span>
         &nbsp; Due: ${task.dueDate
          ? new Date(task.dueDate).toLocaleDateString()
          : 'No deadline'}`;

      renderAssignees(task.assignees);

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
            const originalValue = currentTask ? currentTask.status : dropdown.value;

            try {
              dropdown.disabled = true;

              await taskAPI.update(taskId, { status: newStatus });

              if (currentTask) {
                currentTask.status = newStatus;
              }
              updateStatusSelect(newStatus);

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
        updateStatusSelect(task.status);
      }

    } catch (err) {
      document.getElementById('pageError').textContent = err.message;
      document.getElementById('pageError').classList.add('show');
    }
  }

  // ── ASSIGNEES MODAL ──────────────────────────────────────
  function closeAssigneesModal() {
    document.getElementById('assigneesModal').classList.remove('show');
    document.getElementById('assigneesError').classList.remove('show');
  }

  async function openAssigneesModal() {
    if (!currentTask) return;

    try {
      const project = await projectAPI.getById(currentTask.projectId);
      const select = document.getElementById('assigneesSelect');

      if (!project.members || project.members.length === 0) {
        select.innerHTML = '<option disabled>No members found</option>';
      } else {
        select.innerHTML = project.members.map(m => `
          <option value="${m.userId}">
            ${m.user ? m.user.name : 'Unknown'}
            (${m.role.replace('_', ' ')})
          </option>
        `).join('');
      }

      const assigneeIds = (currentTask.assignees || []).map(a => String(a.id));
      Array.from(select.options).forEach(opt => {
        opt.selected = assigneeIds.includes(opt.value);
      });

      document.getElementById('assigneesError').classList.remove('show');
      document.getElementById('assigneesModal').classList.add('show');
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  }

  document.getElementById('editAssigneesBtn')
    .addEventListener('click', openAssigneesModal);

  document.getElementById('closeAssigneesModal')
    .addEventListener('click', closeAssigneesModal);

  document.getElementById('closeAssigneesModal2')
    .addEventListener('click', closeAssigneesModal);

  document.getElementById('saveAssigneesBtn')
    .addEventListener('click', async () => {
      const select = document.getElementById('assigneesSelect');
      const userIds = Array.from(select.selectedOptions).map(opt => opt.value);

      if (userIds.length === 0) {
        const errEl = document.getElementById('assigneesError');
        errEl.textContent = 'Please select at least one assignee.';
        errEl.classList.add('show');
        return;
      }

      try {
        await taskAPI.assignUsers(taskId, userIds);

        const selectedNames = Array.from(select.selectedOptions)
          .map(opt => opt.textContent.trim().split('(')[0].trim());

        if (currentTask) {
          currentTask.assignees = userIds.map((id, i) => ({
            id: parseInt(id, 10),
            name: selectedNames[i] || 'Unknown',
          }));
        }

        renderAssignees(currentTask ? currentTask.assignees : []);
        closeAssigneesModal();
        showToast('Success', 'Assignees updated.', 'success');

        await loadTaskDetail();
      } catch (err) {
        const errEl = document.getElementById('assigneesError');
        errEl.textContent = err.message;
        errEl.classList.add('show');
      }
    });

  // ── ATTACHMENTS ──────────────────────────────────────────
  function getAttachmentUrl(fileUrl) {
    if (!fileUrl) return '#';
    if (fileUrl.startsWith('http')) return fileUrl;
    const path = fileUrl.replace(/\\/g, '/');
    return '/' + path.replace(/^\/?/, '');
  }

  async function loadAttachments() {
    const list = document.getElementById('attachmentsList');

    try {
      const attachments = await taskAPI.getAttachments(taskId);

      if (attachments.length === 0) {
        list.innerHTML = `<div class="notif-empty">No attachments yet.</div>`;
        return;
      }

      list.innerHTML = attachments.map(a => {
        const canDelete = a.uploadedBy === user.id || user.role === 'admin';
        return `
          <div style="display:flex; align-items:center; justify-content:space-between;
                      padding:10px 0; border-bottom:1px solid var(--border); gap:12px;">
            <a href="${getAttachmentUrl(a.fileUrl)}" target="_blank"
               style="color:var(--primary); text-decoration:none; font-size:14px;">
              <i class="bi bi-paperclip"></i> ${a.fileName}
            </a>
            ${canDelete ? `
              <button class="btn btn-danger btn-sm" data-attachment-id="${a.id}">
                <i class="bi bi-trash"></i> Delete
              </button>
            ` : ''}
          </div>
        `;
      }).join('');

      list.querySelectorAll('[data-attachment-id]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const attachmentId = btn.dataset.attachmentId;
          const ok = await appConfirm(
            'Delete Attachment?',
            'This file will be permanently removed.',
            'Delete'
          );
          if (!ok) return;

          try {
            await taskAPI.deleteAttachment(taskId, attachmentId);
            showToast('Success', 'Attachment deleted.', 'success');
            await loadAttachments();
          } catch (err) {
            showToast('Error', err.message, 'error');
          }
        });
      });

    } catch (err) {
      list.innerHTML = `<div class="notif-empty">Could not load attachments.</div>`;
    }
  }

  document.getElementById('uploadBtn').addEventListener('click', async () => {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
      showToast('Error', 'Please select a file to upload.', 'error');
      return;
    }

    try {
      document.getElementById('uploadBtn').disabled = true;
      await taskAPI.uploadAttachment(taskId, file);
      fileInput.value = '';
      showToast('Success', 'File uploaded.', 'success');
      await loadAttachments();
    } catch (err) {
      showToast('Error', err.message, 'error');
    } finally {
      document.getElementById('uploadBtn').disabled = false;
    }
  });

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
  loadAttachments();
});
