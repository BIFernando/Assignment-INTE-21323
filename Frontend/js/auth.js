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


    // ── NOTIFICATION PANEL ────────────────────────────────
function renderNotificationPanel() {
  const panel = `
    <div class="notif-overlay" id="notifOverlay" onclick="closeNotifPanel()"></div>
    <div class="notif-panel" id="notifPanel">
      <div class="notif-panel-header">
        <span class="notif-panel-title">
          <i class="bi bi-bell"></i> Notifications
        </span>
        <button class="notif-close-btn" onclick="closeNotifPanel()">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
      <div class="notif-panel-actions">
        <button class="btn btn-secondary btn-sm" onclick="markAllRead()">
          <i class="bi bi-check2-all"></i> Mark all read
        </button>
      </div>
      <div class="notif-panel-body" id="notifList">
        <div class="notif-empty">Loading...</div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', panel);

  document.addEventListener('click', (e) => {
    if (e.target.closest('#notifBtn')) toggleNotifPanel();
  });
}

function toggleNotifPanel() {
  const panel   = document.getElementById('notifPanel');
  const overlay = document.getElementById('notifOverlay');
  const isOpen  = panel.classList.contains('open');
  if (isOpen) {
    closeNotifPanel();
  } else {
    panel.classList.add('open');
    overlay.classList.add('open');
    loadNotifications();
  }
}

function closeNotifPanel() {
  document.getElementById('notifPanel')?.classList.remove('open');
  document.getElementById('notifOverlay')?.classList.remove('open');
}

async function loadNotifications() {
  const list = document.getElementById('notifList');
  try {
    const notifications = await notificationAPI.getAll();
    if (!notifications || notifications.length === 0) {
      list.innerHTML = `
        <div class="notif-empty">
          <i class="bi bi-bell-slash" style="font-size:28px; opacity:0.3;"></i>
          <div style="margin-top:8px;">No notifications yet</div>
        </div>`;
      return;
    }

    list.innerHTML = notifications.map(n => `
      <div class="notif-item ${n.isRead ? '' : 'unread'}" data-id="${n.id}">
        <div class="notif-dot"></div>
        <div class="notif-item-content">
          <div class="notif-item-msg">${n.message}</div>
          <div class="notif-item-time">${timeAgo(n.createdAt)}</div>
        </div>
      </div>
    `).join('');

    // Mark as read when panel opens
    notifications.filter(n => !n.isRead).forEach(n => {
      notificationAPI.markRead(n.id).catch(() => {});
    });

    // Update badge to 0
    const badge = document.getElementById('notifBadge');
    if (badge) badge.style.display = 'none';

  } catch (err) {
    list.innerHTML = `<div class="notif-empty">Could not load notifications.</div>`;
  }
}

async function markAllRead() {
  try {
    await notificationAPI.markAllRead();
    loadNotifications();
  } catch (err) {
    console.log('Could not mark all read.');
  }
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)   return 'Just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return Math.floor(diff / 86400) + 'd ago';
}

// ── IN-APP CONFIRM DIALOG ─────────────────────────────
function renderConfirmDialog() {
  const dialog = `
    <div class="modal-overlay" id="confirmOverlay">
      <div class="modal" style="max-width:380px;">
        <div class="modal-header">
          <span class="modal-title" id="confirmTitle">Are you sure?</span>
        </div>
        <p id="confirmMessage"
           style="color:var(--text-muted); font-size:14px; margin:0 0 20px;">
        </p>
        <div style="display:flex; gap:10px; justify-content:flex-end;">
          <button class="btn btn-secondary" id="confirmCancelBtn">Cancel</button>
          <button class="btn btn-danger"    id="confirmOkBtn">Delete</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', dialog);
}

// Drop-in replacement for confirm() — returns a Promise
function appConfirm(title, message, okLabel = 'Delete') {
  return new Promise((resolve) => {
    const overlay = document.getElementById('confirmOverlay');
    document.getElementById('confirmTitle').textContent   = title;
    document.getElementById('confirmMessage').textContent = message;
    document.getElementById('confirmOkBtn').textContent   = okLabel;

    overlay.classList.add('show');

    const ok = document.getElementById('confirmOkBtn');
    const cancel = document.getElementById('confirmCancelBtn');

    function cleanup(result) {
      overlay.classList.remove('show');
      ok.replaceWith(ok.cloneNode(true));         // remove old listeners
      cancel.replaceWith(cancel.cloneNode(true));
      resolve(result);
    }

    document.getElementById('confirmOkBtn').addEventListener('click',    () => cleanup(true));
    document.getElementById('confirmCancelBtn').addEventListener('click', () => cleanup(false));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) cleanup(false);
    });
  });
}

// Call both renderers — runs once when auth.js loads
document.addEventListener('DOMContentLoaded', () => {
  renderNotificationPanel();
  renderConfirmDialog();
});

