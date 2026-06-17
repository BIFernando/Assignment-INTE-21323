 document.addEventListener('DOMContentLoaded', () => {
 
    requireAuth();
    renderSidebar('projects');
 
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('projectId');
 
    if (!projectId) {
      window.location.href = 'projects.html';
      return;
    }
 
    let myRole = null;
 
    // ── Load Project Details ──────────────────────────
    async function loadProject() {
      try {
        const project = await projectAPI.getById(projectId);
 
        myRole = project.myRole;
 
        document.getElementById('projectName').textContent =
          project.name;
        document.getElementById('projectDesc').textContent =
          project.description || '';
 
        // View Tasks button
        document.getElementById('viewTasksBtn')
          .addEventListener('click', () => {
          window.location.href =
            'tasks.html?projectId=' + projectId;
        });
 
        // Show invite button and actions column only for admins
        if (myRole === 'admin') {
          document.getElementById('inviteMemberBtn').style.display = 'inline-flex';
          document.getElementById('actionsHeader').style.display = 'table-cell';
        }
 
        renderMembers(project.members);
 
      } catch (err) {
        document.getElementById('pageError').textContent = err.message;
        document.getElementById('pageError').classList.add('show');
      }
    }
 
    // ── Render Members Table ──────────────────────────
    function renderMembers(members) {
      const tbody = document.getElementById('membersTableBody');
 
      if (!members || members.length === 0) {
        tbody.innerHTML =
          '<tr><td colspan="4">No members yet.</td></tr>';
        return;
      }
 
      tbody.innerHTML = members.map(m => `
        <tr>
          <td>${m.user ? m.user.name : 'Unknown'}</td>
          <td>${m.user ? m.user.email : ''}</td>
          <td>
            <span class="badge badge-${m.role}">
              ${m.role.replace('_', ' ')}
            </span>
          </td>
          ${myRole === 'admin' ? `
            <td style="display:table-cell;">
              <select class="filter-select" style="font-size:12px; padding:4px 8px;"
                onchange="changeMemberRole('${m.userId}', this.value)"
                ${m.userId === getCurrentUser().id ? 'disabled' : ''}>
                <option value="collaborator"
                  ${m.role === 'collaborator' ? 'selected' : ''}>
                  Collaborator
                </option>
                <option value="project_manager"
                  ${m.role === 'project_manager' ? 'selected' : ''}>
                  Project Manager
                </option>
                <option value="admin"
                  ${m.role === 'admin' ? 'selected' : ''}>
                  Admin
                </option>
              </select>
              ${m.userId !== getCurrentUser().id ? `
                <button class="btn btn-danger btn-sm"
                  style="margin-left:8px;"
                  onclick="removeMember('${m.userId}',
                  '${m.user ? m.user.name : 'this member'}')">
                  Remove
                </button>
              ` : '<span style="font-size:12px; color:var(--text-muted); margin-left:8px;">(you)</span>'}
            </td>
          ` : '<td></td>'}
        </tr>
      `).join('');
    }
 
    // ── Change Member Role ────────────────────────────
    window.changeMemberRole = async function(userId, role) {
      try {
        await projectAPI.updateMemberRole(projectId, userId, role);
        showToast('Success', 'Role updated.', 'success');
      } catch (err) {
        showToast('Error', err.message, 'error');
        loadProject(); // reload to revert dropdown
      }
    };
 
    // ── Remove Member ─────────────────────────────────
    window.removeMember = async function(userId, name) {
      const ok = await appConfirm(
        'Remove ' + name + '?',
        'They will lose access to this project.',
        'Remove'
      );
      if (!ok) return;
      try {
        await projectAPI.removeMember(projectId, userId);
        showToast('Success', name + ' removed from project.', 'success');
        loadProject();
      } catch (err) {
        showToast('Error', err.message, 'error');
      }
    };
 
    // ── Invite Modal ──────────────────────────────────
    document.getElementById('inviteMemberBtn')
      .addEventListener('click', () => {
      document.getElementById('inviteModal').classList.add('show');
    });
 
    document.getElementById('closeInviteModal')
      .addEventListener('click', () => {
      document.getElementById('inviteModal').classList.remove('show');
      document.getElementById('inviteEmail').value = '';
      document.getElementById('inviteError').classList.remove('show');
      document.getElementById('inviteSuccess').classList.remove('show');
    });
 
    document.getElementById('sendInviteBtn')
      .addEventListener('click', async () => {
      const email = document.getElementById('inviteEmail').value.trim();
      const role  = document.getElementById('inviteRole').value;
      const errEl = document.getElementById('inviteError');
      const sucEl = document.getElementById('inviteSuccess');
 
      errEl.classList.remove('show');
      sucEl.classList.remove('show');
 
      if (!email) {
        errEl.textContent = 'Email is required.';
        errEl.classList.add('show');
        return;
      }
 
      try {
        await projectAPI.invite(projectId, email, role);
        sucEl.textContent = 'Member added successfully!';
        sucEl.classList.add('show');
        document.getElementById('inviteEmail').value = '';
        loadProject(); // reload to show new member
      } catch (err) {
        errEl.textContent = err.message;
        errEl.classList.add('show');
      }
    });
 
    loadProject();
 
  });
 