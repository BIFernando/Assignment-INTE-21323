document.addEventListener('DOMContentLoaded', () => {

  requireAuth();
  renderSidebar('profile');

  const user = getCurrentUser();

  // Populate fields from localStorage immediately
  document.getElementById('nameInput').value = user.name || '';
  document.getElementById('emailInput').value = user.email || '';
  document.getElementById('joinedInput').value =
    user.createdAt
      ? new Date(user.createdAt).toLocaleDateString()
      : 'N/A';

  // Avatar initials
  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';
  document.getElementById('profileAvatar').textContent = initials;
  document.getElementById('profileName').textContent = user.name || '';
  document.getElementById('profileRole').textContent =
    user.role ? user.role.replace('_', ' ') : 'No global role';

  // Save name change
  document.getElementById('saveProfileBtn')
    .addEventListener('click', async () => {
      const name = document.getElementById('nameInput').value.trim();
      const errEl = document.getElementById('errorAlert');
      const sucEl = document.getElementById('successAlert');

      errEl.classList.remove('show');
      sucEl.classList.remove('show');

      if (!name) {
        errEl.textContent = 'Name cannot be empty.';
        errEl.classList.add('show');
        return;
      }

      try {
        await userAPI.updateProfile({ name });

        // Update localStorage so sidebar reflects new name
        const updatedUser = { ...user, name };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Update displayed name
        document.getElementById('profileName').textContent = name;
        document.getElementById('profileAvatar').textContent =
          name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

        sucEl.textContent = 'Name updated successfully.';
        sucEl.classList.add('show');

        setTimeout(() => sucEl.classList.remove('show'), 3000);
      } catch (err) {
        errEl.textContent = err.message;
        errEl.classList.add('show');
      }
    });

  // ── CHANGE PASSWORD ────────────────────────────────────────
  document.getElementById('changePasswordBtn')
    .addEventListener('click', async () => {
      const currentPassword = document.getElementById('currentPasswordInput').value;
      const newPassword = document.getElementById('newPasswordInput').value;
      const confirmPassword = document.getElementById('confirmPasswordInput').value;
      const errEl = document.getElementById('errorAlert');
      const sucEl = document.getElementById('successAlert');

      errEl.classList.remove('show');
      sucEl.classList.remove('show');

      // Validation
      if (!currentPassword) {
        errEl.textContent = 'Current password is required.';
        errEl.classList.add('show');
        return;
      }

      if (!newPassword) {
        errEl.textContent = 'New password is required.';
        errEl.classList.add('show');
        return;
      }

      if (newPassword.length < 8) {
        errEl.textContent = 'Password must be at least 8 characters.';
        errEl.classList.add('show');
        return;
      }

      if (!/[A-Z]/.test(newPassword)) {
        errEl.textContent = 'Password must contain an uppercase letter.';
        errEl.classList.add('show');
        return;
      }

      if (!/[a-z]/.test(newPassword)) {
        errEl.textContent = 'Password must contain a lowercase letter.';
        errEl.classList.add('show');
        return;
      }

      if (!/[0-9]/.test(newPassword)) {
        errEl.textContent = 'Password must contain a number.';
        errEl.classList.add('show');
        return;
      }

      if (newPassword !== confirmPassword) {
        errEl.textContent = 'Passwords do not match.';
        errEl.classList.add('show');
        return;
      }

      try {
        await authAPI.changePassword(currentPassword, newPassword);

        sucEl.textContent = 'Password changed successfully. Please log in again.';
        sucEl.classList.add('show');

        // Clear inputs
        document.getElementById('currentPasswordInput').value = '';
        document.getElementById('newPasswordInput').value = '';
        document.getElementById('confirmPasswordInput').value = '';

        // Redirect to login after 2 seconds
        setTimeout(() => {
          logout();
        }, 2000);
      } catch (err) {
        errEl.textContent = err.message || 'Could not change password.';
        errEl.classList.add('show');
      }
    });
// ── CHANGE PASSWORD MODAL ─────────────────────────────────
  const changePasswordBtn = document.getElementById('changePasswordBtn');
  
  changePasswordBtn.addEventListener('click', () => {
    document.getElementById('changePasswordModal').classList.add('show');
  });

  document.getElementById('closeChangePasswordModal')
    .addEventListener('click', () => {
      document.getElementById('changePasswordModal').classList.remove('show');
      clearChangePasswordForm();
    });

  document.getElementById('cancelChangePasswordBtn')
    .addEventListener('click', () => {
      document.getElementById('changePasswordModal').classList.remove('show');
      clearChangePasswordForm();
    });

  document.getElementById('saveChangePasswordBtn')
    .addEventListener('click', async () => {
      const currentPassword = document.getElementById('currentPasswordInput').value;
      const newPassword = document.getElementById('newPasswordInput').value;
      const confirmPassword = document.getElementById('confirmPasswordInput').value;
      const errEl = document.getElementById('changePasswordError');

      errEl.classList.remove('show');

      // Validation
      if (!currentPassword) {
        errEl.textContent = 'Current password is required.';
        errEl.classList.add('show');
        return;
      }

      if (!newPassword) {
        errEl.textContent = 'New password is required.';
        errEl.classList.add('show');
        return;
      }

      if (newPassword.length < 8) {
        errEl.textContent = 'Password must be at least 8 characters.';
        errEl.classList.add('show');
        return;
      }

      if (!/[A-Z]/.test(newPassword)) {
        errEl.textContent = 'Password must contain an uppercase letter.';
        errEl.classList.add('show');
        return;
      }

      if (!/[a-z]/.test(newPassword)) {
        errEl.textContent = 'Password must contain a lowercase letter.';
        errEl.classList.add('show');
        return;
      }

      if (!/[0-9]/.test(newPassword)) {
        errEl.textContent = 'Password must contain a number.';
        errEl.classList.add('show');
        return;
      }

      if (newPassword !== confirmPassword) {
        errEl.textContent = 'Passwords do not match.';
        errEl.classList.add('show');
        return;
      }

      try {
        const btn = document.getElementById('saveChangePasswordBtn');
        btn.disabled = true;
        btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Changing...';

        await authAPI.changePassword(currentPassword, newPassword);
        
        showToast('Success', 'Password changed. Logging you out...', 'success');
        
        setTimeout(() => {
          logout();
        }, 2000);
      } catch (err) {
        errEl.textContent = err.message || 'Could not change password.';
        errEl.classList.add('show');
        document.getElementById('saveChangePasswordBtn').disabled = false;
        document.getElementById('saveChangePasswordBtn').innerHTML = 
          '<i class="bi bi-check2"></i> Change Password';
      }
    });

  function clearChangePasswordForm() {
    document.getElementById('currentPasswordInput').value = '';
    document.getElementById('newPasswordInput').value = '';
    document.getElementById('confirmPasswordInput').value = '';
    document.getElementById('changePasswordError').classList.remove('show');
  }



});
