document.addEventListener('DOMContentLoaded', () => {
 
    requireAuth();
    renderSidebar('profile');
 
    const user = getCurrentUser();
 
    // Populate fields from localStorage immediately
    document.getElementById('nameInput').value  = user.name  || '';
    document.getElementById('emailInput').value = user.email || '';
    document.getElementById('joinedInput').value =
      user.createdAt
        ? new Date(user.createdAt).toLocaleDateString()
        : 'N/A';
 
    // Avatar initials
    const initials = user.name
      ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)
      : '?';
    document.getElementById('profileAvatar').textContent = initials;
    document.getElementById('profileName').textContent   = user.name  || '';
    document.getElementById('profileRole').textContent   =
      user.role ? user.role.replace('_', ' ') : 'No global role';
 
    // Save name change
    document.getElementById('saveProfileBtn')
      .addEventListener('click', async () => {
      const name  = document.getElementById('nameInput').value.trim();
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
          name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
 
        sucEl.textContent = 'Name updated successfully.';
        sucEl.classList.add('show');
 
        setTimeout(() => sucEl.classList.remove('show'), 3000);
      } catch (err) {
        errEl.textContent = err.message;
        errEl.classList.add('show');
      }
    });
 
  });
 