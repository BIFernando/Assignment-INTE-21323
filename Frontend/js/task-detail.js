document.addEventListener('DOMContentLoaded', () => {

  requireAuth();
  renderSidebar('tasks');

  const params = new URLSearchParams(window.location.search);
  const taskId = params.get('id');
  if (!taskId) {
    window.location.href = 'projects.html';
    return;
  }

    async function loadTaskDetail() {
      try {
        const task = await taskAPI.getById(taskId);

        document.getElementById('taskTitle').textContent = task.title;
        document.getElementById('taskDescription').textContent =
          task.description || 'No description.';
        document.getElementById('taskMeta').innerHTML =
          `<span class="badge badge-${task.priority.toLowerCase()}">${task.priority}</span>
           &nbsp; Due: ${task.dueDate
             ? new Date(task.dueDate).toLocaleDateString() : 'No deadline'}`;

        // Assignees list
        const assignees = task.assignees && task.assignees.length > 0
          ? task.assignees.map(a => a.name).join(', ')
          : 'Unassigned';
        document.getElementById('taskAssignees').innerHTML =
          '<strong>Assigned to:</strong> ' + assignees;

        // Status dropdown — all roles can update status
        document.getElementById('statusSelector').innerHTML = `
          <select class="btn btn-secondary btn-sm" id="statusSelect">
            <option value="TODO"        ${task.status==='TODO'?'selected':''}>To Do</option>
            <option value="IN_PROGRESS" ${task.status==='IN_PROGRESS'?'selected':''}>In Progress</option>
            <option value="COMPLETED"   ${task.status==='COMPLETED'?'selected':''}>Completed</option>
          </select>
        `;
        document.getElementById('statusSelect')
    .addEventListener('change', async (e) => {
      const newStatus = e.target.value;
      try {
        await taskAPI.update(taskId, { status: newStatus });
        showToast('Success', 'Status updated to ' +
          newStatus.replace('_', ' ') + '.', 'success');
 
        // Reload full task details so everything syncs
        await loadTaskDetail();
      } catch (err) {
        showToast('Error', err.message, 'error');
        // Revert dropdown if update failed
        await loadTaskDetail();
      }
    });

    } catch (err) {
      document.getElementById('pageError').textContent = err.message;
      document.getElementById('pageError').classList.add('show');
    }
  }

  // ── Load Comments ─────────────────────────────────
  async function loadComments() {
    const list = document.getElementById('commentsList');
    try {
      const comments = await taskAPI.getComments(taskId);

      // Update badge count
      const badge = document.getElementById('commentsBadge');
      if (comments.length > 0) {
        badge.textContent = comments.length;
        badge.style.display = 'inline-flex';
      } else {
        badge.style.display = 'none';
      }

      if (comments.length === 0) {
        list.innerHTML = `
          <div class="notif-empty">
            <i class="bi bi-chat-left"
               style="font-size:28px; opacity:0.3;"></i>
            <div style="margin-top:8px;">No comments yet.</div>
            <div style="font-size:12px; margin-top:4px;">
              Be the first to comment.
            </div>
          </div>`;
        return;
      }

      list.innerHTML = comments.map(c => `
        <div class="notif-item" style="align-items:flex-start;">
          <div class="sidebar-avatar"
               style="width:32px; height:32px; font-size:12px; flex-shrink:0;">
            ${c.author
              ? c.author.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)
              : '?'}
          </div>
          <div style="flex:1; min-width:0;">
            <div style="display:flex; justify-content:space-between;
                        align-items:center; margin-bottom:4px;">
              <span style="font-size:13px; font-weight:600;
                           color:var(--text);">
                ${c.author ? c.author.name : 'Unknown'}
              </span>
              <span style="font-size:11px; color:var(--text-muted);">
                ${timeAgo(c.createdAt)}
              </span>
            </div>
            <div style="font-size:13px; color:var(--text-secondary);
                        line-height:1.5; word-break:break-word;">
              ${c.content}
            </div>
            ${c.userId === user.id ? `
              <button onclick="deleteComment('${c.id}')"
                style="background:none; border:none; color:var(--danger);
                       font-size:11px; cursor:pointer; padding:4px 0;
                       margin-top:4px;">
                Delete
              </button>
            ` : ''}
          </div>
        </div>
      `).join('');

    } catch (err) {
      list.innerHTML =
        `<div class="notif-empty">Could not load comments.</div>`;
    }
  }

  // ── Time Ago Helper ───────────────────────────────
  function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60)    return 'Just now';
    if (diff < 3600)  return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    return Math.floor(diff / 86400) + 'd ago';
  }

  // ── Add Comment ───────────────────────────────────
  document.getElementById('addCommentBtn')
    .addEventListener('click', async () => {
      const content =
        document.getElementById('commentInput').value.trim();
      if (!content) return;

      try {
        await taskAPI.addComment(taskId, content);
        document.getElementById('commentInput').value = '';
        loadComments();
      } catch (err) {
        showToast('Error', err.message, 'error');
      }
    });

  // ── Delete Comment ────────────────────────────────
  window.deleteComment = async function(id) {
    const ok = await appConfirm(
      'Delete Comment?',
      'This cannot be undone.',
      'Delete'
    );
    if (!ok) return;
    try {
      await taskAPI.deleteComment(taskId, id);
      loadComments();
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  // ── Comments Panel ────────────────────────────────
  document.getElementById('commentsBtn')
    .addEventListener('click', () => {
      document.getElementById('commentsPanel').classList.add('open');
      document.getElementById('commentsOverlay').classList.add('open');
      loadComments();
    });

  window.closeComments = function() {
    document.getElementById('commentsPanel').classList.remove('open');
    document.getElementById('commentsOverlay').classList.remove('open');
  };

  // ── Load Attachments ──────────────────────────────
  async function loadAttachments() {
    const list = document.getElementById('attachmentsList');
    try {
      const files = await taskAPI.getAttachments(taskId);

      if (files.length === 0) {
        list.innerHTML =
          `<p style="color:var(--text-muted); font-size:14px;">
             No attachments yet.
           </p>`;
        return;
      }

      list.innerHTML = files.map(f => `
        <div style="display:flex; align-items:center; gap:10px;
                    padding:8px 0; border-bottom:1px solid var(--border-light);">
          <i class="bi bi-file-earmark"
             style="color:var(--primary); font-size:18px;"></i>
          <span style="font-size:14px; flex:1;">${f.fileName}</span>
          <a href="${f.fileUrl}"
             target="_blank"
             class="btn btn-secondary btn-sm">
            <i class="bi bi-eye"></i> View
          </a>
        </div>
      `).join('');

    } catch (err) {
      list.innerHTML =
        `<p style="color:var(--danger); font-size:14px;">
           Could not load attachments.
         </p>`;
    }
  }

  // ── Upload Attachment ─────────────────────────────
  document.getElementById('uploadBtn')
    .addEventListener('click', async () => {
      const file = document.getElementById('fileInput').files[0];
      if (!file) {
        showToast('Error', 'Please choose a file first.', 'error');
        return;
      }
      try {
        await taskAPI.uploadAttachment(taskId, file);
        document.getElementById('fileInput').value = '';
        showToast('Success', 'File uploaded.', 'success');
        loadAttachments();
      } catch (err) {
        showToast('Error', err.message, 'error');
      }
    });

    // ── Load project members for assignment modal ──────────────
  async function loadProjectMembersForAssignment() {
    try {
      // Get the task first to find its projectId
      const task = await taskAPI.getById(taskId);
      const project = await projectAPI.getById(task.projectId);
 
      const select = document.getElementById('assigneesSelect');
      select.innerHTML = project.members.map(m => `
        <option value="${m.userId}"
          ${task.assignees && task.assignees.some(a => a.id === m.userId) ? 'selected' : ''}>
          ${m.user ? m.user.name : 'Unknown'}
        </option>
      `).join('');
    } catch (err) {
      console.error('Could not load members:', err);
    }
  }
 
  // ── Edit Assignees Modal ───────────────────────────────────
  document.getElementById('editAssigneesBtn')
    .addEventListener('click', async () => {
      await loadProjectMembersForAssignment();
      document.getElementById('assigneesModal').classList.add('show');
    });
 
  document.getElementById('closeAssigneesModal')
    .addEventListener('click', () => {
      document.getElementById('assigneesModal').classList.remove('show');
    });
 
  document.getElementById('closeAssigneesModal2')
    .addEventListener('click', () => {
      document.getElementById('assigneesModal').classList.remove('show');
    });
 
  document.getElementById('saveAssigneesBtn')
    .addEventListener('click', async () => {
      const select = document.getElementById('assigneesSelect');
      const assigneeIds = Array.from(select.selectedOptions)
        .map(opt => opt.value);
 
      if (assigneeIds.length === 0) {
        document.getElementById('assigneesError').textContent =
          'Select at least one assignee.';
        document.getElementById('assigneesError').classList.add('show');
        return;
      }
 
      try {
        await taskAPI.assignUsers(taskId, assigneeIds);
        showToast('Success', 'Assignees updated.', 'success');
        document.getElementById('assigneesModal').classList.remove('show');
        await loadTaskDetail();
      } catch (err) {
        document.getElementById('assigneesError').textContent = err.message;
        document.getElementById('assigneesError').classList.add('show');
      }
    });
 


  // ── Init ──────────────────────────────────────────
  loadTaskDetail();
  loadAttachments();
  // Comments load when panel opens, not on page load

});