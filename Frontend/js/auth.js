function logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = 'login.html';
    }

    function getCurrentUser() {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    }

    function requireAuth() {
      if (!localStorage.getItem('token')) {
        window.location.href = 'login.html';
      }
    }

    function requireAdmin() {
      const user = getCurrentUser();
      if (!user || user.role !== 'admin') {
        window.location.href = 'dashboard.html';
      }
    }

    function getInitials(name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
    }

    function getRoleBadge(role) {
      const labels = {
        'admin': 'Admin',
        'project_manager': 'Project Manager',
        'collaborator': 'Collaborator'
      };
      return labels[role] || role;
    }

    function renderSidebar(activePage) {
      const user = getCurrentUser();
      if (!user) return;

      const adminLink = user.role === 'admin' ? `
        <a href="users.html" class="sidebar-link ${activePage==='users'?'active':''}">
          <span class="nav-icon"><i class="bi bi-people"></i></span>
          User Management
        </a>
      ` : '';

      const sidebar = `
        <aside class="sidebar" id="sidebar">
          <div class="sidebar-logo">
            <div class="sidebar-logo-icon">
              <i class="bi bi-kanban"></i>
            </div>
            <div>
              <div class="sidebar-logo-text">TaskFlow</div>
              <div class="sidebar-logo-sub">INTE 21323</div>
            </div>
          </div>

          <nav class="sidebar-nav">
            <div class="sidebar-section-label">Main Menu</div>

            <a href="dashboard.html" class="sidebar-link ${activePage==='dashboard'?'active':''}">
              <span class="nav-icon"><i class="bi bi-grid-1x2"></i></span>
              Dashboard
            </a>

            <a href="tasks.html" class="sidebar-link ${activePage==='tasks'?'active':''}">
              <span class="nav-icon"><i class="bi bi-check2-square"></i></span>
              Tasks
            </a>

            ${adminLink}

            <div class="sidebar-section-label" style="margin-top:16px;">Account</div>

            <a href="#" class="sidebar-link" onclick="logout()">
              <span class="nav-icon"><i class="bi bi-box-arrow-left"></i></span>
              Sign Out
            </a>
          </nav>

          <div class="sidebar-user">
            <div class="sidebar-avatar">${getInitials(user.name)}</div>
            <div class="sidebar-user-info">
              <div class="sidebar-user-name">${user.name}</div>
              <div class="sidebar-user-role">${getRoleBadge(user.role)}</div>
            </div>
            <button class="sidebar-logout" onclick="logout()" title="Sign out">
              <i class="bi bi-box-arrow-right"></i>
            </button>
          </div>
        </aside>
      `;

      document.body.insertAdjacentHTML('afterbegin', sidebar);
    }

    // Toast notification system
    function showToast(title, message, type = 'info') {
      let container = document.getElementById('toastContainer');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
      }

      const icons = {
        success: '✅',
        error:   '❌',
        warning: '⚠️',
        info:    '🔔'
      };

      const colors = {
        success: 'var(--success)',
        error:   'var(--danger)',
        warning: 'var(--warning)',
        info:    'var(--primary)'
      };

      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.style.borderLeftColor = colors[type] || colors.info;
      toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <div>
          <div class="toast-title">${title}</div>
          ${message ? `<div class="toast-msg">${message}</div>` : ''}
        </div>
      `;

      container.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, 4000);
    }
