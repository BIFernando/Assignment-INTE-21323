    requireAuth();
    renderNavbar();

    // Get task ID from URL: task-detail.html?id=abc123
    const params = new URLSearchParams(window.location.search);
    const taskId = params.get('id');
    if (!taskId) window.location.href = 'tasks.html';

    const user = getCurrentUser();

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
 
        // Update the status badge immediately without full reload
        const statusBadge = document.querySelector(
          '#taskMeta .badge[class*="status-"]'
        );
        if (statusBadge) {
          statusBadge.className =
            'badge status-' + newStatus.toLowerCase();
          statusBadge.textContent = newStatus.replace('_', ' ');
        }
      } catch (err) {
        showToast('Error', err.message, 'error');
        // Revert dropdown if update failed
        loadTaskDetail();
      }
    });

      } catch (err) {
        alert('Error loading task: ' + err.message);
      }
    }

    async function loadComments() {
      const comments = await taskAPI.getComments(taskId);
      const list = document.getElementById('commentsList');
      if (comments.length === 0) {
        list.innerHTML = '<p style="color:#888; font-size:14px;">No comments yet.</p>';
        return;
      }
      list.innerHTML = comments.map(c => `
        <div style="border-bottom:1px solid #eee; padding:10px 0;">
          <strong style="font-size:13px;">${c.User ? c.User.name : 'User'}</strong>
          <span style="font-size:12px; color:#aaa; margin-left:8px;">
            ${new Date(c.createdAt).toLocaleString()}
          </span>
          <p style="margin-top:4px; font-size:14px;">${c.content}</p>
        </div>
      `).join('');
    }

    async function loadAttachments() {
      const files = await taskAPI.getAttachments(taskId);
      const list  = document.getElementById('attachmentsList');
      if (files.length === 0) {
        list.innerHTML = '<p style="color:#888; font-size:14px;">No attachments yet.</p>';
        return;
      }
      list.innerHTML = files.map(f => `
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
          <span style="font-size:14px;">📎 ${f.fileName}</span>
          <a href="http://localhost:5000/${f.fileUrl}"
             target="_blank" class="btn btn-secondary btn-sm">View</a>
        </div>
      `).join('');
    }

    // Add comment
    document.getElementById('addCommentBtn')
      .addEventListener('click', async () => {
      const content = document.getElementById('commentInput').value.trim();
      if (!content) return;
      try {
        await taskAPI.addComment(taskId, content);
        document.getElementById('commentInput').value = '';
        loadComments();
      } catch (err) { alert(err.message); }
    });

    // Upload file
    document.getElementById('uploadBtn')
      .addEventListener('click', async () => {
      const file = document.getElementById('fileInput').files[0];
      if (!file) { alert('Please choose a file first.'); return; }
      try {
        await taskAPI.uploadAttachment(taskId, file);
        document.getElementById('fileInput').value = '';
        loadAttachments();
      } catch (err) { alert(err.message); }
    });

    // Load everything
    loadTaskDetail();
    loadComments();
    loadAttachments();