document.addEventListener('DOMContentLoaded', () => {
      requireAuth();
    requireAdmin(); // redirect non-admins away
    renderSidebar('users');

    async function loadUsers() {
      try {
        const users = await userAPI.getAll();
        const tbody = document.getElementById('usersTableBody');

        if (users.length === 0) {
          tbody.innerHTML = '<tr><td colspan="5">No users found.</td></tr>';
          return;
        }

        tbody.innerHTML = users.map(u => `
          <tr>
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td>
              <span class="badge" style="background:#e9d8fd; color:#553c9a;">
                ${u.role ? u.role.replace('_', ' ') : 'No role'}
              </span>
            </td>
            <td>
              <span class="badge ${u.isActive ? 'badge-low' : 'badge-high'}">
                ${u.isActive ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td>
              ${u.isActive ? `
                <button class="btn btn-danger btn-sm"
                  onclick="deactivateUser('${u.id}', '${u.name}')">
                  Deactivate
                </button>
              ` : '<span style="color:#aaa; font-size:13px;">Deactivated</span>'}
            </td>
          </tr>
        `).join('');

      } catch (err) {
        document.getElementById('errorAlert').textContent = err.message;
        document.getElementById('errorAlert').classList.add('show');
      }
    }

    async function deactivateUser(id, name) {
  const ok = await appConfirm(
    'Deactivate ' + name + '?',
    'They will lose access to the system immediately.',
    'Deactivate'
  );
  if (!ok) return;
  try {
    await userAPI.deactivate(id);
    showToast('Success', 'User deactivated successfully.', 'success');
    loadUsers();
  } catch (err) {
    showToast('Error', err.message, 'error');
  }
}

    // Create user modal
    document.getElementById('createUserBtn')
      .addEventListener('click', () => {
      document.getElementById('createUserModal').classList.add('show');
    });

    document.getElementById('closeUserModal')
      .addEventListener('click', () => {
      document.getElementById('createUserModal').classList.remove('show');
    });

    document.getElementById('saveUserBtn')
      .addEventListener('click', async () => {
      const name  = document.getElementById('userName').value.trim();
      const email = document.getElementById('userEmail').value.trim();
      const role  = document.getElementById('userRole').value;
      const errEl = document.getElementById('userModalError');
      errEl.classList.remove('show');

      if (!name || !email || !role) {
        errEl.textContent = 'All fields are required.';
        errEl.classList.add('show');
        return;
      }

      try {
        await userAPI.create({ name, email, role });
        document.getElementById('createUserModal').classList.remove('show');
        document.getElementById('userName').value  = '';
        document.getElementById('userEmail').value = '';
        showSuccess('User created! Welcome email sent.');
        loadUsers();
      } catch (err) {
        errEl.textContent = err.message;
        errEl.classList.add('show');
      }
    });

    function showSuccess(msg) {
      const el = document.getElementById('successAlert');
      el.textContent = msg;
      el.classList.add('show');
      setTimeout(() => el.classList.remove('show'), 3000);
    }

    function showError(msg) {
      const el = document.getElementById('errorAlert');
      el.textContent = msg;
      el.classList.add('show');
      setTimeout(() => el.classList.remove('show'), 3000);
    }

    loadUsers();
  });